import { openai } from "../lib/openai";
import type {
  ResearchBrief,
  DCFModel,
  ContrarianAnalysis,
  ScenarioAnalysis,
  ThesisHealthReport,
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
}

export const agentService = new AgentService();
