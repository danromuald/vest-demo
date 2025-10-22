import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkflowStage = 'discovery' | 'analysis' | 'ic_meeting' | 'execution' | 'monitoring';

interface WorkflowTimelineProps {
  currentStage: WorkflowStage;
  className?: string;
}

const stages = [
  { id: 'discovery', label: 'Discovery & Research', description: 'Initial idea generation' },
  { id: 'analysis', label: 'Analysis', description: 'Deep dive & modeling' },
  { id: 'ic_meeting', label: 'IC Meeting', description: 'Committee review' },
  { id: 'execution', label: 'Execution', description: 'Trade implementation' },
  { id: 'monitoring', label: 'Monitoring', description: 'Ongoing tracking' },
];

export function WorkflowTimeline({ currentStage, className }: WorkflowTimelineProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div className={cn('relative', className)} data-testid="workflow-timeline">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={stage.id} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-colors',
                      isCompleted ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-background text-primary',
                    isPending && 'border-border bg-background text-muted-foreground'
                  )}
                  data-testid={`stage-${stage.id}`}
                >
                  {isCompleted && <CheckCircle2 className="h-5 w-5" />}
                  {isCurrent && <Clock className="h-5 w-5" />}
                  {isPending && <Circle className="h-5 w-5" />}
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-colors',
                      isCompleted ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-xs font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {stage.label}
                </p>
                <p className="text-xs text-muted-foreground">{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
