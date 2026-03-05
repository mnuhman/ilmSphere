# ilmSphere - Troubleshooting Guide

## Can't Upload PDF Files

### Step 1: Verify You're Logged In as Admin
1. Open browser console (Press F12)
2. Look for log message: `HomePage - User Profile:`
3. Check that `role: "admin"` and `isAdmin: true`

**If you see `role: "user"`:**
- You need admin access
- Contact the system administrator
- The first registered user automatically becomes admin

**If you don't see the log:**
- Refresh the page
- Clear browser cache
- Try logging out and back in

### Step 2: Check Upload Button Visibility
1. On the Home page, look for the "Add Document" button
2. It should appear in the top-right of the search section

**If button is not visible:**
- You're not logged in as admin
- Check console for profile information
- Verify your email is: zackmoon321@gmail.com (first registered user)

**If you see "Admin access required to upload documents":**
- Your account is not admin
- Ask the admin to change your role in Settings → Admin

### Step 3: Try Uploading
1. Click "Add Document" button
2. Fill in all required fields:
   - **File**: Select a PDF file (under 1GB)
   - **Title**: Enter document title
   - **Author**: Enter author name
   - **Category**: Select from dropdown
3. Click "Upload"

**Watch for errors in:**
- Red alert box at top of dialog
- Toast notifications (bottom-right)
- Browser console (F12)

### Step 4: Common Error Messages

#### "Failed to create document: ..."
**Cause**: Database permission issue
**Solution**:
1. Open browser console
2. Look for detailed error message
3. Check if you're still logged in
4. Try logging out and back in

#### "File upload failed. Please check your permissions."
**Cause**: Storage permission issue
**Solution**:
1. Verify you're admin (see Step 1)
2. Check browser console for detailed error
3. File might be too large (max 1GB)
4. File type must be .pdf or .txt

#### "PDF uploaded but text extraction failed"
**Cause**: Edge Function timeout (non-critical)
**Effect**: Document uploads successfully but search may be limited
**Solution**: This is a warning, not an error. Document is uploaded and readable.

### Step 5: Check Browser Console
1. Press F12 to open Developer Tools
2. Click "Console" tab
3. Look for error messages in red
4. Common logs to look for:
   - `Starting file upload:` - Upload started
   - `File uploaded successfully:` - Storage upload worked
   - `Creating document record in database:` - Database insert started
   - `Document created successfully:` - Complete success

### Step 6: Verify File Requirements
**File Type**: PDF or TXT only
**File Size**: Maximum 1GB (1,073,741,824 bytes)
**File Name**: Avoid special characters (use letters, numbers, dash, underscore)

**Invalid files will show:**
- Browser's file picker won't let you select them (if wrong type)
- Error message if file is too large

### Step 7: Check Network Connection
1. Open Developer Tools (F12)
2. Click "Network" tab
3. Try uploading again
4. Look for failed requests (red)
5. Click on failed request to see details

**Common network issues:**
- `401 Unauthorized`: Not logged in or session expired
- `403 Forbidden`: Not admin or RLS policy blocking
- `413 Payload Too Large`: File exceeds 1GB
- `500 Internal Server Error`: Server-side issue

### Step 8: Clear Browser Data
Sometimes cached data causes issues:
1. Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. Select "Cached images and files"
3. Select "Cookies and other site data"
4. Click "Clear data"
5. Close and reopen browser
6. Log in again

### Step 9: Try Different File
Test with a small, simple PDF:
1. Find a small PDF (under 1MB)
2. Rename it to simple name: `test.pdf`
3. Try uploading it
4. If this works, original file might be corrupted

### Step 10: Check Database Status
If you have database access:
```sql
-- Check your user role
SELECT id, email, role FROM profiles WHERE email = 'your-email@example.com';

-- Check if is_admin function works
SELECT is_admin(id) FROM profiles WHERE email = 'your-email@example.com';

-- Check storage policies
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

## Still Having Issues?

### Collect This Information:
1. **Browser Console Logs**:
   - Press F12
   - Copy all red error messages
   - Copy all logs starting with "Upload" or "Creating"

2. **Network Errors**:
   - F12 → Network tab
   - Copy failed request details
   - Include status code and response

3. **Your Account Info**:
   - Email address
   - Expected role (admin/user)
   - When you registered

4. **File Details**:
   - File type (PDF/TXT)
   - File size
   - File name

5. **Steps You Tried**:
   - What you clicked
   - What error appeared
   - What you've already tried from this guide

### Contact Support
Create a support ticket in Settings → Support with:
- Subject: "Cannot Upload PDF Files"
- Description: Include all information from above
- Screenshots of error messages

## Quick Checklist

Before asking for help, verify:
- [ ] I'm logged in as admin (check console)
- [ ] I can see the "Add Document" button
- [ ] File is PDF or TXT format
- [ ] File is under 1GB
- [ ] All required fields are filled
- [ ] I checked browser console for errors
- [ ] I tried a different, smaller file
- [ ] I cleared browser cache
- [ ] I tried logging out and back in

## Prevention Tips

### For Admins:
1. **Test uploads regularly** with small files
2. **Monitor system logs** in Settings → System Logs
3. **Check storage space** periodically
4. **Keep browser updated** to latest version
5. **Use supported browsers**: Chrome, Firefox, Safari, Edge

### For Users:
1. **Verify your role** before trying to upload
2. **Request admin access** if needed
3. **Prepare files** before uploading (compress large PDFs)
4. **Use descriptive names** for files
5. **Fill all required fields** carefully

## Technical Details

### Upload Process Flow:
1. User selects file and fills form
2. Frontend validates file type and size
3. File uploads to Supabase Storage (private bucket)
4. Edge Function extracts PDF text (optional, may timeout)
5. Document record created in database
6. System log entry created
7. Success message shown

### Failure Points:
- **Step 2**: Invalid file type/size → User sees error immediately
- **Step 3**: Storage permission → "File upload failed" error
- **Step 4**: Edge Function timeout → Warning (non-critical)
- **Step 5**: Database permission → "Failed to create document" error
- **Step 6**: System log failure → Silent (non-critical)

### Required Permissions:
- **Admin role** in profiles table
- **Storage INSERT policy** allows admin uploads
- **Storage SELECT policy** allows authenticated reads
- **Documents INSERT policy** allows admin creates
- **Documents SELECT policy** allows authenticated reads

### Database Tables:
- `profiles`: User accounts and roles
- `documents`: Document metadata
- `categories`: Document categories
- `system_logs`: Activity logs
- `storage.objects`: File storage

### Storage Bucket:
- **Name**: documents
- **Public**: No (private)
- **Access**: Via signed URLs (1 hour expiry)
- **Max Size**: 1GB per file
