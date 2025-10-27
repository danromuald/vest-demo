# Vest - AI-Powered Investment Committee Platform

## Overview
Vest is an AI-powered investment committee workflow system designed to automate and enhance the investment decision-making process. The platform streamlines workflows from initial research through execution and ongoing portfolio monitoring, leveraging a 16-agent AI system. Its purpose is to reduce analyst workload, enhance meeting quality, ensure compliance, and maintain institutional knowledge. Vest offers capabilities for automated research synthesis, AI-assisted investment committee meetings with real-time contrarian analysis, portfolio monitoring with thesis health tracking, document generation, scenario simulation, compliance checks, trade order generation, and risk assessment. The project is a production-ready enterprise MVP with comprehensive workflow automation.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes

### Seed Data Enhancements (October 27, 2025)
- **Comprehensive Research Scenarios**: Added 7 research requests covering all states (COMPLETED, IN_PROGRESS, PENDING)
  - **CVX (Chevron)**: COMPLETED research with NO proposal - demonstrates "Create Proposal" button
  - **GOOGL & AMZN**: COMPLETED research WITH proposals - demonstrates "View Proposal" button
  - **META, TSLA, NVDA**: Various in-progress and pending states
- **Multi-Sector Coverage**: Expanded from Energy-only to Energy + Technology + Consumer sectors
- **Agent Responses**: Added comprehensive agent responses for GOOGL, AMZN, and CVX research
- **Seed Check Improvement**: Updated logic to check for agent responses (more reliable than proposal checks)
- **Local Docker Parity**: Seed script now creates identical data for local and Replit environments

## System Architecture

### UI/UX Decisions
The frontend is built with React 18+ and TypeScript, utilizing Shadcn/ui with Radix UI primitives for a professional, data-intensive enterprise financial aesthetic. Styling is managed with Tailwind CSS, prioritizing dark mode, a custom financial services color palette, and the Inter Variable and JetBrains Mono typefaces. Key design principles include information clarity, professional trust, efficient workflows, and data-first visualization. The sidebar uses a collapsible hierarchical structure for efficient navigation. A reusable BreadcrumbNav component provides context-aware navigation.

### Technical Implementations
The backend uses Node.js with TypeScript and Express.js, serving RESTful APIs and static assets. Real-time features are powered by a WebSocket server. Data persistence is handled by PostgreSQL via Neon, with Drizzle ORM. The system includes a robust notification system and a PDF generation service. Authentication uses Replit Auth (OpenID Connect) for production and falls back to a mock user in development. All API endpoints use Zod for input validation. The system supports four user roles with distinct permissions: ANALYST, PM, COMPLIANCE, and ADMIN.

### Feature Specifications
Vest supports a comprehensive workflow from `DISCOVERY` to `MONITORING`, with automated progression. Key features include:

#### Core Workflow
- **Proposals Page**: Management of investment proposals with filtering, search, and creation.
- **Proposal Creation Workflow**: Guides users through defining thesis, catalysts, risks, and target price.
- **Proposal Detail Page**: Displays comprehensive proposal information, including voting results and timeline.
- **Workflow Timeline**: Visualizes the 5 workflow stages (Discovery → Analysis → IC Meeting → Execution → Monitoring).
- **IC Meeting Page**: Real-time collaborative meetings with WebSocket-powered voting, live AI responses, and integrated research briefs and valuation models.

#### AI Agent Specialized Pages
Dedicated pages for 16 specialized AI agents, categorized by workflow phase:
- **Pre-Work Agents (Research & Analysis)**: Research Brief, Financial Model, Quant Analysis, Risk Analysis, Scenario Simulator.
- **IC & Execution Agents**: Investment Memos, Meeting Minutes, Compliance Reports, Risk Reports, Trade Orders.
- **Monitoring & Analytics Agents**: Thesis Monitor, Market Events, Data Retrieval, Voice Summaries, Attribution Reports, Risk Regime.
These pages enable in-page artifact generation, historical browsing, master-detail layouts, and robust error handling.

#### Additional Features
- Historical Meetings, Agent Output Review, Monitoring Hub, Debate Room, Document Export, and a Notification System.

### System Design Choices
The architecture emphasizes modularity with a clear separation of concerns between frontend and backend. Data integrity is maintained through Zod schemas and Drizzle ORM. The AI agent system follows a service-based pattern, allowing for specialized, independently functioning agents. A robust error handling and validation strategy is implemented across the platform.

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL.
- **Replit AI Integrations**: OpenAI-compatible API for GPT-5 access.

### UI Component Libraries
- **Radix UI**: Headless, accessible component primitives.
- **shadcn/ui**: Pre-styled components built on Radix UI.
- **Lucide React**: Icon library.

### Development Tools
- **Vite**: Build tool and development server.
- **TypeScript**: Type safety.
- **Drizzle Kit**: Database migrations and schema management.

### Data & State Management
- **TanStack Query**: Server state synchronization and caching.
- **React Hook Form**: Form state management with Zod resolver.
- **Zod**: Runtime schema validation.
- **date-fns**: Date manipulation and formatting.

### Styling & Design
- **Tailwind CSS**: Utility-first CSS framework.
- **class-variance-authority**: Type-safe variant styling.
- **tailwind-merge**: Intelligent Tailwind class merging.

### Additional Libraries
- **Embla Carousel**: Carousel/slider component.
- **cmdk**: Command palette component.
- **Wouter**: Lightweight routing.
- **ws**: WebSocket server.
- **pdfkit**: PDF document generation.