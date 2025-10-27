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
- TanStack Query for server state
- Wouter for routing

**Backend**
- Node.js + Express.js
- PostgreSQL (Neon serverless)
- Drizzle ORM
- WebSocket server for real-time features
- Replit Auth (OpenID Connect) for production

**AI Integration**
- OpenAI-compatible API (GPT-5 via Replit AI)
- 16 specialized agents for research, analysis, and monitoring

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

### Development Mode (Automatic)
- No login required
- Auto-signed in as **Dan Mbanga** (dan@example.io)
- Switch roles via user menu (Analyst, PM, Compliance, Admin)
- No PII exposure - perfect for demos

### Production Mode (Replit)
- Replit Auth (OpenID Connect)
- Session-based authentication
- Automatic user upsert on first login
- Role-based access control

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

### 4. Portfolio Monitoring

- Automated thesis health tracking
- Market event detection and alerts
- Custom notification rules
- Position performance analytics
- Catalyst and risk monitoring

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
- `npm run db:push` - Sync database schema
- `npm run db:push --force` - Force sync (bypass safety checks)
- `npx tsx scripts/seed.ts` - Seed database with demo data

## 🐳 Docker Commands

```bash
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

### Replit Deployment

The application is optimized for Replit with:
- Automatic Replit Auth integration
- Neon PostgreSQL (serverless)
- Environment variables via Replit Secrets
- One-click deployment

Simply deploy to Replit - no additional configuration needed!

### Environment Variables

**Required for Production:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `REPLIT_DOMAINS` - Comma-separated domains (auto-set on Replit)
- `REPL_ID` - Application ID (auto-set on Replit)

**Optional:**
- `NODE_ENV` - Set to `production` for production mode
- `PORT` - Server port (default: 5000)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure everything works
5. Submit a pull request

## 📝 License

Proprietary - All rights reserved

## 🙋 Support

For issues or questions:
- Check [LOCAL_SETUP.md](./LOCAL_SETUP.md) for local development help
- Review [replit.md](./replit.md) for architecture details
- Open an issue in the repository

---

**Built with ❤️ for institutional investors**
