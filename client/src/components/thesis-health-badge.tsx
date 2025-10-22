import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ThesisHealthBadgeProps {
  status: 'HEALTHY' | 'WARNING' | 'ALERT';
  className?: string;
}

export function ThesisHealthBadge({ status, className }: ThesisHealthBadgeProps) {
  const variants = {
    HEALTHY: { className: 'bg-chart-2/10 text-chart-2 border-chart-2/20', label: 'Healthy' },
    WARNING: { className: 'bg-chart-4/10 text-chart-4 border-chart-4/20', label: 'Warning' },
    ALERT: { className: 'bg-chart-3/10 text-chart-3 border-chart-3/20', label: 'Alert' },
  };

  const variant = variants[status];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', variant.className, className)}
      data-testid={`badge-thesis-${status.toLowerCase()}`}
    >
      {variant.label}
    </Badge>
  );
}
