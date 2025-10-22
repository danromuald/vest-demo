# Design Guidelines for Vest - AI-Powered Investment Committee Workflow System

## Design Approach
**Selected Approach**: Design System (Carbon Design + Linear-inspired productivity patterns)

**Justification**: Vest is a data-intensive enterprise financial platform requiring information density, professional aesthetics, and productivity-focused interactions. Drawing from IBM Carbon Design System for enterprise data visualization and Linear for clean, efficient workflows.

**Key Design Principles**:
1. Information Clarity Over Decoration - every pixel serves the data
2. Professional Trust - conservative, authoritative financial services aesthetic
3. Efficient Workflows - minimize clicks, maximize visibility
4. Data-First Visualization - charts and metrics are primary content

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**:
- Background Primary: `222 6% 12%` (Deep charcoal)
- Background Secondary: `222 6% 16%` (Elevated surfaces)
- Background Tertiary: `222 6% 20%` (Cards, panels)
- Border Default: `222 6% 24%` (Subtle divisions)
- Border Accent: `222 6% 32%` (Active borders)

**Brand & Status Colors**:
- Primary Brand: `217 91% 60%` (Professional blue - trust, stability)
- Success/Bull: `142 71% 45%` (Financial green)
- Danger/Bear: `0 84% 60%` (Alert red)
- Warning: `38 92% 50%` (Amber for caution)
- Neutral: `222 6% 65%` (Secondary text)

**Text Hierarchy**:
- Primary Text: `0 0% 98%` (High contrast white)
- Secondary Text: `222 6% 75%` (Muted)
- Tertiary Text: `222 6% 55%` (Low emphasis)

**Light Mode Adjustments**:
- Background: `0 0% 98%`
- Surface: `0 0% 100%`
- Text Primary: `222 12% 15%`
- Borders: `222 6% 88%`

### B. Typography

**Font Families**:
- Primary: `'Inter Variable', sans-serif` (UI, body text, data tables)
- Monospace: `'JetBrains Mono', monospace` (financial figures, code, IDs)

**Type Scale**:
- Hero/Dashboard Title: `text-3xl font-semibold` (30px)
- Section Headers: `text-xl font-semibold` (20px)
- Card Titles: `text-base font-medium` (16px)
- Body Text: `text-sm` (14px)
- Data/Metrics: `text-sm font-mono` (14px monospace)
- Captions/Labels: `text-xs font-medium` (12px uppercase tracking-wide)

**Text Treatment**:
- Financial figures: Always monospace for alignment
- Status badges: Uppercase, bold, small
- Timestamps: Tabular numerals

### C. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 3, 4, 6, 8, 12** for consistent rhythm
- Component padding: `p-4` to `p-6`
- Section gaps: `gap-6` to `gap-8`
- Card margins: `space-y-4`
- Grid gaps: `gap-4`

**Container Strategy**:
- Full app max-width: `max-w-[1600px]` (ultra-wide support for data)
- Dashboard grid: 12-column responsive layout
- Sidebar: Fixed `w-64` (256px)
- Main content: Fluid with responsive breakpoints

**Layout Patterns**:
- Dashboard: Sidebar + Main content area
- Data tables: Full-width with horizontal scroll
- Metric cards: 2-4 column grids (responsive)
- Detail views: 2/3 content + 1/3 sidebar for metadata

### D. Component Library

**Navigation**:
- Top bar: Global actions, user profile, notifications
- Left sidebar: Primary navigation with workflow stages (Pre-IC, IC Session, Post-IC, Monitoring)
- Breadcrumbs: Show current location in workflow
- Status indicator: Persistent workflow stage badge

**Data Display**:
- Metric Cards: Large number + label + trend indicator (↑↓)
- Data Tables: Dense, sortable, with hover states and row actions
- Charts: Recharts with consistent color mapping (green=bull, red=bear, blue=base case)
- Timeline: Vertical timeline for IC workflow progression
- Badges: Status pills (Approved, Pending, Alert, Monitoring)

**Interactive Elements**:
- Primary Button: Solid blue, medium weight
- Secondary Button: Outline with subtle hover
- Danger Button: Red for destructive actions
- Icon Buttons: Ghost style with tooltips
- Tabs: Underline active state
- Search: Always visible, cmd+k shortcut

**Forms & Inputs**:
- Input fields: Dark background with subtle border, focus ring in blue
- Select dropdowns: Native with consistent styling
- Toggle switches: For binary settings
- Date pickers: Calendar overlay for date selection
- Sliders: For position sizing (0-5% range)

**Overlays**:
- Modal dialogs: Center-screen with backdrop blur
- Slide-overs: Right-side panel for details/actions
- Tooltips: Subtle, instant on hover
- Notifications: Toast (top-right) for system feedback
- Agent responses: Floating panel with typing indicator

**Specialized Financial Components**:
- DCF Model Builder: Three-column layout (Bull/Base/Bear)
- Portfolio Impact Visualizer: Before/after comparison cards
- Risk Meter: Gauge chart showing tracking error vs limits
- Vote Tally: Visual vote counter (4-0-1 format)
- Thesis Health Indicator: Traffic light system (🟢⚠️🔴)

### E. Animations

**Minimal, Purposeful Motion**:
- Page transitions: None (instant)
- Data loading: Skeleton screens (subtle pulse)
- AI agent responses: Typing indicator only
- Notifications: Slide-in from top-right
- All transitions: 150-200ms ease-in-out

**Prohibited Animations**:
- No decorative animations
- No parallax effects
- No complex transitions
- No auto-playing videos

## Images Section

**No Hero Images**: This is an enterprise dashboard application, not a marketing site. All visual real estate is dedicated to data, charts, and workflow interfaces.

**Icon Usage**: 
- Heroicons for all UI icons (via CDN)
- Financial icons: Use Unicode symbols (📊 📈 📉 💰) sparingly for visual anchors
- Company logos: Placeholder circular avatars with ticker symbols

**Data Visualization**:
- All charts rendered via Recharts library
- Consistent color scheme across all visualizations
- No decorative imagery - data is the visual content

## Special Considerations

**Information Density**: Unlike consumer apps, embrace density. Users are professionals who need to see multiple data points simultaneously. Use compact spacing, smaller fonts, and multi-column layouts throughout.

**Real-Time Updates**: Design for live data with subtle update indicators (pulsing dot, timestamp changes) rather than disruptive animations.

**Accessibility**: Maintain WCAG AA contrast ratios. All status colors must work in both light/dark modes. Ensure keyboard navigation for power users.

**Agent Interaction Design**:
- Agent invocation: Clear button with agent name
- Response display: Dedicated panel with structured output
- Loading states: Progress indicator with estimated time
- Voice playback: Audio player controls for agent summaries

**Multi-Stage Workflow Visualization**:
- Horizontal stepper showing: Discovery → Analysis → IC Meeting → Execution → Monitoring
- Current stage highlighted, completed stages checkmarked
- Each stage shows relevant data and available actions