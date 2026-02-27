# Admin Management Guide

## Overview
The system now has proper role-based access control:
- **Customers**: Can only access their profile and home page
- **Admins**: Can access all admin features (dashboard, customers, appointments, leads, etc.)

## Changes Made

### 1. Role-Based Routing (`App.js`)
- Added `AdminRoute` component that checks if user has admin role
- Non-admin users trying to access admin pages see "Access Denied" screen
- Default route for logged-in users: `/profile`
- Default route for admins: `/dashboard`

### 2. Dynamic Header (`Header.js`)
- **Admins see**: Dashboard, Customers, Appointments, Leads, Transcripts, Rooms, Admins
- **Customers see**: My Profile, Home
- Header title changes: "Admin Console" vs "Customer Portal"

### 3. Admin Management Scripts

All scripts are located in `mern/backend/scripts/`

## Terminal Commands

### 1. List All Users
```powershell
cd mern/backend
node scripts/listUsers.js
```
Shows all users with their roles, emails, and login info.

### 2. Make a User Admin
```powershell
cd mern/backend
node scripts/makeAdmin.js <email>
```

**Example:**
```powershell
node scripts/makeAdmin.js abhi3.02638@gmail.com
```

**Note**: User must have logged in at least once via Google Auth before you can promote them.

### 3. Remove Admin Privileges
```powershell
cd mern/backend
node scripts/removeAdmin.js <email>
```

**Example:**
```powershell
node scripts/removeAdmin.js user@example.com
```

### 4. Create Admin via API (Alternative)
If backend server is running, you can also use the API:

```powershell
# Make existing user admin
curl -X POST http://localhost:5000/api/auth/make-admin/user@example.com

# Or create new admin
curl -X POST http://localhost:5000/api/auth/create-admin `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@example.com",
    "name": "Admin User",
    "google_id": "unique_google_id",
    "phone": "+1234567890"
  }'
```

## Testing the Changes

### As Customer:
1. Login with Google
2. Should redirect to `/profile`
3. Try accessing `/dashboard` → Should see "Access Denied"
4. Header shows only "My Profile" and "Home"

### As Admin:
1. First, promote your account using the script above
2. Logout and login again
3. Should redirect to `/dashboard`
4. Can access all admin pages
5. Header shows full admin navigation

## Quick Setup for Your Account

```powershell
# Navigate to backend
cd C:\Users\abhir\OneDrive\Desktop\gdg-hyd\mern\backend

# Make yourself admin (use your logged-in email)
node scripts/makeAdmin.js abhi3.02638@gmail.com

# Verify
node scripts/listUsers.js
```

Then logout and login again to see admin features!

## Protected Routes

### Customer Routes (Anyone):
- `/profile` - Customer profile
- `/home` - Home page

### Admin-Only Routes:
- `/dashboard` - Main admin dashboard
- `/admin` - Admin panel
- `/admin-management` - Manage admins
- `/customers` - Customer overview
- `/transcripts` - Call transcripts
- `/appointments` - Appointments management
- `/leads` - Sales leads
- `/livekit-rooms` - Live video rooms

## Troubleshooting

**Issue**: "Access Denied" even after making yourself admin
- **Solution**: Logout and login again to refresh the token

**Issue**: Script says "User not found"
- **Solution**: Login via Google Auth first, then run the script

**Issue**: Changes not reflecting
- **Solution**: Clear browser cache/localStorage and login again
