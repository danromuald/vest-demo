import { AgentPlaceholder } from "./agent-placeholder";

export default function AttributionReportsPage() {
  return (
    <AgentPlaceholder
      agentName="Attribution Reports"
      description="Performance attribution analysis with asset allocation, stock selection, top contributors, and detractors"
      endpoint="/api/agents/attribution-analyst"
      apiMethod="POST"
    />
  );
}
