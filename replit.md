# Vest - AI-Powered Investment Committee Platform

## Overview

Vest is an AI-powered investment committee workflow system designed to automate and enhance the investment decision-making process. The platform streamlines workflows from initial research through execution and ongoing portfolio monitoring, leveraging multi-agent AI systems to reduce analyst workload, enhance meeting quality, ensure compliance, and maintain institutional knowledge.

The system provides capabilities for:
- Automated research synthesis and analysis
- AI-assisted investment committee meetings with real-time contrarian analysis
- Portfolio monitoring with thesis health tracking
- Document generation and management
- Scenario simulation and risk analysis

## Project Status

**Current Status**: Production-Ready Enterprise MVP (October 22, 2025)

**Completed Features**:
✅ Full-stack implementation with React TypeScript frontend and Express backend
✅ PostgreSQL database persistence with Drizzle ORM (migration from in-memory complete)
✅ Five AI agents integrated with OpenAI GPT-5 (Research Synthesizer, Financial Modeler, Contrarian, Scenario Simulator, Thesis Monitor)
✅ Six main pages: Dashboard, Research, IC Meeting, Portfolio, Monitoring, Documents
✅ WebSocket server for real-time IC meeting collaboration with vote synchronization
✅ PDF export functionality (investment memos, meeting minutes, portfolio summaries)
✅ Notification system with thesis monitoring alerts and market event triggers
✅ Complete API layer with RESTful endpoints and Zod validation on all POST/PATCH routes
✅ Comprehensive form validation using react-hook-form with Zod resolvers
✅ Loading states, error handling, and empty states across all pages
✅ Professional financial services UI with dark mode support
✅ Database seeded with realistic demo data (5 companies, 3 positions, 2 proposals, 1 IC meeting)
✅ End-to-end testing verified across all pages and features

**Recent Additions** (Oct 22, 2025):
- ✅ PostgreSQL database with 9 normalized tables (companies, positions, proposals, IC meetings, votes, agent responses, financial models, thesis monitors, market events, notifications)
- ✅ Real-time collaboration via WebSocket for IC meetings
- ✅ PDF generation service using pdfkit for document exports
- ✅ Notification bell UI component with unread count badges and severity levels
- ✅ Notification API routes with mark-as-read functionality

**Production Readiness**:
- All data persisted to PostgreSQL (no data loss on restart)
- WebSocket infrastructure for real-time features
- PDF export capability for compliance and recordkeeping
- Notification system for proactive thesis monitoring
- Comprehensive error handling and validation throughout

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript using Vite as the build tool

**UI Component System**: Shadcn/ui with Radix UI primitives, following the "New York" style variant. The design system emphasizes a professional, data-intensive enterprise financial aesthetic inspired by IBM Carbon Design and Linear's productivity patterns.

**Styling Approach**: 
- Tailwind CSS for utility-first styling
- Dark mode as primary theme with light mode support
- Custom color palette focused on professional financial services aesthetics
- Information density prioritized over decoration
- Typography: Inter Variable for UI/body text, JetBrains Mono for financial figures and data

**State Management**: 
- TanStack Query (React Query) for server state management with custom query client
- React hooks for local component state
- Custom context providers for theme management

**Routing**: Wouter for lightweight client-side routing

**Key Design Principles**:
1. Information clarity over decoration - every pixel serves the data
2. Professional trust - conservative, authoritative financial services aesthetic
3. Efficient workflows - minimize clicks, maximize visibility
4. Data-first visualization - charts and metrics are primary content

### Backend Architecture

**Runtime**: Node.js with TypeScript (ESM modules)

**Web Framework**: Express.js serving both API routes and static frontend assets

**Development Server**: Vite's middleware mode for hot module replacement during development, with custom server-side rendering setup for production

**API Design**: RESTful endpoints under `/api` prefix handling:
- Portfolio positions and companies
- Investment proposals and IC meetings
- AI agent invocations (research synthesizer, DCF modeler, contrarian analyst, scenario simulator, thesis monitor)
- Financial models and thesis monitoring
- Voting and meeting management

**Storage Layer**: PostgreSQL database via Neon serverless driver with Drizzle ORM implementation

**Real-time Features**: WebSocket server (path: `/ws`) for IC meeting collaboration:
- Join/leave meeting rooms
- Real-time vote casting and synchronization
- Meeting state broadcasts to all participants
- Event-driven architecture with room-based client management

**Document Export**: PDF generation service using pdfkit:
- Investment memos with thesis, catalysts, risks, and recommendations
- Meeting minutes with attendees, agenda, decisions, and proposals
- Portfolio summaries with position details and performance metrics
- Professional formatting with headers, footers, and typography

**Notification System**: Real-time alerts and notifications:
- Thesis health monitoring alerts (CRITICAL, WARNING, INFO)
- Market event notifications with portfolio impact
- IC vote notifications with proposal details
- System notifications for general updates
- Notification bell UI with unread count badges
- Mark as read and bulk mark all read functionality

