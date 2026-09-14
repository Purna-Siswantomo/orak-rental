# Changelog - Security & Deployment Updates

## [2026-09-14] - Security Hardening & PostgreSQL Migration

### 🔒 Security Improvements

**Admin Access Control**
- ✅ Hidden admin button dari public navbar (`src/components/Navbar.tsx`)
- ✅ Admin akses hanya via direct URL `/admin/login`
- ✅ Route protection via middleware (`src/proxy.ts`)

**Database Migration**
- ✅ SQLite → PostgreSQL (`prisma/schema.prisma`)
- ✅ Production-ready untuk Vercel deployment
- ✅ Connection string via environment variable

**Authentication & Session**
- ✅ Login page moved: `/login` → `/admin/login`
- ✅ Middleware redirect updated
- ✅ Session token: HMAC-SHA256 signed, HTTP-only cookies
- ✅ Protected routes: `/admin/*`, `/api/orders`, `/api/config`

**Environment Variables**
- ✅ Created `.env.example` template
- ✅ Secrets gitignored (`.env*`)
- ✅ Required vars: `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`

### 📝 Documentation

**New Files**
- `DEPLOYMENT.md` - Vercel + PostgreSQL deployment guide
- `SECURITY_AUDIT.md` - Security audit report & recommendations
- `.env.example` - Environment variables template
- `CHANGELOG.md` - This file

**Updated Files**
- `README.md` - Updated login path references
- `prisma/schema.prisma` - PostgreSQL datasource
- `src/components/Navbar.tsx` - Removed admin button
- `src/proxy.ts` - Renamed from middleware.ts, updated redirect path

### 🚀 Deployment Ready

**Checklist**
- [x] Build passes (`npm run build`)
- [x] PostgreSQL schema ready
- [x] Environment template documented
- [x] Security audit complete
- [x] Admin interface hidden
- [x] Auth middleware active

**Next Steps**
1. Setup PostgreSQL database (Neon.tech / Supabase recommended)
2. Configure Vercel environment variables
3. Deploy via Vercel Git integration
4. Run `npx prisma db push` post-deployment

### 📊 Files Changed

```
Modified:
  src/components/Navbar.tsx       (-13 lines, admin button removed)
  src/proxy.ts                    (renamed from middleware.ts, redirect updated)
  prisma/schema.prisma            (sqlite → postgresql)
  README.md                       (login path updated)

Added:
  .env.example                    (environment template)
  DEPLOYMENT.md                   (deployment guide)
  SECURITY_AUDIT.md               (security report)
  CHANGELOG.md                    (this file)
  src/app/admin/login/page.tsx    (login moved to /admin/login)
```

### ⚠️ Breaking Changes

**For Developers**
- Login URL changed: `/login` → `/admin/login`
- Database provider changed: `sqlite` → `postgresql`
- Middleware file renamed: `middleware.ts` → `proxy.ts` (Next.js 16 convention)

**Migration Required**
- Update `.env` dengan PostgreSQL connection string
- Re-run `npx prisma generate` after schema change
- Clear browser cookies if testing locally

### 🔐 Security Notes

**Current Rating**: GOOD (production-ready)

**Implemented**
- ✅ Session management (HMAC-signed tokens)
- ✅ Route protection (middleware auth gate)
- ✅ Environment externalization
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection (React auto-escape)
- ✅ HTTPS enforcement (production)

**Recommendations** (optional)
- ⚠️ Add rate limiting on `/api/auth/login` (prevent brute-force)
- ⚠️ Password hashing with bcrypt (currently plain-text in env)
- ⚠️ Setup error monitoring (Sentry)

See `SECURITY_AUDIT.md` for full report.

---

**Author**: Sirius (Hermes Agent)  
**Date**: 2026-09-14  
**Project**: Otak Rental - Harga Joki
