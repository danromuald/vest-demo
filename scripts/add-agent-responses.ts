import { storage } from "../server/storage";

async function addAgentResponses() {
  console.log("🤖 Adding agent responses for all 16 AI agents...");
  
  try {
    //Pre-Work Agents (Research & Analysis)
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

    console.log("✅ Successfully added all 16 AI agent responses!");
  } catch (error) {
    console.error("❌ Failed to add agent responses:", error);
    throw error;
  }
}

addAgentResponses()
  .then(() => {
    console.log("👋 Script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
