# TODO: Fix Admin Logout Functionality

## Current Issue
- Admin logout button only redirects to home page without signing out from Supabase auth
- Session persists, causing automatic redirect to dashboard on next login attempt
- Other dashboards (Volunteer, Student) have proper logout that calls supabase.auth.signOut()

## Tasks
- [x] Update AdminDashboard.jsx logout button to properly sign out user
- [x] Test logout functionality to ensure session is cleared

## Files to Edit
- src/AdminDashboard.jsx: Update logout button handler
