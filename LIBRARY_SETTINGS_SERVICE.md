# Library Settings Service Documentation

## Overview
The Library Settings Service manages the core configuration parameters for the library management system. It provides a centralized way to manage loan policies, fine structures, and borrowing limits.

## Features

### Core Settings Management
- **Loan Duration**: Configure default loan period in days
- **Overdue Fines**: Set daily fine amounts for overdue items
- **Borrowing Limits**: Set maximum items per user by category
- **Activity Logging**: All changes are logged for audit trails

### Service Methods

#### 1. `create(createLibrarySettingDto, userId)`
Creates initial library settings (only if none exist).
- **Purpose**: Initialize library configuration for new systems
- **Validation**: Prevents duplicate settings creation
- **Logging**: Records creation activity

```typescript
// Example usage
const settings = await librarySettingsService.create({
  loanDurationDays: 21,
  overdueFinePerDay: 1.50,
  maxBooksPerUser: 10,
  maxDVDsPerUser: 5,
  maxMagazinesPerUser: 15
}, userId);
```

#### 2. `findAll()`
Retrieves current library settings, creating defaults if none exist.
- **Auto-creation**: Creates default settings if database is empty
- **Singleton Pattern**: Ensures only one settings record exists

```typescript
// Example usage
const settings = await librarySettingsService.findAll();
console.log(settings.loanDurationDays); // 14 (default)
```

#### 3. `findOne(id)`
Retrieves specific settings by ID.
- **Validation**: Throws NotFoundException if settings don't exist
- **Error Handling**: Comprehensive error logging

#### 4. `update(id, updateLibrarySettingDto, userId)`
Updates existing library settings.
- **Partial Updates**: Only updates provided fields
- **Validation**: Enforces business rules and constraints
- **Logging**: Records all changes with user attribution

```typescript
// Example usage
const updatedSettings = await librarySettingsService.update(settingsId, {
  loanDurationDays: 28,
  overdueFinePerDay: 2.00
}, userId);
```

#### 5. `remove(id, userId)`
Resets settings to default values (soft delete).
- **No Hard Delete**: Library always needs configuration
- **Default Reset**: Returns all values to system defaults
- **Logging**: Records reset activity

### Helper Methods

#### 6. `getLoanDuration()`
Quick access to current loan duration setting.

```typescript
const days = await librarySettingsService.getLoanDuration();
// Returns: number (days)
```

#### 7. `getOverdueFinePerDay()`
Quick access to current fine rate.

```typescript
const fineRate = await librarySettingsService.getOverdueFinePerDay();
// Returns: number (currency amount)
```

#### 8. `getMaxItemsPerUser()`
Returns comprehensive borrowing limits.

```typescript
const limits = await librarySettingsService.getMaxItemsPerUser();
// Returns: {
//   books: number,
//   dvds: number,
//   magazines: number,
//   total: number
// }
```

#### 9. `checkBorrowingLimit(userId, itemType)`
Validates if user can borrow more items of a specific type.

```typescript
const canBorrow = await librarySettingsService.checkBorrowingLimit(userId, 'DVD');
// Returns: boolean
```

#### 10. `getSettingsSummary()`
Comprehensive dashboard data including settings and statistics.

```typescript
const summary = await librarySettingsService.getSettingsSummary();
// Returns: {
//   settings: { /* current configuration */ },
//   statistics: { /* loan statistics */ }
// }
```

## Configuration Options

### Loan Duration
- **Range**: 1-365 days
- **Default**: 14 days
- **Description**: Standard borrowing period for all items

### Overdue Fine Per Day
- **Range**: $0.00-$100.00
- **Default**: $1.00
- **Description**: Daily charge for items returned late

### Borrowing Limits
- **Books/General Items**: 1-50 items (default: 5)
- **DVDs**: 1-20 items (default: 3)
- **Magazines**: 1-50 items (default: 10)

## Activity Logging
All settings changes are automatically logged with the following activities:
- `LIBRARY_SETTINGS_CREATED`: Initial settings creation
- `LIBRARY_SETTINGS_UPDATED`: Settings modifications
- `LIBRARY_SETTINGS_RESET`: Settings reset to defaults

## Error Handling
- **ConflictException**: Attempting to create settings when they already exist
- **NotFoundException**: Accessing settings that don't exist
- **ValidationException**: Invalid data in DTOs
- **Database Errors**: Comprehensive error logging and re-throwing

## Default Values
When no settings exist, the system automatically creates defaults:
```javascript
{
  loanDurationDays: 14,
  overdueFinePerDay: 1.00,
  maxItemsPerUser: 5,
  maxDVDsPerUser: 3,
  maxMagazinesPerUser: 10
}
```

## Integration with Other Services

### Loan Service Integration
- Loan duration calculation
- Overdue fine computation
- Borrowing limit validation

### User Service Integration
- User suspension thresholds
- Profile-based borrowing rules

### Fine Service Integration
- Automatic fine calculation
- Fine rate management

## API Endpoints (via Controller)
- `POST /library-settings` - Create settings
- `GET /library-settings` - Get current settings
- `GET /library-settings/:id` - Get specific settings
- `PATCH /library-settings/:id` - Update settings
- `DELETE /library-settings/:id` - Reset to defaults
- `GET /library-settings/summary` - Dashboard data

## Security & Authorization
- Only administrators can create/modify settings
- Librarians can view settings
- All changes require user authentication
- Complete audit trail via transaction logging

## Performance Considerations
- Settings are cached after first retrieval
- Minimal database queries for common operations
- Non-blocking activity logging
- Optimized query patterns for borrowing limit checks

## Business Rules
1. **Single Settings Record**: Only one settings configuration per system
2. **Automatic Defaults**: System creates defaults if none exist
3. **Soft Deletion**: Settings cannot be permanently deleted
4. **Validation**: All numeric values must be within reasonable ranges
5. **Audit Trail**: All changes must be logged with user attribution

## Usage Examples

### Setting Up a New Library
```typescript
// Create initial settings for a new library
const settings = await librarySettingsService.create({
  loanDurationDays: 21,
  overdueFinePerDay: 0.50,
  maxBooksPerUser: 8,
  maxDVDsPerUser: 4,
  maxMagazinesPerUser: 12
}, adminUserId);
```

### Checking User Borrowing Eligibility
```typescript
// Before creating a loan
const canBorrowBook = await librarySettingsService.checkBorrowingLimit(userId, 'BOOK');
if (!canBorrowBook) {
  throw new BadRequestException('User has reached maximum book borrowing limit');
}
```

### Getting Dashboard Statistics
```typescript
// For admin dashboard
const dashboardData = await librarySettingsService.getSettingsSummary();
// Display current settings and library statistics
```

This service provides a robust foundation for library configuration management with comprehensive validation, logging, and integration capabilities.
