import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="h-3 w-3" />;
    return change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-muted-foreground';
    if (variant === 'success' || (variant === 'default' && change > 0)) return 'text-chart-2';
    if (variant === 'danger' || (variant === 'default' && change < 0)) return 'text-chart-3';
    return 'text-muted-foreground';
  };

  return (
    <Card className={cn('hover-elevate', className)} data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold font-mono text-foreground" data-testid={`text-metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs font-medium mt-1", getTrendColor())}>
            {getTrendIcon()}
            <span>
              {Math.abs(change)}% {changeLabel || 'vs last period'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
