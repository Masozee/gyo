# GYA - Next.js Dashboard with Hono API

A modern full-stack application built with Next.js 15, Hono API framework, and SQLite database.

## 🚀 Features

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Hono API framework for fast and lightweight APIs
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Complete user authentication system
- **UI Components**: shadcn/ui with dark mode support
- **Command Palette**: ⌘K shortcut for quick navigation
- **Responsive Design**: Mobile-first approach with modern UI

## 🏗️ Architecture

### Frontend (Next.js)
- **Dashboard**: Modern sidebar navigation with three menu groups
- **Authentication**: Login/Register forms with validation
- **Profile Management**: Complete user profile with 20+ fields
- **Theme Support**: Light/Dark/System theme toggle
- **Command Palette**: Quick navigation and search

### Backend (Hono API)
- **Fast & Lightweight**: Hono framework for optimal performance
- **RESTful APIs**: Clean API endpoints for authentication and user management
- **CORS Support**: Configured for cross-origin requests
- **Logging**: Built-in request logging middleware

## 📁 Project Structure

```
├── api/                    # Hono API server
│   ├── index.ts           # Main API routes
│   └── server.ts          # Server configuration
├── app/                   # Next.js App Router
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── profile/          # Profile page
│   └── register/         # Registration page
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── app-sidebar.tsx  # Main sidebar
│   ├── command-palette.tsx
│   ├── login-form.tsx
│   ├── register-form.tsx
│   ├── theme-toggle.tsx
│   └── user-profile.tsx
├── lib/                 # Utilities and configuration
│   ├── auth.ts         # Authentication logic
│   ├── config.ts       # API configuration
│   ├── db.ts           # Database connection
│   ├── schema.ts       # Database schema
│   └── utils.ts        # Utility functions
└── scripts/            # Database scripts
    ├── init-db.ts      # Initialize database
    └── create-test-user.ts
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Initialize database tables
npm run db:init

# Create a test user (email: test@example.com, password: password123)
npm run db:seed
```

### 3. Development
```bash
# Run both Next.js and Hono API servers
npm run dev:all

# Or run them separately:
npm run dev      # Next.js (http://localhost:3002)
npm run api:dev  # Hono API (http://localhost:3001)
```

### 4. Production Build
```bash
# Build Next.js application
npm run build

# Build and start both servers
npm run start:all
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Users
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile

### Health Check
- `GET /` - API health check

## 🎯 Usage Examples

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Register
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"password123",
    "firstName":"John",
    "lastName":"Doe",
    "username":"johndoe"
  }'
```

### Update Profile
```bash
curl -X PUT http://localhost:3001/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John Updated",
    "company":"Acme Corp",
    "jobTitle":"Developer"
  }'
```

## 🎨 UI Features

### Dashboard Navigation
- **Workspace**: Dashboard, Projects, Tasks, Profile
- **Web**: Website, Analytics, SEO
- **Payments**: Transactions, Invoices, Wallet, Orders

### Theme Support
- Light/Dark/System theme toggle
- Persistent theme preference
- Smooth transitions

### Command Palette
- Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)
- Quick navigation to any page
- Search functionality

## 🗄️ Database Schema

### Users Table
- Basic info: email, password, firstName, lastName, username
- Profile: avatar, bio, phone, dateOfBirth
- Address: address, city, state, zipCode, country
- Professional: company, jobTitle, website
- System: isActive, emailVerified, createdAt, updatedAt

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
API_PORT=3001

# Database
DATABASE_URL=file:local.db
```

### API Configuration
The API URL is configurable via `lib/config.ts`:
```typescript
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
};
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Next.js development server
npm run api:dev      # Hono API development server
npm run dev:all      # Both servers concurrently

# Production
npm run build        # Build Next.js application
npm run start        # Start Next.js production server
npm run api:start    # Start Hono API production server
npm run start:all    # Both servers in production

# Database
npm run db:init      # Initialize database
npm run db:seed      # Create test user
npm run db:generate  # Generate migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio

# Other
npm run lint         # Run ESLint
```

## 🚀 Why Hono?

Hono was chosen as the API framework for several reasons:

1. **Performance**: Ultra-fast runtime with minimal overhead
2. **TypeScript**: First-class TypeScript support
3. **Lightweight**: Small bundle size and memory footprint
4. **Modern**: Built for modern JavaScript runtimes
5. **Middleware**: Rich ecosystem of middleware
6. **Developer Experience**: Excellent DX with great tooling

## 🔒 Security Features

- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- SQL injection prevention with Drizzle ORM
- Secure session management (localStorage for demo)

## 🎯 Next Steps

- [ ] Add JWT authentication
- [ ] Implement proper session management
- [ ] Add API rate limiting
- [ ] Set up production deployment
- [ ] Add comprehensive testing
- [ ] Implement real-time features with WebSockets
- [ ] Add file upload functionality
- [ ] Implement email verification

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js, Hono, and modern web technologies.
