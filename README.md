# Vest - AI-Powered Investment Committee Platform

> Production-ready enterprise MVP for automating investment workflows from discovery through monitoring

![Vest Banner](https://via.placeholder.com/1200x300/1a1b26/c0caf5?text=Vest+Investment+Committee+Platform)

## 🎯 Overview

**Vest** is an AI-powered investment committee workflow system designed to streamline the complete investment decision-making process. From initial research and analysis through IC meetings, execution, and ongoing portfolio monitoring, Vest automates tedious workflows while ensuring compliance and maintaining institutional knowledge.

### Key Features

- **🔄 Complete Workflow Automation** - Five-stage workflow (Discovery → Analysis → IC Meeting → Execution → Monitoring)
- **🤖 16 Specialized AI Agents** - Research synthesis, financial modeling, risk analysis, contrarian debate, thesis monitoring, and more
- **👥 Real-time Collaboration** - WebSocket-powered IC meetings with live voting, debate, and AI-assisted decision-making
- **📊 Unified Workspace** - Stage-aware tabs consolidate 25+ pages into a single, context-rich interface
- **🎨 Professional Design** - IBM Carbon + Linear-inspired aesthetic with dark mode and enterprise polish
- **🔒 No PII Exposure** - Demo mode uses synthetic data (Dan Mbanga, dan@example.io) - perfect for presentations

## 🚀 Quick Start

### Prerequisites

- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- Git  
- Make (pre-installed on macOS/Linux)

### One-Command Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd vest

# Build, start, migrate, and seed everything
make run-all
```

The application will be available at **http://localhost:5000**

You'll be automatically signed in as **Dan Mbanga** (dan@example.io) with access to:
- ✅ Complete NVDA workflow from Discovery → Monitoring
- ✅ 5 workflow stages with 4 research artifacts
- ✅ IC Meeting with 3 APPROVE votes and debate messages
- ✅ Active position (5000 NVDA shares @ $119.50)
- ✅ Monitoring events and thesis health tracking

### Additional Commands

```bash
make help        # Show all available commands
make start       # Start application (with logs)
make stop        # Stop application
make logs        # View logs
make clean       # Remove all containers and data
make db-reset    # Reset and reseed database
```

See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for detailed instructions and troubleshooting.

## 📖 Comprehensive Documentation

- **[Local Setup Guide](./LOCAL_SETUP.md)** - Detailed local development instructions
- **[Architecture & Technical Details](./replit.md)** - System design, database schema, API endpoints
- **[Design Guidelines](./design_guidelines.md)** - UI/UX principles and design system

## 🏗️ Architecture

### Tech Stack

**Frontend**
- React 18 + TypeScript
- Shadcn/ui + Radix UI primitives
- Tailwind CSS with custom financial color palette
- TanStack Query for server state management
- Wouter for client-side routing
- Framer Motion for animations

**Backend**
- Node.js 20 + Express.js
- PostgreSQL 15 database
- Drizzle ORM for type-safe queries
- WebSocket server for real-time features
- Session-based authentication
- PDF generation for reports

**AI Integration**
- OpenAI-compatible API
- 16 specialized agents for research, analysis, and monitoring
- Real-time AI debate and contrarian analysis

**Infrastructure**
- Docker & Docker Compose for local development
- Health checks and automatic migrations
- Volume persistence for database

### Database Schema

17 comprehensive tables covering:
- Workflows & Stages
- Proposals & Companies
- Research Artifacts & Revisions
- IC Meetings, Votes, Debate Messages
- Portfolio Positions & Trade Orders
- Monitoring Events & Thesis Health
- Compliance Checks & Risk Assessments
- Agent Responses & Financial Models

## 🎨 Design System

- **Inspired by**: IBM Carbon Design + Linear
- **Typography**: Inter Variable + JetBrains Mono
- **Color Palette**: Custom financial services theme with dark mode
- **Principles**: Information clarity, professional trust, efficient workflows, data-first visualization

## 🔐 Authentication

### Development Mode (Default)
- No login required
- Auto-signed in as **Dan Mbanga** (dan@example.io)
- Switch roles via user menu (Analyst, PM, Compliance, Admin)
- No PII exposure - perfect for demos and testing

### Production Mode
- Session-based authentication
- Configurable authentication provider (OAuth, SAML, etc.)
- Role-based access control (RBAC)
- Secure session management with encrypted cookies

## 📊 Key Features in Detail

### 1. Unified Workflow Workspace

Single `/workflows/:id` route with stage-aware tabs:
- **Overview**: Proposal details, thesis, catalysts, risks
- **Analysis Hub**: Research artifacts, financial models, risk analysis
- **IC Meeting**: Real-time voting, debate, contrarian AI challenges
- **Monitoring**: Thesis health, market events, monitoring alerts

### 2. 16 Specialized AI Agents

**Pre-Work Agents** (Research & Analysis)
- Research Brief Synthesizer
- Financial Model Builder
- Quantitative Analysis
- Risk Analyzer
- Scenario Simulator

**IC & Execution Agents**
- Investment Memo Generator
- Meeting Minutes Recorder
- Compliance Report Generator
- Risk Report Compiler
- Trade Order Creator

**Monitoring & Analytics Agents**
- Thesis Health Monitor
- Market Event Tracker
- Data Retrieval Agent
- Voice Summary Generator
- Attribution Reporter
- Risk Regime Analyzer

### 3. Real-time IC Meetings

- WebSocket-powered collaboration
- Live voting with vote aggregation
- Real-time debate messages
- AI contrarian agent challenging consensus
- Integrated research briefs and valuation models
- Voice input capability for debate participation

### 4. Portfolio Monitoring

- Automated thesis health tracking (0-100 score)
- Market event detection and alerts
- Custom alert rules and notifications
- Position performance analytics
- Catalyst and risk monitoring
- Historical performance timeline

## 🧪 Demo Data

The seed script creates a complete NVDA investment scenario:

**Users**
- Sarah Chen (Analyst)
- Mike Rodriguez (PM)
- Jane Smith (Compliance)
- Dan Mbanga (Demo user)

**NVDA Workflow**
- Stage: MONITORING (5 stages completed)
- Proposal: BUY @ $145 target, 5% weight
- Artifacts: Research Brief, DCF Model, Risk Analysis, Investment Thesis
- IC Meeting: APPROVED (3 votes)
- Position: 5000 shares @ $119.50 avg cost
- Current P&L: +$62,500 (+10.46%)
- Thesis Health: HEALTHY (82/100 score)

## 🛠️ Development

### Running Locally Without Docker

```bash
# Install PostgreSQL 15
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb vest_db

# Install dependencies
npm install

# Set environment variables (create .env)
DATABASE_URL=postgresql://localhost:5432/vest_db
NODE_ENV=development
SESSION_SECRET=local_dev_secret

# Run migrations
npm run db:push --force

# Seed database
npx tsx scripts/seed.ts

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Sync database schema
- `npm run db:push --force` - Force sync (bypass safety checks)
- `npx tsx scripts/seed.ts` - Seed database with demo data

## 🐳 Docker Commands

```bash
# Complete setup (recommended)
make run-all

# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean everything (including data)
docker-compose down -v

# Rebuild after code changes
docker-compose up --build

# Access database
docker exec -it vest-postgres psql -U vest -d vest_db

# Seed database (if already running)
docker-compose exec app npx tsx scripts/seed.ts
```

## 📈 Production Deployment

### Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key (generate with `openssl rand -base64 32`)
- `NODE_ENV` - Set to `production` for production mode

**Optional:**
- `PORT` - Server port (default: 5000)
- `OPENAI_API_KEY` - OpenAI API key for AI agents (if using OpenAI directly)

### Deployment Platforms

Vest can be deployed to any platform that supports Node.js and PostgreSQL:

**Recommended Platforms:**
- **Heroku** - Simple deployment with Postgres add-on
- **Railway** - Modern platform with automatic PostgreSQL
- **Render** - Free tier available with PostgreSQL
- **AWS/GCP/Azure** - Full control with managed PostgreSQL (RDS/Cloud SQL/Azure DB)
- **DigitalOcean App Platform** - Easy deployment with managed databases

### Production Checklist

- [ ] Set strong `SESSION_SECRET` (32+ random characters)
- [ ] Configure production database (PostgreSQL 15+)
- [ ] Set `NODE_ENV=production`
- [ ] Enable SSL for database connections
- [ ] Configure domain and HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for PostgreSQL
- [ ] Review and configure CORS settings if needed

## 🔒 Security

- Session-based authentication with encrypted cookies
- CSRF protection on all mutations
- SQL injection prevention via Drizzle ORM
- Environment-based configuration
- Secure WebSocket connections
- No hardcoded secrets or credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure everything works locally
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

Apache 2.0

## 🙋 Support

For issues or questions:
- Check [LOCAL_SETUP.md](./LOCAL_SETUP.md) for local development help
- Review [replit.md](./replit.md) for architecture details
- Open an issue in the repository

---

**Built with ❤️ for institutional investors**
