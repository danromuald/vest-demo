import { db } from "./db";
import {
  companies, positions, proposals, icMeetings, votes, marketEvents, thesisMonitors, notifications,
  researchRequests, agentResponses, financialModels, meetingParticipants
} from "@shared/schema";
import { randomUUID } from "crypto";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(notifications);
  await db.delete(votes);
  await db.delete(meetingParticipants);
  await db.delete(agentResponses);
  await db.delete(financialModels);
  await db.delete(marketEvents);
  await db.delete(thesisMonitors);
  await db.delete(proposals);
  await db.delete(researchRequests);
  await db.delete(icMeetings);
  await db.delete(positions);
  await db.delete(companies);

  // Seed Companies
  const companyData = await db.insert(companies).values([
    {
      id: randomUUID(),
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      sector: "Technology",
      industry: "Semiconductors",
      marketCap: "2850000000000",
      currentPrice: "875.50",
      description: "Leader in GPU technology and AI computing infrastructure, powering data centers and autonomous vehicles",
    },
    {
      id: randomUUID(),
      ticker: "MSFT",
      name: "Microsoft Corporation",
      sector: "Technology",
      industry: "Software",
      marketCap: "2950000000000",
      currentPrice: "415.25",
      description: "Cloud computing, productivity software, and enterprise AI services with Azure and Office 365",
    },
    {
      id: randomUUID(),
      ticker: "TSLA",
      name: "Tesla Inc",
      sector: "Consumer Cyclical",
      industry: "Auto Manufacturers",
      marketCap: "825000000000",
      currentPrice: "245.80",
      description: "Electric vehicle manufacturer and clean energy company with autonomous driving technology",
    },
    {
      id: randomUUID(),
      ticker: "AAPL",
      name: "Apple Inc",
      sector: "Technology",
      industry: "Consumer Electronics",
      marketCap: "3100000000000",
      currentPrice: "195.75",
      description: "Consumer electronics and services ecosystem with iPhone, Mac, and services revenue",
    },
    {
      id: randomUUID(),
      ticker: "GOOGL",
      name: "Alphabet Inc",
      sector: "Technology",
      industry: "Internet Content & Information",
      marketCap: "2050000000000",
      currentPrice: "165.30",
      description: "Search, advertising, cloud computing, and AI research with Google and YouTube platforms",
    },
  ]).returning();

  console.log(`✅ Seeded ${companyData.length} companies`);

  // Seed Positions
  const positionData = await db.insert(positions).values([
    {
      id: randomUUID(),
      ticker: "NVDA",
      companyName: "NVIDIA Corporation",
      shares: 85000,
      avgCost: "625.00",
      currentPrice: "875.50",
      marketValue: "74417500",
      portfolioWeight: "12.85",
      gainLoss: "21292500",
      gainLossPercent: "40.08",
      sector: "Technology",
      analyst: "Michael Torres",
      thesisHealth: "HEALTHY",
      purchaseDate: new Date("2023-11-20"),
    },
    {
      id: randomUUID(),
      ticker: "MSFT",
      companyName: "Microsoft Corporation",
      shares: 120000,
      avgCost: "385.50",
      currentPrice: "415.25",
      marketValue: "49830000",
      portfolioWeight: "8.60",
      gainLoss: "3570000",
      gainLossPercent: "7.72",
      sector: "Technology",
      analyst: "Sarah Chen",
      thesisHealth: "HEALTHY",
      purchaseDate: new Date("2024-08-15"),
    },
    {
      id: randomUUID(),
      ticker: "AAPL",
      companyName: "Apple Inc",
      shares: 95000,
      avgCost: "178.20",
      currentPrice: "195.75",
      marketValue: "18596250",
      portfolioWeight: "3.21",
      gainLoss: "1667250",
      gainLossPercent: "9.85",
      sector: "Technology",
      analyst: "David Kim",
      thesisHealth: "WARNING",
      purchaseDate: new Date("2024-03-10"),
    },
  ]).returning();

  console.log(`✅ Seeded ${positionData.length} positions`);

  // Seed Research Requests
  const researchData = await db.insert(researchRequests).values([
    {
      id: randomUUID(),
      ticker: "TSLA",
      companyName: "Tesla Inc",
      requestedBy: "Sarah Chen",
      assignedTo: "Michael Torres",
      priority: "HIGH",
      status: "IN_PROGRESS",
      researchType: "INITIAL",
      description: "Evaluate Tesla for potential new position. Focus on FSD adoption trajectory and energy storage growth.",
      dueDate: new Date("2025-10-30"),
    },
    {
      id: randomUUID(),
      ticker: "GOOGL",
      companyName: "Alphabet Inc",
      requestedBy: "Robert Anderson",
      assignedTo: "Sarah Chen",
      priority: "HIGH",
      status: "COMPLETED",
      researchType: "DEEP_DIVE",
      description: "Analyze regulatory headwinds and competitive threats. Recommend trim or exit strategy.",
      dueDate: new Date("2025-10-20"),
    },
  ]).returning();

  console.log(`✅ Seeded ${researchData.length} research requests`);

  // Seed IC Meeting
  const meetingId = randomUUID();
  await db.insert(icMeetings).values({
    id: meetingId,
    meetingDate: new Date("2025-10-25T14:00:00Z"),
    status: "SCHEDULED",
    attendees: ["Sarah Chen", "Michael Torres", "David Kim", "Jennifer Park", "Robert Anderson"],
    agenda: {
      proposals: ["TSLA New Position", "GOOGL Trim"],
      presentations: ["Q3 Portfolio Review", "Macro Outlook"],
    },
  });

  console.log("✅ Seeded IC meeting");

  // Seed Proposals
  const proposalData = await db.insert(proposals).values([
    {
      id: randomUUID(),
      ticker: "TSLA",
      companyName: "Tesla Inc",
      analyst: "Michael Torres",
      proposalType: "BUY",
      proposedWeight: "4.50",
      targetPrice: "310.00",
      thesis: "Tesla is transitioning from pure EV play to autonomous driving and energy storage leader. FSD adoption accelerating with v13 release showing significant improvement. Energy storage business growing 150% YoY with strong margins.",
      catalysts: [
        "Full Self-Driving v13 wide release in Q4 2025",
        "Cybertruck production ramp hitting 25k units/month",
        "Energy storage deployments exceeding 100 GWh annually",
        "Robotaxi unveiling scheduled for Q1 2026",
      ],
      risks: [
        "Regulatory approval delays for autonomous driving",
        "Competition intensifying from Chinese EV makers",
        "Execution risk on multiple product ramps simultaneously",
        "Valuation multiple compression if growth slows",
      ],
      status: "PENDING",
      icMeetingId: meetingId,
    },
    {
      id: randomUUID(),
      ticker: "GOOGL",
      companyName: "Alphabet Inc",
      analyst: "Sarah Chen",
      proposalType: "SELL",
      proposedWeight: "0.00",
      targetPrice: "145.00",
      thesis: "Regulatory headwinds mounting with DOJ antitrust case targeting search monopoly. AI disruption risk from ChatGPT and Claude gaining search market share. Cloud growth decelerating while margins under pressure.",
      catalysts: [
        "DOJ antitrust trial verdict expected Q1 2026",
        "Potential forced divestiture of Chrome or Android",
        "Market share loss to AI-powered search alternatives",
        "YouTube ad revenue growth slowing",
      ],
      risks: [
        "Exiting position may be premature if settlement reached",
        "Strong FCF generation supports 20% buyback program",
        "Waymo autonomous driving optionality undervalued",
        "Cloud AI products could re-accelerate growth",
      ],
      status: "PENDING",
      icMeetingId: meetingId,
    },
  ]).returning();

  console.log(`✅ Seeded ${proposalData.length} proposals`);

  // Seed Votes for proposals
  for (const proposal of proposalData) {
    await db.insert(votes).values([
      {
        id: randomUUID(),
        proposalId: proposal.id,
        voterName: "Sarah Chen",
        voterRole: "Portfolio Manager",
        vote: "APPROVE",
        comment: "Strong thesis with clear catalysts. Risk/reward favorable at current levels.",
      },
      {
        id: randomUUID(),
        proposalId: proposal.id,
        voterName: "Robert Anderson",
        voterRole: "Chief Investment Officer",
        vote: "APPROVE",
        comment: "Aligns with our growth strategy. Monitoring regulatory developments closely.",
      },
      {
        id: randomUUID(),
        proposalId: proposal.id,
        voterName: "David Kim",
        voterRole: "Risk Manager",
        vote: "ABSTAIN",
        comment: "Need more clarity on downside protection given volatility in the sector.",
      },
    ]);
  }

  console.log("✅ Seeded votes");

  // Seed Agent Responses (Research Briefs, DCF Models, etc.)
  await db.insert(agentResponses).values([
    // RESEARCH_SYNTHESIZER agents
    {
      id: randomUUID(),
      agentType: "RESEARCH_SYNTHESIZER",
      ticker: "TSLA",
      prompt: "Generate comprehensive research brief for TSLA including key metrics, strengths, concerns, and recommendation",
      response: {
        executiveSummary: "Tesla is evolving from pure EV manufacturer to autonomous driving and energy storage leader. FSD v13 shows meaningful progress with intervention rates down 80%. Energy storage business growing 150%+ YoY with strong margins. Cybertruck production ramping faster than expected.",
        keyMetrics: {
          marketCap: "$825B",
          pe: "65x",
          revenue: "$98B (est 2024)",
          revenueGrowth: "22%",
          margins: "Operating: 11%, Net: 15%",
          evDeliveries: "1.9M units (2024E)",
        },
        strengths: [
          "FSD technology 2-3 years ahead of competition",
          "Energy storage deployments exceeding 100 GWh annually",
          "Cybertruck orders backlog of 2M+ units",
          "Vertical integration provides cost advantages",
          "Strong brand loyalty and direct sales model"
        ],
        concerns: [
          "Valuation elevated at 65x PE vs auto peers at 8x",
          "Chinese EV competition intensifying (BYD, NIO)",
          "Regulatory approval uncertainty for full autonomy",
          "Execution risk on multiple product ramps"
        ],
        recommendation: "BUY - Target 4.5% weight at $310 price target (26% upside)"
      },
    },
    {
      id: randomUUID(),
      agentType: "RESEARCH_SYNTHESIZER",
      ticker: "GOOGL",
      prompt: "Generate comprehensive research brief for GOOGL including key metrics, strengths, concerns, and recommendation",
      response: {
        executiveSummary: "Alphabet faces mounting regulatory pressure with DOJ antitrust case threatening search monopoly. AI disruption risk from ChatGPT and Claude gaining mindshare. Cloud growth decelerating while margins under pressure from AI infrastructure investments.",
        keyMetrics: {
          marketCap: "$2.05T",
          pe: "24x",
          revenue: "$307B (2024)",
          revenueGrowth: "10%",
          margins: "Operating: 30%, Net: 24%",
          cloudRevenue: "$36B (12% of total)",
        },
        strengths: [
          "Search still dominant with 90%+ market share",
          "YouTube largest video platform with 2B+ users",
          "Strong FCF supports 20% buyback program",
          "Waymo autonomous driving leadership",
          "AI research capabilities (DeepMind)"
        ],
        concerns: [
          "DOJ seeking forced divestiture of Chrome/Android",
          "AI-powered search alternatives gaining traction",
          "Cloud margins compressed by AI investments",
          "YouTube ad revenue growth slowing to 5%"
        ],
        recommendation: "SELL - Exit position given regulatory and competitive headwinds"
      },
    },
    {
      id: randomUUID(),
      agentType: "RESEARCH_SYNTHESIZER",
      ticker: "NVDA",
      prompt: "Generate comprehensive research brief for NVDA",
      response: {
        executiveSummary: "NVIDIA dominates AI infrastructure with 90%+ datacenter GPU market share. Hopper H100/H200 chips sold out through 2025. Blackwell B200 platform launching Q1 2026 with 5x performance improvement. Software moat expanding via CUDA ecosystem.",
        keyMetrics: {
          marketCap: "$2.85T",
          pe: "78x",
          revenue: "$126B (2024E)",
          revenueGrowth: "94%",
          margins: "Operating: 62%, Net: 55%",
          datacenterRevenue: "$98B (78% of total)",
        },
        strengths: [
          "Near-monopoly in AI training chips (90%+ share)",
          "CUDA software ecosystem creates switching costs",
          "Blackwell platform extends technological lead",
          "Sovereign AI demand from governments",
          "Networking business growing 200%+ YoY"
        ],
        concerns: [
          "Extreme valuation at 78x PE vs historical 30x",
          "AMD and custom chips gaining market share",
          "Customer concentration: Top 4 = 40% of revenue",
          "Export restrictions to China reducing TAM"
        ],
        recommendation: "HOLD - Maintain 12.8% weight, trim on strength above $950"
      },
    },
    
    // CONTRARIAN agents
    {
      id: randomUUID(),
      agentType: "CONTRARIAN",
      ticker: "TSLA",
      prompt: "Provide contrarian bear case analysis for TSLA including key risks and counterarguments",
      response: {
        bearCase: "Tesla faces intensifying competition from Chinese EV makers (BYD, NIO) with lower-cost models. FSD remains years away from true autonomy despite marketing claims. Energy storage margins will compress as commoditization accelerates. Valuation at 65x PE leaves no room for execution missteps.",
        keyRisks: [
          "BYD now #1 EV seller globally with superior battery tech",
          "FSD regulatory approval uncertain - could take 5+ years",
          "Energy storage becoming commoditized with margin pressure",
          "Cybertruck production challenges and quality issues",
          "Valuation disconnect: 65x PE vs Toyota at 8x PE"
        ],
        counterarguments: [
          "FSD data advantage with 5B+ miles driven",
          "Energy storage TAM massive and early stage",
          "Brand strength supports pricing power",
          "Vertical integration provides cost moat"
        ],
        recommendation: "Wait for valuation to compress to 35-40x PE before initiating"
      },
    },
    {
      id: randomUUID(),
      agentType: "CONTRARIAN",
      ticker: "NVDA",
      prompt: "Provide contrarian bear case analysis for NVDA",
      response: {
        bearCase: "NVIDIA's dominance is temporary. AMD's MI300X matching H100 performance at lower cost. Hyperscalers developing custom AI chips (Google TPU, Amazon Trainium). AI capex cycle peaking as ROI disappoints. Valuation at 78x PE assumes perpetual hypergrowth.",
        keyRisks: [
          "AMD MI300X gaining share with 40% cost advantage",
          "Google, Amazon, Microsoft all building custom chips",
          "AI infrastructure buildout slowing in 2026",
          "China export restrictions reducing addressable market 25%",
          "Gross margins peak at 75% - compression ahead"
        ],
        counterarguments: [
          "CUDA ecosystem creates 2-3 year switching cost",
          "Blackwell performance lead maintains premium pricing",
          "Inference market opportunity just beginning",
          "Sovereign AI demand provides growth buffer"
        ],
        recommendation: "Trim above $950, reduce to 8% weight from 12.8%"
      },
    },
    
    // DCF_MODELER (stored in financialModels table but also agent response)
    {
      id: randomUUID(),
      agentType: "DCF_MODELER",
      ticker: "TSLA",
      prompt: "Generate 3-scenario DCF model for TSLA",
      response: {
        bullCase: {
          targetPrice: 380,
          irr: 42.5,
          upside: "55%",
          revenueCAGR: "30% (2025-2027)",
          operatingMargin: "16%",
          terminalGrowth: "4%",
          wacc: "9%",
          keyAssumptions: {
            evDeliveries: "3.2M units by 2027",
            energyStorage: "200 GWh (25% of revenue)",
            fsdAttachment: "40% take rate at $99/month",
            autonomyLaunch: "2026 robotaxi service"
          }
        },
        baseCase: {
          targetPrice: 310,
          irr: 26.1,
          upside: "26%",
          revenueCAGR: "22% (2025-2027)",
          operatingMargin: "13%",
          terminalGrowth: "3%",
          wacc: "10%",
          keyAssumptions: {
            evDeliveries: "2.8M units by 2027",
            energyStorage: "180 GWh (20% of revenue)",
            fsdAttachment: "25% take rate",
            autonomyLaunch: "Delayed to 2027"
          }
        },
        bearCase: {
          targetPrice: 195,
          irr: -6.5,
          downside: "-21%",
          revenueCAGR: "12% (2025-2027)",
          operatingMargin: "9%",
          terminalGrowth: "2%",
          wacc: "11.5%",
          keyAssumptions: {
            evDeliveries: "2.2M units by 2027",
            energyStorage: "120 GWh (15% of revenue)",
            fsdAttachment: "10% take rate",
            autonomyLaunch: "No meaningful autonomy revenue"
          }
        },
        sensitivities: {
          wacc: "±1% changes price by ±18%",
          terminalGrowth: "±0.5% changes price by ±10%",
          operatingMargin: "±2% changes price by ±15%"
        }
      },
    },
    {
      id: randomUUID(),
      agentType: "DCF_MODELER",
      ticker: "NVDA",
      prompt: "Generate 3-scenario DCF model for NVDA",
      response: {
        bullCase: {
          targetPrice: 1150,
          irr: 28.5,
          upside: "31%",
          revenueCAGR: "35% (2025-2027)",
          operatingMargin: "64%",
          terminalGrowth: "6%",
          wacc: "9.5%",
          keyAssumptions: {
            datacenterRevenue: "$185B by 2027",
            inferenceMarket: "40% of datacenter revenue",
            networking: "$45B revenue",
            marketShareMaintained: "85% AI chip share"
          }
        },
        baseCase: {
          targetPrice: 950,
          irr: 18.2,
          upside: "9%",
          revenueCAGR: "28% (2025-2027)",
          operatingMargin: "60%",
          terminalGrowth: "5%",
          wacc: "10%",
          keyAssumptions: {
            datacenterRevenue: "$165B by 2027",
            inferenceMarket: "35% of datacenter revenue",
            networking: "$38B revenue",
            marketShareMaintained: "75% AI chip share"
          }
        },
        bearCase: {
          targetPrice: 650,
          irr: -8.4,
          downside: "-26%",
          revenueCAGR: "15% (2025-2027)",
          operatingMargin: "52%",
          terminalGrowth: "3%",
          wacc: "11%",
          keyAssumptions: {
            datacenterRevenue: "$125B by 2027",
            inferenceMarket: "25% of datacenter revenue",
            networking: "$28B revenue",
            marketShareEroded: "60% AI chip share"
          }
        },
        sensitivities: {
          marketShare: "10% share loss = -$120 price impact",
          margins: "5% margin compression = -$95 price impact",
          wacc: "±1% changes price by ±22%"
        }
      },
    },
    
    // QUANT_ANALYST
    {
      id: randomUUID(),
      agentType: "QUANT_ANALYST",
      ticker: "TSLA",
      prompt: "Generate quantitative factor analysis for TSLA",
      response: {
        factorExposures: {
          growth: 2.8,
          value: -1.5,
          momentum: 1.2,
          quality: 0.6,
          size: 1.4,
          volatility: 2.1
        },
        riskMetrics: {
          sharpeRatio: 1.45,
          beta: 2.1,
          alpha: 8.5,
          correlationToSP500: 0.62,
          maxDrawdown: "-38%",
          volatility: "48% annualized"
        },
        portfolioFit: {
          incrementalTracking: "+0.85%",
          correlationToPortfolio: 0.58,
          diversificationBenefit: "Low - high correlation with tech positions"
        },
        quantScore: 72,
        recommendation: "Factor profile shows high growth/momentum exposure. Consider sizing risk given 2.1 beta and high volatility."
      },
    },
    {
      id: randomUUID(),
      agentType: "QUANT_ANALYST",
      ticker: "NVDA",
      prompt: "Generate quantitative factor analysis for NVDA",
      response: {
        factorExposures: {
          growth: 3.2,
          value: -2.1,
          momentum: 2.5,
          quality: 1.8,
          size: 2.4,
          volatility: 1.6
        },
        riskMetrics: {
          sharpeRatio: 2.15,
          beta: 1.8,
          alpha: 12.3,
          correlationToSP500: 0.71,
          maxDrawdown: "-28%",
          volatility: "42% annualized"
        },
        portfolioFit: {
          incrementalTracking: "+1.12%",
          correlationToPortfolio: 0.68,
          diversificationBenefit: "Low - highest weight in tech sector"
        },
        quantScore: 88,
        recommendation: "Exceptional quant profile with strong momentum and quality scores. Monitor concentration risk at 12.8% weight."
      },
    },
    
    // SCENARIO_SIMULATOR
    {
      id: randomUUID(),
      agentType: "SCENARIO_SIMULATOR",
      ticker: "TSLA",
      prompt: "Simulate portfolio impact of adding TSLA position at 4.5% weight",
      response: {
        currentPortfolio: {
          totalValue: "$579M",
          positions: 12,
          techWeight: "38.5%",
          trackingError: "4.2%",
          sharpeRatio: 1.68
        },
        projectedPortfolio: {
          totalValue: "$579M",
          positions: 13,
          techWeight: "43.0%",
          trackingError: "5.1%",
          sharpeRatio: 1.72
        },
        impactAnalysis: {
          trackingErrorChange: "+0.9%",
          sectorConcentration: "Tech weight increases to 43% (warning threshold 45%)",
          factorExposure: "Growth factor +0.8, Volatility +0.6",
          correlationImpact: "Portfolio correlation increases to 0.74"
        },
        riskWarnings: [
          "Tech sector approaching 45% concentration limit",
          "High correlation (0.68) with existing NVDA position",
          "Portfolio beta increases from 1.25 to 1.32"
        ],
        recommendation: "APPROVE with monitoring - Stay within limits but close to tech concentration threshold"
      },
    },
    
    // DOCUMENT_GENERATOR (Investment Memos)
    {
      id: randomUUID(),
      agentType: "DOCUMENT_GENERATOR",
      ticker: "TSLA",
      prompt: "Generate investment memo for TSLA BUY proposal",
      response: {
        title: "Investment Memorandum: Tesla Inc (TSLA)",
        preparedBy: "Michael Torres, Technology Analyst",
        date: "October 24, 2025",
        actionRecommendation: "BUY - Initiate 4.5% position",
        
        executiveSummary: "Tesla is transitioning from pure EV manufacturer to autonomous driving and energy storage leader. We recommend initiating a 4.5% position at current levels with $310 price target (26% upside). FSD v13 demonstrates meaningful progress, energy storage growing 150%+ YoY, and Cybertruck ramping faster than expected.",
        
        investmentThesis: {
          primary: "Autonomous driving leadership with 2-3 year technological lead and 5B+ miles of real-world training data",
          supporting: [
            "Energy storage business inflecting with 150%+ YoY growth and strong margins",
            "Cybertruck production ramp ahead of schedule with 2M+ unit backlog",
            "Vertical integration providing sustainable cost advantages"
          ]
        },
        
        catalysts: [
          "FSD v13 wide release Q4 2025 with 80% reduction in interventions",
          "Cybertruck production hitting 25k units/month by Q2 2026",
          "Energy storage deployments exceeding 100 GWh annually",
          "Robotaxi unveiling Q1 2026 with limited launch in select cities"
        ],
        
        risks: [
          "Regulatory approval delays for autonomous driving",
          "Competition intensifying from Chinese EV makers (BYD, NIO)",
          "Execution risk on multiple product ramps simultaneously",
          "Valuation multiple compression if growth decelerates"
        ],
        
        valuation: {
          method: "DCF 3-scenario analysis",
          targetPrice: "$310",
          upside: "26%",
          priceRange: "$195 (bear) to $380 (bull)"
        },
        
        recommendation: "APPROVE - Initiate 4.5% position. Monitor FSD regulatory progress and energy storage margin trends."
      },
    },
    
    // MINUTES_SCRIBE
    {
      id: randomUUID(),
      agentType: "MINUTES_SCRIBE",
      ticker: null,
      prompt: "Generate meeting minutes for IC meeting on October 25, 2025",
      response: {
        meetingTitle: "Investment Committee Meeting",
        date: "October 25, 2025, 2:00 PM ET",
        attendees: ["Sarah Chen (PM)", "Michael Torres (Analyst)", "David Kim (Risk)", "Jennifer Park (Compliance)", "Robert Anderson (CIO)"],
        
        decisions: [
          {
            proposal: "TSLA - Initiate 4.5% position",
            decision: "APPROVED",
            votes: "4 Approve, 0 Reject, 1 Abstain",
            rationale: "Strong thesis with clear catalysts. FSD progress de-risking technology narrative."
          },
          {
            proposal: "GOOGL - Exit position",
            decision: "APPROVED",
            votes: "3 Approve, 1 Reject, 1 Abstain",
            rationale: "Regulatory headwinds and AI disruption warrant exit despite strong FCF."
          }
        ],
        
        keyDiscussion: [
          "Concern raised about tech sector concentration reaching 43% after TSLA addition",
          "Debate on TSLA valuation at 65x PE vs auto peers at 8x",
          "Discussion of GOOGL regulatory timeline and potential settlement scenarios",
          "Portfolio rebalancing strategy if NVDA continues rallying"
        ],
        
        actionItems: [
          {
            item: "Execute TSLA purchase order - 4.5% weight at market",
            owner: "Trading Desk",
            deadline: "October 28, 2025"
          },
          {
            item: "Execute GOOGL exit via VWAP over 3 days",
            owner: "Trading Desk",
            deadline: "October 30, 2025"
          },
          {
            item: "Monitor tech sector weight - report if exceeds 44%",
            owner: "Risk Team",
            deadline: "Ongoing"
          }
        ]
      },
    },
    
    // COMPLIANCE_MONITOR
    {
      id: randomUUID(),
      agentType: "COMPLIANCE_MONITOR",
      ticker: "TSLA",
      prompt: "Check compliance for TSLA purchase",
      response: {
        complianceStatus: "APPROVED WITH CONDITIONS",
        
        checks: [
          {
            rule: "Position Size Limit (15% max)",
            status: "PASS",
            details: "4.5% weight within limit"
          },
          {
            rule: "Sector Concentration (45% max)",
            status: "WARNING",
            details: "Tech sector will be 43.0% (limit 45%). Close to threshold."
          },
          {
            rule: "Liquidity (30-day ADV)",
            status: "PASS",
            details: "TSLA 30-day ADV $12B, position size $26M = 0.2% ADV"
          },
          {
            rule: "Restricted List",
            status: "PASS",
            details: "TSLA not on restricted list"
          },
          {
            rule: "Conflict of Interest",
            status: "PASS",
            details: "No conflicts identified"
          }
        ],
        
        violations: [],
        
        warnings: [
          "Tech sector concentration 43% - approaching 45% limit",
          "Consider reducing if NVDA position appreciates further"
        ],
        
        remediationRequired: false,
        
        monitoringRequirements: [
          "Daily sector weight monitoring",
          "Alert if tech sector exceeds 44%"
        ],
        
        signoff: "Jennifer Park, Compliance Officer"
      },
    },
    
    // RISK_REPORTER
    {
      id: randomUUID(),
      agentType: "RISK_REPORTER",
      ticker: "TSLA",
      prompt: "Generate pre-trade risk report for TSLA purchase",
      response: {
        tradeDetails: {
          ticker: "TSLA",
          action: "BUY",
          size: "$26M (4.5% weight)",
          currentPrice: "$245.80"
        },
        
        portfolioImpact: {
          currentVaR: "$12.5M (95% 1-day)",
          projectedVaR: "$13.8M (95% 1-day)",
          varIncrease: "+$1.3M (+10.4%)",
          betaContribution: "+0.07 to portfolio beta",
          trackingErrorIncrease: "+0.9%"
        },
        
        riskFactors: {
          volatility: "48% annualized (2.5x portfolio average)",
          beta: "2.1 vs S&P 500",
          maxDrawdown: "-38% over past 12 months",
          correlationToPortfolio: "0.68"
        },
        
        limitBreaches: [],
        
        warnings: [
          "HIGH VOLATILITY: 48% vol is 2.5x portfolio average",
          "SECTOR CONCENTRATION: Tech sector approaching 45% limit",
          "CORRELATION: 0.68 correlation with existing tech positions"
        ],
        
        stressScenarios: {
          techSelloff: "-15% sector decline = -$6.5M portfolio impact",
          marketCrash: "-20% market = -$8.2M portfolio impact",
          teslaSpecific: "-25% stock decline = -$6.5M position loss"
        },
        
        recommendation: "APPROVE - Risk metrics elevated but within acceptable ranges. Monitor sector concentration closely.",
        
        riskRating: "MEDIUM-HIGH"
      },
    },
    
    // TRADE_ORDER_GENERATOR
    {
      id: randomUUID(),
      agentType: "TRADE_ORDER_GENERATOR",
      ticker: "TSLA",
      prompt: "Generate trade order for TSLA purchase",
      response: {
        orderTicket: "ORD-2025-1024-001",
        
        tradeDetails: {
          ticker: "TSLA",
          side: "BUY",
          targetNotional: "$26,000,000",
          targetWeight: "4.5%",
          currentPrice: "$245.80",
          estimatedShares: "105,780 shares"
        },
        
        executionStrategy: {
          orderType: "VWAP",
          timeframe: "Full day execution",
          participationRate: "12-15% of volume",
          startTime: "09:35 ET",
          endTime: "15:55 ET",
          discretion: "±2% vs VWAP benchmark"
        },
        
        riskParameters: {
          maxSlippage: "0.50%",
          limitPrice: "$250.00 (stop if exceeded)",
          minFillSize: "100 shares",
          displaySize: "500 shares"
        },
        
        instructions: [
          "Use VWAP algorithm to minimize market impact",
          "Monitor for unusual volume spikes - pause if detected",
          "Split across multiple dark pools and exchanges",
          "No market-on-close - complete by 3:55pm",
          "Report execution progress every 2 hours"
        ],
        
        postTradeAnalysis: {
          benchmarks: ["VWAP", "Arrival Price", "Close Price"],
          reportingRequirements: "TCA report due EOD"
        }
      },
    },
    
    // THESIS_MONITOR (in addition to thesisMonitors table)
    {
      id: randomUUID(),
      agentType: "THESIS_MONITOR",
      ticker: "AAPL",
      prompt: "Generate thesis health monitor for AAPL position",
      response: {
        ticker: "AAPL",
        healthStatus: "WARNING",
        driftScore: 42,
        
        originalThesis: {
          summary: "Services-driven growth model with 16%+ revenue growth and expanding margins",
          keyPillars: [
            "Services revenue growing 15-20% annually",
            "iPhone upgrade cycle strength",
            "China market share gains",
            "Margin expansion from services mix shift"
          ]
        },
        
        currentState: {
          servicesGrowth: "12% YoY (vs 16% thesis)",
          iPhoneGrowth: "1.5% YoY (vs 8% expected)",
          chinaRevenue: "-6.5% YoY (vs +10% thesis)",
          operatingMargin: "29.5% (vs 31% thesis)"
        },
        
        keyConcerns: [
          "Services growth decelerating from 16% to 12%",
          "iPhone revenue nearly flat vs 8% growth expected",
          "China weakness persisting - down 6.5% YoY",
          "Margin expansion stalling at 29.5%"
        ],
        
        newRisks: [
          "DOJ antitrust lawsuit targeting App Store",
          "Huawei regaining share in China premium segment",
          "Services growth outlook lowered by management"
        ],
        
        recommendation: "HOLD with close monitoring - Consider trimming if Q4 guidance disappoints. Reduce to 2% weight from 3.2%.",
        
        nextReview: "Post Q4 earnings (January 2026)"
      },
    },
    
    // MARKET_EVENT_MONITOR (in addition to marketEvents table)
    {
      id: randomUUID(),
      agentType: "MARKET_EVENT_MONITOR",
      ticker: "NVDA",
      prompt: "Monitor market events for NVDA position",
      response: {
        ticker: "NVDA",
        eventSummary: "Q3 earnings beat with strong datacenter growth",
        
        event: {
          type: "EARNINGS",
          date: "October 20, 2025",
          severity: "MEDIUM",
          priceImpact: "+5.2%"
        },
        
        keyMetrics: {
          revenue: "$35.1B (+94% YoY) vs $33.2B est",
          datacenterRevenue: "$30.8B (+112% YoY)",
          eps: "$4.25 vs $3.89 est",
          guidance: "Q4 revenue $36.5B vs $35.8B est"
        },
        
        analysis: {
          positive: [
            "Datacenter revenue up 112% - AI demand robust",
            "Hopper and Blackwell chips showing strong adoption",
            "Gross margins holding at 75% despite mix shift",
            "Guidance beat Street expectations"
          ],
          negative: [
            "Gaming revenue flat YoY",
            "China exposure declining due to export restrictions",
            "Customer concentration remains high (Top 4 = 40%)"
          ]
        },
        
        portfolioImpact: "+$2.85M unrealized gain",
        
        recommendation: "No action required - Position performing in line with thesis. Monitor for profit-taking opportunity above $950."
      },
    },
    
    // DATA_RETRIEVAL
    {
      id: randomUUID(),
      agentType: "DATA_RETRIEVAL",
      ticker: "TSLA",
      prompt: "Retrieve historical precedent transactions for EV sector",
      response: {
        query: "EV sector acquisitions and strategic investments",
        
        precedentTransactions: [
          {
            date: "2023-08",
            acquirer: "General Motors",
            target: "Cruise (additional investment)",
            dealValue: "$1.35B",
            evRevenue: "8.5x",
            relevance: 85,
            insights: "Autonomous driving valued at premium multiples"
          },
          {
            date: "2024-03",
            acquirer: "Apple",
            target: "Canoo (rumored)",
            dealValue: "$2.8B",
            evRevenue: "4.2x",
            relevance: 72,
            insights: "Tech giants valuing EV design and manufacturing IP"
          },
          {
            date: "2024-11",
            acquirer: "Toyota",
            target: "Pony.ai stake",
            dealValue: "$450M",
            evRevenue: "N/A",
            relevance: 68,
            insights: "Autonomous driving partnerships increasingly common"
          }
        ],
        
        comparableMetrics: {
          avgEVRevenue: "6.2x",
          avgPremium: "32%",
          strategicRationale: "Technology and manufacturing capability acquisition"
        },
        
        insights: "EV sector M&A focused on autonomous driving and battery technology. Strategic buyers willing to pay 4-8x revenue multiples."
      },
    },
    
    // VOICE_SYNTHESIZER
    {
      id: randomUUID(),
      agentType: "VOICE_SYNTHESIZER",
      ticker: null,
      prompt: "Generate audio summary of IC meeting decisions",
      response: {
        audioTranscript: "Investment Committee Meeting Summary - October 25, 2025. The committee approved two proposals today. First, Tesla Incorporated - approved for purchase at 4.5% portfolio weight with $310 target price. The thesis centers on autonomous driving leadership and energy storage growth. The vote was 4 approves, 1 abstain. Second, Alphabet Inc - approved for full exit. Regulatory headwinds from the DOJ antitrust case and AI competition warrant exiting the position. Vote was 3 approves, 1 reject, 1 abstain. Key monitoring item: tech sector concentration now at 43%, approaching the 45% limit. Risk team will monitor daily.",
        
        keyPoints: [
          "TSLA approved - 4.5% weight, $310 target",
          "GOOGL approved for exit",
          "Tech sector concentration 43% - near limit",
          "Trading to execute within 3 days"
        ],
        
        duration: "1:45 minutes",
        
        audioFileURL: "/audio/ic-meeting-2025-10-25.mp3"
      },
    },
    
    // ATTRIBUTION_ANALYST
    {
      id: randomUUID(),
      agentType: "ATTRIBUTION_ANALYST",
      ticker: null,
      prompt: "Generate Q3 2025 performance attribution analysis",
      response: {
        period: "Q3 2025",
        totalReturn: "+8.5%",
        benchmark: "S&P 500 +5.2%",
        alpha: "+3.3%",
        
        attribution: {
          assetAllocation: {
            contribution: "+1.2%",
            drivers: [
              "Overweight technology (+2.1%)",
              "Underweight utilities (-0.5%)",
              "Overweight healthcare (-0.4%)"
            ]
          },
          stockSelection: {
            contribution: "+2.1%",
            drivers: [
              "NVDA position (+1.8%)",
              "MSFT outperformance (+0.6%)",
              "AAPL underperformance (-0.3%)"
            ]
          }
        },
        
        topContributors: [
          {
            ticker: "NVDA",
            weight: "12.8%",
            return: "+18.5%",
            contribution: "+1.85%"
          },
          {
            ticker: "MSFT",
            weight: "8.6%",
            return: "+11.2%",
            contribution: "+0.62%"
          }
        ],
        
        topDetractors: [
          {
            ticker: "AAPL",
            weight: "3.2%",
            return: "-4.5%",
            contribution: "-0.32%"
          }
        ],
        
        insights: "Strong alpha generation driven by technology overweight and stock selection, particularly NVDA. AAPL underperformance offset some gains."
      },
    },
    
    // RISK_REGIME_MONITOR
    {
      id: randomUUID(),
      agentType: "RISK_REGIME_MONITOR",
      ticker: null,
      prompt: "Assess current market risk regime",
      response: {
        currentRegime: "MODERATE VOLATILITY",
        regimeScore: 58,
        lastUpdate: "October 24, 2025",
        
        indicators: {
          vix: {
            current: 18.5,
            status: "MODERATE",
            trend: "Increasing from 14.2 30 days ago"
          },
          creditSpreads: {
            current: "125 bps",
            status: "NORMAL",
            trend: "Stable"
          },
          equityCorrelations: {
            current: 0.42,
            status: "MODERATE",
            trend: "Increasing dispersion"
          },
          rateVolatility: {
            current: "MOVE Index 95",
            status: "MODERATE",
            trend: "Elevated"
          }
        },
        
        riskSignals: [
          "VIX rising to 18.5 from 14.2 (30-day)",
          "Rate volatility elevated on Fed uncertainty",
          "Equity correlations increasing slightly"
        ],
        
        portfolioImplications: [
          "Consider reducing beta from 1.32 to 1.15",
          "Increase cash allocation from 2% to 5%",
          "Trim high-beta positions (TSLA, NVDA) on strength",
          "Add defensive sectors (healthcare, utilities)"
        ],
        
        scenarioProbabilities: {
          continuedGrowth: "55%",
          volatilitySpike: "30%",
          marketCorrection: "15%"
        },
        
        recommendation: "MODERATE CAUTION - Reduce portfolio beta and build cash reserves. Volatility likely to increase into year-end."
      },
    },
  ]);

  console.log("✅ Seeded agent responses");

  // Seed Financial Models (DCF)
  await db.insert(financialModels).values([
    {
      id: randomUUID(),
      ticker: "TSLA",
      modelType: "DCF",
      createdBy: "Michael Torres",
      bullCase: JSON.stringify({
        targetPrice: 380,
        irr: 42.5,
        revenueGrowth: "30% CAGR (2025-2027)",
        operatingMargin: "16%",
        terminalGrowth: "4%",
        wacc: "9%"
      }),
      baseCase: JSON.stringify({
        targetPrice: 310,
        irr: 26.1,
        revenueGrowth: "22% CAGR (2025-2027)",
        operatingMargin: "13%",
        terminalGrowth: "3%",
        wacc: "10%"
      }),
      bearCase: JSON.stringify({
        targetPrice: 195,
        irr: -6.5,
        revenueGrowth: "12% CAGR (2025-2027)",
        operatingMargin: "9%",
        terminalGrowth: "2%",
        wacc: "11.5%"
      }),
      assumptions: JSON.stringify({
        evDeliveries: "2.8M units by 2027 (base case)",
        energyStorage: "180 GWh deployments (20% of revenue)",
        services: "$25B revenue (FSD subscriptions)",
        automotive: "$145B revenue",
        sensitivity: {
          wacc: "±1% changes price by ±18%",
          terminalGrowth: "±0.5% changes price by ±10%",
          operatingMargin: "±2% changes price by ±15%"
        }
      }),
    },
  ]);

  console.log("✅ Seeded financial models");

  // Seed Thesis Monitors
  await db.insert(thesisMonitors).values([
    {
      id: randomUUID(),
      ticker: "AAPL",
      positionId: positionData[2].id,
      healthStatus: "WARNING",
      lastCheck: new Date(),
      alerts: {
        items: [
          "iPhone revenue growth decelerated to 1.5% YoY in Q3 vs 8% expected",
          "Services growth slowing from 16% to 12% YoY",
          "China revenue down 6.5% YoY amid competitive pressure",
        ],
      },
      recommendations: "Consider trimming position if Q4 guidance disappoints. Monitor China demand closely.",
    },
  ]);

  console.log("✅ Seeded thesis monitors");

  // Seed Market Events
  await db.insert(marketEvents).values([
    {
      id: randomUUID(),
      ticker: "NVDA",
      eventType: "EARNINGS",
      severity: "MEDIUM",
      description: "NVDA reported Q3 earnings with revenue of $35.1B (+94% YoY), beating estimates of $33.2B. Data center revenue up 112% to $30.8B.",
      impact: "Positive: Confirms AI infrastructure demand remains robust. Hopper and Blackwell chips showing strong adoption.",
      portfolioImpact: "2850000",
    },
    {
      id: randomUUID(),
      ticker: "AAPL",
      eventType: "NEWS",
      severity: "HIGH",
      description: "DOJ antitrust lawsuit filed against Apple App Store practices, seeking to force opening of iOS ecosystem to alternative app stores.",
      impact: "Negative: Services revenue at risk if forced to allow sideloading. Could reduce App Store take rate from 30% to 15%.",
      portfolioImpact: "-420000",
    },
    {
      id: randomUUID(),
      ticker: null,
      eventType: "MACRO",
      severity: "CRITICAL",
      description: "Federal Reserve signals potential pause in rate cuts as inflation remains sticky at 2.8%. 10-year Treasury yields spike to 4.7%.",
      impact: "Negative: Higher discount rates compress growth stock valuations. Rotation from tech to value sectors likely.",
      portfolioImpact: "-3200000",
    },
  ]);

  console.log("✅ Seeded market events");

  // Seed notifications
  await db.insert(notifications).values([
    {
      id: randomUUID(),
      type: "THESIS_ALERT",
      severity: "CRITICAL",
      title: "Thesis Alert: TSLA",
      message: "TSLA thesis health is now ALERT. Elevated competition risk, margin compression detected. Review recommended.",
      ticker: "TSLA",
      isRead: false,
      actionUrl: "/monitoring?ticker=TSLA",
    },
    {
      id: randomUUID(),
      type: "MARKET_EVENT",
      severity: "WARNING",
      title: "Market Event: Portfolio",
      message: "MACRO detected - Federal Reserve signals potential pause in rate cuts as inflation remains sticky at 2.8%.",
      isRead: false,
      actionUrl: "/monitoring",
    },
    {
      id: randomUUID(),
      type: "IC_VOTE",
      severity: "INFO",
      title: "New Vote: NVDA",
      message: "Michael Kim voted APPROVE on NVDA proposal",
      ticker: "NVDA",
      isRead: false,
      actionUrl: "/ic-meeting",
    },
    {
      id: randomUUID(),
      type: "THESIS_ALERT",
      severity: "WARNING",
      title: "Thesis Alert: GOOGL",
      message: "GOOGL thesis health is now WARNING. Regulatory headwinds increasing. Monitor closely.",
      ticker: "GOOGL",
      isRead: false,
      actionUrl: "/monitoring?ticker=GOOGL",
    },
  ]);

  console.log("✅ Seeded notifications");
  console.log("🎉 Database seeding complete!");
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log("✨ Seeding finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seed };
