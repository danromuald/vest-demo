import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, User } from "lucide-react";

export default function Documents() {
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

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Recent Documents</CardTitle>
          <CardDescription>Generated reports and meeting artifacts</CardDescription>
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
