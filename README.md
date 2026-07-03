# Developer Africa MW Webpage

A Next.js admin dashboard for managing students, courses, and completion records at Development Africa MW.

## Features

- Student management with auto-generated student IDs
- Course management
- Student course and completion tracking
- QR code and barcode generation for student profiles
- Supabase authentication with admin-only access
- Responsive design

## Tech Stack

- **Framework**: Next.js 13
- **Authentication**: Supabase Auth
- **Styling**: SCSS Modules
- **QR Codes**: qrcode library

## Setup Instructions

### Prerequisites

- Node.js installed
- A Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/developerafricamw-webpage-nxt.git
cd developerafricamw-webpage-nxt
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### a. Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Create a new project
3. Wait for the project to be fully initialized

#### b. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the **Project URL** and **anon/public** key
3. Create a `.env.local` file in the root directory with these credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### c. Set Up Database

1. In your Supabase project dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-setup.sql` in this repository
3. Paste and run the SQL script in the Supabase SQL Editor

#### d. Create Admin User

**Option 1: Manual Creation (Recommended)**

1. Start your Next.js app: `npm run dev`
2. Go to http://localhost:3000/login and sign up a new user with your admin email
3. In your Supabase dashboard, go to **Authentication** → **Users**
4. Copy the user ID (UUID) of the user you just created
5. Go to **SQL Editor** and run this query:

```sql
INSERT INTO public.profiles (id, email, role)
VALUES ('user-uuid-here', 'admin@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

Replace `'user-uuid-here'` with the actual UUID and `'admin@example.com'` with the actual email.

**Option 2: Signup with Admin Metadata**

When signing up, you can add a `role` metadata field. However, **Option 1** is recommended for security.

### 4. Run the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 5. Access the Admin Dashboard

- Navigate to http://localhost:3000/login
- Log in with your admin credentials
- You will be redirected to the admin dashboard at http://localhost:3000/admin

## Usage

### For Admins

1. **Login**: Access `/login` and enter your admin credentials
2. **Manage Students**: Add, view, and delete students. Auto-generated student IDs follow the format `DEV-MW{YY}{COHORT}{SEQ}`
3. **Manage Courses**: Add and delete courses
4. **Track Completion**: Assign a course to each student and update completion status/date
5. **Generate QR Codes**: Create QR codes for student profiles that can be scanned for quick access
6. **Logout**: Click the logout button to sign out

### For Non-Admins

Non-admin users will see an "Access denied" error message when trying to log in. Only users with `role = 'admin'` in the profiles table can access the admin dashboard.

## Project Structure

```
pages/
├── login.js              # Login page with Supabase authentication
├── admin.js               # Admin dashboard (protected)
├── student/[studentId].js # Student profile page
└── api/                   # API routes

lib/
└── supabase.js            # Supabase client configuration

components/
├── Layout.js              # Layout wrapper
├── footer.js              # Footer component
└── ...                    # Other components

styles/
└── admin.module.scss      # Admin and login styles

supabase-setup.sql         # SQL schema for Supabase
```

## Authentication Flow

1. User visits `/admin` or `/login`
2. If not authenticated, redirected to `/login`
3. User enters credentials
4. Supabase validates credentials
5. System checks if user has `role = 'admin'` in profiles table
6. If admin, redirect to `/admin`; otherwise show access denied error
7. Logout clears session and redirects to `/login`

## Security Features

- Row Level Security (RLS) enabled on profiles table
- Authentication state management with Supabase
- Route protection for admin pages
- Automatic session renewal via `onAuthStateChange` listener
- Environment variables for sensitive credentials

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Environment Variables

Make sure to add these in your deployment platform's environment settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### "Access denied. Admin privileges required."

- Make sure you've created an admin user following the setup instructions
- Check that the user's `role` is set to `'admin'` in the profiles table

### "An error occurred during authentication"

- Verify your Supabase credentials in `.env.local`
- Check that your Supabase project is active and accessible
- Ensure the `profiles` table exists in your Supabase database

### Cannot login after password reset

- Check your Supabase email settings
- Visit `/login` and try logging in again

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
