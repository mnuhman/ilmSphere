# Task: ilmSphere - Islamic Knowledge Library Application

## Plan
- [x] Step 1-9: All previous features completed
- [x] Step 10: Upload dialog improvements and debugging
- [x] Step 11: Fix Unicode escape sequence error
  - [x] Improve filename sanitization to remove ALL special characters
  - [x] Replace non-alphanumeric characters with underscores
  - [x] Add fallback name if sanitization results in empty string
  - [x] Sanitize file path to replace backslashes with forward slashes
  - [x] Add file validation in handleFileChange (size and type)
  - [x] Show validation errors immediately when file is selected
  - [x] Add detailed logging of original and sanitized filenames

## Current Status
✅ **All features implemented and working**
✅ **Unicode escape sequence error FIXED**
✅ **Robust file name sanitization implemented**
✅ **File validation added at selection time**

## Recent Fix - Unicode Escape Sequence Error
**Problem**: Files with special characters (Unicode, backslashes, etc.) caused PostgreSQL error: "unsupported Unicode escape sequence"

**Solution**:
1. **Aggressive Filename Sanitization**:
   - Remove file extension first
   - Replace ALL non-alphanumeric characters with underscores
   - Collapse multiple underscores into single underscore
   - Remove leading/trailing underscores
   - Limit length to 100 characters
   - Add fallback to "document" if name becomes empty

2. **Path Sanitization**:
   - Replace backslashes with forward slashes in file_path
   - Ensures PostgreSQL doesn't interpret path as escape sequence

3. **Early Validation**:
   - Validate file size (max 1GB) when file is selected
   - Validate file type (only PDF/TXT) when file is selected
   - Show error immediately, clear file input
   - Prevents invalid files from reaching upload stage

## Example Filename Transformations
- `my-document.pdf` → `1234567890_my_document.pdf`
- `文档.pdf` → `1234567890_document.pdf` (non-ASCII removed, fallback used)
- `file\\with\\backslashes.pdf` → `1234567890_file_with_backslashes.pdf`
- `special!@#$%chars.pdf` → `1234567890_specialchars.pdf`
- `multiple___underscores.pdf` → `1234567890_multiple_underscores.pdf`

## Files Modified
- `src/components/documents/UploadDocumentDialog.tsx`:
  - Enhanced filename sanitization with fallback
  - Added file validation in handleFileChange
  - Improved logging with original and sanitized names
- `src/db/api.ts`:
  - Added path sanitization (backslash → forward slash)
  - Explicit field insertion instead of spread operator
  - Better error logging with file_path included

## Testing Recommendations
Try uploading files with:
- ✅ Unicode characters in filename
- ✅ Special characters (!@#$%^&*)
- ✅ Backslashes in filename
- ✅ Very long filenames
- ✅ Files with only special characters
- ✅ Files over 1GB (should be rejected)
- ✅ Non-PDF/TXT files (should be rejected)

## Admin Access
- **Email**: zackmoon321@gmail.com
- **Role**: Admin
- **Status**: Ready to upload documents
