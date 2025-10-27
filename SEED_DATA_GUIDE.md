# Comprehensive Seed Data Guide - Vest Platform

## Overview

The seed script now creates diverse, realistic data across multiple research scenarios and workflow stages. This guide explains all the data that will be seeded locally and how to test each scenario.

## Complete Data Scenarios

### Research Requests (7 scenarios across different states)

| Ticker | Company | Status | Has Proposal? | Priority | Button Shown |
|--------|---------|--------|---------------|----------|--------------|
| **CVX** | Chevron | ✅ COMPLETED | ❌ NO | HIGH | **"Create Proposal"** |
| **GOOGL** | Alphabet | ✅ COMPLETED | ✅ YES | MEDIUM | **"View Proposal"** |
| **AMZN** | Amazon | ✅ COMPLETED | ✅ YES | HIGH | **"View Proposal"** |
| **OXY** | Occidental | 🔄 IN_PROGRESS | ✅ YES | MEDIUM | "View Analysis" |
| **META** | Meta Platforms | 🔄 IN_PROGRESS | ❌ NO | MEDIUM | "AI Analysis" |
| **TSLA** | Tesla | ⏳ PENDING | ❌ NO | HIGH | "AI Analysis" |
| **NVDA** | NVIDIA | ⏳ PENDING | ❌ NO | LOW | "AI Analysis" |

**Key Testing Scenario:** CVX shows "Create Proposal" button because research is COMPLETED but no proposal exists yet.

### Proposals (5 across different stages)

| Ticker | Company | Status | Analyst | Workflow Stage |
|--------|---------|--------|---------|----------------|
| **NEE** | NextEra Energy | APPROVED | user-analyst-1 | MONITORING |
| **NVDA** | NVIDIA | APPROVED | user-analyst-1 | MONITORING |
| **CVX** | Chevron | PENDING | user-analyst-2 | IC_MEETING |
| **OXY** | Occidental | PENDING | user-demo-1 | ANALYSIS |
| **GOOGL** | Alphabet | DRAFT | user-demo-1 | (research stage) |
| **AMZN** | Amazon | PENDING | user-analyst-1 | (research stage) |

### Complete Workflows (4 at different stages)

#### 1. NEE - Full Monitoring Workflow
- **Stage**: MONITORING (post-execution)
- **Status**: ACTIVE
- **Features**:
  - Active position ($741K) with thesis tracking
  - 3 monitoring events (earnings beat, rate case delay, portfolio check)
  - 16+ AI agent responses covering all workflow phases
  - Completed IC meeting with debate session (11 messages)
  - Full artifact history (Research Brief, DCF Model, Risk Analysis, etc.)

#### 2. NVDA - Tech Sector Monitoring
- **Stage**: MONITORING
- **Status**: ACTIVE
- **Features**:
  - Active position ($660K) tracking
  - 3 monitoring events
  - Completed IC meeting (4 debate messages)
  - Full set of agent responses

#### 3. CVX - Active IC Meeting
- **Stage**: IC_MEETING
- **Status**: ACTIVE
- **Features**:
  - Active debate session in progress (9 messages)
  - Research artifacts complete
  - Awaiting committee vote

#### 4. OXY - Analysis In Progress
- **Stage**: ANALYSIS
- **Status**: ACTIVE
- **Features**:
  - Work-in-progress research artifacts
  - Draft financial model (60% complete)
  - Scenario analysis research request active

### Agent Responses by Ticker

#### GOOGL (COMPLETED research)
- ✅ Research Brief (comprehensive analysis)
- ✅ DCF Valuation Model (bull/base/bear scenarios)
- **Shows**: "View Analysis" button + "View Proposal" button

#### AMZN (COMPLETED research)
- ✅ Research Brief
- ✅ DCF Valuation Model
- **Shows**: "View Analysis" button + "View Proposal" button

#### CVX (COMPLETED research, NO proposal)
- ✅ Research Brief
- ✅ DCF Valuation Model
- **Shows**: "View Analysis" button + **"Create Proposal" button**

#### NEE (Full workflow)
- ✅ All 16 agent types with responses:
  1. Research Synthesizer (research brief)
  2. Financial Modeler (DCF model)
  3. Quant Analyzer (quantitative analysis)
  4. Risk Analyzer (risk assessment)
  5. Scenario Simulator (scenario analysis)
  6. Document Generator (investment memos)
  7. Meeting Recorder (meeting minutes)
  8. Compliance Checker (compliance reports)
  9. Risk Reporter (risk reports)
  10. Trade Executor (trade orders)
  11. Thesis Monitor (thesis tracking)
  12. Market Monitor (market events)
  13. Data Retriever (data analysis)
  14. Voice Summarizer (voice summaries)
  15. Attribution Analyzer (performance attribution)
  16. Risk Regime Analyzer (risk regime analysis)

