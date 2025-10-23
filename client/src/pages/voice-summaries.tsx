import { AgentPlaceholder } from "./agent-placeholder";

export default function VoiceSummariesPage() {
  return (
    <AgentPlaceholder
      agentName="Voice Summaries"
      description="Audio summaries of IC decisions with transcript summaries and key points"
      endpoint="/api/agents/voice-synthesizer"
      apiMethod="POST"
    />
  );
}
