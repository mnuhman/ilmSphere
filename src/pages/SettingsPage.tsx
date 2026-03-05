import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  updateProfile,
  getAllProfiles,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSystemLogs,
  getSupportTickets,
  createSupportTicket,
  updateSupportTicket,
} from '@/db/api';
import type { Profile, Category, SystemLog, SupportTicket, TicketStatus } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { supabase } from '@/db/supabase';

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })} className="space-y-6">
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="w-full h-auto inline-flex flex-wrap md:grid md:grid-cols-6 items-center justify-start md:justify-center p-1">
            <TabsTrigger value="profile" className="flex-1 md:flex-none">Profile</TabsTrigger>
            <TabsTrigger value="password" className="flex-1 md:flex-none">Password</TabsTrigger>
            <TabsTrigger value="support" className="flex-1 md:flex-none">Support</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin" className="flex-1 md:flex-none">Admin</TabsTrigger>}
            {isAdmin && <TabsTrigger value="categories" className="flex-1 md:flex-none">Categories</TabsTrigger>}
            {isAdmin && <TabsTrigger value="logs" className="flex-1 md:flex-none">Logs</TabsTrigger>}
          </TabsList>
        </div>

        <TabsContent value="profile">
          <ProfileTab profile={profile} refreshProfile={refreshProfile} />
        </TabsContent>

        <TabsContent value="password">
          <PasswordTab />
        </TabsContent>

        <TabsContent value="support">
          <SupportTab profile={profile} isAdmin={isAdmin} />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="admin">
              <AdminTab />
            </TabsContent>

            <TabsContent value="categories">
              <CategoriesTab />
            </TabsContent>

            <TabsContent value="logs">
              <LogsTab />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function ProfileTab({ profile, refreshProfile }: { profile: Profile | null; refreshProfile: () => Promise<void> }) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || '');
  }, [profile]);

  const handleSave = async () => {
    if (!profile || !fullName.trim()) return;

    setSaving(true);
    try {
      await updateProfile(profile.id, { full_name: fullName });
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile?.email || ''} disabled />
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
            {profile?.role}
          </Badge>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}

function PasswordTab() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={saving}
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Updating...' : 'Update Password'}
        </Button>
      </CardContent>
    </Card>
  );
}

function SupportTab({ profile, isAdmin }: { profile: Profile | null; isAdmin: boolean }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [status, setStatus] = useState<TicketStatus>('open');

  useEffect(() => {
    loadTickets();
  }, [profile, isAdmin]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = isAdmin
        ? await getSupportTickets()
        : await getSupportTickets(profile?.id);
      setTickets(data);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createSupportTicket(subject, message);
      toast.success('Ticket created successfully');
      setDialogOpen(false);
      setSubject('');
      setMessage('');
      loadTickets();
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      await updateSupportTicket(selectedTicket.id, {
        status,
        admin_response: adminResponse || undefined,
      });
      toast.success('Ticket updated successfully');
      setSelectedTicket(null);
      setAdminResponse('');
      loadTickets();
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Support Tickets</CardTitle>
            <CardDescription>
              {isAdmin ? 'Manage all support tickets' : 'View and create support tickets'}
            </CardDescription>
          </div>
          {!isAdmin && (
            <Button onClick={() => setDialogOpen(true)}>Create Ticket</Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-48 w-full bg-muted" />
        ) : tickets.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No tickets found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                {isAdmin && <TableHead>User</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.subject}</TableCell>
                  {isAdmin && <TableCell>{ticket.user?.email}</TableCell>}
                  <TableCell>
                    <Badge
                      variant={
                        ticket.status === 'closed'
                          ? 'secondary'
                          : ticket.status === 'in_progress'
                            ? 'default'
                            : 'outline'
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(ticket.created_at), 'MMM d, yyyy')}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setStatus(ticket.status);
                          setAdminResponse(ticket.admin_response || '');
                        }}
                      >
                        Respond
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>Describe your issue or question</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Respond to Ticket</DialogTitle>
              <DialogDescription>{selectedTicket.subject}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>User Message</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedTicket.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as TicketStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="response">Admin Response</Label>
                <Textarea
                  id="response"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTicket}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

function AdminTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await getAllProfiles();
      setProfiles(data);
    } catch (error) {
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View all registered users</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-48 w-full bg-muted" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.full_name}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>
                    <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                      {profile.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(profile.created_at), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryName);
        toast.success('Category updated successfully');
      } else {
        await createCategory(categoryName);
        toast.success('Category created successfully');
      }
      setDialogOpen(false);
      setCategoryName('');
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (category: Category) => {
    if (category.slug === 'uncategorized') {
      toast.error('Cannot delete Uncategorized category');
      return;
    }

    try {
      await deleteCategory(category.id);
      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Category Management</CardTitle>
            <CardDescription>Manage document categories</CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>Add Category</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-48 w-full bg-muted" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryName(category.name);
                          setDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      {category.slug !== 'uncategorized' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingCategory(null);
          setCategoryName('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function LogsTab() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getSystemLogs(100);
      setLogs(data);
    } catch (error) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Logs</CardTitle>
        <CardDescription>View system activity logs</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-48 w-full bg-muted" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>
                    {log.details && (
                      <code className="text-xs">{JSON.stringify(log.details)}</code>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
