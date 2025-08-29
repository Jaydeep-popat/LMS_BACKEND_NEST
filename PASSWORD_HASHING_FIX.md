# Password Hashing Fix for Admin User Creation

## Problem Fixed
When admins created users through the `/user` endpoint, passwords were stored in plain text instead of being hashed. This created a security vulnerability and inconsistency with user self-registration.

## Changes Made

### 1. Updated UserService (`src/user/user.service.ts`)

#### `create()` method:
- ✅ **Added password hashing** using bcrypt with salt rounds of 10
- ✅ **Added duplicate email check** before creation
- ✅ **Set `isVerified: true`** for admin-created users (no email verification needed)
- ✅ **Excluded sensitive fields** from response (password, otp, refreshToken)

#### `findAll()` method:
- ✅ **Excluded sensitive fields** from response for security

#### `findOne()` method:
- ✅ **Excluded sensitive fields** from response for security

#### `update()` method:
- ✅ **Added password hashing** when password is being updated
- ✅ **Excluded sensitive fields** from response

## Security Improvements

### Before Fix:
```typescript
// ❌ Password stored in plain text
await this.prisma.user.create({ data: createUserDto });
```

### After Fix:
```typescript
// ✅ Password properly hashed
const passwordHash = await bcrypt.hash(createUserDto.password, 10);
const userData = {
  ...createUserDto,
  password: passwordHash,
  isVerified: true,
};
```

## API Behavior Changes

### User Creation by Admin:
- **Route**: `POST /user` (Admin only)
- **Authentication**: Requires JWT + Admin role
- **Password**: Now properly hashed before storage
- **Verification**: Admin-created users are automatically verified
- **Response**: Excludes sensitive fields (password, tokens, OTP)

### User Self-Registration:
- **Route**: `POST /auth/register` (Public)
- **Password**: Already properly hashed (no changes)
- **Verification**: Requires email OTP verification

## Benefits

1. **Security**: All passwords now consistently hashed
2. **Consistency**: Same hashing method for both registration flows
3. **Privacy**: Sensitive fields excluded from API responses
4. **Admin UX**: Admin-created users don't need email verification

## Testing

### Valid Admin User Creation Request:
```bash
POST /user
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@library.com",
  "password": "securePassword123",
  "role": "LIBRARIAN",
  "isActive": true
}
```

### Response (passwords excluded):
```json
{
  "id": "clm123...",
  "name": "John Doe",
  "email": "john.doe@library.com",
  "role": "LIBRARIAN",
  "isActive": true,
  "isVerified": true,
  "createdAt": "2025-08-29T...",
  "updatedAt": "2025-08-29T..."
}
```

## Security Notes

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ No sensitive data in API responses
- ✅ Proper error handling for duplicate emails
- ✅ Admin-created users automatically verified
- ✅ Consistent with auth service implementation

The password hashing vulnerability has been completely resolved!
