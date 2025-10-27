# Docker Setup - Quick Reference

## ✅ All Issues Fixed

The following issues have been resolved:

1. **✅ REPLIT_DOMAINS warning removed** - Suppressed in development mode
2. **✅ OPENAI_API_KEY added** - Dummy key configured for local development
3. **✅ Database configuration verified** - PostgreSQL connects properly
4. **✅ Environment variables configured** - All required vars set in docker-compose.yml

## 🚀 Quick Start (After Fixes)

```bash
# Stop any running containers
make clean

# Start fresh with all fixes
make run-all
```

This will:
1. Build Docker containers with new environment variables
2. Start PostgreSQL database (vest_db)
3. Run database migrations (17 tables)
4. Seed with complete demo data
5. Start the app on http://localhost:5000

## Environment Variables

All required environment variables are now set in `docker-compose.yml`:

- ✅ `DATABASE_URL` - PostgreSQL connection
- ✅ `OPENAI_API_KEY` - Dummy key for local dev
- ✅ `SESSION_SECRET` - Session encryption
- ✅ `NODE_ENV=development` - Development mode (no Replit warnings)
- ✅ All PostgreSQL connection vars (PGHOST, PGPORT, etc.)

## Troubleshooting

### If seeding fails with Error 137 (Out of Memory)

**Increase Docker Memory:**

1. Open Docker Desktop
2. Settings → Resources
3. Increase Memory to **4GB minimum** (8GB recommended)
4. Apply & Restart
5. Run: `make seed`

### Check if database is seeded

```bash
# Connect to database
docker compose exec postgres psql -U vest -d vest_db

# Check for data
vest_db=# SELECT COUNT(*) FROM users;
vest_db=# SELECT COUNT(*) FROM workflows;
vest_db=# \q
```

### View application logs

```bash
make logs
```

### Restart everything

```bash
make restart
```

### Complete reset

```bash
make clean        # Remove everything
make run-all      # Start fresh
```

## Verification Steps

After running `make run-all`:

1. **Check app is running**: http://localhost:5000
2. **Verify no errors**: `make logs`
3. **Check database**: `docker compose exec postgres psql -U vest -d vest_db -c "SELECT COUNT(*) FROM users;"`
4. **Login**: Should auto-login as Dan Mbanga

## What You'll See

**Demo Data Included:**
- 5 users (Dan Mbanga auto-login)
- 3 complete workflows (NEE, CVX, NVDA)
- 4 research requests (TSLA, GOOGL, AMZN, OXY)
- 2 proposals with AI-generated theses
- IC meetings with voting and debate
- Active portfolio position (NVDA: 5000 shares @ $119.50)
- Monitoring events and thesis health tracking

## Docker Compose Commands

If you prefer direct docker-compose commands:

```bash
# Start
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Clean everything
docker compose down -v

# Seed database
docker compose exec app npx tsx scripts/seed.ts

# Database migrations
docker compose exec app npm run db:push -- --force
```

## Port Configuration

- **Application**: http://localhost:5000
- **PostgreSQL**: localhost:5432

Both ports must be free before starting Docker.

## Success Indicators

✅ **Containers running**: `docker compose ps` shows both healthy
✅ **No errors in logs**: `make logs` shows clean startup
✅ **App accessible**: http://localhost:5000 loads
✅ **Auto-login works**: Signed in as Dan Mbanga
✅ **Data present**: See workflows, proposals, etc.

---

**Need help?** Check `LOCAL_SETUP.md` for comprehensive troubleshooting.
