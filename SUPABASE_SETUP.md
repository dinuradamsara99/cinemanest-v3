# Supabase Database Setup Guide

This guide will walk you through connecting your CinemaNest project to Supabase using Prisma.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Prisma CLI installed (already set up in this project)

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: CinemaNest (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click **"Create new project"**
5. Wait for the project to be provisioned (this may take a few minutes)

## Step 2: Get Your Database Connection String

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the left sidebar
2. Navigate to **Database** section
3. Scroll down to **Connection string** section
4. Select the **URI** tab (sometimes called "Connection pooling")
5. Choose **"Session mode"** for the connection mode
6. Copy the connection string - it will look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

> [!IMPORTANT]
> Replace `[YOUR-PASSWORD]` with the database password you created in Step 1.

## Step 3: Configure Environment Variables

1. Create or update the `.env.local` file in your project root:
   ```bash
   # In the project root: cinemanest/.env.local
   ```

2. Add your Supabase connection string:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
   
   # NextAuth configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   ```

> [!TIP]
> Generate a secure `NEXTAUTH_SECRET` by running:
> ```bash
> openssl rand -base64 32
> ```
> If you don't have OpenSSL, use: `npx auth secret` or visit [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

3. **For production**, also create a `.env` file (or configure in your deployment platform):
   ```env
   DATABASE_URL="your-production-database-url"
   NEXTAUTH_URL="https://yourdomain.com"
   NEXTAUTH_SECRET="your-production-secret"
   ```

## Step 4: Push Database Schema to Supabase

Run the following commands to sync your Prisma schema with Supabase:

```bash
# Push the schema to Supabase (creates tables)
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

> [!NOTE]
> **What does `prisma db push` do?**
> - Creates all tables defined in your `prisma/schema.prisma` file
> - Sets up relations and constraints
> - Does NOT create migration files (use `prisma migrate dev` for that)

## Step 5: Verify the Connection

1. Check the Supabase dashboard:
   - Go to **Table Editor** in the left sidebar
   - You should see the following tables created:
     - `User`
     - `Account`
     - `Session`
     - `VerificationToken`

2. Test in your application:
   ```typescript
   // You can test the connection in a test file or API route
   import { prisma } from '@/lib/prisma'
   
   const users = await prisma.user.findMany()
   console.log(users)
   ```

## Step 6: (Optional) Set Up Prisma Migrations

For production-grade schema management, use migrations instead of `db push`:

```bash
# Initialize migrations with current schema
npx prisma migrate dev --name init

# Future schema changes
npx prisma migrate dev --name describe_your_changes
```

## Common Issues & Solutions

### Issue: "Can't reach database server"
**Solution**: 
- Check that your DATABASE_URL is correct
- Verify your Supabase project is active
- Ensure the password in the URL is correct (no special characters causing issues)

### Issue: "Connection pool timeout"
**Solution**:
- Switch to **Transaction mode** in Supabase connection pooling settings
- Or use the direct connection string (port 5432) instead of pooled (port 6543)

### Issue: "SSL certificate verification failed"
**Solution**:
Add `?sslmode=require` to your connection string:
```env
DATABASE_URL="postgresql://...?sslmode=require"
```

## Direct vs Pooled Connection

Supabase provides two types of connections:

| Type | Port | Use Case |
|------|------|----------|
| **Direct** | 5432 | Long-running connections, migrations, Prisma Migrate |
| **Pooled** | 6543 | Serverless/Edge functions, high concurrency |

For Next.js with Prisma, use the **pooled connection** (port 6543).

## Security Best Practices

> [!CAUTION]
> Never commit `.env.local` or `.env` files to Git!

1. Add to `.gitignore`:
   ```gitignore
   .env
   .env.local
   .env*.local
   ```

2. Use environment variables in your deployment platform:
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site settings → Environment variables
   - **Render**: Environment → Secret Files

## Next Steps

- ✅ Database connection established
- ✅ Prisma schema synced
- 🔄 Set up NextAuth.js authentication
- 🔄 Create your first user registration
- 🔄 Test login functionality

## Useful Commands

```bash
# View your database in the browser
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# Check connection and schema status
npx prisma validate

# Format your schema file
npx prisma format
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
