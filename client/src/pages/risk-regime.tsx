import { AgentPlaceholder } from "./agent-placeholder";

export default function RiskRegimePage() {
  return (
    <AgentPlaceholder
      agentName="Risk Regime Monitor"
      description="Continuous risk regime tracking (LOW/MODERATE/HIGH/CRISIS volatility) with market indicators and portfolio adjustments"
      endpoint="/api/agents/risk-regime-monitor"
      apiMethod="POST"
    />
  );
}