#### OXY (Work in progress)
- 🔄 Research Brief (DRAFT - 60% complete)
- 🔄 Financial Model (IN PROGRESS - building sections)

### Users & Roles

| ID | Name | Role | Email |
|----|------|------|-------|
| user-demo-1 | Dan Mbanga | PM | dan@example.io |
| user-analyst-1 | Sarah Chen | ANALYST | sarah.chen@vest.com |
| user-pm-1 | Mike Rodriguez | PM | mike.rodriguez@vest.com |
| user-compliance-1 | Jane Smith | COMPLIANCE | jane.smith@vest.com |
| user-analyst-2 | Alex Thompson | ANALYST | alex.thompson@vest.com |

### Companies (8 across 3 sectors)

**Energy Sector:**
- NEE (NextEra Energy) - Electric Utilities
- CVX (Chevron) - Oil & Gas Integrated
- OXY (Occidental Petroleum) - Oil & Gas E&P

**Technology Sector:**
- GOOGL (Alphabet) - Internet Content
- NVDA (NVIDIA) - Semiconductors
- META (Meta Platforms) - Social Media

**Consumer Discretionary:**
- AMZN (Amazon) - E-commerce & Cloud
- TSLA (Tesla) - Electric Vehicles

## How to Test Locally

### Step 1: Clean Start

```bash
cd vest-demo

# Stop everything
make stop

# Complete clean (removes all data)
make clean

# Fresh seed with ALL data
make run-all
```

### Step 2: Verify Seed Completion

Watch for this output:
```
✅ Seed completed successfully!
📊 Created data:
  - 5 users (Dan, Sarah, Mike, Jane, Alex)
  - 8 companies across 3 sectors
  - 4 workflows in different stages
  - 7 research requests (various states)
  - 6 proposals
  - Agent responses for GOOGL, AMZN, CVX
  - IC meetings with debate sessions
  - Monitoring events
```

### Step 3: Test Research Page Scenarios

**Open:** http://localhost:5000 → Navigate to "Research"

**Verify These Scenarios:**

1. **CVX (Chevron)** ⭐ **KEY TEST**
   - Status: ✅ COMPLETED
   - Buttons shown: "AI Analysis" + **"Create Proposal"**
   - Click "AI Analysis" → Should show Research Brief + DCF Model
   - Click "Create Proposal" → Should open proposal creation form

2. **GOOGL (Alphabet)**
   - Status: ✅ COMPLETED
   - Buttons shown: "AI Analysis" + "View Proposal"
   - Click "View Analysis" → Shows research data
   - Click "View Proposal" → Navigates to GOOGL proposal (DRAFT status)

3. **AMZN (Amazon)**
   - Status: ✅ COMPLETED
   - Buttons shown: "AI Analysis" + "View Proposal"
   - Same behavior as GOOGL

4. **TSLA (Tesla)**
   - Status: ⏳ PENDING
   - Buttons shown: "AI Analysis" only
   - Research not started yet

5. **OXY (Occidental)**
   - Status: 🔄 IN_PROGRESS
   - Buttons shown: "AI Analysis"
   - Click → Shows work-in-progress artifacts (60% complete)

6. **META (Meta Platforms)**
   - Status: 🔄 IN_PROGRESS
   - Buttons shown: "AI Analysis"
   - Research in progress

### Step 4: Test Proposals Page

**Navigate to:** "Proposals" page

**Verify These Proposals:**

1. **NEE** - APPROVED (Monitoring stage)
2. **NVDA** - APPROVED (Monitoring stage)
3. **CVX** - PENDING (IC Meeting stage)
4. **OXY** - PENDING (Analysis stage)
5. **GOOGL** - DRAFT (From research)
6. **AMZN** - PENDING (From research)

**Create New Proposal from CVX:**
- Go to Research page
- Click "Create Proposal" on CVX
- Fill out form (pre-populated with CVX research data)
- Submit → Should create new CVX proposal

### Step 5: Test IC Meetings

**Navigate to:** "IC Meetings" page

**Verify:**
1. **NEE Meeting** - COMPLETED (11 debate messages)
2. **CVX Meeting** - ACTIVE (9 debate messages, ongoing)
3. **NVDA Meeting** - COMPLETED (4 debate messages)

**Test Debate Room:**
- Click into CVX meeting
- Should see active debate with AI agent responses
- Test voice controls if available

