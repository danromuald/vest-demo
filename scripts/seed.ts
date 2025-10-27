import { storage } from "../server/storage";

async function seed() {
  console.log("🌱 Starting database seeding...");
  
  // Helper to ensure artifact creation follows schema correctly
  const seedArtifact = async ({
    workflowId,
    artifactType,
    stage,
    title,
    content,
    createdBy,
    status = "APPROVED",
    version = 1,
    metadata = null
  }: {
    workflowId: string;
    artifactType: string;
    stage: string;
    title: string;
    content: string;
    createdBy: string;
    status?: string;
    version?: number;
    metadata?: any;
  }) => {
    return storage.createWorkflowArtifact({
      workflowId,
      artifactType,
      stage,
      title,
      content: { text: content }, // Wrap in JSON
      createdBy,
      status,
      version,
      metadata
    });
  };

  try {
    // Check if already seeded by looking for NEE workflow
    const existingWorkflows = await storage.getWorkflows({ ticker: "NEE" });
    if (existingWorkflows.length > 0) {
      const existingNeeWorkflow = existingWorkflows[0];
      const monitoringEvents = await storage.getMonitoringEvents(existingNeeWorkflow.id);
      if (monitoringEvents.length > 0) {
        console.log("✅ Database already seeded - skipping");
        return;
      }
      console.log("NEE workflow exists but incomplete - proceeding with seed...");
    } else {
      console.log("Database not seeded yet - proceeding with seed...");
    }

    // Create demo users with different roles
    console.log("Creating demo users...");
    const users = [
      {
        id: "user-demo-1",
        email: "dan@example.io",
        firstName: "Dan",
        lastName: "Mbanga",
        profileImageUrl: null,
        role: "ANALYST" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "user-analyst-1",
        email: "sarah.chen@vest.com",
        firstName: "Sarah",
        lastName: "Chen",
        profileImageUrl: null,
        role: "ANALYST" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "user-pm-1",
        email: "mike.rodriguez@vest.com",
        firstName: "Mike",
        lastName: "Rodriguez",
        profileImageUrl: null,
        role: "PM" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "user-compliance-1",
        email: "jane.smith@vest.com",
        firstName: "Jane",
        lastName: "Smith",
        profileImageUrl: null,
        role: "COMPLIANCE" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "user-analyst-2",
        email: "alex.thompson@vest.com",
        firstName: "Alex",
        lastName: "Thompson",
        profileImageUrl: null,
        role: "ANALYST" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for (const user of users) {
      await storage.upsertUser(user);
    }

    // Create Energy sector companies
    console.log("Creating companies...");
    const companies = [
      {
        ticker: "NEE",
        name: "NextEra Energy, Inc.",
        sector: "Energy",
        industry: "Electric Utilities",
        marketCap: 152000000000,
        description: "Leading clean energy company with largest renewable energy portfolio in North America"
      },
      {
        ticker: "CVX",
        name: "Chevron Corporation",
        sector: "Energy",
        industry: "Oil & Gas Integrated",
        marketCap: 285000000000,
        description: "Integrated energy company engaged in crude oil and natural gas exploration and production"
      },
      {
        ticker: "OXY",
        name: "Occidental Petroleum Corporation",
        sector: "Energy",
        industry: "Oil & Gas E&P",
        marketCap: 56000000000,
        description: "Independent oil and gas company with carbon capture and enhanced oil recovery capabilities"
      }
    ];

    for (const company of companies) {
      try {
        await storage.createCompany(company);
      } catch (error: any) {
        // Ignore duplicate key errors (company already exists)
        if (error.code !== '23505') {
          throw error;
        }
        console.log(`  - ${company.ticker} already exists, skipping`);
      }
    }

    // =====================================================================
    // WORKFLOW 1: NEE - Complete workflow in MONITORING stage
    // =====================================================================
    console.log("\n📊 Creating NEE workflow (MONITORING stage)...");
    
    const neeProposal = await storage.createProposal({
      ticker: "NEE",
      companyName: "NextEra Energy, Inc.",
      analyst: "user-analyst-1",
      proposalType: "BUY",
      proposedWeight: "4.50",
      targetPrice: "85.00",
      status: "APPROVED",
      thesis: "NextEra Energy is the world's largest renewable energy producer with unmatched competitive advantages in clean energy infrastructure. The company's integrated regulated/competitive model provides stable cash flows while capturing secular tailwinds from energy transition. Target $85 represents 15% upside with 3.5% dividend yield.",
      catalysts: [
        "Renewable energy backlog of 23 GW with locked-in PPAs at favorable rates",
        "Florida Power & Light rate case approval supporting 10% rate base growth",
        "Green hydrogen pilot programs positioning for $100B+ addressable market",
        "IRA tax credits extending economics of solar/wind for 10+ years"
      ],
      risks: [
        "Regulatory risk: Florida PSC could deny future rate increases",
        "Weather exposure: Hurricane season could impact infrastructure",
        "Interest rate sensitivity: Rising rates pressure ROIC on capital-intensive projects",
        "Technology disruption: Battery storage economics improving faster than expected"
      ],
      recommendation: "BUY",
      upside: "15.20",
      downside: "-8.50"
    });

    const neeWorkflow = await storage.createWorkflow({
      ticker: "NEE",
      companyName: "NextEra Energy, Inc.",
      sector: "Energy",
      currentStage: "MONITORING",
      status: "ACTIVE",
      owner: "user-analyst-1",
      description: "Clean energy leader with dominant renewable infrastructure and regulated utility moat"
    });

    // Create all 5 workflow stages for NEE (all completed except monitoring which is in progress)
    const neeStages = await Promise.all([
      storage.createWorkflowStage({
        workflowId: neeWorkflow.id,
        stage: "DISCOVERY",
        status: "COMPLETED",
        owner: "user-analyst-1",
        startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        notes: "Initial research and thesis development completed"
      }),
      storage.createWorkflowStage({
        workflowId: neeWorkflow.id,
        stage: "ANALYSIS",
        status: "COMPLETED",
        owner: "user-analyst-1",
        startedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        notes: "Financial model, risk analysis, and investment thesis completed"
      }),
      storage.createWorkflowStage({
        workflowId: neeWorkflow.id,
        stage: "IC_MEETING",
        status: "COMPLETED",
        owner: "user-pm-1",
        startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        notes: "IC meeting approved position - 4.5% weight"
      }),
      storage.createWorkflowStage({
        workflowId: neeWorkflow.id,
        stage: "EXECUTION",
        status: "COMPLETED",
        owner: "user-pm-1",
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notes: "Position built - 6500 shares @ $73.50 avg"
      }),
      storage.createWorkflowStage({
        workflowId: neeWorkflow.id,
        stage: "MONITORING",
        status: "IN_PROGRESS",
        owner: "user-analyst-1",
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedAt: null,
        notes: "Active monitoring - thesis health: HEALTHY"
      })
    ]);

    // NEE Research Artifacts
    console.log("  Creating NEE artifacts...");
    const neeArtifacts = [
      await seedArtifact({
        workflowId: neeWorkflow.id,
        artifactType: "RESEARCH_BRIEF",
        stage: "ANALYSIS",
        title: "NEE Renewable Energy Leadership Analysis",
        createdBy: "user-analyst-1",
        content: `# NextEra Energy Investment Research Brief

## Executive Summary
NextEra Energy (NEE) represents a unique opportunity to gain exposure to the secular energy transition theme while maintaining downside protection through its regulated Florida utility. The company operates the largest renewable energy portfolio globally with 30+ GW capacity and has demonstrated consistent execution on capital deployment.

## Investment Thesis
1. **Renewable Energy Leadership**: NEE owns and operates the world's largest wind and solar portfolio. FPL's regulated utility provides stable cash flows (~60% of EBITDA) while NEP captures growth in competitive renewables.

2. **Structural Competitive Advantages**: 
   - Lowest cost renewable energy producer due to scale and technology partnerships
   - Vertically integrated development/operations reducing third-party dependencies
   - Strong relationships with turbine/panel manufacturers ensuring supply chain priority

3. **Secular Tailwinds**: 
   - Corporate PPAs: 85% of Fortune 100 have net-zero commitments
   - Federal support: IRA provides $369B in clean energy incentives
   - State mandates: 30+ states with renewable portfolio standards

## Financial Model Highlights
- Revenue CAGR 2023-2028E: 8.2%
- EBITDA CAGR 2023-2028E: 9.5%
- FCF/share growth: 10% annually
- Current valuation: 18.5x NTM P/E vs 5-year average of 21.2x

## Key Risks
- Regulatory lag in Florida rate cases
- Rising interest rates impacting project economics
- Weather volatility (hurricanes)
- Technology disruption from battery storage

## Recommendation: BUY
Target Price: $85 (15% upside)
Position Size: 4.5% of portfolio`
      }),

      await seedArtifact({
        workflowId: neeWorkflow.id,
        artifactType: "FINANCIAL_MODEL",
        stage: "ANALYSIS",
        title: "NEE DCF Valuation Model",
        createdBy: "user-analyst-1",
        content: `# NextEra Energy DCF Model

## Model Assumptions
**Revenue Drivers:**
- Florida Power & Light: 6% rate base growth + 2% volume
- Energy Resources: 23 GW renewable backlog deployment
- Customer growth: 75K new FL connections annually

**Margin Profile:**
- Regulated utility EBITDA margin: 45% (stable)
- Competitive renewables EBITDA margin: 38% (expanding from scale)

**Capital Deployment:**
- Annual capex: $18-20B through 2027
- Renewable development: $12B annually
- Grid modernization: $4B annually
- Maintenance capex: $2B annually

## DCF Valuation
- Terminal FCF (2028): $7.2B
- WACC: 7.2% (beta: 0.65, equity weight: 55%)
- Terminal growth: 3.0%
- Enterprise Value: $168B
- Net Debt: $65B
- Equity Value: $103B
- Shares Out: 2.0B
- **Fair Value: $85/share**

## Sensitivity Analysis
Price sensitivity to WACC ± 50bps and terminal growth ± 50bps:
- Bull case ($95): WACC 6.7%, g=3.5%
- Base case ($85): WACC 7.2%, g=3.0%  
- Bear case ($68): WACC 7.7%, g=2.5%

## Returns Analysis
- Entry price: $73.50
- Expected return (1-year): 18.7% (15% price + 3.7% yield)
- Risk-adjusted return: 14.2% (applying 75% probability)`
      }),

      await seedArtifact({
        workflowId: neeWorkflow.id,
        artifactType: "RISK_ANALYSIS",
        stage: "ANALYSIS",
        title: "NEE Risk Assessment & Scenario Analysis",
        createdBy: "user-analyst-1",
        content: `# Risk Analysis: NextEra Energy

## Top 5 Risks (Probability x Impact)

### 1. Regulatory Risk (Medium probability, High impact)
**Description**: Florida Public Service Commission could deny or reduce requested rate increases
**Mitigation**: Strong regulatory track record, essential service designation
**Quantified Impact**: -15% downside if rate case denied

### 2. Interest Rate Risk (High probability, Medium impact)  
**Description**: Rising rates increase WACC and reduce project returns
**Mitigation**: Hedging program, locked-in PPAs, inflation escalators
**Quantified Impact**: Each 100bps increase in rates = -$4/share in fair value

### 3. Weather/Climate Risk (Low probability, High impact)
**Description**: Major hurricane causing infrastructure damage and outages
**Mitigation**: Underground infrastructure investment, insurance coverage
**Quantified Impact**: Category 5 hurricane = $2-3B damage (insured)

### 4. Technology Disruption (Medium probability, Medium impact)
**Description**: Battery storage costs decline faster than solar, changing competitive dynamics
**Mitigation**: Early mover in battery storage (3 GW pipeline)
**Quantified Impact**: Could compress renewables margins by 200-300bps

### 5. Execution Risk (Low probability, Medium impact)
**Description**: Delays or cost overruns in 23 GW renewable backlog
**Mitigation**: Proven development team, supply chain relationships
**Quantified Impact**: 20% cost overrun = -8% to returns

## Scenario Analysis

**Bull Case (+45%): Clean Energy Acceleration**
- Federal policy extends IRA credits
- Carbon pricing drives renewable demand  
- NEE gains market share in storage
- Target: $105/share

**Base Case (+15%): As Expected**
- Current trajectory continues
- Moderate policy support
- Target: $85/share

**Bear Case (-25%): Renewables Slowdown**
- Policy uncertainty slows development
- Rising rates pressure returns
- Technology disruption
- Target: $55/share`
      }),

      await seedArtifact({
        workflowId: neeWorkflow.id,
        artifactType: "INVESTMENT_THESIS",
        stage: "ANALYSIS",
        title: "NEE Investment Thesis Summary",
        createdBy: "user-analyst-1",
        content: `# Investment Thesis: NextEra Energy (NEE)

## Core Thesis
NextEra Energy represents a rare combination of defensive utility characteristics with offensive exposure to the multi-decade energy transition. The company's dual model provides downside protection while capturing upside from renewable energy secular growth.

## Why Now?
1. Stock trading at 18.5x P/E vs 5-year average of 21x (13% discount)
2. 23 GW renewable backlog represents 3-4 years of visible growth
3. IRA tailwinds just beginning to materialize in project returns
4. Recent pullback driven by rate concerns creates entry opportunity

## Competitive Position
- #1 renewable energy producer globally (30+ GW installed)
- Lowest cost operator (scale + vertical integration)
- Regulated utility provides 60% of EBITDA (moat + stability)
- Technology leadership in battery storage and green hydrogen

## Financial Strength
- Investment grade credit rating (BBB+/Baa1)
- Conservative 60% payout ratio provides dividend growth runway
- $70B+ liquidity for growth investments
- 10-year track record of meeting/exceeding guidance

## Risk/Reward
- Upside to $85 target: +15%
- Dividend yield: 3.7%
- Total return potential: 18-20% annually
- Downside: Well-supported at $65 (regulated utility value)

## Position Recommendation
**Action**: BUY
**Weight**: 4.5% (overweight vs 2.5% benchmark)
**Entry**: $73.50 or lower
**Stop loss**: $65 (regulated utility sum-of-parts value)`
      })
    ];

    // NEE IC Meeting with realistic debate
    console.log("  Creating NEE IC meeting...");
    const neeMeeting = await storage.createICMeeting({
      workflowId: neeWorkflow.id,
      meetingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      status: "COMPLETED",
      title: "NEE Investment Committee Meeting",
      description: "Review and vote on NextEra Energy (NEE) investment proposal",
      attendees: ["user-analyst-1", "user-pm-1", "user-compliance-1", "user-demo-1"],
      agenda: {
        items: [
          "Investment thesis review",
          "Financial model walkthrough",
          "Risk analysis discussion",
          "Q&A and debate",
          "Vote on position sizing"
        ]
      },
      decisions: {
        approved: true,
        positionSize: "4.5%",
        conditions: []
      },
      minutes: "Strong consensus on thesis. Approved 4.5% position size. Some debate on timing given recent rate case uncertainty.",
      createdBy: "user-pm-1"
    });

    // IC Meeting votes
    await Promise.all([
      storage.createVote({
        proposalId: neeProposal.id,
        voterName: "Mike Rodriguez",
        voterRole: "PM",
        vote: "APPROVE",
        comment: "Clean energy thesis is compelling. NEE has best-in-class execution. Valuation is attractive at 18x P/E. Confidence: 85%"
      }),
      storage.createVote({
        proposalId: neeProposal.id,
        voterName: "Jane Smith",
        voterRole: "COMPLIANCE",
        vote: "APPROVE",
        comment: "Regulatory risk is manageable given Florida's constructive environment. Position size is appropriate. Confidence: 78%"
      }),
      storage.createVote({
        proposalId: neeProposal.id,
        voterName: "Dan Mbanga",
        voterRole: "ANALYST",
        vote: "APPROVE",
        comment: "Strong secular tailwinds. Execution track record reduces risk. Like the regulated utility downside protection. Confidence: 82%"
      })
    ]);

    // IC Meeting debate messages
    const neeDebateMessages = [
      {
        meetingId: neeMeeting.id,
        proposalId: neeProposal.id,
        senderId: "user-pm-1",
        senderName: "Mike Rodriguez",
        senderRole: "PM",
        content: "Sarah, great work on the research brief. The renewable backlog visibility is compelling. My main question is on the Florida rate case - what's your confidence on approval?",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000)
      },
      {
        meetingId: neeMeeting.id,
        proposalId: neeProposal.id,
        senderId: "user-analyst-1",
        senderName: "Sarah Chen",
        senderRole: "ANALYST",
        content: "High confidence - 85%. FPL has a strong track record with the FL PSC. They've approved 95% of rate increases over the past 10 years. The infrastructure investments are clearly beneficial to customers (grid hardening, reliability).",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000)
      },
      {
        meetingId: neeMeeting.id,
        proposalId: neeProposal.id,
        senderId: "AI_AGENT",
        senderName: "Contrarian AI",
        senderRole: "ANALYST",
        content: "🤖 **Contrarian View**: While NEE's renewable portfolio is impressive, I'm concerned about three factors: (1) Rising interest rates disproportionately impact capital-intensive renewable developers - every 100bps reduces project returns by ~200bps. (2) Battery storage costs are declining 15-20% annually, which could obsolete some of NEE's solar/wind assets sooner than expected. (3) The stock has historically underperformed during rate hike cycles - we're potentially early in a multi-year hiking cycle. Have we stress-tested the model for 9% WACC?",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000)
      },
      {
        meetingId: neeMeeting.id,
        proposalId: neeProposal.id,
        senderId: "user-analyst-1",
        senderName: "Sarah Chen",
        senderRole: "ANALYST",
        content: "Good pushback. On interest rates: NEE has hedged ~70% of their floating rate exposure through 2025. Their PPAs also have inflation escalators which partially offset. At 9% WACC, fair value drops to $72 - still only 2% below current price. On battery storage: NEE is actually a leader there with 3 GW in development. They're positioned to benefit from the disruption, not be disrupted by it.",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 16 * 60 * 1000)
      },
      {
        meetingId: neeMeeting.id,
        proposalId: neeProposal.id,
        senderId: "user-demo-1",
        senderName: "Dan Mbanga",
        senderRole: "ANALYST",
        content: "I think the regulated utility piece gives us meaningful downside protection here. Even in a bear case on renewables, FPL is worth $50-55/share by itself. We're essentially getting the competitive renewables business for $20/share when it generates $4B+ in EBITDA.",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000)
      },
      {
        meetingId: neeMeeting.id,
        proposalId: neeProposal.id,
        senderId: "user-compliance-1",
        senderName: "Jane Smith",
        senderRole: "COMPLIANCE",
        content: "From a compliance perspective, I'm comfortable with the position. Liquidity is excellent, ESG profile is strong, and the regulatory environment is well-understood. No red flags on governance or disclosure quality.",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 24 * 60 * 1000)
      },
      {
        meetingId: neeMeeting.id,
        proposalId: neeProposal.id,
        senderId: "user-pm-1",
        senderName: "Mike Rodriguez",
        senderRole: "PM",
        content: "Alright, I'm convinced. Let's approve at 4.5% weight. The risk/reward looks favorable here, and the thesis has multi-year durability. Sarah, please coordinate with trading on building the position over the next 2-3 weeks.",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 28 * 60 * 1000)
      }
    ];

    for (const msg of neeDebateMessages) {
      await storage.createDebateMessage(msg);
    }

    // NEE Position (MONITORING stage)
    console.log("  Creating NEE position...");
    const neePosition = await storage.createPosition({
      ticker: "NEE",
      companyName: "NextEra Energy, Inc.",
      sector: "Energy",
      shares: 6500,
      avgCost: "73.50",
      currentPrice: "78.20",
      marketValue: "508300.00",
      gainLoss: "30550.00",
      gainLossPercent: "6.39",
      portfolioWeight: "4.52",
      analyst: "Sarah Chen",
      thesisHealth: "HEALTHY",
      purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    });

    // NEE Monitoring Events
    console.log("  Creating NEE monitoring events...");
    const neeMonitoringEvents = [
      {
        workflowId: neeWorkflow.id,
        positionId: neePosition.id,
        eventType: "EARNINGS_BEAT" as const,
        severity: "INFO" as const,
        title: "Q3 Earnings Beat: EPS $0.85 vs $0.79 est",
        description: "NextEra reported Q3 adjusted EPS of $0.85, beating consensus by 7.6%. Revenue of $7.2B (+9.2% YoY) also exceeded estimates. Management raised FY guidance to $3.05-3.15 from $3.00-3.10. Key highlights: (1) Renewable backlog expanded to 23.5 GW, (2) FPL customer growth of 76K exceeded expectations, (3) Energy Resources EBITDA margins expanded 120bps to 39.2%.",
        impactOnThesis: "Positive - validates our growth assumptions and margin expansion thesis",
        actionRequired: false,
        actionTaken: null
      },
      {
        workflowId: neeWorkflow.id,
        positionId: neePosition.id,
        eventType: "REGULATORY_UPDATE" as const,
        severity: "WARNING" as const,
        title: "FL PSC Rate Case Hearing Delayed to Q1",
        description: "Florida Public Service Commission postponed NEE's rate case hearing from December to February 2026. The delay is procedural (additional discovery requested by interveners) and not indicative of opposition. NEE still expects approval but timing pushed out 6-8 weeks.",
        impactOnThesis: "Neutral to slight negative - delays implementation but doesn't change probability of approval",
        actionRequired: false,
        actionTaken: "Monitoring - no position change warranted"
      },
      {
        workflowId: neeWorkflow.id,
        positionId: neePosition.id,
        eventType: "MARKET_MOVE" as const,
        severity: "INFO" as const,
        title: "Stock +6.4% Following Earnings Beat",
        description: "NEE shares rallied $4.70 (+6.4%) to $78.20 following strong Q3 results and raised guidance. Outperformed XLU (+0.8%) by 560bps. Volume 2.3x average. Analyst commentary positive: JPM raised target to $88, MS to $85, GS maintained Buy.",
        impactOnThesis: "Positive - price target now $85 vs current $78.20, maintaining 8.7% upside",
        actionRequired: false,
        actionTaken: null
      }
    ];

    for (const event of neeMonitoringEvents) {
      await storage.createMonitoringEvent(event);
    }

    // NEE Thesis Health Metrics
    await storage.createThesisHealthMetric({
      workflowId: neeWorkflow.id,
      positionId: neePosition.id,
      ticker: "NEE",
      healthStatus: "HEALTHY",
      healthScore: 85,
      catalystsStatus: {
        renewableBacklog: { status: "ON_TRACK", progress: 95, note: "23.5 GW vs 22 GW expected" },
        regulatoryApproval: { status: "ON_TRACK", progress: 85, note: "Rate case delayed but approval likely" },
        marginExpansion: { status: "AHEAD", progress: 110, note: "EBITDA margins 43.5% vs 42% expected" }
      },
      risksStatus: {
        interestRates: { status: "MONITORED", severity: "MEDIUM", note: "70% hedged through 2025" },
        regulatoryDelay: { status: "LOW", severity: "LOW", note: "Procedural delay only" },
        technologyDisruption: { status: "MONITORED", severity: "MEDIUM", note: "NEE leading in battery storage" }
      },
      keyMetrics: {
        revenueGrowth: { expected: 8.0, actual: 9.2, variance: "+15%" },
        ebitdaMargin: { expected: 42.0, actual: 43.5, variance: "+3.6%" },
        fcfYield: { expected: 3.5, actual: 3.8, variance: "+8.6%" },
        renewableBacklog: { expected: "22 GW", actual: "23.5 GW", variance: "+6.8%" }
      },
      deviation: {
        summary: "Thesis tracking well. Earnings beat validates growth assumptions. Rate case delay is minor speed bump. Price appreciation to $78.20 reduces upside but position remains attractive.",
        majorChanges: []
      },
      lastCheck: new Date(),
      nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdBy: "user-analyst-1"
    });

    // =====================================================================
    // WORKFLOW 2: CVX - In IC_MEETING stage
    // =====================================================================
    console.log("\n📊 Creating CVX workflow (IC_MEETING stage)...");
    
    const cvxProposal = await storage.createProposal({
      ticker: "CVX",
      companyName: "Chevron Corporation",
      analyst: "user-analyst-2",
      proposalType: "BUY",
      proposedWeight: "3.50",
      targetPrice: "175.00",
      status: "PENDING",
      thesis: "Chevron offers attractive exposure to rising oil prices with best-in-class capital discipline and shareholder returns. The company's low-cost asset base (Permian, Kazakhstan, LNG) provides competitive advantages in any price environment. Target $175 represents 12% upside with 3.8% dividend yield and 5% buyback.",
      catalysts: [
        "Permian production growth of 10%+ annually through 2027 from tier-1 acreage",
        "Tengiz expansion project ramping to 850K bpd (15% company production increase)",
        "LNG portfolio (Gorgon, Wheatstone) benefiting from Asian demand and European gas crisis",
        "Capital returns of $20B+ annually (7-8% yield at current prices) with oil at $80+"
      ],
      risks: [
        "Oil price exposure: Breakeven ~$50 WTI but material earnings sensitivity to prices",
        "Geopolitical risk: ~40% production from Kazakhstan, Australia, Nigeria",
        "Energy transition: Long-term demand concerns and stranded asset risk",
        "Refining exposure: Margins compressed in recession scenarios"
      ],
      recommendation: "BUY",
      upside: "12.40",
      downside: "-18.20"
    });

    const cvxWorkflow = await storage.createWorkflow({
      ticker: "CVX",
      companyName: "Chevron Corporation",
      sector: "Energy",
      currentStage: "IC_MEETING",
      status: "ACTIVE",
      owner: "user-analyst-2",
      description: "Integrated energy major with low-cost production and strong capital returns"
    });

    // Create CVX workflow stages (up to IC Meeting)
    await Promise.all([
      storage.createWorkflowStage({
        workflowId: cvxWorkflow.id,
        stage: "DISCOVERY",
        status: "COMPLETED",
        owner: "user-analyst-2",
        startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        notes: "Initial research on CVX completed"
      }),
      storage.createWorkflowStage({
        workflowId: cvxWorkflow.id,
        stage: "ANALYSIS",
        status: "COMPLETED",
        owner: "user-analyst-2",
        startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notes: "Financial model and risk analysis completed"
      }),
      storage.createWorkflowStage({
        workflowId: cvxWorkflow.id,
        stage: "IC_MEETING",
        status: "IN_PROGRESS",
        owner: "user-pm-1",
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: null,
        notes: "IC meeting in progress - reviewing proposal"
      }),
      storage.createWorkflowStage({
        workflowId: cvxWorkflow.id,
        stage: "EXECUTION",
        status: "PENDING",
        owner: null,
        startedAt: null,
        completedAt: null,
        notes: null
      }),
      storage.createWorkflowStage({
        workflowId: cvxWorkflow.id,
        stage: "MONITORING",
        status: "PENDING",
        owner: null,
        startedAt: null,
        completedAt: null,
        notes: null
      })
    ]);

    // CVX Artifacts
    console.log("  Creating CVX artifacts...");
    await Promise.all([
      seedArtifact({
        workflowId: cvxWorkflow.id,
        artifactType: "RESEARCH_BRIEF",
        stage: "ANALYSIS",
        title: "CVX Traditional Energy Quality Analysis",
        createdBy: "user-analyst-2",
        content: `# Chevron Corporation Investment Brief

## Executive Summary
Chevron is a top-tier integrated energy company with low-cost production assets and industry-leading capital discipline. Despite energy transition headwinds, CVX offers attractive near-term returns through strong free cash flow generation and shareholder returns.

## Investment Highlights
- Permian Basin: Tier-1 acreage with 10+ years inventory at sub-$30 breakeven
- Tengiz Expansion: Adding 260K bpd at $40/bbl breakeven (world-class)
- Capital Returns: $20B+ annually at $80+ oil (8% shareholder yield)
- Balance Sheet: Net debt target of $25B vs $13B today (room for returns)

## Financial Outlook
- Production CAGR 2024-2027: 3.5%
- FCF yield: 12-14% at $85 oil, 8-10% at $70 oil
- Dividend yield: 3.8% with 6% growth
- Buyback: $15B annually (~5% shares outstanding)

## Key Debate Points
**Bull Case**: Energy security drives sustained $80+ oil, CVX's low-cost assets print cash, stock re-rates from 9x to 11x P/E
**Bear Case**: Demand destruction + energy transition accelerates, oil to $60, CVX cuts buybacks

## Recommendation: BUY (with timing considerations)
Target: $175 (12% upside + 9% shareholder yield)`
      }),

      seedArtifact({
        workflowId: cvxWorkflow.id,
        artifactType: "FINANCIAL_MODEL",
        stage: "ANALYSIS",
        title: "CVX Cash Flow Model & Valuation",
        createdBy: "user-analyst-2",
        content: `# Chevron Financial Model

## Production & Price Assumptions
- Oil production: 3.1M bpd (2024) → 3.4M bpd (2027)
- Brent price deck: $85/bbl (2024) → $80/bbl (long-term)
- Permian: 700K bpd → 900K bpd (+29% growth)
- Tengiz expansion: 600K bpd → 850K bpd

## Financial Projections (2024-2027)
Revenue: $200B → $215B (+2.3% CAGR)
EBITDA: $52B → $56B
FCF: $28B → $30B
EPS: $14.20 → $16.50

## Valuation
**DCF Fair Value**: $182/share
- WACC: 9.5%
- Terminal FCF: $28B
- Growth rate: 0%

**Relative Valuation**: $165-175/share
- 10x P/E on $17 normalized EPS
- In-line with XOM, premium to Occidental

**Shareholder Return Value**: $170/share
- PV of 10-year buyback at 5% of shares = $45/share of value

## Sensitivity: Oil Price Impact
$100 oil: $205/share (+31%)
$85 oil: $175/share (base)
$70 oil: $145/share (-17%)
$60 oil: $120/share (-31%)`
      }),

      seedArtifact({
        workflowId: cvxWorkflow.id,
        artifactType: "RISK_ANALYSIS",
        stage: "ANALYSIS",
        title: "CVX Risk Assessment",
        createdBy: "user-analyst-2",
        content: `# Risk Analysis: Chevron Corporation

## Risk #1: Oil Price Volatility (HIGH)
- **Probability**: High (oil prices inherently volatile)
- **Impact**: Material - $10 oil = $1.50/share EPS impact
- **Mitigation**: Low-cost assets, hedging program, dividend covered even at $50 oil
- **Our View**: Bullish on oil given supply constraints and China reopening

## Risk #2: Energy Transition (MEDIUM-HIGH)
- **Probability**: Medium (pace uncertain but direction clear)
- **Impact**: High over 10+ years - demand destruction risk
- **Mitigation**: Shifting to LNG, low-carbon, but limited alternative energy investments
- **Our View**: Risk real but 10-15 year timeframe allows returns before peak oil

## Risk #3: Geopolitical Exposure (MEDIUM)
- **Probability**: Medium (Kazakhstan 10% of production, some Nigeria)
- **Impact**: Medium - loss of asset would hurt but not fatal
- **Mitigation**: Diversified portfolio, insurance, government relations
- **Our View**: Acceptable given returns in base case

## Risk #4: Refining Margin Compression (MEDIUM)
- **Probability**: Medium-High in recession
- **Impact**: Medium - refining is ~25% of EBITDA
- **Mitigation**: Integrated model, downstream often hedges upstream
- **Our View**: Near-term risk but margins still elevated vs history

## Scenario Analysis
**Bull**: $100 oil, strong execution → $210/share (+35%)
**Base**: $80-85 oil, on-track → $175/share (+12%)
**Bear**: $65 oil, transition accelerates → $130/share (-17%)`
      })
    ]);

    // CVX IC Meeting (SCHEDULED but not completed)
    console.log("  Creating CVX IC meeting (in progress)...");
    const cvxMeeting = await storage.createICMeeting({
      workflowId: cvxWorkflow.id,
      meetingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: "SCHEDULED",
      title: "CVX Investment Committee Meeting",
      description: "Review and vote on Chevron Corporation (CVX) investment proposal",
      attendees: ["user-analyst-2", "user-pm-1", "user-compliance-1", "user-demo-1"],
      agenda: {
        items: [
          "Traditional energy thesis review",
          "Oil price sensitivity analysis",
          "Energy transition risk assessment",
          "Q&A and contrarian debate",
          "Vote on position"
        ]
      },
      minutes: "Upcoming IC meeting to review CVX proposal. Key discussion points: oil price assumptions, energy transition timeline, position sizing given sector exposure.",
      createdBy: "user-pm-1"
    });

    // Some early debate messages (meeting in progress)
    const cvxDebateMessages = [
      {
        meetingId: cvxMeeting.id,
        proposalId: cvxProposal.id,
        senderId: "user-pm-1",
        senderName: "Mike Rodriguez",
        senderRole: "PM",
        content: "Alex, thanks for the work here. Playing devil's advocate: aren't we late to the party on traditional energy? Oil stocks have rallied 40% this year. What's the catalyst for further upside from here?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        meetingId: cvxMeeting.id,
        proposalId: cvxProposal.id,
        senderId: "user-analyst-2",
        senderName: "Alex Thompson",
        senderRole: "ANALYST",
        content: "Fair point. But I'd argue CVX at 9x earnings with an 8% shareholder yield is still cheap. The rally has been justified - supply is tight, OPEC is disciplined, and energy capex was severely underfunded 2015-2020. We're in a structural deficit. Plus CVX specifically has Tengiz ramping which adds 15% to production at $40 breakeven.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ];

    for (const msg of cvxDebateMessages) {
      await storage.createDebateMessage(msg);
    }

    // =====================================================================
    // WORKFLOW 3: OXY - In ANALYSIS stage
    // =====================================================================
    console.log("\n📊 Creating OXY workflow (ANALYSIS stage)...");
    
    const oxyProposal = await storage.createProposal({
      ticker: "OXY",
      companyName: "Occidental Petroleum Corporation",
      analyst: "user-demo-1",
      proposalType: "BUY",
      proposedWeight: "2.50",
      targetPrice: "75.00",
      status: "PENDING",
      thesis: "Occidental is a transformed company post-Anadarko acquisition with premier Permian acreage and unique carbon capture optionality. Berkshire's 25% stake provides validation and downside support. The company is on track to reduce debt from $20B to sub-$15B while returning significant capital to shareholders. Target $75 represents 25% upside.",
      catalysts: [
        "Permian DJ Basin production growth of 15% annually with sub-$35 breakevens",
        "Low-carbon ventures scaling: Direct Air Capture plant in Texas (first commercial scale)",
        "Debt reduction to $15B by end-2024 unlocking $3B+ in annual buybacks",
        "Potential Berkshire takeout at premium to current price"
      ],
      risks: [
        "High leverage: Net debt/EBITDA still 1.5x despite improvement from 2.5x",
        "Execution risk: OxyChem weakness offsets upstream strength",
        "Berkshire overhang: Warren Buffett could sell stake creating pressure",
        "Carbon capture unproven: DACS economics uncertain at scale"
      ],
      recommendation: "BUY",
      upside: "25.00",
      downside: "-12.00"
    });

    const oxyWorkflow = await storage.createWorkflow({
      ticker: "OXY",
      companyName: "Occidental Petroleum Corporation",
      sector: "Energy",
      currentStage: "ANALYSIS",
      status: "ACTIVE",
      owner: "user-demo-1",
      description: "Permian pure-play with carbon capture optionality and Berkshire backing"
    });

    // Create OXY workflow stages (in analysis)
    await Promise.all([
      storage.createWorkflowStage({
        workflowId: oxyWorkflow.id,
        stage: "DISCOVERY",
        status: "COMPLETED",
        owner: "user-demo-1",
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: "Initial research completed - Berkshire investment thesis looks compelling"
      }),
      storage.createWorkflowStage({
        workflowId: oxyWorkflow.id,
        stage: "ANALYSIS",
        status: "IN_PROGRESS",
        owner: "user-demo-1",
        startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedAt: null,
        notes: "Building financial model - 60% complete"
      }),
      storage.createWorkflowStage({
        workflowId: oxyWorkflow.id,
        stage: "IC_MEETING",
        status: "PENDING",
        owner: null,
        startedAt: null,
        completedAt: null,
        notes: null
      }),
      storage.createWorkflowStage({
        workflowId: oxyWorkflow.id,
        stage: "EXECUTION",
        status: "PENDING",
        owner: null,
        startedAt: null,
        completedAt: null,
        notes: null
      }),
      storage.createWorkflowStage({
        workflowId: oxyWorkflow.id,
        stage: "MONITORING",
        status: "PENDING",
        owner: null,
        startedAt: null,
        completedAt: null,
        notes: null
      })
    ]);

    // OXY partial artifacts (still in analysis)
    console.log("  Creating OXY artifacts (partial)...");
    await Promise.all([
      seedArtifact({
        workflowId: oxyWorkflow.id,
        artifactType: "RESEARCH_BRIEF",
        stage: "DISCOVERY",
        title: "OXY Transformation Story Analysis (DRAFT)",
        createdBy: "user-demo-1",
        status: "DRAFT",
        content: `# Occidental Petroleum Research Brief - DRAFT

## Investment Thesis (Work in Progress)
Occidental has successfully navigated the challenging post-Anadarko integration and is now positioned as a premier Permian producer with improving financial flexibility. The Berkshire Hathaway investment provides both validation and downside support.

## Key Points Under Investigation
1. **Permian Asset Quality**: Analyzing well productivity trends in Delaware Basin
2. **Carbon Capture Economics**: Modeling DAC plant returns under various scenarios
3. **Debt Trajectory**: Stress-testing paydown timeline under different oil price scenarios
4. **Berkshire Implications**: Is this strategic investment or just value play?

## Preliminary Financial Analysis
- Current production: ~1.2M boe/d (Permian is 60%)
- EBITDA (est. 2024): $14-15B at $80 oil
- FCF: $6-7B after capex and dividends
- Net Debt: $19B → targeting $15B by Q4 2024

## Work Remaining
- [ ] Complete DCF model with stress tests
- [ ] Detailed competitive positioning vs peers (PXD, DVN)
- [ ] Carbon capture TAM analysis
- [ ] Management track record review
- [ ] Technical analysis and entry point timing

**Status**: 60% complete - targeting IC meeting in 2-3 weeks`
      }),

      seedArtifact({
        workflowId: oxyWorkflow.id,
        artifactType: "FINANCIAL_MODEL",
        stage: "ANALYSIS",
        title: "OXY Financial Model (IN PROGRESS)",
        createdBy: "user-demo-1",
        status: "DRAFT",
        content: `# Occidental Financial Model - Work in Progress

## Current Status: Building Production Model

**Completed Sections:**
✅ Historical financials (2020-2023)
✅ Production build-up by basin
✅ Price deck assumptions

**In Progress:**
🔄 Opex/capex by segment
🔄 OxyChem earnings model
🔄 Debt paydown schedule

**To Do:**
❌ Carbon capture revenue modeling
❌ Valuation framework
❌ Sensitivity analyses

## Preliminary Estimates (Subject to Change)
- 2024E Revenue: $29B
- 2024E EBITDA: $14.5B
- 2024E FCF: $6.8B
- Est. Fair Value: $72-78/share (wide range pending refinement)

**Next Steps:**
1. Validate Permian well economics with field-level data
2. Model OxyChem turnaround
3. Build comprehensive debt waterfall
4. Sensitize to oil price scenarios ($65-$100)

**Expected Completion**: 7-10 days`
      })
    ]);

    // Create research request for OXY (analyst seeking help)
    console.log("  Creating OXY research request...");
    await storage.createResearchRequest({
      proposalId: oxyProposal.id,
      workflowId: oxyWorkflow.id,
      requestedBy: "user-demo-1",
      agentType: "SCENARIO_SIMULATOR",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      query: "Model OXY cash flows under three scenarios: (1) $100 oil sustained, (2) $80 oil base case, (3) $60 oil stress case. Focus on debt paydown timeline and buyback capacity.",
      context: "Need to understand downside protection and upside optionality for IC presentation",
      expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });

    // Create notifications
    console.log("Creating notifications...");
    const notifications = [
      {
        userId: "user-demo-1",
        ticker: "NEE",
        title: "NEE Earnings Beat",
        message: "NextEra Energy reported Q3 EPS of $0.85 vs $0.79 est (+7.6% beat). Position +6.4% today.",
        type: "EARNINGS" as const,
        severity: "INFO" as const,
        readAt: null,
        actionUrl: "/workflows/" + neeWorkflow.id
      },
      {
        userId: "user-demo-1",
        ticker: "NEE",
        title: "FL Rate Case Delayed",
        message: "Florida PSC postponed NEE rate case hearing to February 2026 (from December). Delay is procedural.",
        type: "REGULATORY" as const,
        severity: "WARNING" as const,
        readAt: null,
        actionUrl: "/workflows/" + neeWorkflow.id
      },
      {
        userId: "user-demo-1",
        ticker: "CVX",
        title: "CVX IC Meeting Scheduled",
        message: "IC meeting for Chevron proposal scheduled for 2 days from now. Please review materials.",
        type: "IC_MEETING" as const,
        severity: "INFO" as const,
        readAt: null,
        actionUrl: "/ic-meeting/" + cvxMeeting.id
      },
      {
        userId: "user-demo-1",
        ticker: "OXY",
        title: "OXY Research Request Update",
        message: "Scenario analysis for Occidental Petroleum is in progress. Expected completion in 3 days.",
        type: "RESEARCH" as const,
        severity: "INFO" as const,
        readAt: null,
        actionUrl: "/workflows/" + oxyWorkflow.id
      }
    ];

    for (const notification of notifications) {
      await storage.createNotification(notification);
    }

    console.log("\n✅ Seed completed successfully!");
    console.log("\n📊 Created data:");
    console.log("  - 5 users (Dan, Sarah, Mike, Jane, Alex)");
    console.log("  - 3 Energy sector companies (NEE, CVX, OXY)");
    console.log("  - 3 workflows in different stages:");
    console.log("    • NEE (MONITORING): Complete workflow with position & thesis tracking");
    console.log("    • CVX (IC_MEETING): Ready for IC decision");
    console.log("    • OXY (ANALYSIS): Work in progress");
    console.log("  - 9 research artifacts across workflows");
    console.log("  - 2 IC meetings (1 completed with debate, 1 scheduled)");
    console.log("  - 1 active position (NEE)");
    console.log("  - 3 monitoring events for NEE");
    console.log("  - 7 debate messages with contrarian AI input");
    console.log("  - 4 notifications");
    console.log("\n🎯 Demo user: Dan Mbanga (dan@example.io)");
    console.log("   You can see all workflows and participate in IC meetings!");

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

// Run the seed
seed()
  .then(() => {
    console.log("👋 Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed script failed:", error);
    process.exit(1);
  });
