# Library Management System Frontend - Next.js Development Prompt

## Project Overview
Create a modern, responsive Library Management System frontend using **Next.js 14** with **TypeScript**. This will connect to an existing NestJS backend API with comprehensive library operations, user management, and administrative features.

## Tech Stack Requirements
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS(latest version) + shadcn/ui components
- **State Management**: Zustand or React Query (TanStack Query)
- **Authentication**: NextAuth.js or custom JWT implementation
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts or Chart.js
- **Tables**: TanStack Table
- **Date Handling**: date-fns
- **HTTP Client**: Axios

## Project Structure
```
src/
├── app/                          # Next.js 14 app router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── library-items/        # Books, DVDs, Equipment management
│   │   ├── loans/                # Loan management
│   │   ├── users/                # User management (admin)
│   │   ├── activities/           # Activity logs
│   │   ├── reservations/         # Reservations
│   │   ├── fines/                # Fine management
│   │   └── settings/             # Library settings
│   ├── api/                      # API routes (if needed)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Form components
│   ├── tables/                   # Data table components
│   ├── charts/                   # Chart components
│   ├── layout/                   # Layout components
│   └── common/                   # Shared components
├── lib/
│   ├── api.ts                    # API client setup
│   ├── auth.ts                   # Authentication logic
│   ├── utils.ts                  # Utility functions
│   ├── validations.ts            # Zod schemas
│   └── constants.ts              # App constants
├── hooks/                        # Custom React hooks
├── store/                        # State management
├── types/                        # TypeScript type definitions
└── utils/                        # Utility functions
```

## Core Features to Implement

### 1. **Authentication System**
- **Login Page**: Email/password authentication
- **Registration Page**: User self-registration with email verification
- **Password Reset**: Forgot password flow
- **Role-based Access**: Different UI for Student, Teacher, Librarian, Admin
- **Session Management**: JWT token handling, auto-refresh

### 2. **Dashboard Views by Role**

#### **Student/Teacher Dashboard**
- Personal book loans overview
- Due dates and overdue notifications
- Quick search for available books
- Reservation management
- Fine status and payment
- Personal activity history

#### **Librarian Dashboard**
- Library statistics overview
- Recent activities feed
- Quick actions (check in/out books)
- Overdue loans management
- User search and management

#### **Admin Dashboard**
- Complete system statistics
- User management
- Library settings configuration
- System activity logs
- Reports and analytics

### 3. **Library Items Management**

#### **Item Catalog**
- **Multi-type Support**: Books, DVDs, Equipment, Magazines, Software
- **Advanced Search**: Title, author, ISBN, category, availability
- **Filters**: Item type, status, genre, publication year
- **Item Details**: Comprehensive metadata display
- **Availability Status**: Real-time availability with visual indicators

#### **Item Administration** (Librarian/Admin)
- **Add New Items**: Different forms for each item type
  - Books: Title, Author, ISBN, Genre, Publisher, Year
  - DVDs: Title, Director, Genre, Duration, Rating
  - Equipment: Name, Model, Serial Number, Category
- **Bulk Import**: CSV/Excel import functionality
- **Item Editing**: Update item details and metadata
- **Archive Management**: Soft delete and restore items

### 4. **Loan Management System**

#### **Borrowing Interface**
- **Quick Checkout**: Scan or search item, select user
- **Loan Details**: Due dates, renewal options
- **Bulk Operations**: Multiple item checkout
- **Reservation Queue**: Handle waitlists for popular items

#### **Loan Tracking**
- **Active Loans Table**: Sortable, filterable loan list
- **Due Date Management**: Color-coded due date indicators
- **Return Processing**: Simple return interface
- **Renewal System**: Easy loan extensions
- **Overdue Management**: Automated notifications and fine calculation

### 5. **User Management** (Admin/Librarian)

#### **User Administration**
- **User Directory**: Searchable user list with roles
- **User Profiles**: Comprehensive user information
- **Role Management**: Assign and modify user roles
- **Account Status**: Active, suspended, archived users
- **Bulk Operations**: Import users, bulk role changes

#### **User Analytics**
- **Borrowing History**: User's complete loan history
- **Activity Tracking**: User actions and system interactions
- **Fine Management**: Outstanding fines and payment history

### 6. **Reservation System**
- **Reserve Items**: Queue system for unavailable items
- **Reservation Management**: View and cancel reservations
- **Notification System**: Alerts when reserved items become available
- **Priority Handling**: Special handling for faculty/priority users

### 7. **Fine Management**
- **Fine Calculation**: Automatic overdue fine computation
- **Payment Processing**: Record fine payments
- **Fine Waivers**: Admin ability to waive fines
- **Payment History**: Complete financial transaction records

### 8. **Activity & Analytics**

#### **Activity Logs**
- **System Activities**: All user actions and system events
- **Search & Filter**: Advanced log filtering capabilities
- **Export Options**: CSV/PDF export for reports

#### **Analytics Dashboard**
- **Usage Statistics**: Borrowing trends, popular items
- **User Analytics**: Active users, borrowing patterns
- **System Health**: Performance metrics and alerts

### 9. **Library Settings** (Admin Only)
- **Loan Policies**: Configure loan duration, fine rates
- **Borrowing Limits**: Set max items per user by type
- **System Configuration**: Library information, hours
- **Notification Settings**: Email templates and schedules

## UI/UX Requirements

### **Design System**
- **Color Scheme**: Professional library theme (blues, greens, neutral grays)
- **Typography**: Clear, readable fonts optimized for data display
- **Responsive Design**: Mobile-first approach, tablet and desktop optimized
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation
- **Dark Mode**: Toggle between light and dark themes