### Step 6: Test Monitoring Hub

**Navigate to:** "Monitoring" page (or specific workflow)

**Verify NEE Monitoring:**
- Active position: $741K
- 3 monitoring events:
  1. Earnings beat (+6.4% today)
  2. Rate case delay (regulatory)
  3. Portfolio check
- Thesis health tracking
- Agent responses for all 16 agent types

**Verify NVDA Monitoring:**
- Active position: $660K
- 3 monitoring events
- Complete agent coverage

### Step 7: Test Agent Outputs

**Navigate to:** Individual agent pages (Research Brief, DCF Model, etc.)

**Verify Agent Responses Exist For:**
- NEE: All 16 agent types
- GOOGL: Research Synthesizer, Financial Modeler
- AMZN: Research Synthesizer, Financial Modeler
- CVX: Research Synthesizer, Financial Modeler
- OXY: Research Synthesizer (DRAFT), Financial Modeler (DRAFT)

## Database Verification

Check data directly in PostgreSQL:

```bash
# Check research requests
docker compose exec postgres psql -U vest -d vest_db -c \
  "SELECT ticker, status, proposal_id IS NOT NULL as has_proposal FROM research_requests;"

# Check proposals
docker compose exec postgres psql -U vest -d vest_db -c \
  "SELECT ticker, status, analyst FROM proposals ORDER BY created_at;"

# Check agent responses
docker compose exec postgres psql -U vest -d vest_db -c \
  "SELECT ticker, agent_type, COUNT(*) FROM agent_responses GROUP BY ticker, agent_type ORDER BY ticker;"

# Check workflows
docker compose exec postgres psql -U vest -d vest_db -c \
  "SELECT ticker, current_stage, status FROM workflows;"
```

**Expected Counts:**
- Research requests: 7 (CVX, GOOGL, AMZN, OXY, META, TSLA, NVDA)
- Proposals: 6 (NEE, NVDA, CVX, OXY, GOOGL, AMZN)
- Workflows: 4 (NEE, NVDA, CVX, OXY)
- Agent responses: 40+ total
  - NEE: ~32 (all 16 agents x 2 instances)
  - GOOGL: 2 (Research + DCF)
  - AMZN: 2 (Research + DCF)
  - CVX: 2 (Research + DCF)
  - OXY: 2 (Research + DCF, both DRAFT)

## Key Testing Checklist

- [ ] CVX shows "Create Proposal" button (COMPLETED research, no proposal)
- [ ] GOOGL shows "View Proposal" button (COMPLETED research, linked proposal)
- [ ] AMZN shows "View Proposal" button (COMPLETED research, linked proposal)
- [ ] Clicking "View Analysis" on CVX shows Research Brief + DCF Model
- [ ] Creating proposal from CVX works and links back to research request
- [ ] NEE workflow shows full monitoring with 3 events
- [ ] CVX IC meeting shows active debate session
- [ ] Proposals page shows all 6 proposals
- [ ] Agent outputs page shows responses for all tickers
- [ ] Database queries return expected counts

## Troubleshooting

### Issue: "Create Proposal" not showing for CVX

**Cause**: Database wasn't properly cleaned or seed was skipped

**Fix**:
```bash
make clean  # Nuclear option
make run-all  # Fresh seed
```

### Issue: Seed says "already seeded - skipping"

**Cause**: Existing data detected

**Fix**:
```bash
# Force complete reset
make clean
make run-all

# OR manually drop/recreate database:
docker compose down -v
docker compose up -d postgres
make run-all
```

### Issue: Wrong data showing (e.g., proposals from wrong analysts)

**Cause**: Old data from previous runs

**Fix**: Always use `make clean` before reseeding to ensure fresh state

### Issue: Missing agent responses

**Cause**: Seed check detected partial data and skipped creation

**Fix**: `make clean && make run-all` for fresh seed

## Summary

After running `make clean && make run-all`, you will have:

✅ 7 research requests in various states (COMPLETED, IN_PROGRESS, PENDING)
✅ **CVX with "Create Proposal" button** (main test scenario)
✅ GOOGL & AMZN with "View Proposal" buttons
✅ 6 proposals across different workflow stages
✅ 4 complete workflows (NEE and NVDA in MONITORING, CVX in IC_MEETING, OXY in ANALYSIS)
✅ 40+ agent responses covering all major agent types
✅ 3 IC meetings with debate sessions
✅ 6 monitoring events
✅ 5 users with different roles
✅ 8 companies across 3 sectors

**Your local environment will match Replit with comprehensive, realistic data! 🎉**
