import { storage } from "../server/storage";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Check if already seeded by looking for a marker company
    const existingCompany = await storage.getCompanyByTicker("TSLA");
    if (existingCompany) {
      console.log("✅ Database already seeded - skipping");
      return;
    }

    console.log("Database not seeded yet - proceeding with seed...");

    // Create demo user
    console.log("Creating demo user...");
    await storage.upsertUser({
      id: "dev-user-1",
      email: "demo@vest.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null,
      role: "ANALYST",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create sample companies
    console.log("Creating sample companies...");
    const companies = [
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
      },
      {
        ticker: "NVDA",
        name: "NVIDIA Corporation",
        sector: "Technology",
        industry: "Semiconductors",
        marketCap: 1200000000000,
        description: "Graphics processing units and AI chips manufacturer"
      },
      {
        ticker: "MSFT",
        name: "Microsoft Corporation",
        sector: "Technology",
        industry: "Software",
        marketCap: 2800000000000,
        description: "Software and cloud computing services"
      },
      {
        ticker: "AAPL",
        name: "Apple Inc.",
        sector: "Technology",
        industry: "Consumer Electronics",
        marketCap: 3000000000000,
        description: "Consumer electronics and software company"
      }
    ];

    for (const company of companies) {
      await storage.createCompany(company);
    }

    // Create sample positions
    console.log("Creating sample positions...");
    const positions = [
      {
        ticker: "TSLA",
        shares: 5000,
        avgCost: 180.50,
        currentPrice: 242.84,
        sector: "Consumer Discretionary",
        thesis: "Leading position in EV market with strong brand and technological advantage",
        status: "ACTIVE" as const,
        entryDate: new Date("2024-01-15"),
      },
      {
        ticker: "GOOGL",
        shares: 3000,
        avgCost: 128.30,
        currentPrice: 165.42,
        sector: "Communication Services",
        thesis: "Dominant search engine with growing cloud business and AI capabilities",
        status: "ACTIVE" as const,
        entryDate: new Date("2024-02-01"),
      }
    ];

    for (const position of positions) {
      await storage.createPosition(position);
    }

    // Create sample proposals
    console.log("Creating sample proposals...");
    const proposals = [
      {
        ticker: "NVDA",
        companyName: "NVIDIA Corporation",
        proposalType: "BUY" as const,
        status: "PENDING" as const,
        proposedBy: "dev-user-1",
        targetPrice: 950.00,
        currentPrice: 875.50,
        upside: 8.5,
        shares: 2000,
        thesis: "AI chip leader with strong demand growth and pricing power",
        catalysts: ["New GPU architecture launch", "Expanding AI data center partnerships", "Growing autonomous vehicle chip business"],
        risks: ["High valuation multiples", "Competition from AMD and Intel", "Supply chain constraints"],
        conviction: 8,
        timeHorizon: 24,
      },
      {
        ticker: "MSFT",
        companyName: "Microsoft Corporation",
        proposalType: "BUY" as const,
        status: "DRAFT" as const,
        proposedBy: "dev-user-1",
        targetPrice: 425.00,
        currentPrice: 380.00,
        upside: 11.8,
        shares: 1500,
        thesis: "Cloud growth accelerating with Azure AI services and enterprise adoption",
        catalysts: ["Azure AI revenue growth", "Office 365 price increases", "Gaming division expansion"],
        risks: ["Regulatory scrutiny", "Cloud competition", "Slower PC market"],
        conviction: 7,
        timeHorizon: 18,
      }
    ];

    for (const proposal of proposals) {
      await storage.createProposal(proposal);
    }

    // Create sample IC meeting
    console.log("Creating sample IC meeting...");
    const meeting = await storage.createICMeeting({
      title: "Q1 2025 Investment Committee Meeting",
      scheduledAt: new Date("2025-01-20T14:00:00Z"),
      status: "SCHEDULED" as const,
      agenda: ["Review NVDA buy proposal", "Portfolio rebalancing discussion", "Market outlook Q1"],
    });

    // Add participants
    await storage.createMeetingParticipant({
      meetingId: meeting.id,
      userId: "dev-user-1",
      role: "ANALYST" as const,
    });

    // Create sample research requests
    console.log("Creating sample research requests...");
    await storage.createResearchRequest({
      ticker: "NVDA",
      requestedBy: "dev-user-1",
      priority: "HIGH" as const,
      status: "COMPLETED" as const,
      researchType: "FULL_ANALYSIS" as const,
      questions: ["What is NVIDIA's competitive moat in AI chips?", "How sustainable is current demand?"],
    });

    // Create sample notifications
    console.log("Creating sample notifications...");
    const notifications = [
      {
        userId: "dev-user-1",
        type: "IC_VOTE" as const,
        title: "IC Meeting Tomorrow",
        message: "Q1 2025 Investment Committee Meeting scheduled for tomorrow at 2:00 PM",
        severity: "INFO" as const,
        read: false,
        actionUrl: "/ic-meeting",
      },
      {
        userId: "dev-user-1",
        type: "THESIS_ALERT" as const,
        title: "Thesis Health Alert: TSLA",
        message: "TSLA thesis drift detected - recent earnings miss key assumptions",
        severity: "MEDIUM" as const,
        read: false,
        actionUrl: "/thesis-monitor",
      }
    ];

    for (const notification of notifications) {
      await storage.createNotification(notification);
    }

    // Create sample agent responses for the proposals
    console.log("Creating sample agent responses...");
    
    // Research Brief for NVDA
    await storage.createAgentResponse({
      ticker: "NVDA",
      agentType: "RESEARCH_SYNTHESIZER",
      data: {
        ticker: "NVDA",
        companyName: "NVIDIA Corporation",
        executiveSummary: "NVIDIA is the dominant player in GPU technology with commanding market share in gaming, data centers, and AI computing. The company's CUDA ecosystem creates significant switching costs, while its new Blackwell architecture positions it well for continued AI infrastructure buildout.",
        keyMetrics: {
          marketCap: "$1.2T",
          peRatio: 45.2,
          revenue: "$60.9B",
          revenueGrowth: "+122% YoY",
          netMargin: "49.3%",
          roe: "115.2%"
        },
        strengths: [
          "Dominant 80%+ market share in AI accelerators",
          "CUDA moat with 4M+ developers",
          "Strong pricing power with 60%+ gross margins",
          "Diversified revenue across gaming, data center, automotive"
        ],
        weaknesses: [
          "High customer concentration (hyperscalers)",
          "Geopolitical risks from China restrictions",
          "Valuation premium to peers"
        ],
        recommendation: "BUY",
        targetPrice: 950,
        analysisDate: new Date().toISOString(),
      },
      metadata: { analyst: "AI Research Agent", confidence: 0.92 },
    });

    // DCF Model for NVDA
    await storage.createAgentResponse({
      ticker: "NVDA",
      agentType: "DCF_MODELER",
      data: {
        ticker: "NVDA",
        scenarios: {
          bull: {
            targetPrice: 1050,
            irr: 28.5,
            assumptions: "Sustained AI infrastructure growth, market share gains in automotive"
          },
          base: {
            targetPrice: 950,
            irr: 22.3,
            assumptions: "Moderate AI growth, stable margins, diversification success"
          },
          bear: {
            targetPrice: 720,
            irr: 12.1,
            assumptions: "Competition intensifies, margin compression, slower AI adoption"
          }
        },
        wacc: 9.2,
        terminalGrowth: 3.0,
        modelDate: new Date().toISOString(),
      },
      metadata: { analyst: "DCF Modeler Agent", modelVersion: "2.1" },
    });

    // Risk Analysis for NVDA
    await storage.createAgentResponse({
      ticker: "NVDA",
      agentType: "CONTRARIAN",
      data: {
        ticker: "NVDA",
        bearCase: {
          summary: "AI infrastructure spending may be peaking as hyperscalers digest recent capacity additions. Competition from AMD, custom ASICs, and potential customer backward integration poses margin risk.",
          keyRisks: [
            "Customer concentration: Top 4 customers represent 40%+ of revenue",
            "AMD gaining share with MI300 competitive on price/performance",
            "Custom silicon threat: Google TPU, Amazon Trainium, Microsoft Maia",
            "Geopolitical: China export restrictions eliminate 25% of market",
            "Valuation: Trading at 45x earnings vs 5-year average of 35x"
          ],
          mitigationStrategths: 8,
          contraryIndicators: [
            "Insider selling accelerated in Q4",
            "Server GPU orders showing first sequential decline",
            "Hyperscaler CapEx guidance below consensus"
          ]
        },
        analysisDate: new Date().toISOString(),
      },
      metadata: { analyst: "Contrarian Agent", severity: "MEDIUM" },
    });

    console.log("✅ Database seeding completed successfully!");
    console.log("\nCreated:");
    console.log("  - 1 demo user");
    console.log("  - 5 companies (TSLA, GOOGL, NVDA, MSFT, AAPL)");
    console.log("  - 2 positions (TSLA, GOOGL)");
    console.log("  - 2 proposals (NVDA, MSFT)");
    console.log("  - 1 IC meeting");
    console.log("  - 1 research request");
    console.log("  - 2 notifications");
    console.log("  - 3 agent responses (Research Brief, DCF Model, Risk Analysis for NVDA)");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
