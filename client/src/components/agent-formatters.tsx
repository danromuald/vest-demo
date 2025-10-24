import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle, 
  BarChart3, Shield, DollarSign, Target, Info 
} from "lucide-react";

// Research Brief Formatter
export function ResearchBriefDisplay({ data }: { data: any }) {
  if (!data) return null;

  let parsedData;
  try {
    parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('Failed to parse research brief data:', error);
    return (
      <div className="text-sm text-destructive" data-testid="error-parsing-data">
        Error displaying research brief. Invalid data format.
      </div>
    );
  }
  
  return (
    <div className="space-y-6" data-testid="research-brief-display">
      {/* Company Header */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2" data-testid="text-company-name">
          {parsedData.companyName || parsedData.ticker}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-summary">
          {parsedData.summary}
        </p>
      </div>

      {/* Key Metrics */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Key Metrics
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {parsedData.keyMetrics && Object.entries(parsedData.keyMetrics).map(([key, value]: [string, any]) => (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1 capitalize">{key}</div>
                <div className="text-base font-semibold text-foreground" data-testid={`metric-${key}`}>
                  {value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {parsedData.strengths && parsedData.strengths.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-chart-2" />
            Key Strengths
          </h4>
          <ul className="space-y-2">
            {parsedData.strengths.map((strength: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground" data-testid={`strength-${idx}`}>
                <span className="text-chart-2 mt-0.5">•</span>
                <span className="flex-1">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {parsedData.risks && parsedData.risks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-chart-3" />
            Key Risks
          </h4>
          <ul className="space-y-2">
            {parsedData.risks.map((risk: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground" data-testid={`risk-${idx}`}>
                <span className="text-chart-3 mt-0.5">•</span>
                <span className="flex-1">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      {parsedData.recommendation && (
        <div className="flex items-center gap-3 pt-2">
          <span className="text-sm font-medium text-muted-foreground">Recommendation:</span>
          <Badge 
            variant="default" 
            className={
              parsedData.recommendation === 'BUY' ? 'bg-chart-2 border-chart-2 text-white' :
              parsedData.recommendation === 'SELL' ? 'bg-chart-3 border-chart-3 text-white' :
              'bg-chart-4 border-chart-4 text-white'
            }
            data-testid="badge-recommendation"
          >
            {parsedData.recommendation}
          </Badge>
        </div>
      )}
    </div>
  );
}

// DCF Model Formatter
export function DCFModelDisplay({ data }: { data: any }) {
  if (!data) return null;

  let parsedData;
  try {
    parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('Failed to parse DCF model data:', error);
    return (
      <div className="text-sm text-destructive" data-testid="error-parsing-data">
        Error displaying DCF model. Invalid data format.
      </div>
    );
  }
  
  const scenarios = parsedData.scenarios || {};
  
  return (
    <div className="space-y-6" data-testid="dcf-model-display">
      {/* Scenario Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Bull Case */}
        {scenarios.bull && (
          <Card className="border-chart-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-chart-2">
                <TrendingUp className="h-4 w-4" />
                Bull Case
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Target Price</div>
                <div className="text-2xl font-bold text-foreground" data-testid="text-bull-price">
                  ${scenarios.bull.price}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">IRR</div>
                <div className="text-lg font-semibold text-chart-2" data-testid="text-bull-irr">
                  {scenarios.bull.irr}%
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Assumptions</div>
                <p className="text-xs text-foreground leading-relaxed" data-testid="text-bull-assumptions">
                  {scenarios.bull.assumptions}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Base Case */}
        {scenarios.base && (
          <Card className="border-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                <Target className="h-4 w-4" />
                Base Case
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Target Price</div>
                <div className="text-2xl font-bold text-foreground" data-testid="text-base-price">
                  ${scenarios.base.price}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">IRR</div>
                <div className="text-lg font-semibold text-primary" data-testid="text-base-irr">
                  {scenarios.base.irr}%
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Assumptions</div>
                <p className="text-xs text-foreground leading-relaxed" data-testid="text-base-assumptions">
                  {scenarios.base.assumptions}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bear Case */}
        {scenarios.bear && (
          <Card className="border-chart-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-chart-3">
                <TrendingDown className="h-4 w-4" />
                Bear Case
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Target Price</div>
                <div className="text-2xl font-bold text-foreground" data-testid="text-bear-price">
                  ${scenarios.bear.price}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">IRR</div>
                <div className="text-lg font-semibold text-chart-3" data-testid="text-bear-irr">
                  {scenarios.bear.irr}%
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Assumptions</div>
                <p className="text-xs text-foreground leading-relaxed" data-testid="text-bear-assumptions">
                  {scenarios.bear.assumptions}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Model Parameters */}
      <div className="grid grid-cols-2 gap-4">
        {parsedData.wacc !== undefined && (
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">WACC</div>
              <div className="text-xl font-bold text-foreground" data-testid="text-wacc">
                {parsedData.wacc}%
              </div>
            </CardContent>
          </Card>
        )}
        {parsedData.terminalGrowth !== undefined && (
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Terminal Growth</div>
              <div className="text-xl font-bold text-foreground" data-testid="text-terminal-growth">
                {parsedData.terminalGrowth}%
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Quant Analysis Formatter
export function QuantAnalysisDisplay({ data }: { data: any }) {
  if (!data) return null;

  let parsedData;
  try {
    parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('Failed to parse quant analysis data:', error);
    return (
      <div className="text-sm text-destructive" data-testid="error-parsing-data">
        Error displaying quant analysis. Invalid data format.
      </div>
    );
  }
  
  return (
    <div className="space-y-6" data-testid="quant-analysis-display">
      {/* Summary */}
      {parsedData.summary && (
        <div>
          <p className="text-sm text-foreground leading-relaxed" data-testid="text-summary">
            {parsedData.summary}
          </p>
        </div>
      )}

      {/* Factor Exposures */}
      {parsedData.factorExposures && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4">Factor Exposures</h4>
          <div className="space-y-3">
            {Object.entries(parsedData.factorExposures).map(([factor, value]: [string, any]) => {
              const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
              const percentage = Math.round(numValue * 100);
              return (
                <div key={factor}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-foreground capitalize">{factor}</span>
                    <span className="text-xs font-semibold text-muted-foreground" data-testid={`factor-${factor}`}>
                      {numValue.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Statistical Metrics */}
      {parsedData.statisticalMetrics && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Statistical Metrics</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(parsedData.statisticalMetrics).map(([key, value]: [string, any]) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-base font-semibold text-foreground" data-testid={`metric-${key}`}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quant Score */}
      {parsedData.quantScore !== undefined && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Overall Quant Score</div>
                <div className="text-2xl font-bold text-foreground" data-testid="text-quant-score">
                  {parsedData.quantScore}/100
                </div>
              </div>
              <Progress value={parsedData.quantScore} className="w-24 h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Risk Analysis (Contrarian) Formatter
export function RiskAnalysisDisplay({ data }: { data: any }) {
  if (!data) return null;

  let parsedData;
  try {
    parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('Failed to parse risk analysis data:', error);
    return (
      <div className="text-sm text-destructive" data-testid="error-parsing-data">
        Error displaying risk analysis. Invalid data format.
      </div>
    );
  }
  
  return (
    <div className="space-y-6" data-testid="risk-analysis-display">
      {/* Bear Case */}
      {parsedData.bearCase && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-chart-3" />
            Bear Case Analysis
          </h4>
          <p className="text-sm text-foreground leading-relaxed" data-testid="text-bear-case">
            {parsedData.bearCase}
          </p>
        </div>
      )}

      {/* Downside Target */}
      <div className="grid grid-cols-2 gap-4">
        {parsedData.quantifiedDownside && (
          <Card className="border-chart-3">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Downside Target</div>
              <div className="text-2xl font-bold text-chart-3" data-testid="text-downside">
                {parsedData.quantifiedDownside}
              </div>
            </CardContent>
          </Card>
        )}
        {parsedData.probabilityAssessment && (
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Probability</div>
              <div className="text-xl font-semibold text-foreground" data-testid="text-probability">
                {parsedData.probabilityAssessment}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Historical Precedents */}
      {parsedData.historicalPrecedents && parsedData.historicalPrecedents.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Historical Precedents</h4>
          <ul className="space-y-2">
            {parsedData.historicalPrecedents.map((precedent: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground" data-testid={`precedent-${idx}`}>
                <span className="text-muted-foreground mt-0.5">•</span>
                <span className="flex-1">{precedent}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Risks */}
      {parsedData.keyRisks && parsedData.keyRisks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Key Risk Factors</h4>
          <ul className="space-y-2">
            {parsedData.keyRisks.map((risk: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground" data-testid={`key-risk-${idx}`}>
                <XCircle className="h-4 w-4 text-chart-3 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Compliance Report Formatter
export function ComplianceReportDisplay({ data }: { data: any }) {
  if (!data) return null;

  let parsedData;
  try {
    parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('Failed to parse compliance report data:', error);
    return (
      <div className="text-sm text-destructive" data-testid="error-parsing-data">
        Error displaying compliance report. Invalid data format.
      </div>
    );
  }
  
  const checks = parsedData.complianceChecks || {};
  
  return (
    <div className="space-y-6" data-testid="compliance-report-display">
      {/* Compliance Checks */}
      <div className="space-y-3">
        {Object.entries(checks).map(([key, check]: [string, any]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid={`check-${key}-detail`}>
                    {check.detail || check}
                  </p>
                </div>
                {check.passed !== undefined && (
                  check.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-chart-2 flex-shrink-0" data-testid={`check-${key}-passed`} />
                  ) : (
                    <XCircle className="h-5 w-5 text-chart-3 flex-shrink-0" data-testid={`check-${key}-failed`} />
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Violations */}
      {parsedData.violations && parsedData.violations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 text-chart-3">
            <XCircle className="h-4 w-4" />
            Violations Detected
          </h4>
          <ul className="space-y-2">
            {parsedData.violations.map((violation: string, idx: number) => (
              <li key={idx} className="text-sm text-chart-3" data-testid={`violation-${idx}`}>
                • {violation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      {parsedData.recommendation && (
        <Card className={parsedData.approvalRequired ? 'border-chart-4' : 'border-chart-2'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-semibold text-foreground">Compliance Recommendation</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed" data-testid="text-recommendation">
              {parsedData.recommendation}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
