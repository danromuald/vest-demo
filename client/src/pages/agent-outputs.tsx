import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Search, FileText, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import type { AgentResponse } from "@shared/schema";
import { format } from "date-fns";

export default function AgentOutputs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);

  const { data: agentOutputs = [] } = useQuery<AgentResponse[]>({
    queryKey: ['/api/agent-responses'],
  });

  // Get unique agent types from actual data
  const uniqueAgentTypes = Array.from(new Set(agentOutputs.map(r => r.agentType)));
  
  // Helper to convert agent type to display name
  const formatAgentName = (agentType: string) => {
    return agentType.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };
  
  const agentTypes = [
    { id: "all", label: "All Agents" },
    ...uniqueAgentTypes.map(type => ({
      id: type,
      label: formatAgentName(type)
    }))
  ];

  const filteredOutputs = agentOutputs.filter(output => {
    const matchesSearch = output.ticker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         output.prompt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAgent = selectedAgent === "all" || output.agentType === selectedAgent;
    return matchesSearch && matchesAgent;
  });

  const selectedOutputData = selectedOutput
    ? agentOutputs.find(o => o.id === selectedOutput)
    : null;

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case "RESEARCH_SYNTHESIZER": return <FileText className="h-4 w-4" />;
      case "DCF_MODELER": return <TrendingUp className="h-4 w-4" />;
      case "CONTRARIAN": return <AlertTriangle className="h-4 w-4" />;
      case "SCENARIO_SIMULATOR": return <TrendingUp className="h-4 w-4" />;
      case "THESIS_MONITOR": return <Clock className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getAgentColor = (agentType: string) => {
    switch (agentType) {
      case "RESEARCH_SYNTHESIZER": return "bg-blue-500/10 text-blue-500";
      case "DCF_MODELER": return "bg-green-500/10 text-green-500";
      case "CONTRARIAN": return "bg-orange-500/10 text-orange-500";
      case "SCENARIO_SIMULATOR": return "bg-purple-500/10 text-purple-500";
      case "THESIS_MONITOR": return "bg-teal-500/10 text-teal-500";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
      {/* Agent Outputs List */}
      <Card className="w-96 flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Agent Outputs
          </CardTitle>
          <div className="space-y-3 mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search outputs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-outputs"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {agentTypes.map((agent) => (
                <Button
                  key={agent.id}
                  variant={selectedAgent === agent.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAgent(agent.id)}
                  data-testid={`button-filter-${agent.id}`}
                  className="text-xs"
                >
                  {agent.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden px-3">
          <ScrollArea className="h-full">
            {filteredOutputs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bot className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No agent outputs found</p>
              </div>
            ) : (
              <div className="space-y-2 pr-3">
                {filteredOutputs.map((output) => (
                  <button
                    key={output.id}
                    onClick={() => setSelectedOutput(output.id)}
                    className={`w-full text-left rounded-md p-3 border transition-colors ${
                      selectedOutput === output.id
                        ? "bg-primary/10 border-primary"
                        : "hover-elevate"
                    }`}
                    data-testid={`button-output-${output.id}`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${getAgentColor(output.agentType)}`}>
                        {getAgentIcon(output.agentType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{output.ticker}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{output.prompt?.substring(0, 100)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(output.generatedAt!), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Output Details */}
      <Card className="flex-1 flex flex-col">
        {!selectedOutputData ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Select an agent output</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose an output from the sidebar to view details
              </p>
            </div>
          </div>
        ) : (
          <>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${getAgentColor(selectedOutputData.agentType)}`}>
                    {getAgentIcon(selectedOutputData.agentType)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold">{selectedOutputData.ticker}</CardTitle>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>{selectedOutputData.agentType.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>{format(new Date(selectedOutputData.generatedAt!), 'MMMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <Tabs defaultValue="summary" className="h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b px-6 bg-transparent">
                  <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
                  <TabsTrigger value="detailed" data-testid="tab-detailed">Detailed Analysis</TabsTrigger>
                  <TabsTrigger value="context" data-testid="tab-context">Context</TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1">
                  <TabsContent value="summary" className="p-6 mt-0 space-y-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Request Prompt</h3>
                      <div className="text-sm text-foreground bg-muted/50 p-4 rounded-md whitespace-pre-wrap">
                        {selectedOutputData.prompt}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="detailed" className="p-6 mt-0">
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-muted/50 p-6 rounded-md">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                          {JSON.stringify(selectedOutputData.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="context" className="p-6 mt-0 space-y-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Response Metadata</h3>
                      <dl className="space-y-3">
                        <div className="flex gap-4">
                          <dt className="text-sm text-muted-foreground w-32 shrink-0">Agent Type:</dt>
                          <dd className="text-sm text-foreground">{selectedOutputData.agentType}</dd>
                        </div>
                        {selectedOutputData.ticker && (
                          <div className="flex gap-4">
                            <dt className="text-sm text-muted-foreground w-32 shrink-0">Ticker:</dt>
                            <dd className="text-sm text-foreground font-mono">{selectedOutputData.ticker}</dd>
                          </div>
                        )}
                        <div className="flex gap-4">
                          <dt className="text-sm text-muted-foreground w-32 shrink-0">Generated:</dt>
                          <dd className="text-sm text-foreground">
                            {format(new Date(selectedOutputData.generatedAt!), 'MMMM d, yyyy h:mm:ss a')}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
