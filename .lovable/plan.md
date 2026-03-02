

## Plan: Secure Admin Access and Clean Up Login/Signup Pages

### Current Problems
1. Admin credentials (`admin@annadanam.org / admin123`) are displayed publicly on the login page -- a security risk.
2. Admin role check is purely client-side (localStorage), easily manipulated by anyone.
3. The signup page allows selecting any role including potentially manipulating to admin.
4. No server-side admin protection exists.

### Changes

#### 1. Remove admin credentials from Login page
- Delete the `<p>` tag on line 68-70 in `Login.tsx` that shows `Admin: admin@annadanam.org / admin123`.

#### 2. Harden admin access in AuthContext
- Prevent anyone from signing up with role `admin` -- the `signup` function should reject or force-override any attempt to set `role: 'admin'`.
- Keep the seeded admin account as the only admin.

#### 3. Protect the Admin route
- In `Admin.tsx`, add a proper redirect with a toast message ("Access denied") when a non-admin tries to visit `/admin`.
- In `Header.tsx`, the "Admin Panel" menu item is already gated behind `user.role === 'admin'` -- keep this, but also hide the `/admin` route from the URL bar for non-admins by redirecting.

#### 4. Polish Login and Signup pages
- **Login page**: Clean, minimal design -- remove the credentials hint, add a "Forgot password?" link placeholder, keep the "Don't have an account? Sign Up" link.
- **Signup page**: Remove any possibility of selecting `admin` role (the current select only has donor/recipient/volunteer, which is already correct). Add subtle design polish (consistent spacing, better placeholder text).

### Files Modified
- `src/pages/Login.tsx` -- remove admin creds line, minor polish
- `src/context/AuthContext.tsx` -- block admin role in signup
- `src/pages/Admin.tsx` -- add proper access denied toast and redirect