### Data Architecture

**ORM**: Drizzle ORM with schema-first approach

**Database**: PostgreSQL (via Neon serverless driver for connection pooling and edge compatibility)

**Schema Design** (9 normalized tables):
- **Companies**: Stock information, sector, industry, market data, current price
- **Positions**: Portfolio holdings with performance metrics and thesis health tracking
- **Proposals**: Investment recommendations tied to companies with catalysts and risks
- **IC Meetings**: Committee meeting records with agenda, decisions, minutes, and attendees
- **Votes**: Individual committee member votes on proposals (APPROVE, REJECT, ABSTAIN)
- **Agent Responses**: Stored AI-generated analysis and recommendations from all 5 agents
- **Financial Models**: DCF and valuation models with bull/base/bear scenarios
- **Thesis Monitors**: Ongoing tracking of investment thesis validity with health status
- **Market Events**: External events affecting portfolio positions with severity levels
- **Notifications**: System alerts for thesis monitoring, market events, and IC votes

**Validation**: Zod schemas for runtime type validation integrated with Drizzle schemas

### AI Agent System

**AI Provider**: OpenAI GPT-5 via Replit's AI Integrations service (OpenAI-compatible API without requiring separate API keys)

**Agent Architecture**: Service-based pattern with specialized agents:

1. **Research Synthesizer**: Generates comprehensive research briefs with financial metrics, strengths, risks, and recommendations
2. **DCF Modeler**: Creates discounted cash flow valuation models with assumptions and sensitivity analysis
3. **Contrarian Analyst**: Provides devil's advocate perspective challenging investment theses
4. **Scenario Simulator**: Models portfolio impact under different market scenarios
5. **Thesis Monitor**: Tracks ongoing thesis health and generates alerts for thesis violations

**Response Format**: JSON-structured outputs with strict schema validation for consistent data structure

### Security & Session Management

**Authentication**: Session-based authentication using express-session with PostgreSQL session store (connect-pg-simple)

**Security Headers**: Custom middleware for request logging and response capture

**Input Validation**: Zod schemas on all API endpoints with error handling for validation failures

### Build & Deployment

**Build Process**: 
- Frontend: Vite production build outputting to `dist/public`
- Backend: esbuild bundling server code as ESM module to `dist`

**Development Workflow**:
- Hot module replacement via Vite
- TypeScript type checking without emit
- Integrated Replit development tools (cartographer, dev banner, runtime error overlay)

**Environment Configuration**: Environment-based configuration with separate development and production modes

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Replit AI Integrations**: OpenAI-compatible API service providing GPT-5 access

### UI Component Libraries
- **Radix UI**: Headless, accessible component primitives (accordion, dialog, dropdown, popover, select, tabs, toast, tooltip, etc.)
- **shadcn/ui**: Pre-styled components built on Radix UI
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Build tool and development server
- **Replit Vite Plugins**: Development banner, cartographer for code navigation, runtime error overlay
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database migrations and schema management

### Data & State Management
- **TanStack Query**: Server state synchronization and caching
- **React Hook Form**: Form state management with Zod resolver integration
- **Zod**: Runtime schema validation
- **date-fns**: Date manipulation and formatting

### Styling & Design
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling
- **tailwind-merge**: Intelligent Tailwind class merging

### Additional Libraries
- **Embla Carousel**: Carousel/slider component
- **cmdk**: Command palette component
- **Wouter**: Lightweight routing
- **ws**: WebSocket server for real-time collaboration
- **pdfkit**: PDF document generation

## Recent Implementation Notes (October 22, 2025)

### Database Migration
Successfully migrated from in-memory storage to PostgreSQL with:
- Complete schema definition in `shared/schema.ts`
- DatabaseStorage class implementing IStorage interface in `server/storage.ts`
- All CRUD operations using Drizzle ORM with proper error handling
- Database seeding script with realistic financial data

### WebSocket Implementation
Real-time collaboration infrastructure:
- WebSocket server on same HTTP server (path: `/ws`)
- Room-based architecture for IC meeting isolation
- Message types: join_meeting, leave_meeting, cast_vote, update_meeting
- Client tracking per meeting room for targeted broadcasts
- Graceful cleanup on client disconnect

### PDF Export Service
Document generation capabilities:
- Investment memo PDFs with comprehensive proposal details
- Meeting minutes PDFs with decisions and attendee information
- Portfolio summary PDFs with position-level analysis
- Professional formatting with multi-page support
- Streaming responses for efficient memory usage

### Notification System
Proactive alerting infrastructure:
- NotificationService with specialized alert creation methods
- Notification schema with type, severity, and actionUrl fields
- API routes for fetching, creating, and marking notifications as read
- NotificationBell component with real-time unread count
- 30-second polling interval for updates
- Severity-based color coding (CRITICAL, WARNING, INFO)