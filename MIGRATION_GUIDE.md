# Database Schema Migration Guide

## Step 1: Create Migration
Run this command to create a new migration with your schema changes:

```bash
npx prisma migrate dev --name "add_multiple_item_types_support"
```

This will:
- Generate a new migration file in `prisma/migrations/`
- Apply the migration to your database
- Regenerate the Prisma client

## Step 2: Alternative - Reset Database (Development Only)
If you want to start fresh (⚠️ THIS WILL DELETE ALL DATA):

```bash
npx prisma migrate reset
```

## Step 3: Generate Prisma Client
After migration, generate the updated client:

```bash
npx prisma generate
```

## Step 4: Verify Migration
Check if everything is working:

```bash
npx prisma db pull
```

## Key Changes Made to Schema:

### 1. LibraryItem Model Enhanced:
- ❌ Removed: `author` (moved to metadata)
- ❌ Removed: `genre` (replaced with category system)
- ✅ Added: `type` (ItemType enum)
- ✅ Added: `metadata` (Json field for flexible data)
- ✅ Added: `description`, `language`, `location`, `isbn`, `barcode`
- ✅ Added: `categories` (many-to-many relationship)

### 2. New Models Added:
- ✅ `Category` - For flexible categorization
- ✅ `ItemCategory` - Junction table for many-to-many

### 3. Enhanced Enums:
- ✅ `ItemType` - Supports books, DVDs, equipment, etc.
- ✅ `ItemStatus` - Added MAINTENANCE status
- ✅ `ActivityType` - Added item management activities

### 4. LibrarySettings Updated:
- ✅ `maxItemsPerUser` (renamed from maxBooksPerUser)
- ✅ `maxDVDsPerUser`, `maxMagazinesPerUser` (type-specific limits)

## Migration Strategy for Existing Data:

### Option A: Manual Data Migration (Recommended)
1. Create a migration script to convert existing books
2. Map old `author` and `genre` to new structure

### Option B: Fresh Start (If no important data)
Just run `prisma migrate reset`

## Example: Converting Existing Book Data

```sql
-- This would be in your migration file
-- Convert existing books to new structure
UPDATE "LibraryItem" SET 
  type = 'BOOK',
  metadata = json_build_object(
    'author', author,
    'genre', genre
  ),
  language = 'English'
WHERE author IS NOT NULL;

-- Remove old columns (Prisma will handle this)
```

## Usage Examples After Migration:

### Creating Different Item Types:

```typescript
// Book
await prisma.libraryItem.create({
  data: {
    title: "The Great Gatsby",
    type: "BOOK",
    metadata: {
      author: "F. Scott Fitzgerald",
      genre: "Classic Literature",
      pages: 180,
      publisher: "Scribner"
    },
    isbn: "978-0-7432-7356-5"
  }
});

// DVD
await prisma.libraryItem.create({
  data: {
    title: "Inception",
    type: "DVD",
    metadata: {
      director: "Christopher Nolan",
      duration: "148 minutes",
      rating: "PG-13",
      year: 2010
    },
    barcode: "DVD001"
  }
});

// Equipment
await prisma.libraryItem.create({
  data: {
    title: "MacBook Pro 13\"",
    type: "EQUIPMENT",
    metadata: {
      brand: "Apple",
      model: "MacBook Pro",
      serialNumber: "ABC123",
      specifications: "M1 chip, 8GB RAM"
    },
    location: "Tech Center - Shelf A"
  }
});
```

⚠️ **Important Notes:**
1. **Backup your database** before running migrations
2. **Test migrations** on a copy of your database first
3. **Update your application code** to handle the new schema structure
4. **Create seed data** for categories if needed
