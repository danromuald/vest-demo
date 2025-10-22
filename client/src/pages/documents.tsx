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
  const mockDocuments = [
    {
      id: '1',
      title: 'NVDA Investment Memo',
      type: 'Investment Memo',
      createdBy: 'Sarah Chen',
      createdAt: '2025-02-20',
      status: 'Final',
      description: 'Comprehensive analysis supporting buy recommendation',
    },
    {
      id: '2',
      title: 'IC Meeting Minutes - Feb 2025',
      type: 'Meeting Minutes',
      createdBy: 'Katherine Lee',
      createdAt: '2025-02-15',
      status: 'Approved',
      description: 'Official record of February Investment Committee meeting',
    },
    {
      id: '3',
      title: 'Q1 2025 Portfolio Review',
      type: 'Portfolio Review',
      createdBy: 'Rebecca Zhang',
      createdAt: '2025-02-10',
      status: 'Draft',
      description: 'Quarterly performance attribution and positioning analysis',
    },
    {
      id: '4',
      title: 'Risk Analysis Report',
      type: 'Risk Report',
      createdBy: 'Risk Agent',
      createdAt: '2025-02-08',
      status: 'Final',
      description: 'Portfolio risk metrics and compliance check',
    },
  ];

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

      {/* Legacy Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Document Archive</CardTitle>
          <CardDescription>Previously generated reports and artifacts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-4 rounded-md border border-border p-4 hover-elevate"
                data-testid={`document-${doc.id}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        doc.status === 'Final' || doc.status === 'Approved'
                          ? 'bg-chart-2/10 text-chart-2 border-chart-2/20'
                          : 'bg-chart-4/10 text-chart-4 border-chart-4/20'
                      }
                    >
                      {doc.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3 w-3" />
                      <span>{doc.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      <span>{doc.createdBy}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" data-testid={`button-view-${doc.id}`}>
                      <FileText className="h-3 w-3" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" data-testid={`button-download-${doc.id}`}>
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
