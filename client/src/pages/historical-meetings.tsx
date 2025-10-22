import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Users, TrendingUp, Clock, Search, Download, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { ICMeeting, Proposal, Vote } from "@shared/schema";
import { format } from "date-fns";

export default function HistoricalMeetings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);

  const { data: meetings = [] } = useQuery<ICMeeting[]>({
    queryKey: ['/api/ic-meetings'],
  });

  const { data: proposals = [] } = useQuery<Proposal[]>({
    queryKey: ['/api/proposals'],
  });

  const { data: votes = [] } = useQuery<Vote[]>({
    queryKey: ['/api/votes'],
  });

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.agenda?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedMeetingData = selectedMeeting
    ? meetings.find(m => m.id === selectedMeeting)
    : null;

  const meetingProposals = selectedMeetingData
    ? proposals.filter(p => p.icMeetingId === selectedMeeting)
    : [];

  const meetingVotes = selectedMeetingData
    ? votes.filter(v => meetingProposals.some(p => p.id === v.proposalId))
    : [];

  const exportMeetingMinutes = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/export/meeting-minutes/${meetingId}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to export");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-minutes-${meetingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
      {/* Meetings List */}
      <Card className="w-96 flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historical Meetings
          </CardTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-meetings"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden px-3">
          <ScrollArea className="h-full">
            {filteredMeetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No meetings found</p>
              </div>
            ) : (
              <div className="space-y-2 pr-3">
                {filteredMeetings.map((meeting) => (
                  <button
                    key={meeting.id}
                    onClick={() => setSelectedMeeting(meeting.id)}
                    className={`w-full text-left rounded-md p-3 border transition-colors ${
                      selectedMeeting === meeting.id
                        ? "bg-primary/10 border-primary"
                        : "hover-elevate"
                    }`}
                    data-testid={`button-meeting-${meeting.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-sm line-clamp-1">{meeting.title}</span>
                      <Badge variant={meeting.status === "COMPLETED" ? "default" : "secondary"} className="ml-2 shrink-0">
                        {meeting.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(meeting.meetingDate!), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Users className="h-3 w-3" />
                      <span>{meeting.attendees?.length || 0} attendees</span>
                      <span>•</span>
                      <FileText className="h-3 w-3" />
                      <span>{proposals.filter(p => p.icMeetingId === meeting.id).length} proposals</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Meeting Details */}
      <Card className="flex-1 flex flex-col">
        {!selectedMeetingData ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Select a meeting</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a meeting from the sidebar to view details
              </p>
            </div>
          </div>
        ) : (
          <>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold">{selectedMeetingData.title}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(selectedMeetingData.meetingDate!), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedMeetingData.attendees?.length || 0} attendees</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportMeetingMinutes(selectedMeetingData.id)}
                  data-testid="button-export-minutes"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <Tabs defaultValue="overview" className="h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b px-6 bg-transparent">
                  <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                  <TabsTrigger value="proposals" data-testid="tab-proposals">
                    Proposals ({meetingProposals.length})
                  </TabsTrigger>
                  <TabsTrigger value="decisions" data-testid="tab-decisions">Decisions</TabsTrigger>
                  <TabsTrigger value="minutes" data-testid="tab-minutes">Minutes</TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1">
                  <TabsContent value="overview" className="p-6 mt-0 space-y-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Agenda</h3>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
                        {selectedMeetingData.agenda || "No agenda available"}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Attendees</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedMeetingData.attendees?.map((attendee, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-3 p-3 border border-border rounded-md"
                            data-testid={`attendee-${index}`}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                              {attendee.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-foreground">{attendee}</span>
                          </div>
                        )) || <p className="text-sm text-muted-foreground col-span-2">No attendees recorded</p>}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Meeting Outcome</h3>
                      <Badge variant={selectedMeetingData.status === "COMPLETED" ? "default" : "secondary"}>
                        {selectedMeetingData.status}
                      </Badge>
                    </div>
                  </TabsContent>

                  <TabsContent value="proposals" className="p-6 mt-0 space-y-4">
                    {meetingProposals.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground">No proposals in this meeting</p>
                      </div>
                    ) : (
                      meetingProposals.map((proposal) => {
                        const proposalVotes = meetingVotes.filter(v => v.proposalId === proposal.id);
                        const approveCount = proposalVotes.filter(v => v.decision === "APPROVE").length;
                        const rejectCount = proposalVotes.filter(v => v.decision === "REJECT").length;
                        
                        return (
                          <Card key={proposal.id} data-testid={`proposal-card-${proposal.id}`}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <CardTitle className="text-base">{proposal.ticker}</CardTitle>
                                    <Badge variant={proposal.recommendation === "BUY" ? "default" : "secondary"}>
                                      {proposal.recommendation}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{proposal.proposalType}</p>
                                </div>
                                <Badge variant={proposal.status === "APPROVED" ? "default" : "destructive"}>
                                  {proposal.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Target Price</span>
                                  <p className="font-semibold text-foreground">${parseFloat(proposal.targetPrice).toFixed(2)}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Upside</span>
                                  <p className="font-semibold text-green-500">{parseFloat(proposal.upside).toFixed(1)}%</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Conviction</span>
                                  <p className="font-semibold text-foreground">{proposal.conviction}/5</p>
                                </div>
                              </div>

                              <div>
                                <span className="text-sm text-muted-foreground">Voting Results</span>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <span className="text-sm">{approveCount} Approve</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-destructive" />
                                    <span className="text-sm">{rejectCount} Reject</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm font-medium text-foreground mb-2">Thesis</p>
                                <p className="text-sm text-muted-foreground line-clamp-3">{proposal.thesis}</p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </TabsContent>

                  <TabsContent value="decisions" className="p-6 mt-0 space-y-4">
                    <div className="space-y-3">
                      {selectedMeetingData.decisions?.map((decision, index) => (
                        <div 
                          key={index}
                          className="p-4 border border-border rounded-md hover-elevate"
                          data-testid={`decision-${index}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground">{decision}</p>
                            </div>
                          </div>
                        </div>
                      )) || <p className="text-sm text-muted-foreground">No decisions recorded</p>}
                    </div>

                    {meetingProposals.length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <h3 className="font-semibold text-foreground mb-3">Portfolio Impact</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {meetingProposals.map((proposal) => (
                            <Link key={proposal.id} href="/monitoring">
                              <div className="flex items-center justify-between p-3 border border-border rounded-md hover-elevate cursor-pointer">
                                <div>
                                  <p className="text-sm font-medium text-foreground">{proposal.ticker}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {proposal.status === "APPROVED" ? "Added to monitoring" : "Not executed"}
                                  </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="minutes" className="p-6 mt-0">
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-muted/50 p-6 rounded-md whitespace-pre-wrap text-sm text-foreground">
                        {selectedMeetingData.minutes || "No meeting minutes available"}
                      </div>
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
