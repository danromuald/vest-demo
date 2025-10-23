import { openai } from "../lib/openai";
import type {
  ResearchBrief,
  DCFModel,
  ContrarianAnalysis,
  ScenarioAnalysis,
  ThesisHealthReport,
  FactorAnalysis,
  MarketEventReport,
  InvestmentMemo,
} from "@shared/schema";

export class AgentService {
  // Research Synthesizer Agent
  async generateResearchBrief(ticker: string): Promise<ResearchBrief> {
    try {
      const prompt = `You are an expert investment analyst. Generate a comprehensive research brief for ${ticker}.

Include:
1. Executive summary of the company and investment thesis
2. Key financial metrics (revenue, growth, margins, valuation)
3. Key strengths (3-4 bullet points)
4. Key risks (3-4 bullet points)
5. Recommendation (BUY, HOLD, or SELL)

Return ONLY valid JSON matching this exact structure:
{
  "ticker": "${ticker}",
  "companyName": "Company full name",
  "summary": "2-3 sentence executive summary",
  "keyMetrics": {
    "revenue": "e.g., $120B TTM",
    "growth": "e.g., +45% YoY",
    "margins": "e.g., 65% gross",
    "valuation": "e.g., 28x P/E"
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "recommendation": "BUY"
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content) as ResearchBrief;
    } catch (error) {
      console.error("Error generating research brief:", error);
      throw error;
    }
  }

  // Financial Modeler Agent
  async generateDCFModel(ticker: string): Promise<DCFModel> {
    try {
      const prompt = `You are an expert financial modeler. Generate a DCF valuation model for ${ticker} with three scenarios.

Include bull case, base case, and bear case with target prices, IRRs, and key assumptions.

Return ONLY valid JSON matching this exact structure:
{
  "ticker": "${ticker}",
  "scenarios": {
    "bull": {
      "price": 1200,
      "irr": 18.5,
      "assumptions": "50% revenue CAGR, 70% margins, premium multiple"
    },
    "base": {
      "price": 950,
      "irr": 12.3,
      "assumptions": "30% revenue CAGR, 65% margins, market multiple"
    },
    "bear": {
      "price": 650,
      "irr": -5.2,
      "assumptions": "15% revenue CAGR, 55% margins, discount multiple"
    }
  },
  "wacc": 10.5,
  "terminalGrowth": 3.0
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 1024,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content) as DCFModel;
    } catch (error) {
      console.error("Error generating DCF model:", error);
      throw error;
    }
  }

  // Contrarian Agent
  async generateContrarianAnalysis(ticker: string): Promise<ContrarianAnalysis> {
    try {
      const prompt = `You are a contrarian investment analyst. Generate a structured bear case analysis for ${ticker}.

Include:
1. Bear case summary (what could go wrong)
2. Historical precedents (2-3 similar situations)
3. Quantified downside price target
4. Probability assessment
5. Key risks

Return ONLY valid JSON matching this exact structure:
{
  "ticker": "${ticker}",
  "bearCase": "Detailed bear case narrative explaining what could go wrong",
  "historicalPrecedents": [
    "Intel's margin compression 2018-2020 during datacenter competition",
    "Cisco's revenue decline during telecom bubble burst 2000-2002"
  ],
  "quantifiedDownside": "$450",
  "probabilityAssessment": "30% over 3 years",
  "keyRisks": ["risk 1", "risk 2", "risk 3"]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content) as ContrarianAnalysis;
    } catch (error) {
      console.error("Error generating contrarian analysis:", error);
      throw error;
    }
  }

  // Scenario Simulator Agent
  async generateScenarioAnalysis(
    ticker: string,
    proposedWeight: number
  ): Promise<ScenarioAnalysis> {
    try {
      const prompt = `You are a portfolio risk analyst. Analyze the impact of adding ${ticker} at ${proposedWeight}% portfolio weight.

Compare current portfolio vs projected portfolio after adding this position.

Return ONLY valid JSON matching this exact structure:
{
  "proposedWeight": ${proposedWeight},
  "currentPortfolio": {
    "trackingError": 2.1,
    "concentration": 18.5,
    "factorExposures": {
      "growth": 0.65,
      "momentum": 0.42,
      "quality": 0.58
    }
  },
  "projectedPortfolio": {
    "trackingError": 2.35,
    "concentration": 21.2,
    "factorExposures": {
      "growth": 0.72,
      "momentum": 0.48,
      "quality": 0.61
    }
  },
  "riskMetrics": {
    "withinLimits": true,
    "warnings": []
  }
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 1024,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content) as ScenarioAnalysis;
    } catch (error) {
      console.error("Error generating scenario analysis:", error);
      throw error;
    }
  }

