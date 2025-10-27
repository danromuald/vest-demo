import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, User, FileDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Proposal, ICMeeting } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Documents() {
  const { toast } = useToast();

  // Fetch proposals and IC meetings
  const { data: proposals = [] } = useQuery<Proposal[]>({
    queryKey: ['/api/proposals'],
  });

  const { data: meetings = [] } = useQuery<ICMeeting[]>({
    queryKey: ['/api/ic-meetings'],
  });

  const handleExportInvestmentMemo = (proposalId: string) => {
    const url = `/api/export/investment-memo/${proposalId}`;
    window.open(url, '_blank');
    toast({
      title: "Export Started",
      description: "Investment memo PDF is being generated",
    });
  };

  const handleExportMeetingMinutes = (meetingId: string) => {
    const url = `/api/export/meeting-minutes/${meetingId}`;
    window.open(url, '_blank');
    toast({
      title: "Export Started",
      description: "Meeting minutes PDF is being generated",
    });
  };

  const handleExportPortfolioSummary = () => {
    const url = `/api/export/portfolio-summary`;
    window.open(url, '_blank');
    toast({
      title: "Export Started",
      description: "Portfolio summary PDF is being generated",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
          Documents
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-generated investment memos, meeting minutes, and reports
        </p>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold font-mono text-foreground">24</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold font-mono text-foreground">4</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Investment Memos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold font-mono text-foreground">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Meeting Minutes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold font-mono text-foreground">8</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Quick Exports</CardTitle>
          <CardDescription>Generate PDF documents with one click</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExportPortfolioSummary}
              variant="default"
              data-testid="button-export-portfolio"
            >
              <FileDown className="h-4 w-4" />
              Export Portfolio Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Investment Memos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Investment Memos</CardTitle>
          <CardDescription>Export proposals as formatted PDF memos</CardDescription>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proposals available</p>
          ) : (
            <div className="space-y-3">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {proposal.ticker} - {proposal.companyName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {proposal.analyst} • {proposal.proposalType}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportInvestmentMemo(proposal.id)}
                    data-testid={`button-export-memo-${proposal.ticker}`}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Minutes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Meeting Minutes</CardTitle>
          <CardDescription>Export IC meeting records as PDF</CardDescription>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No meetings available</p>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        IC Meeting - {new Date(meeting.meetingDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: {meeting.status} • {meeting.attendees?.length || 0} attendees
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportMeetingMinutes(meeting.id)}
                    data-testid={`button-export-minutes-${meeting.id}`}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
