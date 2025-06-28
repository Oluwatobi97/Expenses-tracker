# Admin Panel Access

## How to Access Admin Panel

### **Method 1: Direct Admin Login**

1. Navigate to `/admin-login` in your browser
   - Example: `https://yourapp.com/admin-login`
   - Example: `http://localhost:5173/admin-login` (for local development)
2. Use your admin credentials:
   - **Email**: `victortobi2000@gmail.com`
   - **Password**: `Siyanbola2468@@`
3. You'll be automatically redirected to `/admin` after successful login

### **Method 2: Direct URL Access (if already logged in)**

1. Navigate to `/admin` in your browser
   - Example: `https://yourapp.com/admin`
   - Example: `http://localhost:5173/admin` (for local development)
2. If not logged in as admin, you'll be redirected to `/admin-login`

## Admin Login Features

- ✅ **Separate Login Page**: Dedicated admin login at `/admin-login`
- ✅ **Different Design**: Red-themed secure admin interface
- ✅ **Email Validation**: Only accepts `victortobi2000@gmail.com`
- ✅ **Security Notice**: Professional security warnings
- ✅ **Access Control**: Redirects non-admin users to dashboard

## Admin Access Configuration

**Current Admin Email**: `victortobi2000@gmail.com`

Only this specific email address has access to the admin panel. To modify admin access, edit the `adminEmails` array in:

```
src/components/AdminRoute.tsx
```

Current configuration:

```typescript
const adminEmails = ["victortobi2000@gmail.com"];
```

## Security Features

- ✅ **Route Protection**: Only the specified admin email can access `/admin`
- ✅ **Hidden from UI**: No visible links or buttons to admin panel
- ✅ **Separate Login**: Dedicated admin login page
- ✅ **Silent Redirect**: Unauthorized users are redirected without indication
- ✅ **Professional**: Follows industry best practices for admin access

## Important Notes

- Keep your admin credentials secure
- Use the dedicated `/admin-login` page for admin access
- Only `victortobi2000@gmail.com` can access the admin panel
- Consider implementing additional security measures for production use