  // Thesis Monitor Agent
  async generateThesisHealthReport(ticker: string): Promise<ThesisHealthReport> {
    try {
      const prompt = `You are a thesis monitoring analyst. Assess the health of the investment thesis for ${ticker}.

Evaluate:
1. Current status (HEALTHY, WARNING, or ALERT)
2. Summary of thesis health
3. Key concerns (if any)
4. Thesis drift score (0-100, where 0 = on track, 100 = complete deviation)
5. Recommendation (HOLD, REVIEW, or SELL)

Return ONLY valid JSON matching this exact structure:
{
  "ticker": "${ticker}",
  "status": "WARNING",
  "summary": "Thesis remains largely intact but customer concentration risk materializing as expected",
  "keyConcerns": [
    "Microsoft reducing AI capex growth rate",
    "Increased competition from custom silicon",
    "Valuation multiple expansion beyond historical norms"
  ],
  "thesisDrift": 25,
  "recommendation": "HOLD"
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 1024,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content) as ThesisHealthReport;
    } catch (error) {
      console.error("Error generating thesis health report:", error);
      throw error;
    }
  }

  // Quant Analyst Agent
  async generateFactorAnalysis(ticker: string): Promise<FactorAnalysis> {
    try {
      const prompt = `You are a quantitative analyst. Generate a comprehensive factor analysis for ${ticker}.

Analyze:
1. Factor exposures (growth, value, momentum, quality, size, volatility)
2. Statistical metrics (sharpe ratio, beta, alpha, volatility)
3. Correlation with portfolio
4. Risk-adjusted returns
5. Overall quant score (0-100)

Return ONLY valid JSON matching this exact structure:
{
  "ticker": "${ticker}",
  "factorExposures": {
    "growth": 0.85,
    "value": 0.15,
    "momentum": 0.72,
    "quality": 0.88,
    "size": 0.95,
    "volatility": 0.45
  },
  "statisticalMetrics": {
    "sharpeRatio": 1.85,
    "beta": 1.25,
    "alpha": 5.2,
    "volatility": 28.5
  },
  "portfolioCorrelation": 0.65,
  "riskAdjustedReturn": 15.3,
  "quantScore": 82,
  "summary": "Strong momentum and quality characteristics with elevated volatility"
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 1024,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content) as FactorAnalysis;
    } catch (error) {
      console.error("Error generating factor analysis:", error);
      throw error;
    }
  }

  // Market Event Monitor Agent
  async generateMarketEventReport(ticker: string): Promise<MarketEventReport> {
    try {
      const prompt = `You are a market monitoring analyst. Generate a real-time market event report for ${ticker}.

Include:
1. Recent price movements and triggers
2. News events impacting the stock
3. Analyst rating changes
4. Volume and technical alerts
5. Severity level (LOW, MEDIUM, HIGH, CRITICAL)

Return ONLY valid JSON matching this exact structure:
{
  "ticker": "${ticker}",
  "priceMovement": {
    "current": 185.50,
    "change": -3.2,
    "changePercent": -1.69,
    "trigger": "Earnings miss"
  },
  "newsEvents": [
    "Q3 earnings below estimates; revenue guidance reduced",
    "CFO departure announced",
    "Major customer contract renewal delayed"
  ],
  "analystChanges": [
    "Morgan Stanley downgrade from Overweight to Equal Weight",
    "JP Morgan cuts target from $210 to $175"
  ],
  "technicalAlerts": [
    "Broke 200-day moving average",
    "Volume 2.5x average"
  ],
  "severity": "HIGH",
  "recommendation": "Review position immediately; thesis may be compromised"
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content) as MarketEventReport;
    } catch (error) {
      console.error("Error generating market event report:", error);
      throw error;
    }
  }

  // Document Generator Agent
  async generateInvestmentMemo(ticker: string, proposalData: any): Promise<InvestmentMemo> {
    try {
      const prompt = `You are a professional investment memo writer. Generate a comprehensive investment memo for ${ticker}.

Include:
1. Executive summary
2. Investment thesis
3. Valuation analysis
4. Risk factors
5. Recommendation with target price and timeframe

Use this proposal data: ${JSON.stringify(proposalData, null, 2)}

Return ONLY valid JSON matching this exact structure:
{
  "ticker": "${ticker}",
  "title": "Investment Memorandum: ${ticker}",
  "executiveSummary": "2-3 paragraph executive summary",
  "investmentThesis": "Detailed multi-paragraph investment thesis",
  "valuationAnalysis": "Comprehensive valuation framework with DCF, comparables, and precedent transactions",
  "riskFactors": [
    "Competitive pressure from established players",
    "Regulatory uncertainty in key markets",
    "Execution risk on new product launches"
  ],
  "recommendation": {
    "action": "BUY",
    "targetPrice": 250,
    "timeframe": "12 months",
    "conviction": "HIGH"
  },
  "preparedBy": "Investment Committee",
  "date": "${new Date().toISOString().split('T')[0]}"
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 4096,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content) as InvestmentMemo;
    } catch (error) {
      console.error("Error generating investment memo:", error);
      throw error;
    }
  }

