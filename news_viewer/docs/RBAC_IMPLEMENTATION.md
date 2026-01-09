# Role-Based Access Control (RBAC) Implementation Guide

## Overview
This document describes the role-based access control system implemented for the News Viewer application.

## Role Levels

| Role | Level | Description | Access |
|------|-------|-------------|--------|
| **Basic User** | 0 | Default user | News viewing only |
| **Advanced User** | 1 | Enhanced access | News + additional features (future) |
| **Admin** | 2 | Administrative access | News + Person data access |
| **Super Admin** | 3+ | Full system access | All features |

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role INTEGER NOT NULL DEFAULT 0,  -- Role level
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);
```

### Migration
If you have an existing `users` table, run the migration script in `schema_users.sql`:
```bash
psql -U your_user -d your_database -f schema_users.sql
```

This will add the `role` column with a default value of 0 for existing users.

## Backend Implementation

### 1. Dependencies (`dependencies.py`)

**`get_current_user()`**
- Validates JWT token
- Fetches user from database including role
- Returns `UserResponse` with role field

**`require_role(minimum_role: int)`**
- Dependency factory for role-based access
- Checks if user's role >= minimum_role
- Returns 403 Forbidden if insufficient permissions

### 2. Usage in Routes

**Apply to entire router:**
```python
from dependencies import require_role

router = APIRouter(
    prefix="/admin",
    dependencies=[Depends(require_role(2))]  # Require role 2+
)
```

**Apply to specific endpoint:**
```python
@router.get("/sensitive-data")
async def get_sensitive_data(
    user: UserResponse = Depends(require_role(3))  # Require role 3+
):
    ...
```

### 3. Current Route Protection

| Route | Minimum Role | Access Level |
|-------|--------------|--------------|
| `/news/*` | 0 | All authenticated users |
| `/person/*` | 2 | Admin and above |
| `/auth/*` | N/A | Public (login/register) |

## User Management

### 1. Interactive Script (`manage_users.py`)

```bash
python manage_users.py
```

**Features:**
- ✅ Add new user with role
- ✅ Update user password
- ✅ Update user role
- ✅ List all users with roles

**Example Session:**
```
============================================================
User Management Script - News Viewer (RBAC)
============================================================

📌 Role Levels:
   0: Basic User (News only)
   1: Advanced User
   2: Admin (Person data access)
   3: Super Admin

============================================================

1. Add new user
2. Update user password
3. Update user role
4. List all users
5. Exit

Enter your choice (1-5): 1

--- Add New User ---
Enter username: john
Enter password: ********
Confirm password: ********

Select role:
  0: Basic User (News only)
  1: Advanced User
  2: Admin (Person data access)
  3: Super Admin
Enter role number (default 0): 2

✅ User 'john' created successfully with role 2 (Admin (Person data access))
```

### 2. Bulk Import (`bulk_import_users.py`)

```bash
python bulk_import_users.py
```

**File Format:** `username,password,role`
- Role is optional, defaults to 0

**Example File (`users.txt`):**
```
# Admin users
admin,SecurePass123!,3
manager,ManagerPass456,2

# Regular users
john,password123,0
jane,password456,0

# Advanced users
analyst,analyst789,1
```

**Run Import:**
```bash
python bulk_import_users.py
# Enter: users.txt
```

## Frontend Integration

### 1. Update Auth Context

The user object now includes the `role` field:

```typescript
interface User {
    id: number;
    username: string;
    role: number;  // ← New field
    created_at: string;
    last_login: string | null;
}
```

### 2. Conditional Rendering

**Hide features based on role:**
```typescript
import { useAuth } from './contexts/AuthContext';

function Dashboard() {
    const { user } = useAuth();
    
    return (
        <div>
            {/* Always visible */}
            <NewsSection />
            
            {/* Only for role 2+ */}
            {user && user.role >= 2 && (
                <PersonDataSection />
            )}
            
            {/* Only for role 3+ */}
            {user && user.role >= 3 && (
                <AdminPanel />
            )}
        </div>
    );
}
```

### 3. Route Protection

**Protected Route Component:**
```typescript
interface ProtectedRouteProps {
    children: React.ReactNode;
    minimumRole: number;
}

function ProtectedRoute({ children, minimumRole }: ProtectedRouteProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!user || user.role < minimumRole) {
            navigate('/dashboard');
            // Show error toast
        }
    }, [user, minimumRole, navigate]);
    
    if (!user || user.role < minimumRole) {
        return null;
    }
    
    return <>{children}</>;
}
```

**Usage in Routes:**
```typescript
<Routes>
    <Route path="/news" element={<NewsPage />} />
    
    <Route 
        path="/person/*" 
        element={
            <ProtectedRoute minimumRole={2}>
                <PersonRoutes />
            </ProtectedRoute>
        } 
    />
    
    <Route 
        path="/admin" 
        element={
            <ProtectedRoute minimumRole={3}>
                <AdminPanel />
            </ProtectedRoute>
        } 
    />
</Routes>
```

## Security Considerations

### 1. Backend Enforcement
- ✅ All role checks happen on the backend
- ✅ Frontend hiding is for UX only, not security
- ✅ API returns 403 Forbidden for insufficient permissions

### 2. Token Security
- ✅ JWT tokens include username (not role)
- ✅ Role is fetched from database on each request
- ✅ Role changes take effect immediately

### 3. Default Permissions
- ✅ New users default to role 0 (Basic User)
- ✅ Explicit role assignment required for elevated access
- ✅ No automatic role escalation

## Testing

### 1. Create Test Users

```bash
python manage_users.py
```

Create users with different roles:
- `user_basic` (role 0)
- `user_admin` (role 2)
- `user_super` (role 3)

### 2. Test API Access

**Role 0 User:**
```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user_basic","password":"password123"}'

# Access news (should work)
curl http://localhost:8000/news/raw \
  -H "Authorization: Bearer <token>"

# Access person data (should fail with 403)
curl http://localhost:8000/person/ministry-structure \
  -H "Authorization: Bearer <token>"
```

**Role 2 User:**
```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user_admin","password":"password123"}'

# Access person data (should work)
curl http://localhost:8000/person/ministry-structure \
  -H "Authorization: Bearer <token>"
```

## Migration Checklist

- [ ] Run database migration (`schema_users.sql`)
- [ ] Update existing users' roles as needed
- [ ] Test backend role enforcement
- [ ] Update frontend to include role field
- [ ] Implement frontend route protection
- [ ] Add role-based UI hiding
- [ ] Test with different role levels
- [ ] Update documentation for team

## Future Enhancements

### Potential Role Levels
- **Role 1**: Access to analytics/reports
- **Role 4**: System configuration
- **Role 5**: User management

### Additional Features
- Role-based data filtering
- Audit logging for role changes
- Time-based role assignments
- Role groups/permissions matrix

## Troubleshooting

### Issue: 403 Forbidden on person routes
**Solution:** Check user role in database:
```sql
SELECT username, role FROM users WHERE username = 'your_username';
```

### Issue: Role not updating
**Solution:** Role is fetched from database on each request. Clear JWT token and re-login.

### Issue: Migration fails
**Solution:** Check if role column already exists:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';
```

## Support

For questions or issues:
1. Check this documentation
2. Review backend logs for 403 errors
3. Verify database schema
4. Test with manage_users.py script