### **Component Standards**
- **Data Tables**: Advanced sorting, filtering, pagination
- **Forms**: Multi-step forms for complex data entry
- **Modals**: Consistent modal patterns for actions
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages and recovery options

### **Key Pages to Build**

#### **1. Landing/Home Page**
- Library overview and quick search
- Featured books and announcements
- Login/register prompts for guests

#### **2. Library Catalog (/library-items)**
- Advanced search interface
- Item grid/list view toggle
- Item detail pages with availability
- Quick reserve/borrow actions

#### **3. User Dashboard (/dashboard)**
- Personalized dashboard by role
- Quick stats and recent activities
- Action shortcuts for common tasks

#### **4. Loan Management (/loans)**
- Active loans table
- Check-in/check-out interface
- Overdue loans with automated actions

#### **5. User Management (/users)** (Admin/Librarian)
- User directory with advanced search
- User profile management
- Bulk user operations

#### **6. Activity Logs (/activities)**
- Filterable activity timeline
- Export and reporting capabilities

#### **7. Settings (/settings)**
- Library configuration forms
- User preference settings
- System maintenance options

## Advanced Features

### **Search & Discovery**
- **Global Search**: Site-wide search with intelligent results
- **Auto-suggestions**: Real-time search suggestions
- **Recently Viewed**: User's browsing history
- **Recommendations**: Suggest items based on user behavior

### **Notifications**
- **Real-time Alerts**: Due date reminders, reservation notifications
- **Email Integration**: Automated email notifications
- **In-app Notifications**: Bell icon with notification center

### **Reporting**
- **Dashboard Charts**: Interactive charts for statistics
- **Custom Reports**: Generate reports with date ranges and filters
- **Export Options**: PDF, CSV, Excel export capabilities

### **Mobile Experience**
- **PWA Support**: Progressive Web App capabilities
- **Mobile Scanner**: Barcode scanning for quick item lookup
- **Offline Mode**: Basic functionality when offline

## Technical Specifications

### **API Integration**
- **Base URL Configuration**: Environment-based API endpoints
- **Authentication Headers**: JWT token management
- **Error Handling**: Consistent error response handling
- **Request/Response Types**: Full TypeScript interfaces

### **Performance**
- **Code Splitting**: Route-based code splitting
- **Image Optimization**: Next.js Image component usage
- **Caching**: Implement proper caching strategies
- **SEO**: Meta tags and structured data

### **Security**
- **CSRF Protection**: Implement CSRF tokens
- **XSS Prevention**: Sanitize user inputs
- **Role-based Routing**: Protect routes based on user roles
- **Secure Storage**: Secure token storage

## Backend API Endpoints to Integrate

### **Authentication** (`/auth`)
- POST `/auth/login` - User login
- POST `/auth/register` - User registration
- POST `/auth/logout` - User logout
- POST `/auth/forgot-password` - Password reset request
- POST `/auth/reset-password` - Reset password
- GET `/auth/me` - Get current user

### **Users** (`/user`)
- GET `/user` - Get all users (admin)
- GET `/user/me` - Get current user profile
- GET `/user/:id` - Get user by ID
- PATCH `/user/:id` - Update user
- DELETE `/user/:id` - Delete user

### **Library Items** (`/library-items`)
- GET `/library-items` - Get all items with filters
- POST `/library-items` - Add new item
- GET `/library-items/:id` - Get item details
- PATCH `/library-items/:id` - Update item
- DELETE `/library-items/:id` - Archive item
- GET `/library-items/search/:q` - Search items

### **Loans** (`/loan`)
- POST `/loan/borrow` - Create new loan
- PATCH `/loan/:id/return` - Return item
- PATCH `/loan/:id/renew` - Renew loan
- GET `/loan/my-loans` - Get user's loans
- GET `/loan/all` - Get all loans (admin)
- GET `/loan/overdue` - Get overdue loans

### **Reservations** (`/reservation`)
- POST `/reservation` - Create reservation
- GET `/reservation` - Get all reservations
- GET `/reservation/my` - Get user's reservations
- DELETE `/reservation/:id` - Cancel reservation

### **Fines** (`/fines`)
- GET `/fines` - Get all fines
- GET `/fines/my` - Get user's fines
- PATCH `/fines/:id/pay` - Pay fine
- PATCH `/fines/:id/waive` - Waive fine (admin)

### **Activities** (`/activities`)
- GET `/activities` - Get activity logs
- GET `/activities/my` - Get user's activities
- GET `/activities/stats` - Get activity statistics

### **Library Settings** (`/library-settings`)
- GET `/library-settings` - Get settings
- PATCH `/library-settings/:id` - Update settings (admin)
- GET `/library-settings/summary` - Get dashboard summary

## Deliverables

1. **Complete Next.js Application**: Fully functional frontend
2. **Component Library**: Reusable UI components
3. **Type Definitions**: Complete TypeScript interfaces
4. **Documentation**: README with setup and deployment instructions
5. **Environment Configuration**: Development and production configs

## Getting Started Template

```typescript
// Example API client setup
interface ApiConfig {
  baseURL: string;
  timeout: number;
}

// Example user type
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'LIBRARIAN' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

// Example library item type
interface LibraryItem {
  id: string;
  title: string;
  type: 'BOOK' | 'DVD' | 'EQUIPMENT' | 'MAGAZINE';
  status: 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'LOST' | 'DAMAGED';
  metadata: Record<string, any>;
  createdAt: string;
}
```

This frontend should provide a complete, professional library management interface that seamlessly integrates with your existing NestJS backend while offering an intuitive user experience for all user types.
