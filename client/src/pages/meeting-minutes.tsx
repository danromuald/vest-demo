import { AgentPlaceholder } from "./agent-placeholder";

export default function MeetingMinutesPage() {
  return (
    <AgentPlaceholder
      agentName="Meeting Minutes"
      description="Automated IC meeting documentation with attendees, decisions, vote tallies, discussion points, and action items"
      endpoint="/api/agents/minutes-scribe"
      apiMethod="POST"
    />
  );
}
