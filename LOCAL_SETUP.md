# Vest - Local Development Setup

This guide will help you set up and run Vest locally on your MacBook using Docker.

## Prerequisites

- Docker Desktop for Mac ([Download here](https://www.docker.com/products/docker-desktop))
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd vest
```

### 2. Start the Application

The easiest way to run Vest locally is using Docker Compose, which will:
- Start a PostgreSQL database
- Install all dependencies
- Run database migrations
- Seed the database with demo data
- Start the development server

```bash
docker-compose up
```

The application will be available at: **http://localhost:5000**

### 3. Access the Demo

Open your browser and navigate to http://localhost:5000

The app automatically signs you in as **Dan Mbanga** (dan@example.io) in development mode - no login required!

## What's Included

The Docker setup automatically creates:
- ✅ PostgreSQL 15 database
- ✅ Demo user account (Dan Mbanga - dan@example.io)
- ✅ Complete NVDA workflow from Discovery → Monitoring
  - 5 workflow stages (Discovery, Analysis, IC Meeting, Execution, Monitoring)
  - 4 research artifacts (Research Brief, Financial Model, Risk Analysis, Thesis)
  - IC Meeting with 3 APPROVE votes and debate messages
  - Active position (5000 NVDA shares @ $119.50)
  - 3 monitoring events and thesis health metrics
- ✅ Sample companies (TSLA, GOOGL, NVDA)
- ✅ Notifications and agent responses

## Useful Commands

### Stop the Application

```bash
docker-compose down
```

### Stop and Remove All Data

```bash
docker-compose down -v
```

This will delete the database and all data. Next time you run `docker-compose up`, it will be a fresh start with seed data.

### View Logs

```bash
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f app

# Just the database
docker-compose logs -f postgres
```

### Rebuild After Code Changes

If you've made changes to dependencies or Docker configuration:

```bash
docker-compose up --build
```

### Access the Database Directly

```bash
docker exec -it vest-postgres psql -U vest -d vest_db
```

## Manual Setup (Without Docker)

If you prefer to run without Docker:

### 1. Install PostgreSQL

Install PostgreSQL 15 using Homebrew:

```bash
brew install postgresql@15
brew services start postgresql@15
```

### 2. Create Database

```bash
createdb vest_db
```

### 3. Set Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://localhost:5432/vest_db
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGDATABASE=vest_db
SESSION_SECRET=your_local_dev_secret_change_me
NODE_ENV=development
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Database Migrations

```bash
npm run db:push --force
```

### 6. Seed the Database

```bash
npx tsx scripts/seed.ts
```

### 7. Start the Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:5000**

## Development Features

### No Authentication Required

In local development, the app runs without real authentication. You are automatically signed in as:
- **Name**: Dan Mbanga
- **Email**: dan@example.io
- **Role**: Analyst (can be changed via user menu)

You can:
- Access the platform immediately without login
- Switch between roles (Analyst, PM, Compliance, Admin) using the user menu
- Test all features without credential requirements
- No PII (Personally Identifiable Information) is exposed

### Hot Reload

The development server automatically reloads when you make changes to:
- Frontend code (React components)
- Backend code (API routes, services)
- Styles (Tailwind CSS)

### Database Access

Connect to the local database using any PostgreSQL client:

**Connection Details:**
- Host: `localhost`
- Port: `5432`
- Database: `vest_db`
- Username: `vest` (Docker) or your local username (Manual)
- Password: `vest_dev_password` (Docker only)

Recommended clients:
- [Postico](https://eggerapps.at/postico/) (Mac native)
- [TablePlus](https://tableplus.com/)
- [pgAdmin](https://www.pgadmin.org/)

## Troubleshooting

### Port 5000 Already in Use

If you get an error that port 5000 is already in use:

```bash
# Find what's using port 5000
lsof -ti:5000

# Kill the process
kill -9 <PID>
```

Or change the port in `docker-compose.yml`:

```yaml
ports:
  - "3000:5000"  # Access app at localhost:3000
```

### Database Connection Issues

If the app can't connect to the database:

```bash
# Check if PostgreSQL container is running
docker ps

# Restart containers
docker-compose restart
```

### Fresh Start

To completely reset everything:

```bash
# Stop and remove containers, volumes, and images
docker-compose down -v --rmi local

# Rebuild and restart
docker-compose up --build
```

### Permission Issues (Manual Setup)

If you get permission errors with PostgreSQL:

```bash
# Grant your user access
psql postgres -c "ALTER USER $(whoami) WITH SUPERUSER;"

# Or create a new user
psql postgres -c "CREATE USER vest WITH SUPERUSER PASSWORD 'vest_dev_password';"
```

## Next Steps

Once you have the app running locally:

1. **Explore the Dashboard** - View portfolio positions and metrics
2. **Create a Proposal** - Navigate to Proposals and click "Create Proposal"
3. **Run IC Meeting** - Schedule and participate in an investment committee meeting
4. **Test AI Agents** - Generate research briefs, financial models, and risk analyses
5. **Switch Roles** - Use the user menu to test different role permissions

## Support

For issues or questions:
- Check the [main README](./README.md) for feature documentation
- Review the [architecture docs](./replit.md) for technical details
- Open an issue in the repository

## Production Deployment

For production deployment on Replit:
- The app automatically uses Replit Auth (OpenID Connect)
- Database is provided by Neon PostgreSQL
- Environment variables are managed by Replit Secrets
- Simply deploy and it will work without additional configuration