  async generateComplianceReport(ticker: string, proposalId: string): Promise<import('@shared/schema').ComplianceReport> {
    try {
      const prompt = `You are a compliance officer. Generate a comprehensive compliance report for ${ticker} (Proposal ID: ${proposalId}).

Include:
1. Compliance checks (position limits, sector concentration, regulatory restrictions, conflicts of interest)
2. Any violations found
3. Severity assessment
4. Remediation steps
5. Whether additional approval is required

Return ONLY valid JSON matching this exact structure:
{
  "ticker": "${ticker}",
  "proposalId": "${proposalId}",
  "complianceChecks": {
    "positionLimits": { "passed": true, "detail": "Position size 5.2% within 10% single-name limit" },
    "sectorConcentration": { "passed": true, "detail": "Technology sector 28% within 35% limit" },
    "regulatoryRestrictions": { "passed": true, "detail": "No restricted securities or insider holdings" },
    "conflictOfInterest": { "passed": true, "detail": "No conflicts identified" }
  },
  "violations": [],
  "severity": "LOW",
  "remediation": [],
  "approvalRequired": false,
  "recommendation": "Proposal meets all compliance requirements and is approved for execution"
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content);
    } catch (error) {
      console.error("Error generating compliance report:", error);
      throw error;
    }
  }

  async generateMeetingMinutes(meetingId: string): Promise<import('@shared/schema').MeetingMinutes> {
    try {
      const prompt = `You are an IC meeting secretary. Generate comprehensive meeting minutes for meeting ID: ${meetingId}.

Include:
1. Meeting date and attendees
2. Proposals reviewed with decisions and vote tallies
3. Key discussion points
4. Action items with assignments and due dates
5. Next meeting date

Return ONLY valid JSON matching this exact structure:
{
  "meetingId": "${meetingId}",
  "date": "${new Date().toISOString().split('T')[0]}",
  "attendees": ["Sarah Chen - Technology Analyst", "Michael Torres - Portfolio Manager", "Lisa Park - Risk Officer", "David Kim - Head of Research"],
  "proposalsReviewed": [
    {
      "ticker": "AAPL",
      "proposalId": "prop-123",
      "decision": "APPROVED",
      "voteSummary": { "for": 3, "against": 0, "abstain": 1 }
    }
  ],
  "keyDiscussionPoints": [
    "Strong revenue growth and margin expansion justify 5% position",
    "Services segment provides recurring revenue stream",
    "Risk mitigated by diversified product portfolio"
  ],
  "actionItems": [
    {
      "description": "Execute AAPL purchase order via TWAP over 3 days",
      "assignedTo": "Trading Desk",
      "dueDate": "${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
    }
  ],
  "nextMeetingDate": "${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 3072,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content);
    } catch (error) {
      console.error("Error generating meeting minutes:", error);
      throw error;
    }
  }

  async generateTradeOrder(ticker: string, proposalId: string, proposalData: any): Promise<import('@shared/schema').TradeOrder> {
    try {
      const prompt = `You are a trade execution specialist. Generate a detailed trade order for ${ticker} (Proposal ID: ${proposalId}).

Proposal data: ${JSON.stringify(proposalData, null, 2)}

Include:
1. Order type (BUY/SELL) and shares
2. Target price and execution strategy
3. Estimated cost
4. Risk parameters (max slippage, stop loss)
5. Execution instructions

Return ONLY valid JSON matching this exact structure:
{
  "ticker": "${ticker}",
  "proposalId": "${proposalId}",
  "orderType": "BUY",
  "shares": 5000,
  "targetPrice": 185.50,
  "orderStrategy": "TWAP",
  "timeframe": "3 days",
  "estimatedCost": 927500,
  "riskParameters": {
    "maxSlippage": 0.5,
    "stopLoss": 175.00
  },
  "executionInstructions": [
    "Execute via TWAP algorithm over 3 trading days",
    "Target 30% of average daily volume",
    "Avoid first/last 30 minutes of trading day",
    "Monitor order flow for adverse selection"
  ],
  "generatedAt": "${new Date().toISOString()}"
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content);
    } catch (error) {
      console.error("Error generating trade order:", error);
      throw error;
    }
  }

  async generatePreTradeRisk(ticker: string, proposalId: string, proposedShares: number): Promise<import('@shared/schema').PreTradeRiskReport> {
    try {
      const prompt = `You are a risk analyst. Generate a pre-trade risk assessment for ${ticker} (Proposal ID: ${proposalId}, Proposed Shares: ${proposedShares}).

Include:
1. Proposed weight and portfolio impact
2. Risk metrics (VaR, beta, correlation)
3. Any limit breaches
4. Overall risk rating
5. Recommendation

Return ONLY valid JSON matching this exact structure:
{
  "ticker": "${ticker}",
  "proposalId": "${proposalId}",
  "proposedShares": ${proposedShares},
  "proposedWeight": 5.2,
  "portfolioImpact": {
    "newPortfolioWeight": 5.2,
    "sectorConcentration": 28.5,
    "factorExposureChange": "Growth +0.15, Quality +0.08",
    "trackingErrorChange": 0.35
  },
  "riskMetrics": {
    "varImpact": 125000,
    "betaContribution": 0.08,
    "correlationToPortfolio": 0.72
  },
  "limitBreaches": [],
  "riskRating": "MEDIUM",
  "recommendation": "Position size within acceptable risk parameters. Monitor sector concentration."
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      return JSON.parse(content);
    } catch (error) {
      console.error("Error generating pre-trade risk report:", error);
      throw error;
    }
  }
}

export const agentService = new AgentService();
