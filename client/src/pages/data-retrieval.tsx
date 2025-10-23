import { AgentPlaceholder } from "./agent-placeholder";

export default function DataRetrievalPage() {
  return (
    <AgentPlaceholder
      agentName="Data Retrieval"
      description="Historical precedent transactions, comparable deals, and historical data with relevance scoring and insights"
      endpoint="/api/agents/data-retrieval"
      apiMethod="POST"
    />
  );
}
