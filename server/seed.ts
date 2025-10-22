import { db } from "./db";
import {
  companies, positions, proposals, icMeetings, votes, marketEvents, thesisMonitors, notifications
} from "@shared/schema";
import { randomUUID } from "crypto";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(notifications);
  await db.delete(votes);
  await db.delete(marketEvents);
  await db.delete(thesisMonitors);
  await db.delete(proposals);
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
