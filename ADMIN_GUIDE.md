# ilmSphere Admin Guide

## Getting Started

### First Time Setup
1. **Register as Admin**: The first user to register automatically becomes the admin
2. **Verify Email**: Check your email and click the verification link
3. **Login**: Use your credentials to access the system

### Admin Credentials
- **Admin Email**: zackmoon321@gmail.com (first registered user)
- **Regular User**: hackerzack404@gmail.com

## Document Management

### Uploading Documents

1. **Navigate to Home Page**
2. **Click "+ Add New Document"** button (visible only to admin)
3. **Fill in the form**:
   - **Title**: Document name (required)
   - **Author**: Author name (required)
   - **Category**: Select from dropdown (required)
   - **Description**: Brief description (optional)
   - **Author Details**: Author bio/information (optional)
   - **File**: Upload PDF or TXT file (max 1GB)

4. **Click "Upload"** and wait for completion

### Available Categories
- Quran
- Hadith
- Fiqh (Islamic Jurisprudence)
- Aqeedah (Islamic Creed)
- Seerah (Prophet's Biography)
- Islamic History
- Arabic Language
- Tafsir (Quranic Exegesis)
- Uncategorized

### Editing Documents
1. Click the **Edit icon** (pencil) on any document card
2. Modify the fields you want to change
3. Click **Save Changes**

### Deleting Documents
1. Click the **Delete icon** (trash) on any document card
2. Confirm the deletion in the dialog
3. The document and its file will be permanently removed

## Category Management

### Adding Categories
1. Go to **Settings** → **Categories** tab
2. Enter the category name
3. Click **Add Category**

### Editing Categories
1. Find the category in the list
2. Click **Edit**
3. Change the name
4. Click **Save**

### Deleting Categories
1. Find the category in the list
2. Click **Delete**
3. Confirm deletion
4. **Note**: Documents in deleted categories will move to "Uncategorized"

## System Logs

### Viewing Logs
1. Go to **Settings** → **System Logs** tab
2. View all system activities:
   - Document uploads
   - Document edits
   - Document deletions
   - User logins
   - Downloads

### Log Information
- **Action**: What happened
- **User**: Who performed the action
- **Details**: Additional information
- **Timestamp**: When it occurred

## Support Tickets

### Viewing Tickets
1. Go to **Settings** → **Support** tab
2. View all user-submitted tickets

### Responding to Tickets
1. Click on a ticket to view details
2. Change status (Open/In Progress/Resolved/Closed)
3. Add response message
4. Click **Update**

## User Management

### Viewing Users
1. Go to **Settings** → **Admin** tab
2. View all registered users

### Changing User Roles
1. Find the user in the list
2. Click **Edit**
3. Select new role (User/Admin)
4. Click **Save**

## Troubleshooting

### Document Upload Fails
**Check**:
1. File size is under 1GB
2. File type is PDF or TXT
3. All required fields are filled
4. You're logged in as admin
5. Check browser console for error messages

### Users Can't Read Documents
**Check**:
1. User is logged in and verified
2. Document exists in database
3. File exists in storage
4. Check browser console for errors

### PDF Text Search Not Working
**Check**:
1. PDF was successfully uploaded
2. Text extraction completed (check system logs)
3. Wait a few seconds after upload for indexing

## Best Practices

### Document Organization
- Use descriptive titles
- Fill in author information
- Add detailed descriptions
- Choose appropriate categories
- Use consistent naming conventions

### File Management
- Keep file sizes reasonable (compress large PDFs)
- Use clear, descriptive filenames
- Verify uploads completed successfully
- Regularly check system logs

### User Support
- Respond to tickets promptly
- Keep ticket status updated
- Provide clear, helpful responses
- Close resolved tickets

## Technical Information

### Database
- **Backend**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (private bucket)
- **Authentication**: Email + Password with verification

### File Types
- **PDF**: Full-text search enabled, page count extracted
- **TXT**: Plain text display, no page count

### Security
- Row Level Security (RLS) enabled
- Admin-only upload/edit/delete
- Authenticated users can read
- Private storage with signed URLs

### Performance
- Files cached for 1 hour
- Signed URLs expire after 1 hour
- Full-text search indexed
- Pagination for large lists

## Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check system logs in Settings
3. Verify your admin role in profile
4. Clear browser cache and retry
5. Contact technical support with error details
