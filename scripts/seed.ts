import { storage } from "../server/storage";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Check if already seeded
    const existingCompany = await storage.getCompanyByTicker("NVDA");
    if (existingCompany) {
      console.log("✅ Database already seeded - skipping");
      return;
    }

    console.log("Database not seeded yet - proceeding with seed...");

    // Create demo users with different roles
    console.log("Creating demo users...");
    const users = [
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
      }
    ];

    for (const user of users) {
      await storage.upsertUser(user);
    }

    // Create companies
    console.log("Creating companies...");
    const companies = [
      {
        ticker: "NVDA",
        name: "NVIDIA Corporation",
        sector: "Technology",
        industry: "Semiconductors",
        marketCap: 1200000000000,
        description: "Graphics processing units and AI chips manufacturer"
      },
      {
        ticker: "TSLA",
        name: "Tesla, Inc.",
        sector: "Consumer Discretionary",
        industry: "Automobiles",
        marketCap: 789000000000,
        description: "Electric vehicle and clean energy company"
      },
      {
        ticker: "GOOGL",
        name: "Alphabet Inc.",
        sector: "Communication Services",
        industry: "Internet Services",
        marketCap: 1680000000000,
        description: "Technology company specializing in internet services"
      }
    ];

    for (const company of companies) {
      await storage.createCompany(company);
    }

    // Create NVDA proposal (starting point)
    console.log("Creating NVDA proposal...");
    const nvdaProposal = await storage.createProposal({
      ticker: "NVDA",
      companyName: "NVIDIA Corporation",
      proposalType: "BUY",
      status: "PENDING",
      proposedBy: "user-analyst-1",
      targetPrice: 145.00,
      currentPrice: 119.50,
      upside: 21.3,
      shares: 5000,
      thesis: "AI infrastructure leader with dominant market share and strong secular growth tailwinds from enterprise AI adoption.",
      catalysts: [
        "Blackwell architecture launch Q2 with 40% performance improvement",
        "Expanding TAM in automotive and edge computing",
        "Strong pricing power with sustainable 65%+ gross margins"
      ],
      risks: [
        "Customer concentration: Top 3 customers represent 45% of revenue",
        "Geopolitical headwinds: Export restrictions to China impact 25% of TAM",
        "Valuation: Trading at 35x NTM P/E vs 5-year avg of 22x"
      ],
      conviction: 8,
      timeHorizon: 24,
    });

    // Create comprehensive NVDA workflow
    console.log("Creating NVDA workflow...");
    const nvdaWorkflow = await storage.createWorkflow({
      proposalId: nvdaProposal.id,
      ticker: "NVDA",
      currentStage: "MONITORING", // Advanced stage to show full functionality
      status: "ACTIVE",
      priority: "HIGH",
      assignedTo: "user-analyst-1",
    });

    // Create workflow stages
    console.log("Creating workflow stages...");
    const stages = [
      { stage: "DISCOVERY", status: "COMPLETED", completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { stage: "ANALYSIS", status: "COMPLETED", completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { stage: "IC_MEETING", status: "COMPLETED", completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { stage: "EXECUTION", status: "COMPLETED", completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { stage: "MONITORING", status: "IN_PROGRESS", completedAt: null },
    ];

    for (const stageData of stages) {
      await storage.createWorkflowStage({
        workflowId: nvdaWorkflow.id,
        stage: stageData.stage as any,
        status: stageData.status as any,
        owner: "user-analyst-1",
        startedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        completedAt: stageData.completedAt,
      });
    }

    // Workflow assignments (would be created if storage method existed)
    // Note: Assignment functionality can be added later

    // Create artifacts (research outputs)
    console.log("Creating workflow artifacts...");
    const artifacts = [
      {
        workflowId: nvdaWorkflow.id,
        artifactType: "RESEARCH_BRIEF",
        title: "NVIDIA Deep Dive: AI Infrastructure Dominance",
        version: 1,
        summary: "Comprehensive analysis of NVIDIA's market position, competitive moat, and growth drivers in AI infrastructure.",
        content: "Executive Summary: NVIDIA maintains 80%+ market share in AI accelerators...",
        generatedBy: "AI Research Agent",
        stage: "ANALYSIS",
      },
      {
        workflowId: nvdaWorkflow.id,
        artifactType: "FINANCIAL_MODEL",
        title: "NVIDIA DCF Valuation Model",
        version: 1,
        summary: "3-scenario DCF model with bull case $165, base $145, bear $110 price targets.",
        content: "Base Case Assumptions: Revenue CAGR 22%, Operating Margin 48%, WACC 9.2%...",
        generatedBy: "DCF Modeler Agent",
        stage: "ANALYSIS",
      },
      {
        workflowId: nvdaWorkflow.id,
        artifactType: "RISK_ANALYSIS",
        title: "NVIDIA Risk Assessment",
        version: 1,
        summary: "Key risks include customer concentration, geopolitical exposure, and valuation premium.",
        content: "Risk Factor Analysis: 1. Customer Concentration (HIGH)...",
        generatedBy: "Risk Analyst Agent",
        stage: "ANALYSIS",
      },
      {
        workflowId: nvdaWorkflow.id,
        artifactType: "INVESTMENT_THESIS",
        title: "NVIDIA Investment Thesis",
        version: 2,
        summary: "Long NVDA: AI infrastructure leader with durable competitive moat and strong secular tailwinds.",
        content: "Investment Thesis: We recommend a BUY rating on NVIDIA...",
        generatedBy: "user-analyst-1",
        stage: "IC_MEETING",
      },
    ];

    for (const artifact of artifacts) {
      await storage.createWorkflowArtifact(artifact as any);
    }

    // Create IC Meeting
    console.log("Creating IC meeting...");
    const icMeeting = await storage.createICMeeting({
      workflowId: nvdaWorkflow.id,
      title: "NVDA Investment Committee Meeting",
      scheduledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: "COMPLETED",
      decision: "APPROVED",
      agenda: ["NVDA investment proposal review", "Risk assessment discussion", "Vote on recommendation"],
    });

    // Add meeting participants
    await storage.createMeetingParticipant({
      meetingId: icMeeting.id,
      userId: "user-analyst-1",
      role: "ANALYST",
    });

    await storage.createMeetingParticipant({
      meetingId: icMeeting.id,
      userId: "user-pm-1",
      role: "PM",
    });

    await storage.createMeetingParticipant({
      meetingId: icMeeting.id,
      userId: "user-compliance-1",
      role: "COMPLIANCE",
    });

    // Create votes
    const votes = [
      { meetingId: icMeeting.id, userId: "user-analyst-1", voteType: "APPROVE", rationale: "Strong thesis with compelling risk/reward" },
      { meetingId: icMeeting.id, userId: "user-pm-1", voteType: "APPROVE", rationale: "Fits portfolio strategy, good entry point" },
      { meetingId: icMeeting.id, userId: "user-compliance-1", voteType: "APPROVE", rationale: "No compliance concerns" },
    ];

    for (const vote of votes) {
      await storage.createVote(vote as any);
    }

    // Create debate messages
    const messages = [
      {
        meetingId: icMeeting.id,
        userId: "user-pm-1",
        message: "The customer concentration risk is valid, but worth noting they have multi-year contracts with committed capacity. Sticky relationships.",
        messageType: "COMMENT",
      },
      {
        meetingId: icMeeting.id,
        userId: "user-analyst-1",
        message: "Agree. Also, their software moat is underappreciated - CUDA ecosystem creates significant switching costs.",
        messageType: "COMMENT",
      },
    ];

    for (const msg of messages) {
      await storage.createDebateMessage(msg as any);
    }

    // Create position (after IC approval)
    console.log("Creating NVDA position...");
    await storage.createPosition({
      ticker: "NVDA",
      shares: 5000,
      avgCost: 119.50,
      currentPrice: 132.00,
      sector: "Technology",
      thesis: "AI infrastructure leader with dominant market share",
      status: "ACTIVE",
      entryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    // Create monitoring events
    console.log("Creating monitoring events...");
    const events = [
      {
        workflowId: nvdaWorkflow.id,
        ticker: "NVDA",
        eventType: "PRICE_ALERT",
        severity: "MEDIUM",
        title: "Price moved +10% above entry",
        description: "Current price $132 vs entry $119.50, up 10.5% - consider rebalancing",
        eventData: { priceChange: 10.5, currentPrice: 132.00, entryPrice: 119.50 },
        status: "ACTIVE",
        triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        workflowId: nvdaWorkflow.id,
        ticker: "NVDA",
        eventType: "FUNDAMENTAL",
        severity: "LOW",
        title: "Earnings beat expectations",
        description: "Q3 EPS $2.15 vs est. $1.98, revenue $14.2B vs $13.8B expected",
        eventData: { epsActual: 2.15, epsEstimate: 1.98, revenueActual: 14.2, revenueEstimate: 13.8 },
        status: "RESOLVED",
        triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        workflowId: nvdaWorkflow.id,
        ticker: "NVDA",
        eventType: "MARKET_EVENT",
        severity: "LOW",
        title: "Analyst upgrade from Morgan Stanley",
        description: "Upgraded to Overweight with $155 price target",
        eventData: { analyst: "Morgan Stanley", rating: "Overweight", priceTarget: 155 },
        status: "RESOLVED",
        triggeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const event of events) {
      await storage.createMonitoringEvent(event as any);
    }

    // Create thesis health metric
    console.log("Creating thesis health metrics...");
    await storage.createThesisHealthMetric({
      workflowId: nvdaWorkflow.id,
      ticker: "NVDA",
      healthStatus: "HEALTHY",
      healthScore: 82,
      catalystsStatus: {
        "Blackwell launch": "ON_TRACK",
        "TAM expansion": "AHEAD",
        "Pricing power": "ON_TRACK"
      },
      risksStatus: {
        "Customer concentration": "STABLE",
        "Geopolitical": "ELEVATED",
        "Valuation": "MODERATE"
      },
      keyMetrics: {
        priceVsTarget: 0.91, // $132 vs $145 target
        revenueGrowth: 1.22,
        marginTrend: "STABLE"
      },
      deviation: {
        priceDeviation: -9.0,
        catalystProgress: 0.65,
        riskMaterialization: 0.15
      },
      lastCheck: new Date(),
      nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdBy: "System",
    });

    // Create notifications
    console.log("Creating notifications...");
    const notifications = [
      {
        userId: "user-analyst-1",
        type: "MONITORING_ALERT" as const,
        title: "NVDA price alert triggered",
        message: "NVDA moved +10% above entry price - review for rebalancing",
        severity: "MEDIUM" as const,
        read: false,
        actionUrl: `/workflows/${nvdaWorkflow.id}`,
      },
      {
        userId: "user-pm-1",
        type: "THESIS_ALERT" as const,
        title: "NVDA thesis health update",
        message: "Thesis health score: 82 (HEALTHY) - catalysts progressing as expected",
        severity: "INFO" as const,
        read: false,
        actionUrl: `/workflows/${nvdaWorkflow.id}`,
      }
    ];

    for (const notification of notifications) {
      await storage.createNotification(notification);
    }

    // Create agent responses
    console.log("Creating agent responses...");
    await storage.createAgentResponse({
      ticker: "NVDA",
      agentType: "RESEARCH_SYNTHESIZER",
      data: {
        ticker: "NVDA",
        companyName: "NVIDIA Corporation",
        executiveSummary: "NVIDIA is the dominant player in GPU technology with commanding market share in gaming, data centers, and AI computing.",
        keyMetrics: {
          marketCap: "$1.2T",
          peRatio: 35.2,
          revenue: "$60.9B",
          revenueGrowth: "+122% YoY",
          netMargin: "49.3%",
          roe: "115.2%"
        },
        strengths: [
          "Dominant 80%+ market share in AI accelerators",
          "CUDA moat with 4M+ developers",
          "Strong pricing power with 65%+ gross margins"
        ],
        weaknesses: [
          "High customer concentration",
          "Geopolitical risks",
          "Valuation premium"
        ],
        recommendation: "BUY",
        targetPrice: 145,
        analysisDate: new Date().toISOString(),
      },
      metadata: { analyst: "AI Research Agent", confidence: 0.92 },
    });

    console.log("✅ Database seeding completed successfully!");
    console.log("\nCreated complete NVDA workflow from discovery through monitoring:");
    console.log("  - 3 users (Analyst, PM, Compliance)");
    console.log("  - 3 companies (NVDA, TSLA, GOOGL)");
    console.log("  - 1 NVDA proposal");
    console.log("  - 1 complete workflow with 5 stages");
    console.log("  - 4 research artifacts");
    console.log("  - 1 IC meeting with 3 votes and debate");
    console.log("  - 1 position (executed)");
    console.log("  - 3 monitoring events");
    console.log("  - 1 thesis health metric");
    console.log("  - 2 notifications");
    console.log("  - Agent responses");
    console.log("\nWorkflow accessible at: /workflows/" + nvdaWorkflow.id);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
