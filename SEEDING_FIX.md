# Seeding Fix - GOOGL & AMZN Data Missing

## Problem Identified

The seed script (`scripts/seed.ts`) had an overly aggressive "already seeded" check that would skip all seeding if NEE workflow with monitoring events existed. This caused GOOGL and AMZN research requests and proposals to be missing in local Docker environments.

### What Was Missing:
- ✅ GOOGL research request (COMPLETED status)
- ✅ GOOGL proposal (DRAFT status) with AI-generated thesis
- ✅ GOOGL agent responses (Research Brief, DCF Model)
- ✅ AMZN research request (COMPLETED status)
- ✅ AMZN proposal (PENDING status) with AI-generated thesis
- ✅ AMZN agent responses (Research Brief, DCF Model)

## Fix Applied

Updated the seed script to check for BOTH NEE monitoring events AND GOOGL/AMZN proposals before skipping. This ensures all demo data is properly seeded.

**Before:**
```typescript
// Skipped if NEE workflow existed
if (existingWorkflows.length > 0) {
  const monitoringEvents = await storage.getMonitoringEvents(existingNeeWorkflow.id);
  if (monitoringEvents.length > 0) {
    console.log("✅ Database already seeded - skipping");
    return; // ← This skipped GOOGL/AMZN seeding!
  }
}
```

**After:**
```typescript
// Only skips if BOTH NEE AND GOOGL/AMZN exist
const hasGooglProposal = existingProposals.some(p => p.ticker === "GOOGL" && p.analyst === "user-demo-1");
const hasAmznProposal = existingProposals.some(p => p.ticker === "AMZN" && p.analyst === "user-analyst-1");

if (existingWorkflows.length > 0 && hasGooglProposal && hasAmznProposal) {
  // ... check monitoring events
  console.log("✅ Database already fully seeded (NEE + GOOGL + AMZN) - skipping");
}
```

## How to Apply the Fix Locally

### Option 1: Complete Reset (Recommended)

```bash
# Stop and clean everything
make clean

# Start fresh with all fixes
make run-all
```

This will:
1. Delete all Docker volumes (wipes database)
2. Rebuild containers
3. Run migrations
4. Seed with COMPLETE data (NEE + GOOGL + AMZN + all agent responses)

### Option 2: Reseed Existing Database

```bash
# Manually clear the database
docker compose exec postgres psql -U vest -d vest_db -c "TRUNCATE TABLE proposals, research_requests, agent_responses CASCADE;"

# Reseed
make seed
```

## What You'll Have After Seeding

### Research Requests Page
- **TSLA** (PENDING) - Awaiting analyst assignment
- **GOOGL** (✅ COMPLETED) - Shows "Create Proposal" button
- **AMZN** (✅ COMPLETED) - Shows "Create Proposal" button  
- **OXY** (IN_PROGRESS) - Scenario analysis in progress

### Proposals Page
- **NEE** (APPROVED) - Full workflow with IC meeting
- **CVX** (PENDING) - In IC_PREP stage
- **OXY** (DRAFT) - Linked to in-progress research
- **GOOGL** (✅ DRAFT) - AI-generated thesis with Research Brief and DCF
- **AMZN** (✅ PENDING) - AI-generated thesis with Research Brief and DCF

### Agent Responses (available when clicking "Generate with AI")
- GOOGL Research Brief - Comprehensive Google Cloud, AI, Search analysis
- GOOGL DCF Model - Bull/Base/Bear scenarios with valuation
- AMZN Research Brief - AWS, Retail, Advertising analysis
- AMZN DCF Model - Detailed financial projections

## Complete Demo Data Inventory

After proper seeding, you'll have:

**Users**: 5 (Dan Mbanga, Sarah Chen, Mike Rodriguez, Jane Smith, Alex Thompson)

**Companies**: 4 (NEE, CVX, NVDA, OXY)

**Workflows**: 3 complete
- NEE (MONITORING) - Full 5-stage workflow
- CVX (IC_PREP) - Preparing for IC meeting
- OXY (DISCOVERY) - Early stage research

**Research Requests**: 4
- TSLA (PENDING)
- **GOOGL (COMPLETED)** ← Now included!
- **AMZN (COMPLETED)** ← Now included!
- OXY (IN_PROGRESS)

**Proposals**: 5
- NEE (APPROVED)
- CVX (PENDING)
- OXY (DRAFT)
- **GOOGL (DRAFT)** ← Now included!
- **AMZN (PENDING)** ← Now included!

**IC Meetings**: 2
- NEE meeting (COMPLETED) - With votes and debate
- CVX meeting (SCHEDULED) - Upcoming

**Agent Responses**: 16+ covering all agents
- Research synthesizer responses for all tickers
- Financial models with DCF valuations
- Risk analysis and scenario planning
- **GOOGL agent responses** ← Now included!
- **AMZN agent responses** ← Now included!

**Portfolio Positions**: 2
- NEE (5000 shares @ $73.50)
- NVDA (5000 shares @ $119.50)

**Monitoring Events**: 5+ for active positions

**Notifications**: 4 across different types (earnings, regulatory, IC meetings, research)

## Verification

After reseeding, verify the fix worked:

```bash
# Check for GOOGL/AMZN proposals
docker compose exec postgres psql -U vest -d vest_db -c "SELECT ticker, status, analyst FROM proposals WHERE ticker IN ('GOOGL', 'AMZN');"

# Should show:
# GOOGL | DRAFT   | user-demo-1
# AMZN  | PENDING | user-analyst-1

# Check for GOOGL/AMZN research
docker compose exec postgres psql -U vest -d vest_db -c "SELECT ticker, status FROM research_requests WHERE ticker IN ('GOOGL', 'AMZN') AND status='COMPLETED';"

# Should show 2 COMPLETED research requests
```

## Next Steps

1. Run `make clean && make run-all` on your MacBook
2. Access http://localhost:5000
3. Navigate to Research page - you should see GOOGL and AMZN with "Create Proposal" buttons
4. Navigate to Proposals page - you should see GOOGL (DRAFT) and AMZN (PENDING)
5. Click "Generate with AI" on proposals to see agent responses

All demo data will now match what's running on Replit! 🎉
