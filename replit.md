# Vest - AI-Powered Investment Committee Platform

## Overview

Vest is an AI-powered investment committee workflow system designed to automate and enhance the investment decision-making process. The platform streamlines workflows from initial research through execution and ongoing portfolio monitoring, leveraging multi-agent AI systems to reduce analyst workload, enhance meeting quality, ensure compliance, and maintain institutional knowledge. Vest provides capabilities for automated research synthesis, AI-assisted investment committee meetings with real-time contrarian analysis, portfolio monitoring with thesis health tracking, document generation, and scenario simulation. The project is currently a production-ready enterprise MVP.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend is built with React 18+ and TypeScript, utilizing Shadcn/ui with Radix UI primitives for a professional, data-intensive enterprise financial aesthetic, inspired by IBM Carbon Design and Linear. Styling is managed with Tailwind CSS, prioritizing dark mode, a custom financial services color palette, and the Inter Variable and JetBrains Mono typefaces. Key design principles include information clarity, professional trust, efficient workflows, and data-first visualization.

### Technical Implementations

The backend uses Node.js with TypeScript and Express.js, serving RESTful APIs and static assets. Real-time features, such as collaborative IC meetings and voting, are powered by a WebSocket server. Data persistence is handled by PostgreSQL via Neon, with Drizzle ORM. The system includes a robust notification system for thesis monitoring and market events, and a PDF generation service for compliance documentation like investment memos and meeting minutes. Authentication is session-based using `express-session`, and all API endpoints feature Zod for input validation.

### Feature Specifications

Vest supports a comprehensive workflow from `DISCOVERY` to `MONITORING`, including automated progression based on task completion (e.g., research completion advances to `ANALYSIS`, proposal creation to `IC_MEETING`). Critical features include:
- **Proposal Creation Workflow**: Links research to IC meetings, guiding users through thesis, catalysts, risks, and target price definition.
- **AI Agent Integration**: Five specialized agents (Research Synthesizer, DCF Modeler, Contrarian Analyst, Scenario Simulator, Thesis Monitor) provide analysis and recommendations with JSON-structured outputs.
- **WorkflowStageNavigator**: Dashboard component for tracking workflow progression.
- **Historical Meetings**: Page to review past meetings, decisions, and voting.
- **Agent Output Review**: Dedicated page for filtering and browsing AI agent responses.
- **Monitoring Hub**: Comprehensive tracking of positions, thesis health, and market events.
- **Debate Room**: Real-time AI-human collaboration via WebSocket.
- **Document Export**: PDF generation for investment memos, meeting minutes, and portfolio summaries.
- **Notification System**: Real-time alerts for thesis health, market events, and IC votes.

### System Design Choices

The architecture emphasizes modularity with a clear separation of concerns between frontend and backend. Data integrity is maintained through Zod schemas and Drizzle ORM, ensuring consistent validation across the stack. The AI agent system follows a service-based pattern, allowing for specialized, independently functioning agents. A robust error handling and validation strategy is implemented across the platform to prevent data corruption and enhance user experience.

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