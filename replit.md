# Vest - AI-Powered Investment Committee Platform

## Overview
Vest is an AI-powered investment committee workflow system designed to automate and enhance the investment decision-making process. The platform streamlines workflows from initial research through execution and ongoing portfolio monitoring, leveraging a 16-agent AI system. Its purpose is to reduce analyst workload, enhance meeting quality, ensure compliance, and maintain institutional knowledge. Vest offers capabilities for automated research synthesis, AI-assisted investment committee meetings with real-time contrarian analysis, portfolio monitoring with thesis health tracking, document generation, scenario simulation, compliance checks, trade order generation, and risk assessment. The project is a production-ready enterprise MVP with comprehensive workflow automation.

## Recent Changes (October 26, 2025)
- **Backend Infrastructure**: Completed comprehensive database schema with 17 tables including workflows, workflow_stages, workflow_artifacts, ic_meetings, debate_messages, positions, monitoring_events, thesis_health_metrics, and more
- **Storage Layer**: Implemented full storage interface with 34+ methods covering workflow orchestration, artifact management, IC meeting operations, monitoring, and analytics
- **API Layer**: Built 28 REST API endpoints with Zod validation, session-based authentication, and proper error handling
- **WebSocket Server**: Production-ready WebSocket implementation for real-time IC meeting collaboration with session-based authentication
- **Workflow Workspace**: Created unified /workflows/:id route with stage-aware tabs (Overview, Analysis Hub, IC Meeting, Monitoring) replacing 16+ separate pages
- **Seed Script**: Comprehensive database seeding with complete NVDA workflow scenario from discovery through monitoring including users, proposals, workflow stages, artifacts, IC meetings, votes, debate messages, positions, monitoring events, and thesis health metrics
- **Architectural Discovery**: E2E testing identified IC meeting-to-proposal relationship architecture that needs refinement (IC meetings currently link to workflows; frontend expects links to proposals)

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend is built with React 18+ and TypeScript, utilizing Shadcn/ui with Radix UI primitives for a professional, data-intensive enterprise financial aesthetic, inspired by IBM Carbon Design and Linear. Styling is managed with Tailwind CSS, prioritizing dark mode, a custom financial services color palette, and the Inter Variable and JetBrains Mono typefaces. Key design principles include information clarity, professional trust, efficient workflows, and data-first visualization. The sidebar uses a collapsible hierarchical structure for efficient navigation, organized into "Workflow," "AI Agents" (with Pre-Work, IC & Execution, and Monitoring & Analytics sub-groups), and "Resources." A reusable BreadcrumbNav component provides context-aware navigation.

### Technical Implementations
The backend uses Node.js with TypeScript and Express.js, serving RESTful APIs and static assets. Real-time features, such as collaborative IC meetings and voting, are powered by a WebSocket server. Data persistence is handled by PostgreSQL via Neon, with Drizzle ORM. The system includes a robust notification system for thesis monitoring and market events, and a PDF generation service. Authentication uses Replit Auth (OpenID Connect) for production and falls back to a mock user in development. All API endpoints use Zod for input validation. The system supports four user roles with distinct permissions: ANALYST, PM, COMPLIANCE, and ADMIN.

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