# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project Name: `family-investment-tracker`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
5. Wait for project to be created (~2 minutes)

## 2. Run Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/schema.sql`
4. Paste and click "Run"
5. Verify tables were created in **Table Editor**

## 3. Get API Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key (for server-side operations)

## 4. Add Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

## 5. Configure Vercel

In your Vercel project settings:
1. Go to **Settings** → **Environment Variables**
2. Add the same three variables from step 4
3. Redeploy your application

## 6. Initialize Default Users

After schema is created, run this SQL to add default users:

```sql
INSERT INTO users (id, username, password, name, role, avatar) VALUES
('self', 'self', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Vivek Kumaran', 'admin', '👤'),
('spouse', 'spouse', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Spouse', 'user', '👥');
```

(Password for both is `password123` - change after first login!)

## Next Steps

After setup, the application will automatically use Supabase for all data storage instead of localStorage.
