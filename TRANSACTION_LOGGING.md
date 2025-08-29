# Transaction Logging Implementation

## Overview
A comprehensive transaction logging system has been implemented to track all user activities and system operations across the library management system.

## Features

### TransactionService
- **Location**: `src/common/transaction.service.ts`
- **Purpose**: Centralized service for logging and retrieving user activities
- **Key Methods**:
  - `logActivity(userId, action, details?, metadata?)` - Log any user activity
  - `getUserActivities(userId, limit?)` - Get activities for a specific user
  - `getAllActivities(limit?)` - Get all activities (admin/librarian only)
  - `getActivityStats(userId?)` - Get activity statistics

### Integration Points
The TransactionService has been integrated into the following modules:

1. **Auth Service** (`src/auth/auth.service.ts`)
   - Logs user registration, login, logout, email verification
   - Logs password reset requests and completions
   - Logs admin user creation

2. **Loan Service** (`src/loan/loan.service.ts`)
   - Logs book/item borrowing
   - Logs item returns
   - Logs loan renewals and extensions

3. **User Service** (`src/user/user.service.ts`)
   - Logs user profile updates
   - Logs role changes
   - Logs user status changes (active/inactive)

4. **Book/Library Items Service** (`src/book/book.service.ts`)
   - Logs new item additions
   - Logs item updates and modifications
   - Logs item archival/deletion

5. **Activities Controller** (`src/activities/activities.controller.ts`)
   - Provides REST endpoints for viewing transaction logs
   - Supports filtering by user, action, date range
   - Provides activity statistics

## API Endpoints

### Get All Activities (Admin/Librarian)
```
GET /activities
Query Parameters:
- limit: number of results (default: 100)
- userId: filter by user ID
- action: filter by action type
- from: start date (ISO string)
- to: end date (ISO string)
```

### Get My Activities (Any authenticated user)
```
GET /activities/my
Query Parameters:
- limit: number of results (default: 50)
```

### Get Activity Statistics (Admin/Librarian)
```
GET /activities/stats
GET /activities/stats/:userId
```

## Action Types
The system logs the following action types:
- `USER_REGISTERED` - New user registration
- `USER_LOGIN` - User login
- `USER_LOGOUT` - User logout
- `EMAIL_VERIFIED` - Email verification
- `PASSWORD_RESET_REQUESTED` - Password reset request
- `PASSWORD_RESET_COMPLETED` - Password reset completion
- `ADMIN_USER_CREATED` - Admin created a new user
- `ITEM_BORROWED` - Item borrowed by user
- `ITEM_RETURNED` - Item returned by user
- `LOAN_RENEWED` - Loan period extended
- `PROFILE_UPDATED` - User profile updated
- `ROLE_CHANGED` - User role modified
- `ITEM_ADDED` - New library item added
- `ITEM_UPDATED` - Library item modified
- `ITEM_ARCHIVED` - Library item archived

## Database Schema
Activities are stored in the `Transaction` table with the following fields:
- `id` - Unique identifier
- `userId` - User who performed the action
- `action` - Type of action performed
- `details` - Human-readable description
- `metadata` - Additional JSON data
- `createdAt` - Timestamp of the action

## Usage Examples

### Logging a User Action
```typescript
// In any service
await this.transactionService.logActivity(
  userId,
  TransactionAction.ITEM_BORROWED,
  `User borrowed "${item.title}"`,
  { itemId: item.id, itemType: item.type }
);
```

### Getting User Activities
```typescript
// Get last 20 activities for a user
const activities = await this.transactionService.getUserActivities(userId, 20);
```

### Getting Activity Statistics
```typescript
// Get overall statistics
const stats = await this.transactionService.getActivityStats();

// Get statistics for a specific user
const userStats = await this.transactionService.getActivityStats(userId);
```

## Security & Privacy
- Only authenticated users can view their own activities
- Only librarians and admins can view all activities
- Sensitive information (like passwords) is never logged
- All activities include timestamps for audit trails

## Non-blocking Implementation
- All activity logging is implemented as non-blocking operations
- Failed log operations don't affect the main business logic
- Errors in logging are handled gracefully

## Benefits
1. **Audit Trail**: Complete history of all user actions
2. **Security Monitoring**: Track unauthorized access attempts
3. **Usage Analytics**: Understand system usage patterns
4. **Compliance**: Meet audit and compliance requirements
5. **Debugging**: Track down issues with detailed activity logs
6. **User Experience**: Users can see their own activity history
