# Library Management System - Complete Features

## 🔐 Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (STUDENT, TEACHER, LIBRARIAN, ADMIN)
- **Email verification** with OTP system
- **Password reset** functionality
- **Secure logout** with token invalidation

## 📚 Book Management
- **CRUD operations** for books with soft delete (archive)
- **Search functionality** by title and author
- **Book unarchive** capability
- **Role restrictions**: Only LIBRARIAN/ADMIN can create/update/delete books

## 🔄 Loan System
- **Borrow books** (any authenticated user)
- **Return books** (LIBRARIAN/ADMIN only)
- **Renew loans** (LIBRARIAN/ADMIN only)
- **View all loans** (LIBRARIAN/ADMIN only)
- **View user-specific loans** (LIBRARIAN/ADMIN only)
- **Overdue loans tracking**

## 📋 Reservation System
- **Reserve books** when they're borrowed
- **Reservation expiry** (7 days)
- **First-come-first-served** queue system
- **Automatic notification** when book becomes available
- **Cancel reservations** (users can cancel their own)
- **View reservations** (users can view their own, LIBRARIAN/ADMIN can view all)

## 💰 Fines & Penalties System
- **Automatic fine calculation** for overdue books
- **Manual fine creation** (LIBRARIAN/ADMIN)
- **Fine status management** (PENDING, PAID, WAIVED)
- **Fine payment tracking**
- **Fine waiver** capability (LIBRARIAN/ADMIN)
- **View fines** (users can view their own, LIBRARIAN/ADMIN can view all)

## 📧 Email Notifications
- **Registration confirmation** with OTP
- **Password reset** OTP
- **Book borrowed** confirmation with due date
- **Book returned** confirmation
- **Reservation placed** confirmation
- **Reservation cancelled** notification
- **Book available** notification (when reserved book is returned)
- **Due date reminders** (1 day before due date)
- **Overdue notifications** with fine amount

## 👥 User Management
- **User registration** with role assignment
- **User profile** management
- **User activation/deactivation**
- **Role-based access** to user data

## 📊 Activity Logging
- **Comprehensive audit trail** for all actions
- **Filterable logs** by user, action, and date range
- **Automatic logging** of all system events

## 🔧 Library Settings
- **Configurable loan duration** (default: 14 days)
- **Configurable fine per day** (default: $1.00)
- **Maximum books per user** (default: 5)

## 🚀 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/login` - Login user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info

### Books
- `GET /book` - Get all books (public)
- `GET /book/search/:q` - Search books (public)
- `GET /book/:id` - Get book by ID (public)
- `POST /book` - Create book (LIBRARIAN/ADMIN)
- `PATCH /book/:id` - Update book (LIBRARIAN/ADMIN)
- `DELETE /book/:id` - Archive book (LIBRARIAN/ADMIN)
- `PATCH /book/:id/unarchive` - Unarchive book (LIBRARIAN/ADMIN)

### Loans
- `POST /loan/borrow` - Borrow book (authenticated)
- `PATCH /loan/:id/return` - Return book (LIBRARIAN/ADMIN)
- `PATCH /loan/:id/renew` - Renew loan (LIBRARIAN/ADMIN)
- `GET /loan/all` - Get all loans (LIBRARIAN/ADMIN)
- `GET /loan/user/:userId` - Get user loans (LIBRARIAN/ADMIN)
- `GET /loan/overdue` - Get overdue loans (LIBRARIAN/ADMIN)
- `POST /loan/send-due-reminders` - Send due date reminders (LIBRARIAN/ADMIN)
- `POST /loan/send-overdue-notifications` - Send overdue notifications (LIBRARIAN/ADMIN)

### Reservations
- `POST /reservation` - Create reservation (authenticated)
- `GET /reservation` - Get all reservations (LIBRARIAN/ADMIN)
- `GET /reservation/my` - Get user's reservations (authenticated)
- `DELETE /reservation/:id` - Cancel reservation (authenticated)

### Fines
- `POST /fines` - Create fine (LIBRARIAN/ADMIN)
- `GET /fines` - Get all fines (LIBRARIAN/ADMIN)
- `GET /fines/my` - Get user's fines (authenticated)
- `GET /fines/:id` - Get fine by ID (LIBRARIAN/ADMIN)
- `PATCH /fines/:id` - Update fine (LIBRARIAN/ADMIN)
- `PATCH /fines/:id/pay` - Mark fine as paid (LIBRARIAN/ADMIN)
- `PATCH /fines/:id/waive` - Waive fine (LIBRARIAN/ADMIN)
- `DELETE /fines/:id` - Delete fine (ADMIN)
- `POST /fines/calculate-overdue` - Calculate overdue fines (LIBRARIAN/ADMIN)

### Users
- `POST /user` - Create user (ADMIN)
- `GET /user` - Get all users (LIBRARIAN/ADMIN)
- `GET /user/me` - Get current user profile (authenticated)
- `GET /user/:id` - Get user by ID (LIBRARIAN/ADMIN)
- `PATCH /user/:id` - Update user (LIBRARIAN/ADMIN)
- `DELETE /user/:id` - Delete user (ADMIN)

### Activities
- `POST /activities` - Create activity log (authenticated)
- `GET /activities` - Get activity logs with filters (authenticated)

## 🔒 Security Features
- **Password hashing** with bcrypt
- **JWT token expiration** (15 minutes access, 7 days refresh)
- **Role-based route protection**
- **Input validation** with class-validator
- **SQL injection protection** via Prisma ORM
- **Email verification** required for login
- **Secure token storage** in database

## 📋 Database Schema
The system uses PostgreSQL with the following main entities:
- **User**: Authentication, roles, verification status
- **LibraryItem**: Books with status tracking
- **Loan**: Book borrowing records
- **Reservation**: Book reservation queue
- **Fine**: Penalty tracking
- **Transaction**: Activity logging
- **LibrarySettings**: System configuration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- SMTP email service (Gmail, Outlook, etc.)

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/library_db"

# JWT Secrets
JWT_ACCESS_SECRET="your_access_secret_here"
JWT_REFRESH_SECRET="your_refresh_secret_here"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
```

### Installation
```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

## 🧪 Testing the System

### 1. Register Users
```bash
# Register as a student
POST /auth/register
{
  "name": "John Student",
  "email": "student@example.com",
  "password": "password123",
  "role": "STUDENT"
}

# Register as a librarian
POST /auth/register
{
  "name": "Jane Librarian", 
  "email": "librarian@example.com",
  "password": "password123",
  "role": "LIBRARIAN"
}
```

### 2. Verify Email
```bash
POST /auth/verify-email
{
  "email": "student@example.com",
  "otp": "1234"  # Check email for OTP
}
```

### 3. Login
```bash
POST /auth/login
{
  "email": "student@example.com",
  "password": "password123"
}
```

### 4. Test Role-Based Access
- Student trying to create book → 403 Forbidden
- Librarian creating book → 200 Success
- Student reserving book → 200 Success
- Student returning book → 403 Forbidden

## 🔄 Automated Tasks
The system supports automated email notifications:
- **Due date reminders**: Run daily to notify users 1 day before due date
- **Overdue notifications**: Run daily to notify users of overdue books
- **Fine calculation**: Run daily to calculate overdue fines

## 📈 Future Enhancements
- **Multiple book copies** support
- **Advanced search** with filters
- **Book categories** and tags
- **User preferences** and reading lists
- **Analytics dashboard** for librarians
- **Mobile app** integration
- **Payment integration** for fines
- **SMS notifications** in addition to email
