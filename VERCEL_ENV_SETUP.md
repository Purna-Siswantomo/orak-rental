# Vercel Environment Setup Instructions

## ⚠️ CRITICAL: Set Environment Variables BEFORE Deployment

Add these to Vercel Project Settings → Environment Variables:

### Required Variables

**DATABASE_URL** (Production)
```
postgresql://user:password@host/dbname?sslmode=require
```
Choose one:
- **Neon.tech**: https://neon.tech → Create project → Copy connection string
- **Supabase**: https://supabase.com → Create project → Connection Pooling tab

**ADMIN_USERNAME** (Production)
```
admin
```

**ADMIN_PASSWORD** (Production)
```
[Generate strong password: 12+ chars, mix of uppercase/lowercase/numbers/symbols]
```

**SESSION_SECRET** (Production)
```
[Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
```

**NODE_ENV** (Production)
```
production
```

---

## Steps

1. **Setup PostgreSQL Database**
   - Neon: https://neon.tech → sign up → create project
   - Copy connection string (looks like: `postgresql://...`)

2. **Add Environment Variables to Vercel**
   - Go to: https://vercel.com/dashboard
   - Select project: `harga-joki`
   - Settings → Environment Variables
   - Add each variable above with "Production" environment
   - **DO NOT commit `.env.local` to Git**

3. **Deploy**
   - From project root: `vercel deploy --prod`
   - Or via Git push (if connected)

4. **Run Database Migration**
   - After deploy succeeds: `npx prisma db push`
   - This creates tables in PostgreSQL

5. **Test**
   - Visit: https://harga-joki.vercel.app/admin/login
   - Login with: admin / [your password]
