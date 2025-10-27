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

    // NEE Debate Session
    console.log("  Creating NEE debate session...");
    const neeDebateSession = await storage.createDebateSession({
      meetingId: neeMeeting.id,
      proposalId: neeProposal.id,
      ticker: "NEE",
      topic: "NextEra Energy Investment Proposal - Clean Energy Infrastructure Leader",
      status: "COMPLETED",
      currentPhase: "CONCLUDED",
      leadModerator: "Mike Rodriguez",
      activeAgents: ["CONTRARIAN", "RESEARCH", "QUANT", "RISK", "COMPLIANCE"],
      decision: "APPROVED",
      voteCount: { approve: 3, reject: 0, abstain: 0 },
      summary: "Strong consensus on NEE investment thesis. All committee members and AI agents provided comprehensive analysis. Approved 4.5% position weight.",
      keyPoints: [
        "Renewable energy backlog provides 4+ years of visible growth",
        "Florida utility provides downside protection and stable cash flows",
        "Strong execution track record with regulatory approvals",
        "Interest rate sensitivity addressed through hedging program",
        "ESG profile and compliance requirements fully satisfied"
      ],
      participantCount: 9,
      messageCount: 11,
      endedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000)
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
        debateSessionId: neeDebateSession.id,
        userId: "user-pm-1",
        senderName: "Mike Rodriguez",
        senderRole: "PM",
        messageType: "QUESTION",
        content: "Sarah, great work on the research brief. The renewable backlog visibility is compelling. My main question is on the Florida rate case - what's your confidence on approval?"
      },
      {
        meetingId: neeMeeting.id,
        debateSessionId: neeDebateSession.id,
        userId: "user-analyst-1",
        senderName: "Sarah Chen",
        senderRole: "ANALYST",
        messageType: "ANSWER",
        content: "High confidence - 85%. FPL has a strong track record with the FL PSC. They've approved 95% of rate increases over the past 10 years. The infrastructure investments are clearly beneficial to customers (grid hardening, reliability)."
      },
      {
        meetingId: neeMeeting.id,
        debateSessionId: neeDebateSession.id,
        userId: null,
        senderName: "Contrarian AI",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "🤖 **Contrarian View**: While NEE's renewable portfolio is impressive, I'm concerned about three factors: (1) Rising interest rates disproportionately impact capital-intensive renewable developers - every 100bps reduces project returns by ~200bps. (2) Battery storage costs are declining 15-20% annually, which could obsolete some of NEE's solar/wind assets sooner than expected. (3) The stock has historically underperformed during rate hike cycles - we're potentially early in a multi-year hiking cycle. Have we stress-tested the model for 9% WACC?",
        metadata: { agentType: "contrarian" }
      },
      {
        meetingId: neeMeeting.id,
        debateSessionId: neeDebateSession.id,
        userId: "user-analyst-1",
        senderName: "Sarah Chen",
        senderRole: "ANALYST",
        messageType: "ANSWER",
        content: "Good pushback. On interest rates: NEE has hedged ~70% of their floating rate exposure through 2025. Their PPAs also have inflation escalators which partially offset. At 9% WACC, fair value drops to $72 - still only 2% below current price. On battery storage: NEE is actually a leader there with 3 GW in development. They're positioned to benefit from the disruption, not be disrupted by it."
      },
      {
        meetingId: neeMeeting.id,
        debateSessionId: neeDebateSession.id,
        userId: null,
        senderName: "Research Agent",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "📊 **Research Synthesis**: My analysis of 47 renewable energy companies and 23 regulated utilities shows NEE has the strongest competitive moat. Key differentiators: (1) Geographic concentration in Florida provides regulatory predictability, (2) Integrated model generates 2.5x higher ROIC than pure-play renewables, (3) Customer acquisition cost for FPL is $412 vs industry average $890, (4) Renewable backlog of 23 GW represents 4.2 years of visible growth at current run-rate. Competitive analysis shows no peer has this combination of scale, returns, and growth visibility.",
        metadata: { agentType: "research" }
      },
      {
        meetingId: neeMeeting.id,
        debateSessionId: neeDebateSession.id,
        userId: null,
        senderName: "Quant Agent",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "📈 **Quantitative Analysis**: I've run 10,000 Monte Carlo simulations across 50 scenarios. Base case: $82 fair value (18% upside). Bull case (P75): $94. Bear case (P25): $68. Key sensitivities: (1) 100bps WACC change = ±$8 fair value, (2) 10% renewable backlog variance = ±$4, (3) 50bps FPL ROE = ±$3. Risk-adjusted return: 11.2% vs. 8.5% for utilities sector. Sharpe ratio: 0.68 vs sector 0.52. Options market implies 28% annual volatility - we can capitalize on this through collar strategies to enhance yield to 5.2%.",
        metadata: { agentType: "quant" }
      },
      {
        meetingId: neeMeeting.id,
        debateSessionId: neeDebateSession.id,
        userId: null,
        senderName: "Risk Agent",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "⚠️ **Risk Assessment**: I've identified 3 high-priority risks and 5 medium-priority risks. **Critical**: (1) Regulatory risk - 15% probability Florida PSC becomes less constructive (impact: -12% fair value), (2) Hurricane exposure - Cat 5 event costs $2-3B, occurs every 8-12 years historically, (3) Interest rate sensitivity - each 100bps hike reduces NPV of development pipeline by $1.8B. **Mitigants**: Geographic diversification (37 states), infrastructure hardening ($12B invested 2018-2023), hedging program covers 70% rate exposure. Portfolio-level correlation: 0.42 with S&P 500, -0.15 with crude oil. VaR(95%): -8.2% over 30 days.",
        metadata: { agentType: "risk" }
      },
      {
        meetingId: neeMeeting.id,
        debateSessionId: neeDebateSession.id,
        userId: "user-demo-1",
        senderName: "Dan Mbanga",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "I think the regulated utility piece gives us meaningful downside protection here. Even in a bear case on renewables, FPL is worth $50-55/share by itself. We're essentially getting the competitive renewables business for $20/share when it generates $4B+ in EBITDA."
      },
      {
        meetingId: neeMeeting.id,
        debateSessionId: neeDebateSession.id,
        userId: null,
        senderName: "Compliance Agent",
        senderRole: "COMPLIANCE",
        messageType: "COMMENT",
        content: "✅ **Compliance Review**: Position clears all regulatory requirements. Liquidity: Avg daily volume 8.2M shares ($640M) - can build/exit 4.5% position over 2-3 weeks with <5bps impact. ESG: MSCI AAA rating, top decile for utilities. Governance: 9/12 independent directors, separate CEO/Chair since 2021, executive comp tied to TSR and operational metrics. Disclosure: Consistently ranked #1 in Edison Electric Institute transparency index. Concentration limits: Position at 4.5% is well below our 7.5% single-name limit. Sector exposure: Energy sector would be 12.3% of portfolio, below 15% threshold. **No objections from compliance perspective.**",
        metadata: { agentType: "compliance" }
      },
      {
        meetingId: neeMeeting.id,
        debateSessionId: neeDebateSession.id,
        userId: "user-compliance-1",
        senderName: "Jane Smith",
        senderRole: "COMPLIANCE",
        messageType: "COMMENT",
        content: "From a compliance perspective, I'm comfortable with the position. Liquidity is excellent, ESG profile is strong, and the regulatory environment is well-understood. No red flags on governance or disclosure quality."
      },
      {
        meetingId: neeMeeting.id,
        debateSessionId: neeDebateSession.id,
        userId: null,
        senderName: "Contrarian Agent",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "⚡ **Devil's Advocate - Alternative Scenarios**: Let me challenge three key assumptions. (1) **Renewable economics deterioration**: What if battery storage + solar costs decline 25% annually vs our 15% assumption? By 2027, distributed generation could make utility-scale projects uneconomic. NEE's $60B development pipeline assumes current cost curves. (2) **Regulatory regime change**: Florida is a purple state - if Democrats gain control of legislature + PSC, we could see shift toward lower allowed ROEs (10.0% vs current 11.6%), impacting 60% of earnings. (3) **Stranded asset risk**: 15 GW of natural gas generation may face early retirement pressure. Carbon pricing or methane regulations could force $3-4B in write-downs. **Base case might be too optimistic - recommend 3.0% weight vs 4.5%.**",
        metadata: { agentType: "contrarian" }
      },
      {
        meetingId: neeMeeting.id,
        debateSessionId: neeDebateSession.id,
        userId: "user-pm-1",
        senderName: "Mike Rodriguez",
        senderRole: "PM",
        messageType: "DECISION",
        content: "Alright, I'm convinced. Let's approve at 4.5% weight. The risk/reward looks favorable here, and the thesis has multi-year durability. Sarah, please coordinate with trading on building the position over the next 2-3 weeks."
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

    // CVX Debate Session (in progress)
    console.log("  Creating CVX debate session...");
    const cvxDebateSession = await storage.createDebateSession({
      meetingId: cvxMeeting.id,
      proposalId: cvxProposal.id,
      ticker: "CVX",
      topic: "Chevron Corporation - Traditional Energy Thesis in Transition Era",
      status: "ACTIVE",
      currentPhase: "DELIBERATION",
      leadModerator: "Mike Rodriguez",
      activeAgents: ["CONTRARIAN", "RESEARCH", "QUANT", "RISK", "COMPLIANCE"],
      participantCount: 6,
      messageCount: 6,
      keyPoints: [
        "Oil price assumptions and sensitivity analysis",
        "Energy transition timeline and CVX's positioning",
        "Capital allocation and shareholder returns",
        "Valuation attractive but execution risk elevated"
      ]
    });

    // Rich debate messages with all 5 AI agents participating
    const cvxDebateMessages = [
      {
        meetingId: cvxMeeting.id,
        debateSessionId: cvxDebateSession.id,
        userId: "user-pm-1",
        senderName: "Mike Rodriguez",
        senderRole: "PM",
        messageType: "QUESTION",
        content: "Alex, thanks for the work here. Playing devil's advocate: aren't we late to the party on traditional energy? Oil stocks have rallied 40% this year. What's the catalyst for further upside from here?"
      },
      {
        meetingId: cvxMeeting.id,
        debateSessionId: cvxDebateSession.id,
        userId: "user-analyst-2",
        senderName: "Alex Thompson",
        senderRole: "ANALYST",
        messageType: "ANSWER",
        content: "Fair point. But I'd argue CVX at 9x earnings with an 8% shareholder yield is still cheap. The rally has been justified - supply is tight, OPEC is disciplined, and energy capex was severely underfunded 2015-2020. We're in a structural deficit. Plus CVX specifically has Tengiz ramping which adds 15% to production at $40 breakeven."
      },
      {
        meetingId: cvxMeeting.id,
        debateSessionId: cvxDebateSession.id,
        userId: null,
        senderName: "Research Agent",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "📊 **Research Analysis**: Global oil market fundamentals support the thesis. Key findings: (1) Spare capacity at 15-year lows - only 2.1M bpd vs 4.5M historical average, (2) Upstream capex has been $400B below maintenance levels since 2015, creating supply deficit, (3) CVX-specific advantages: Permian breakevens of $35/bbl (Peer average: $42), Kazakhstan Tengiz project adds 260K bpd at industry-leading margins, LNG portfolio provides optionality on Asian gas demand. Competitive positioning: CVX ranks #2 globally in reserve quality (proved reserves: 11.1B boe, 60% liquids). Energy transition timeline: IEA forecasts oil demand peak in 2030 - gives us 6-8 year runway for returns.",
        metadata: { agentType: "research" }
      },
      {
        meetingId: cvxMeeting.id,
        debateSessionId: cvxDebateSession.id,
        userId: null,
        senderName: "Quant Agent",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "📈 **Valuation & Scenario Modeling**: At $155/share, CVX trades at 6.2x EV/EBITDA vs 10-year average of 7.8x - implies 26% upside to historical mean. DCF analysis across oil price scenarios: Bull case ($95/bbl): $198 fair value. Base case ($80/bbl): $178. Bear case ($65/bbl): $142. Current price of $155 offers 3.5:1 reward/risk ratio. Free cash flow yield: 12.3% vs XLE average 9.1%. Shareholder yield (buybacks + dividend): 8.2% ranks in top decile of energy majors. Statistical analysis shows CVX outperforms in late-cycle environments (correlation: 0.73 with ISM Manufacturing). Current ISM at 48.2 suggests cyclical bottom is near.",
        metadata: { agentType: "quant" }
      },
      {
        meetingId: cvxMeeting.id,
        debateSessionId: cvxDebateSession.id,
        userId: null,
        senderName: "Risk Agent",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "⚠️ **Risk Report**: Primary risks include: (1) **Oil price volatility**: Each $10/bbl move impacts earnings by $2.8B annually. Historical volatility: 35% (vs 18% for S&P 500). (2) **Energy transition acceleration**: Scenario analysis shows aggressive EV adoption could reduce demand by 8M bpd by 2030 (base case: 4M bpd). (3) **Geopolitical exposure**: 23% of production from Kazakhstan - political instability or sanctions risk. (4) **Regulatory/ESG pressures**: Carbon pricing could add $5-8/bbl to operating costs. Portfolio impact: Energy sector weight would increase to 8.7% (limit: 12%). Correlation with existing positions: 0.35 with NEE (manageable). Liquidity: ADV $1.2B allows position building with minimal impact. **Recommendation: 3% weight with oil hedges at $70/bbl floor.**",
        metadata: { agentType: "risk" }
      },
      {
        meetingId: cvxMeeting.id,
        debateSessionId: cvxDebateSession.id,
        userId: "user-demo-1",
        senderName: "Dan Mbanga",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "The shareholder yield story is compelling. With oil at $80, they generate $20B+ in free cash flow. Even if we're wrong on price, that 8% yield provides a nice floor while we wait."
      },
      {
        meetingId: cvxMeeting.id,
        debateSessionId: cvxDebateSession.id,
        userId: null,
        senderName: "Compliance Agent",
        senderRole: "COMPLIANCE",
        messageType: "COMMENT",
        content: "✅ **Compliance Assessment**: Position meets regulatory requirements with noted concerns. **Cleared**: Liquidity (ADV $1.2B), concentration (3% well below 7.5% limit), governance (12/13 independent directors). **Concerns**: (1) ESG scoring: MSCI BB rating due to carbon intensity - may trigger client redemptions from ESG-mandated funds, (2) Stranded asset risk: $15B in proved reserves may become uneconomic if carbon pricing exceeds $80/ton, (3) Disclosure: Scope 3 emissions reporting incomplete vs peers. **Mitigation**: Position CVX as transition play with expanding renewables (hydrogen, CCUS, biofuels now 8% of capex). Recommend engaging management on net-zero pathway. **Cleared for investment with enhanced monitoring.**",
        metadata: { agentType: "compliance" }
      },
      {
        meetingId: cvxMeeting.id,
        debateSessionId: cvxDebateSession.id,
        userId: null,
        senderName: "Contrarian Agent",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "⚡ **Contrarian Perspective**: I see significant downside risks being underestimated. (1) **Peak demand earlier than expected**: EV adoption accelerating - Tesla, BYD hitting price parity 2 years ahead of schedule. Chinese EV penetration now 38% vs 15% last year. (2) **OPEC cohesion breaking**: Russia has incentive to cheat on quotas to fund Ukraine war, UAE wants higher production. History shows OPEC discipline collapses in late cycle. (3) **Stranded asset write-downs**: If oil stays <$70 for 2+ years, CVX's $42B in high-cost reserves face impairment. (4) **Capital allocation risk**: Management has terrible track record - Anadarko acquisition destroyed $10B in value. Noble Energy overpaid by $2B. What makes us think buybacks at 9x earnings is smart capital allocation? **Counter-recommendation: PASS or max 1.5% weight.**",
        metadata: { agentType: "contrarian" }
      },
      {
        meetingId: cvxMeeting.id,
        debateSessionId: cvxDebateSession.id,
        userId: "user-analyst-2",
        senderName: "Alex Thompson",
        senderRole: "ANALYST",
        messageType: "ANSWER",
        content: "Strong pushback from Contrarian Agent, but I'd counter: (1) Peak demand timing is uncertain - aviation and petrochemicals still growing 3-4% annually, offsetting transport weakness. (2) Even at $70 oil, CVX generates $15B FCF - that's a 10% FCF yield. (3) On capital allocation: recent track record is better - they've returned $65B to shareholders since 2020 while maintaining investment-grade balance sheet."
      },
      {
        meetingId: cvxMeeting.id,
        debateSessionId: cvxDebateSession.id,
        userId: "user-pm-1",
        senderName: "Mike Rodriguez",
        senderRole: "PM",
        messageType: "COMMENT",
        content: "This is helpful debate. I'm inclined to approve but at a smaller weight than proposed - maybe 2.5-3.0% given the risks highlighted. The yield is attractive but let's be prudent on sizing. Alex, can you refine the recommendation and we'll vote next meeting?"
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

    // Create research requests for different workflow states
    console.log("  Creating research requests...");
    
    // 1. OXY research request (IN_PROGRESS - linked to existing proposal)
    await storage.createResearchRequest({
      ticker: "OXY",
      companyName: "Occidental Petroleum Corporation",
      proposalId: oxyProposal.id,
      workflowId: oxyWorkflow.id,
      requestedBy: "user-demo-1",
      researchType: "SCENARIO_ANALYSIS",
      agentType: "SCENARIO_SIMULATOR",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      query: "Model OXY cash flows under three scenarios: (1) $100 oil sustained, (2) $80 oil base case, (3) $60 oil stress case. Focus on debt paydown timeline and buyback capacity.",
      context: "Need to understand downside protection and upside optionality for IC presentation",
      expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });

    // 2. TSLA research request (PENDING - not started yet, no proposal)
    await storage.createResearchRequest({
      ticker: "TSLA",
      companyName: "Tesla, Inc.",
      requestedBy: "user-demo-1",
      assignedTo: "user-2",
      researchType: "INITIAL",
      agentType: "RESEARCH_SYNTHESIZER",
      priority: "HIGH",
      status: "PENDING",
      query: "Full investment analysis for Tesla including EV market share trends, energy business growth, autonomous driving timeline, and China production ramp. Need comprehensive research brief and DCF model.",
      context: "Portfolio manager interested in adding EV exposure. Need initial research to determine if worth bringing to IC.",
      expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });

    // 3. GOOGL research request (COMPLETED - ready to create proposal)
    const googlResearch = await storage.createResearchRequest({
      ticker: "GOOGL",
      companyName: "Alphabet Inc.",
      requestedBy: "user-2",
      assignedTo: "user-demo-1",
      researchType: "INITIAL",
      agentType: "RESEARCH_SYNTHESIZER",
      priority: "MEDIUM",
      status: "COMPLETED",
      query: "Comprehensive investment analysis for Alphabet focusing on cloud growth, AI monetization, search durability, and YouTube/subscription revenue. Generate research brief and DCF model.",
      context: "Considering adding large-cap tech exposure. Cloud segment showing strong momentum.",
      expectedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    // 4. AMZN research request (COMPLETED - ready to create proposal)
    const amznResearch = await storage.createResearchRequest({
      ticker: "AMZN",
      companyName: "Amazon.com, Inc.",
      requestedBy: "user-demo-1",
      assignedTo: "user-2",
      researchType: "DEEP_DIVE",
      agentType: "RESEARCH_SYNTHESIZER",
      priority: "HIGH",
      status: "COMPLETED",
      query: "Deep dive on Amazon focusing on AWS margin expansion, retail profitability improvement, advertising growth, and capital allocation. Need detailed financial model with scenario analysis.",
      context: "Strong conviction opportunity - cloud growth accelerating, retail margins improving, advertising high-margin new revenue stream.",
      expectedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
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

    // Create Agent Responses for all 16 AI agents
    console.log("Creating agent responses for 16 AI agents...");
    
    // Pre-Work Agents (Research & Analysis)
    await Promise.all([
      // 1. Research Brief
      storage.createAgentResponse({
        agentType: "RESEARCH_SYNTHESIZER",
        ticker: "NEE",
        prompt: "Generate comprehensive research brief for NextEra Energy",
        response: {
          ticker: "NEE",
          companyName: "NextEra Energy, Inc.",
          summary: "NextEra Energy is the world's largest producer of renewable energy from wind and solar with 30+ GW of capacity. The company combines a regulated Florida utility (FPL) providing stable cash flows with NextEra Energy Resources' growth platform in renewables and storage.",
          keyMetrics: {
            revenue: "$28.1B (TTM)",
            growth: "+11% YoY",
            margins: "Operating Margin: 28.4%",
            valuation: "P/E: 21.3x, EV/EBITDA: 14.2x"
          },
          strengths: [
            "Largest renewable energy portfolio globally (30+ GW)",
            "Best-in-class regulated utility with 6% rate base growth",
            "Industry-leading cost structure and project execution",
            "Strong balance sheet with investment-grade credit",
            "Consistent 10% dividend growth track record"
          ],
          risks: [
            "Interest rate sensitivity affects project economics",
            "Regulatory risk in Florida (PSC decisions)",
            "Weather volatility (hurricanes impact operations)",
            "Renewable energy policy changes",
            "Technology disruption from battery storage"
          ],
          recommendation: "BUY"
        }
      }),

      // 2. Financial Model
      storage.createAgentResponse({
        agentType: "FINANCIAL_MODELER",
        ticker: "NEE",
        prompt: "Build DCF valuation model for NEE",
        response: {
          ticker: "NEE",
          modelType: "DCF",
          assumptions: {
            revenueGrowth: "6-8% annual through 2028",
            ebitdaMargin: "28-30%",
            capex: "$18-20B annually",
            wacc: "7.2%",
            terminalGrowth: "3.0%"
          },
          valuationScenarios: [
            { scenario: "Bull", targetPrice: 95, probability: 0.25 },
            { scenario: "Base", targetPrice: 85, probability: 0.50 },
            { scenario: "Bear", targetPrice: 68, probability: 0.25 }
          ],
          fairValue: 85,
          currentPrice: 73.50,
          upside: 15.6,
          recommendation: "BUY"
        }
      }),

      // 3. Quant Analysis
      storage.createAgentResponse({
        agentType: "QUANT_ANALYZER",
        ticker: "NEE",
        prompt: "Perform quantitative factor analysis for NEE",
        response: {
          ticker: "NEE",
          factorScores: {
            momentum: 72,
            value: 58,
            quality: 85,
            growth: 78,
            lowVolatility: 82
          },
          technicalIndicators: {
            rsi: 54,
            macd: "Bullish crossover",
            movingAverages: "Above 50-day and 200-day MAs",
            supportLevel: 71.50,
            resistanceLevel: 79.00
          },
          correlations: {
            SPY: 0.65,
            XLU: 0.78,
            ICLN: 0.82
          },
          riskMetrics: {
            sharpeRatio: 1.24,
            beta: 0.71,
            volatility: "14.2% annualized",
            maxDrawdown: "-18.3% (2022)"
          }
        }
      }),

      // 4. Risk Analysis
      storage.createAgentResponse({
        agentType: "RISK_ANALYZER",
        ticker: "NEE",
        prompt: "Comprehensive risk assessment for NEE position",
        response: {
          ticker: "NEE",
          overallRiskRating: "MEDIUM",
          topRisks: [
            {
              category: "Regulatory",
              severity: "HIGH",
              probability: "MEDIUM",
              description: "Florida PSC rate decisions could impact FPL earnings growth",
              mitigation: "Constructive regulatory environment historically; track record of fair outcomes"
            },
            {
              category: "Market",
              severity: "MEDIUM",
              probability: "HIGH",
              description: "Rising interest rates pressure renewable project returns",
              mitigation: "Long-term PPA contracts lock in economics; cost reductions offset rate impact"
            },
            {
              category: "Weather",
              severity: "MEDIUM",
              probability: "MEDIUM",
              description: "Hurricane risk to Florida infrastructure",
              mitigation: "Insurance coverage; storm hardening capex program; recovery mechanisms"
            }
          ],
          var95: "4.2% (daily)",
          stressTests: {
            marketCrash: "-22%",
            rateSpike: "-15%",
            regulatoryAdverse: "-12%"
          }
        }
      }),

      // 5. Scenario Simulator
      storage.createAgentResponse({
        agentType: "SCENARIO_SIMULATOR",
        ticker: "NEE",
        prompt: "Model multiple scenarios for NEE investment outcome",
        response: {
          ticker: "NEE",
          scenarios: [
            {
              name: "Bull Case: Renewable Super-Cycle",
              probability: 0.25,
              assumptions: ["IRA benefits exceed expectations", "Natural gas prices stay elevated", "Storage breakthrough"],
              outcomes: {
                price: 105,
                return: 42.9,
                timeframe: "2-3 years"
              }
            },
            {
              name: "Base Case: Steady Execution",
              probability: 0.50,
              assumptions: ["Moderate renewables growth", "Stable Florida regulation", "6% rate base CAGR"],
              outcomes: {
                price: 85,
                return: 15.6,
                timeframe: "12-18 months"
              }
            },
            {
              name: "Bear Case: Policy Reversal",
              probability: 0.25,
              assumptions: ["IRA scaled back", "Adverse Florida regulation", "Technology disruption"],
              outcomes: {
                price: 62,
                return: -15.6,
                timeframe: "12 months"
              }
            }
          ],
          expectedValue: 84.25,
          probabilityWeightedReturn: 14.7
        }
      }),

      // IC & Execution Agents (6-10)
      // 6. Investment Memos
      storage.createAgentResponse({
        agentType: "DOCUMENT_GENERATOR",
        ticker: "NEE",
        prompt: "Generate investment committee memo for NEE",
        response: {
          ticker: "NEE",
          title: "Investment Recommendation: NextEra Energy, Inc.",
          executiveSummary: "We recommend a BUY rating on NextEra Energy (NEE) with a 4.5% portfolio weight. NEE offers a unique combination of defensive utility characteristics and offensive renewable energy growth exposure. The company's dual platform provides downside protection while capturing upside from the multi-decade energy transition.",
          investmentThesis: "NextEra combines regulated utility stability (Florida Power & Light) with renewable energy growth (30+ GW portfolio). The company has demonstrated best-in-class execution, industry-leading cost structure, and consistent capital deployment. IRA tailwinds provide additional support for renewable development.",
          valuationAnalysis: "Our DCF model yields an $85 fair value target (15.6% upside from $73.50). Key assumptions: 6% rate base growth, 28% EBITDA margins, 7.2% WACC. NEE trades at 21.3x P/E vs. utility sector avg of 18.5x, justified by superior growth profile and renewable exposure premium.",
          riskFactors: [
            "Regulatory risk in Florida PSC rate cases",
            "Interest rate sensitivity for renewable projects", 
            "Hurricane weather risk to Florida infrastructure",
            "Renewable energy policy/IRA changes",
            "Technology disruption from battery storage"
          ],
          recommendation: {
            action: "BUY",
            targetPrice: 85,
            timeframe: "12-18 months",
            conviction: "HIGH"
          },
          preparedBy: "Dan Mbanga",
          date: new Date().toISOString()
        }
      }),

      // 7. Meeting Minutes
      storage.createAgentResponse({
        agentType: "MEETING_RECORDER",
        ticker: "NEE",
        prompt: "Record IC meeting minutes for NEE discussion",
        response: {
          ticker: "NEE",
          meetingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          attendees: ["Dan Mbanga", "Mike Rodriguez", "Jane Smith", "Sarah Chen"],
          decisions: [
            "Approved NEE position at 4.5% portfolio weight",
            "Target entry price: $73-75 range",
            "Initial position size: $4.5M",
            "Stop loss: $68 (-8% from entry)"
          ],
          keyDiscussion: [
            "Bull case: Renewable super-cycle with IRA tailwinds",
            "Bear case: Interest rate sensitivity and Florida regulatory risk",
            "Consensus: Risk/reward favorable at current valuation",
            "Contrarian AI raised concern about customer concentration"
          ],
          actionItems: [
            "Dan to initiate 50% position immediately",
            "Monitor Florida rate case developments",
            "Review position sizing after Q4 earnings"
          ],
          voteResults: {
            approve: 3,
            reject: 0,
            abstain: 0
          }
        }
      }),

      // 8. Compliance Reports
      storage.createAgentResponse({
        agentType: "COMPLIANCE_CHECKER",
        ticker: "NEE",
        prompt: "Run compliance check for NEE investment",
        response: {
          ticker: "NEE",
          complianceStatus: "APPROVED",
          checks: [
            {
              category: "Position Limits",
              status: "PASS",
              details: "4.5% weight within 5% single-name limit"
            },
            {
              category: "Sector Concentration",
              status: "PASS",
              details: "Energy sector at 12% (under 15% limit)"
            },
            {
              category: "Liquidity",
              status: "PASS",
              details: "ADV: $850M - adequate for position size"
            },
            {
              category: "Restricted List",
              status: "PASS",
              details: "No conflicts or restrictions"
            },
            {
              category: "ESG Screening",
              status: "PASS",
              details: "ESG score: A (renewable energy positive)"
            }
          ],
          approvedBy: "Jane Smith",
          approvalDate: new Date().toISOString(),
          notes: "All compliance checks passed. Position approved for execution."
        }
      }),

      // 9. Risk Reports
      storage.createAgentResponse({
        agentType: "RISK_REPORTER",
        ticker: "NEE",
        prompt: "Generate comprehensive risk report for NEE",
        response: {
          ticker: "NEE",
          overallRisk: "MEDIUM",
          portfolioImpact: {
            var95Daily: "0.19%",
            var95Annual: "3.1%",
            betaContribution: 0.03,
            correlationWithPortfolio: 0.42
          },
          scenarioAnalysis: {
            marketCrash: "-22% (position loss: $990K)",
            rateSpike200bps: "-15% (position loss: $675K)",
            sectorRotation: "-8% (position loss: $360K)"
          },
          concentration: {
            singleName: "4.5% (within 5% limit)",
            sector: "12% Energy (within 15% limit)",
            industry: "8% Utilities (within 10% limit)"
          },
          recommendations: [
            "Monitor interest rate movements closely",
            "Track Florida PSC rate case proceedings",
            "Consider hedging with utilities ETF puts if position grows"
          ]
        }
      }),

      // 10. Trade Orders
      storage.createAgentResponse({
        agentType: "TRADE_EXECUTOR",
        ticker: "NEE",
        prompt: "Generate trade orders for NEE position",
        response: {
          ticker: "NEE",
          orderType: "INITIAL_BUY",
          orders: [
            {
              side: "BUY",
              quantity: 30000,
              orderType: "LIMIT",
              limitPrice: 74.50,
              timeInForce: "DAY",
              estimatedValue: 2235000,
              executionStrategy: "VWAP"
            },
            {
              side: "BUY",
              quantity: 30000,
              orderType: "LIMIT",
              limitPrice: 73.75,
              timeInForce: "GTC",
              estimatedValue: 2212500,
              executionStrategy: "ICEBERG"
            }
          ],
          totalTargetShares: 60000,
          totalTargetValue: 4447500,
          targetWeight: 4.5,
          executionTimeline: "2-3 trading days",
          notes: "Split order to minimize market impact. Use VWAP algo for first tranche, iceberg orders for remainder."
        }
      }),

      // Monitoring & Analytics Agents (11-16)
      // 11. Thesis Monitor
      storage.createAgentResponse({
        agentType: "THESIS_MONITOR",
        ticker: "NEE",
        prompt: "Monitor thesis health for NEE position",
        response: {
          ticker: "NEE",
          status: "HEALTHY",
          summary: "Investment thesis remains intact. Renewable energy momentum strong, Florida utility performing well. No material deterioration in fundamental drivers.",
          keyConcerns: [
            "Interest rates elevated but stable",
            "Florida rate case delayed but outcome likely favorable"
          ],
          thesisDrift: 8,
          recommendation: "HOLD"
        }
      }),

      // 12. Market Events
      storage.createAgentResponse({
        agentType: "MARKET_MONITOR",
        ticker: "NEE",
        prompt: "Track market events affecting NEE",
        response: {
          ticker: "NEE",
          events: [
            {
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              type: "EARNINGS",
              impact: "POSITIVE",
              description: "Q3 earnings beat: EPS $0.85 vs $0.79 est",
              priceReaction: "+6.4%"
            },
            {
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              type: "REGULATORY",
              impact: "NEUTRAL",
              description: "Florida rate case delayed to Feb 2026",
              priceReaction: "-1.2%"
            },
            {
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              type: "INDUSTRY",
              impact: "POSITIVE",
              description: "IRA renewable tax credits extended",
              priceReaction: "+2.8%"
            }
          ],
          summary: "Net positive newsflow. Earnings strength offset regulatory delay."
        }
      }),

      // 13. Data Retrieval
      storage.createAgentResponse({
        agentType: "DATA_RETRIEVER",
        ticker: "NEE",
        prompt: "Retrieve latest financial data for NEE",
        response: {
          ticker: "NEE",
          fundamentals: {
            revenue: "$28.1B",
            revenueGrowth: "+11% YoY",
            ebitda: "$8.2B",
            ebitdaMargin: "29.2%",
            netIncome: "$3.8B",
            eps: "$1.92",
            fcf: "$2.1B",
            roe: "10.8%",
            debtToEquity: "1.42"
          },
          marketData: {
            price: 78.50,
            change: "+2.4%",
            volume: "4.2M",
            avgVolume: "3.8M",
            marketCap: "$154.2B",
            peRatio: 21.3,
            dividendYield: "2.8%"
          },
          lastUpdated: new Date().toISOString()
        }
      }),

      // 14. Voice Summaries
      storage.createAgentResponse({
        agentType: "VOICE_SUMMARIZER",
        ticker: "NEE",
        prompt: "Generate voice summary for NEE position",
        response: {
          ticker: "NEE",
          summary: "NextEra Energy position is performing well, up 6.8% since initiation. Recent Q3 earnings beat expectations with strong renewable energy segment growth. Florida utility continues steady performance. Investment thesis remains healthy with no material concerns. Maintain current 4.5% position weight.",
          keyPoints: [
            "Position return: +6.8% vs S&P +2.1%",
            "Q3 earnings beat drove recent outperformance",
            "Thesis health: HEALTHY (92/100 score)",
            "No action required at this time"
          ],
          audioLength: "45 seconds",
          generatedAt: new Date().toISOString()
        }
      }),

      // 15. Attribution Reports
      storage.createAgentResponse({
        agentType: "ATTRIBUTION_ANALYZER",
        ticker: "NEE",
        prompt: "Analyze performance attribution for NEE position",
        response: {
          ticker: "NEE",
          period: "Since Inception (60 days)",
          totalReturn: 6.8,
          attribution: {
            stockSelection: 4.7,
            sectorAllocation: 1.2,
            marketTiming: 0.9,
            other: 0.0
          },
          benchmarkComparison: {
            portfolio: 6.8,
            spx: 2.1,
            sectorETF: 3.4,
            alpha: 4.7
          },
          drivers: [
            "Earnings beat (+3.2%)",
            "Renewable energy momentum (+2.1%)",
            "Sector rotation into utilities (+1.5%)"
          ]
        }
      }),

      // 16. Risk Regime
      storage.createAgentResponse({
        agentType: "RISK_REGIME_ANALYZER",
        ticker: "NEE",
        prompt: "Analyze current market risk regime for NEE",
        response: {
          ticker: "NEE",
          currentRegime: "MODERATE_VOLATILITY",
          regimeCharacteristics: {
            vix: 16.8,
            correlation: "Normal",
            dispersion: "Medium",
            liquidityConditions: "Good"
          },
          positionImplications: {
            expectedVolatility: "14-16% annualized",
            betaAdjustment: "Minimal (beta stable at 0.71)",
            liquidityImpact: "None - ample liquidity",
            recommendedHedges: "Not required at current regime"
          },
          regimeHistory: [
            { date: "2024-10", regime: "LOW_VOL", duration: "45 days" },
            { date: "2024-09", regime: "MODERATE_VOL", duration: "30 days" },
            { date: "2024-08", regime: "HIGH_VOL", duration: "15 days" }
          ],
          forecast: "Regime expected to remain moderate through year-end"
        }
      })
    ]);

    // =====================================================================
    // GOOGL and AMZN Agent Responses (for COMPLETED research requests)
    // =====================================================================
    console.log("Creating agent responses for GOOGL and AMZN...");
    await Promise.all([
      // GOOGL Research Brief
      storage.createAgentResponse({
        agentType: "RESEARCH_SYNTHESIZER",
        ticker: "GOOGL",
        prompt: "Generate comprehensive research brief for Alphabet Inc.",
        response: {
          ticker: "GOOGL",
          companyName: "Alphabet Inc.",
          summary: "Alphabet dominates internet search (90%+ market share) while building strong positions in cloud computing and digital advertising. Google Cloud Platform is gaining share in the $500B+ cloud market, while YouTube and advertising businesses provide stable cash flow for AI investments.",
          keyMetrics: {
            revenue: "$307B TTM",
            growth: "+9% YoY",
            margins: "Operating Margin: 28%, Net Margin: 24%",
            valuation: "P/E: 24x, EV/EBITDA: 15.2x, FCF Yield: 4.2%"
          },
          strengths: [
            "Search monopoly with 90%+ market share generates $200B+ in high-margin revenue",
            "YouTube is #2 streaming platform with 2.5B+ users and growing subscription revenue",
            "Cloud business growing 28% with improving margins (now profitable)",
            "Leading AI capabilities (DeepMind, Gemini, Bard) positioned for AI monetization",
            "Fortress balance sheet with $110B+ cash, enables aggressive AI R&D spending"
          ],
          risks: [
            "DOJ antitrust case threatens search dominance and revenue",
            "AI disruption risk - ChatGPT and others could erode search queries",
            "Cloud competition from AWS and Azure limits market share gains",
            "YouTube growth slowing as TikTok captures younger demographics",
            "High employee costs and R&D spend pressuring margins"
          ],
          recommendation: "BUY"
        }
      }),

      // GOOGL DCF Model
      storage.createAgentResponse({
        agentType: "FINANCIAL_MODELER",
        ticker: "GOOGL",
        prompt: "Build DCF valuation model for GOOGL",
        response: {
          ticker: "GOOGL",
          scenarios: {
            bull: {
              price: 165,
              irr: 22.5,
              assumptions: "AI monetization successful, Cloud margins expand to 15%+, Search stable despite AI disruption"
            },
            base: {
              price: 145,
              irr: 15.8,
              assumptions: "Cloud grows 25%, Search revenue +5-7% annually, YouTube sustains mid-teens growth"
            },
            bear: {
              price: 105,
              irr: -8.2,
              assumptions: "Search queries decline 10% annually from AI disruption, DOJ breakup forces asset sales"
            }
          },
          wacc: 8.5,
          terminalGrowth: 3.0
        }
      }),

      // AMZN Research Brief
      storage.createAgentResponse({
        agentType: "RESEARCH_SYNTHESIZER",
        ticker: "AMZN",
        prompt: "Generate deep-dive research brief for Amazon.com Inc.",
        response: {
          ticker: "AMZN",
          companyName: "Amazon.com, Inc.",
          summary: "Amazon's three-pillar strategy (AWS cloud, retail marketplace, advertising) creates a powerful flywheel. AWS dominates cloud infrastructure (32% market share), retail profitability is inflecting after years of investment, and advertising is a high-margin $40B+ business growing 25%+.",
          keyMetrics: {
            revenue: "$575B TTM",
            growth: "+11% YoY",
            margins: "Operating Margin: 8.7% (expanding), AWS Margin: 30%+",
            valuation: "P/E: 48x, EV/Sales: 2.8x, FCF: $36B TTM"
          },
          strengths: [
            "AWS cloud leadership with 32% market share, $90B+ revenue run rate",
            "Retail operating margin inflecting from 1% to 5%+ through automation and density",
            "Advertising platform growing 25%+ with 60%+ incremental margins",
            "Prime membership moat with 200M+ subscribers driving loyalty and spend",
            "Logistics network creates cost advantage and enables faster delivery than competitors"
          ],
          risks: [
            "Regulatory scrutiny - FTC lawsuit targeting marketplace practices",
            "AWS competition from Microsoft Azure and Google Cloud",
            "Labor challenges - unionization efforts and wage pressure",
            "Retail margin compression if competition intensifies from Walmart, Temu",
            "Capital intensity - CapEx running $50B+ annually for fulfillment and AWS"
          ],
          recommendation: "BUY"
        }
      }),

      // AMZN DCF Model
      storage.createAgentResponse({
        agentType: "FINANCIAL_MODELER",
        ticker: "AMZN",
        prompt: "Build comprehensive DCF model for Amazon with scenario analysis",
        response: {
          ticker: "AMZN",
          scenarios: {
            bull: {
              price: 210,
              irr: 28.5,
              assumptions: "AWS grows 20%+, Retail margins expand to 8%, Advertising accelerates to $80B by 2028"
            },
            base: {
              price: 175,
              irr: 18.2,
              assumptions: "AWS 15% growth, Retail margins reach 6%, Advertising grows 20% annually"
            },
            bear: {
              price: 120,
              irr: -12.5,
              assumptions: "AWS growth slows to 10%, Retail margin pressure from competition, Regulatory headwinds"
            }
          },
          wacc: 9.2,
          terminalGrowth: 4.0
        }
      })
    ]);

    // =====================================================================
    // WORKFLOW 4: NVDA - Technology sector, MONITORING stage
    // =====================================================================
    console.log("\n🖥️  Creating NVDA workflow (MONITORING stage - Technology sector)...");
    
    const nvdaCompany = await storage.createCompany({
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      sector: "Technology",
      industry: "Semiconductors",
      description: "NVIDIA is a leading designer of graphics processing units (GPUs) for gaming, professional visualization, data centers, and automotive markets. The company has emerged as the dominant AI infrastructure provider."
    });

    const nvdaProposal = await storage.createProposal({
      ticker: "NVDA",
      companyName: "NVIDIA Corporation",
      analyst: "user-analyst-1",
      proposalType: "BUY",
      proposedWeight: "5.50",
      targetPrice: "145.00",
      status: "APPROVED",
      thesis: "NVIDIA is the picks-and-shovels play on AI infrastructure. The company's CUDA software moat + H100/H200 GPU dominance creates a multi-year earnings runway. Cloud providers and enterprises are in a race to build AI compute capacity, with NVIDIA capturing 90%+ of AI accelerator TAM.",
      catalysts: [
        "H200 ramp in Q4 2024 with supply constraints easing",
        "Sovereign AI deals expanding (Middle East, Asia-Pacific)",
        "GB200 Grace Blackwell platform launch in 2025 with 30x performance improvement",
        "Software revenue inflection (CUDA ecosystem, Omniverse, AI Enterprise)"
      ],
      risks: [
        "Competition: AMD MI300X and Intel Gaudi 3 gaining traction in inference workloads",
        "Customer concentration: Top 4 hyperscalers represent 40% of revenue",
        "Geopolitical: China export restrictions limiting TAM by ~$5B annually",
        "Margin pressure: Competitive dynamics could compress 70%+ gross margins"
      ],
      conviction: "HIGH",
      horizon: "12-18 months"
    });

    const nvdaWorkflow = await storage.createWorkflow({
      ticker: "NVDA",
      companyName: "NVIDIA Corporation",
      sector: "Technology",
      currentStage: "MONITORING",
      status: "ACTIVE",
      owner: "user-analyst-1",
      description: "AI infrastructure leader with dominant GPU market position and CUDA software moat"
    });

    await Promise.all([
      storage.createWorkflowStage({
        workflowId: nvdaWorkflow.id,
        stage: "DISCOVERY",
        status: "COMPLETED",
        completedAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000)
      }),
      storage.createWorkflowStage({
        workflowId: nvdaWorkflow.id,
        stage: "ANALYSIS",
        status: "COMPLETED",
        completedAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000)
      }),
      storage.createWorkflowStage({
        workflowId: nvdaWorkflow.id,
        stage: "IC_MEETING",
        status: "COMPLETED",
        completedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000)
      }),
      storage.createWorkflowStage({
        workflowId: nvdaWorkflow.id,
        stage: "EXECUTION",
        status: "COMPLETED",
        completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      }),
      storage.createWorkflowStage({
        workflowId: nvdaWorkflow.id,
        stage: "MONITORING",
        status: "IN_PROGRESS"
      })
    ]);

    // NVDA IC Meeting (completed)
    const nvdaMeeting = await storage.createICMeeting({
      workflowId: nvdaWorkflow.id,
      meetingDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      status: "COMPLETED",
      title: "NVDA Investment Committee Meeting",
      description: "Review and vote on NVIDIA Corporation investment proposal - AI infrastructure leader",
      attendees: ["user-analyst-1", "user-pm-1", "user-compliance-1"],
      agenda: { items: ["AI infrastructure thesis", "Competitive moat analysis", "Valuation and position sizing", "Vote"] },
      minutes: "Strong consensus on NVDA thesis. Approved 5.5% position. Discussion on customer concentration risk.",
      createdBy: "user-pm-1"
    });

    const nvdaDebateSession = await storage.createDebateSession({
      meetingId: nvdaMeeting.id,
      proposalId: nvdaProposal.id,
      ticker: "NVDA",
      topic: "NVIDIA - AI Infrastructure Dominance Thesis",
      status: "COMPLETED",
      currentPhase: "CONCLUDED",
      leadModerator: "Mike Rodriguez",
      activeAgents: ["RESEARCH", "QUANT"],
      decision: "APPROVED",
      voteCount: { approve: 3, reject: 0, abstain: 0 },
      summary: "Unanimous approval for NVDA at 5.5% weight. Strong AI infrastructure thesis with durable moat.",
      keyPoints: ["CUDA moat provides pricing power", "H100 supply constraints easing", "Customer concentration manageable given TAM expansion"],
      participantCount: 5,
      messageCount: 4,
      endedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000)
    });

    await Promise.all([
      storage.createVote({
        proposalId: nvdaProposal.id,
        voterName: "Mike Rodriguez",
        voterRole: "PM",
        vote: "APPROVE",
        comment: "AI infrastructure thesis is compelling. CUDA moat is real. Approve at 5.5% weight."
      }),
      storage.createVote({
        proposalId: nvdaProposal.id,
        voterName: "Sarah Chen",
        voterRole: "ANALYST",
        vote: "APPROVE",
        comment: "Best way to play AI infrastructure boom. H100 margins are exceptional."
      }),
      storage.createVote({
        proposalId: nvdaProposal.id,
        voterName: "Jane Smith",
        voterRole: "COMPLIANCE",
        vote: "APPROVE",
        comment: "Liquidity excellent. Governance solid. ESG concerns manageable."
      })
    ]);

    const nvdaDebateMessages = [
      {
        meetingId: nvdaMeeting.id,
        debateSessionId: nvdaDebateSession.id,
        userId: "user-pm-1",
        senderName: "Mike Rodriguez",
        senderRole: "PM",
        messageType: "QUESTION",
        content: "Sarah, great work on the NVDA analysis. My main concern is customer concentration - aren't we too dependent on a handful of hyperscalers?"
      },
      {
        meetingId: nvdaMeeting.id,
        debateSessionId: nvdaDebateSession.id,
        userId: "user-analyst-1",
        senderName: "Sarah Chen",
        senderRole: "ANALYST",
        messageType: "ANSWER",
        content: "Valid concern, but I'd argue it's mitigated by three factors: (1) TAM is expanding so fast that all hyperscalers are buyers, (2) Enterprise and sovereign AI are emerging as new customer segments, (3) The hyperscalers are locked into CUDA ecosystem - switching costs are massive."
      },
      {
        meetingId: nvdaMeeting.id,
        debateSessionId: nvdaDebateSession.id,
        userId: null,
        senderName: "Research Agent",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "📊 **Market Analysis**: AI accelerator TAM expanding from $45B (2024) to $150B+ (2027). NVIDIA maintains 92% share in data center GPU. Key competitive advantages: (1) CUDA has 4M+ developers - unmatched ecosystem, (2) H100 performance leads AMD MI300 by 30-40% on inference workloads, (3) Software revenue (Omniverse, AI Enterprise) growing 300% YoY adds stickiness. Customer concentration declining: Top 4 customers dropped from 45% to 38% of revenue as enterprise/sovereign AI ramps.",
        metadata: { agentType: "research" }
      },
      {
        meetingId: nvdaMeeting.id,
        debateSessionId: nvdaDebateSession.id,
        userId: null,
        senderName: "Quant Agent",
        senderRole: "ANALYST",
        messageType: "COMMENT",
        content: "📈 **Valuation Framework**: At $119.50, NVDA trades at 28x NTM earnings vs 5-year average of 45x. Despite premium multiple, justified by 40%+ earnings CAGR through 2026. DCF yields $145 fair value (21% upside). Data center segment (73% of revenue) growing 200%+ YoY with 70%+ gross margins. Free cash flow of $42B annually supports buybacks + R&D investment. Risk-adjusted return: 18.2% vs sector 11.4%. Recommend 5-6% position weight.",
        metadata: { agentType: "quant" }
      }
    ];

    for (const msg of nvdaDebateMessages) {
      await storage.createDebateMessage(msg);
    }

    // NVDA Position (active)
    const nvdaPosition = await storage.createPosition({
      ticker: "NVDA",
      companyName: "NVIDIA Corporation",
      sector: "Technology",
      shares: 5000,
      avgCost: "119.50",
      currentPrice: "132.00",
      marketValue: "660000.00",
      gainLoss: "62500.00",
      gainLossPercent: "10.46",
      portfolioWeight: "5.50",
      analyst: "Sarah Chen",
      thesisHealth: "HEALTHY",
      purchaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    });

    // NVDA Monitoring events
    const nvdaMonitoringEvents = [
      {
        workflowId: nvdaWorkflow.id,
        positionId: nvdaPosition.id,
        eventType: "EARNINGS_BEAT" as const,
        severity: "INFO" as const,
        title: "Q3 Earnings Crush - Data Center Revenue +279% YoY",
        description: "NVIDIA reported Q3 earnings with data center revenue of $14.5B (+279% YoY), massively beating estimates of $12.9B. Gaming and professional visualization also strong. H100 supply constraints easing. Raised FY guidance by $2B. Management commentary: 'AI infrastructure demand continues to exceed supply across all segments.'",
        impactOnThesis: "Extremely positive - validates AI infrastructure thesis. TAM expansion faster than expected.",
        actionRequired: false,
        actionTaken: null
      },
      {
        workflowId: nvdaWorkflow.id,
        positionId: nvdaPosition.id,
        eventType: "PRODUCT_ANNOUNCEMENT" as const,
        severity: "INFO" as const,
        title: "GB200 Grace Blackwell Platform Unveiled",
        description: "NVIDIA announced next-generation GB200 combining Grace CPU + Blackwell GPU architecture for AI inference. Claims 30x performance improvement vs H100 with 25x lower TCO. Hyperscalers already placing pre-orders. Shipping begins Q2 2025. Analyst reactions overwhelmingly positive.",
        impactOnThesis: "Positive - extends product roadmap advantage, should drive 2025-2026 upgrade cycle",
        actionRequired: false,
        actionTaken: null
      },
      {
        workflowId: nvdaWorkflow.id,
        positionId: nvdaPosition.id,
        eventType: "COMPETITIVE_THREAT" as const,
        severity: "WARNING" as const,
        title: "AMD MI300X Launch - First Credible H100 Competition",
        description: "AMD launched MI300X GPU targeting AI inference workloads. Early benchmarks from Meta show 80-90% of H100 performance on certain LLM inference tasks. Pricing reportedly 20% below H100. Microsoft Azure adding MI300X instances.",
        impactOnThesis: "Slight negative - first credible competition but CUDA moat remains intact. Monitor market share.",
        actionRequired: true,
        actionTaken: "Increased monitoring cadence on customer win/loss trends and pricing dynamics"
      }
    ];

    for (const event of nvdaMonitoringEvents) {
      await storage.createMonitoringEvent(event);
    }

    // NVDA Thesis Health
    await storage.createThesisHealthMetric({
      workflowId: nvdaWorkflow.id,
      positionId: nvdaPosition.id,
      ticker: "NVDA",
      healthStatus: "HEALTHY",
      healthScore: 92,
      catalystsStatus: {
        h200Ramp: { status: "AHEAD", progress: 115, note: "Supply improving faster than expected" },
        sovereignAI: { status: "ON_TRACK", progress: 90, note: "Middle East and APAC deals progressing" },
        gb200Launch: { status: "ON_TRACK", progress: 80, note: "On schedule for Q2 2025" },
        softwareRevenue: { status: "AHEAD", progress: 125, note: "CUDA ecosystem growing 300% YoY" }
      },
      risksStatus: {
        competition: { status: "MONITORED", severity: "MEDIUM", note: "AMD MI300X competitive but CUDA moat holds" },
        chinaRestrictions: { status: "MONITORED", severity: "MEDIUM", note: "$5B annual TAM impact" },
        marginPressure: { status: "LOW", severity: "LOW", note: "Gross margins expanding to 75%" }
      },
      keyMetrics: {
        revenueGrowth: { expected: 110.0, actual: 206.0, variance: "+87%" },
        grossMargin: { expected: 70.0, actual: 75.0, variance: "+7.1%" },
        dataCenterMix: { expected: 65.0, actual: 73.0, variance: "+12%" },
        fcfGeneration: { expected: "35B", actual: "42B", variance: "+20%" }
      },
      deviation: {
        summary: "Thesis massively outperforming. AI infrastructure demand exceeding all expectations. Data center revenue nearly 3x estimates. CUDA moat strengthening. GB200 pre-orders exceeding H100 launch. No material negative deviations.",
        majorChanges: ["Data center growth 2x faster than modeled", "Gross margins expanding vs compression fears"]
      },
      lastCheck: new Date(),
      nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdBy: "user-analyst-1"
    });

    console.log("\n✅ Seed completed successfully!");
    console.log("\n📊 Created data:");
    console.log("  - 5 users (Dan, Sarah, Mike, Jane, Alex)");
    console.log("  - 4 companies across 2 sectors:");
    console.log("    • Energy: NEE, CVX, OXY");
    console.log("    • Technology: NVDA");
    console.log("  - 4 workflows in different stages:");
    console.log("    • NEE (MONITORING): Complete workflow with position & thesis tracking");
    console.log("    • NVDA (MONITORING): AI infrastructure position with monitoring");
    console.log("    • CVX (IC_MEETING): Active debate session in progress");
    console.log("    • OXY (ANALYSIS): Work in progress");
    console.log("  - 9 research artifacts across workflows");
    console.log("  - 3 IC meetings with debate sessions:");
    console.log("    • NEE: COMPLETED with 11 debate messages (5 AI agents)");
    console.log("    • CVX: ACTIVE with 9 debate messages (5 AI agents)");
    console.log("    • NVDA: COMPLETED with 4 debate messages (2 AI agents)");
    console.log("  - 2 active positions (NEE $741k, NVDA $660k)");
    console.log("  - 6 monitoring events (3 NEE, 3 NVDA)");
    console.log("  - 24 total debate messages with AI agent participation");
    console.log("  - Voice-enabled debate room ready for testing");
    console.log("  - 4 notifications");
    console.log("\n🎯 Demo user: Dan Mbanga (dan@example.io)");
    console.log("   Multi-sector portfolio (Energy + Technology)");
    console.log("   Voice-enabled debate rooms with AI agents");

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
