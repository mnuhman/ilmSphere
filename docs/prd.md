# ilmSphere - PDF & TXT Management Application Requirements Document

## 1. Product Overview

A secure, fast web application where Users can browse, search, read, and download documents. A single Admin manages the library and system operations (upload, edit, delete, categories, logs, and support tickets). The platform includes authentication, email verification, and role-based access control across all pages.

**Application Name:** ilmSphere

**Logo Design:** The logo should incorporate Islamic theme elements

**Supported file types:**
- PDF (read using PDF.js)
- TXT (read using a separate Text Reader)

**Search capabilities:**
- Metadata search across Title, Author, Category
- Full-text search inside PDF content

## 2. User Roles & Access

### Guest (not logged in)
- Can access Sign Up, Log In, and Forgot Password
- Cannot access Home, Readers, Settings, or downloads

### User (logged in)
- Browse and filter the document library
- Search documents using:
  - Metadata search (Title, Author, Category)
  - Full-text search inside PDFs
- Read PDFs in PDF Reader
- Read TXT files in a separate Text Reader
- Download PDF/TXT files (standard download)
- Manage settings (profile, password, theme, preferences)
- Submit support tickets

### Admin (logged in) — only one admin exists
- All User capabilities, plus:
  - Upload new PDF/TXT
  - Edit document metadata
  - Delete documents
  - Bulk upload documents
  - Manage categories
  - View system logs
  - View and respond to support tickets

## 3. Authentication & Account Lifecycle

### Sign Up
**Fields:**
- Full Name
- Email
- Password
- Confirm Password

**Rules:**
- Account is created as unverified
- Verification email is sent
- Users must verify email before accessing app features

### Log In
**Fields:**
- Email
- Password
- Remember Me

**Rules:**
- Only verified users can log in successfully
- Redirect to Home after successful login

### Forgot Password
- Request password reset via email
- System sends a time-limited reset link/token
- User sets a new password

### Log Out
- Button in the top-right navigation
- Clears session
- Redirects to Log In

## 4. Pages & Features

### Page 1 — Home / Library Overview

**Stats Bar**
- Total Documents count
- Available Categories count
- Recently Added (last 5 uploads)

**Category Browser**
- Categories displayed as clickable chips/cards
- Selecting a category filters the grid

**Global Search (Library Search)**
- One search input that supports:
  - Title, Author, Category
  - PDF full-text search (search terms found inside PDF content)
- Results show:
  - Document title, author, category
  - File type (PDF/TXT)
  - For PDF full-text matches: show a short snippet (preview text around the match) when possible

**Document Grid**

Each card shows:
- Thumbnail (PDF thumbnail if available, else file icon)
- Title
- Author
- Category
- Upload Date

Click behavior:
- If file type is PDF → open PDF Reader
- If file type is TXT → open Text Reader (separate page)

**Admin-only controls (hidden from Users)**
- + Add New Document button → modal with:
  - Title
  - Author
  - Category
  - Document Description
  - Author Details (single rich-text field: bio/notes/links)
  - File Upload (.pdf or .txt)
- Edit icon on each card → edit metadata
- Delete icon on each card → confirmation dialog → delete document

### Page 2 — PDF Reader (PDF only)

**Search Bar (top)**
- Search supports:
  - Metadata: Title, Author, Category
  - Full-text search inside PDFs
- Autocomplete behavior:
  - Metadata autocomplete (titles/authors/categories)
  - Full-text search does not need autocomplete, but should show fast results after submit

**PDF Viewer (powered by PDF.js)**
- Prev / Next page buttons
- Jump to page input
- Zoom In / Out and Fit to Width
- Full-screen mode
- Page counter (e.g., Page 4 of 200)
- Table of Contents sidebar (if PDF provides one)
- **Mobile browser optimization:**
  - Add a toggle button to show/hide the Table of Contents sidebar on mobile devices
  - The toggle should be easily accessible and clearly visible in mobile view

**Full-text search experience (inside PDF)**
- User can search for a term and see:
  - Count of matches (if available)
  - Next/previous match navigation
  - Highlighting of matches on the page (when possible)
  - Clicking a search result takes the user to the correct page and highlights the match

**Info Panel**
- Title
- Author
- Category
- Document Description
- Author Details
- Total Pages (auto-extracted)
- Upload Date
- Download button

**Reading Progress**
- Remember last page read per user per PDF
- Re-opening resumes at last page

### Page 2B — Text Reader (TXT only, separate page)

**Search Bar (top)**
- Metadata search only: Title, Author, Category

**Text Viewer**
- Adjustable font size
- Light/Dark mode
- Optional monospace toggle

**Info Panel**
- Title
- Author
- Category
- Document Description
- Author Details
- Pages: blank/null for TXT
- Upload Date
- Download button

### Page 3 — Settings

**User Settings**
- Profile: Full Name, Email
- Password: Change Password
- Theme: Light/Dark mode
- Preferences: Reading preferences
- Support: Submit support tickets

**Admin Settings**
- All User Settings, plus:
- Document Management: Upload, Edit, Delete documents
- Category Management: Add, Edit, Delete categories
- System Logs: View all system logs
- Support Tickets: View and respond to user support tickets

## 5. Navigation Bar

[ Logo (Islamic theme) ] [ Home ] [ PDF Reader ] [ Text Reader ] [ Settings ] [ 👤 Avatar ▾ → Profile / Log Out ]

**Visibility:**
- Guest: Log In | Sign Up only
- User: Home | PDF Reader | Text Reader | Settings | Log Out
- Admin: Home | PDF Reader | Text Reader | Settings (Admin sections inside) | Log Out

## 6. Document Management (Admin)

**File rules**
- Allowed: PDF and TXT only
- Maximum file size: 1 GB
- Validate file type by content (not extension only)

**Pages field behavior**
- PDF: auto-extract and store total pages
- TXT: pages = null

**Downloads**
- Users and Admin can download original files (standard download)
- Files must be stored privately and delivered securely (time-limited access links)

**Bulk upload**
- Upload multiple files at once
- Show per-file progress
- Allow partial success
- Show clear errors per failed file (reason + guidance)

## 7. Category Management

**Rules**
- Categories are used for filtering and search
- Deleting a category must auto-move all documents in that category to Uncategorized
- Uncategorized is a system category and cannot be deleted

## 8. System Logs (Admin)

**Must record:**
- Upload document (who, what, when)
- Edit metadata (who, what changed, when)
- Delete document (who, what, when)
- Login success/failure (basic record)
- Download events (who, what, when)

## 9. Technical Requirements

**Frontend:** React.js with Next.js

**PDF rendering:** PDF.js (Mozilla)

**TXT reading:** Dedicated Text Reader page (plain text renderer with font size + theme controls)

**Backend:** Node.js with Express (or Django if you prefer Python)

**Database:** PostgreSQL

**Full-text search inside PDFs:** OpenSearch or Elasticsearch (recommended for scalable indexing), or PostgreSQL full-text search if you extract and store PDF text

**File storage:** AWS S3 (private bucket)

**File delivery:** CDN + signed URLs for secure downloads

**Authentication:** Secure sessions + email verification + RBAC

**Hosting/Deployment:** Vercel (frontend) + AWS (backend, DB, search, storage)