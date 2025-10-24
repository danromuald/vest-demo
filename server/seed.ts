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
    {
      id: randomUUID(),
      agentType: "RESEARCH_SYNTHESIZER",
      ticker: "TSLA",
      prompt: "Generate comprehensive research brief for TSLA including key metrics, strengths, concerns, and recommendation",
      response: JSON.stringify({
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
      }),
    },
    {
      id: randomUUID(),
      agentType: "RESEARCH_SYNTHESIZER",
      ticker: "GOOGL",
      prompt: "Generate comprehensive research brief for GOOGL including key metrics, strengths, concerns, and recommendation",
      response: JSON.stringify({
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
      }),
    },
    {
      id: randomUUID(),
      agentType: "CONTRARIAN",
      ticker: "TSLA",
      prompt: "Provide contrarian bear case analysis for TSLA including key risks and counterarguments",
      response: JSON.stringify({
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
      }),
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
