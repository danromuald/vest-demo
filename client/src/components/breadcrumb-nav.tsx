import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4" data-testid="breadcrumb-nav">
      <Link href="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" data-testid="breadcrumb-home">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          {item.href ? (
            <Link 
              href={item.href} 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`breadcrumb-${item.label.toLowerCase().replace(/ /g, '-')}`}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium" data-testid={`breadcrumb-current`}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
