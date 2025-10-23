import { AgentPlaceholder } from "./agent-placeholder";

export default function TradeOrdersPage() {
  return (
    <AgentPlaceholder
      agentName="Trade Orders"
      description="Execution ticket generation with order type, shares, strategy (MARKET/LIMIT/TWAP/VWAP), risk parameters, and detailed instructions"
      endpoint="/api/agents/trade-order-generator"
      apiMethod="POST"
    />
  );
}
