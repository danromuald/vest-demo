import { AgentPlaceholder } from "./agent-placeholder";

export default function RiskReportsPage() {
  return (
    <AgentPlaceholder
      agentName="Risk Reports"
      description="Pre-trade risk analysis with portfolio impact, VaR, beta contribution, limit breach detection, and risk ratings"
      endpoint="/api/agents/risk-reporter"
      apiMethod="POST"
    />
  );
}
