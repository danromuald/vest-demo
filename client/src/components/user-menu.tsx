import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Settings, ChevronRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function UserMenu() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const roleChangeMutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await fetch("/api/auth/user/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: Include cookies for session auth
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Role updated",
        description: "Your role has been changed successfully",
      });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-8 w-8 rounded-full bg-sidebar-accent" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-sidebar-accent rounded" />
          <div className="h-3 w-16 bg-sidebar-accent/50 rounded" />
        </div>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';

  const roleLabels: Record<string, string> = {
    ANALYST: "Analyst",
    PM: "Portfolio Manager",
    COMPLIANCE: "Compliance Officer",
    ADMIN: "Administrator",
  };

  const roleColors: Record<string, string> = {
    ANALYST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    PM: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    COMPLIANCE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    ADMIN: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 p-2 hover-elevate"
          data-testid="button-user-menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImageUrl || undefined} alt={fullName} className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left text-sm overflow-hidden">
            <p className="font-medium text-sidebar-foreground truncate">{fullName}</p>
            <Badge variant="outline" className={`text-xs mt-1 ${roleColors[user.role || 'ANALYST']}`}>
              {roleLabels[user.role || 'ANALYST']}
            </Badge>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{fullName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger data-testid="menu-change-role">
            <User className="mr-2 h-4 w-4" />
            <span>Change Role (Demo)</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem 
              onClick={() => roleChangeMutation.mutate('ANALYST')}
              disabled={user.role === 'ANALYST'}
              data-testid="role-analyst"
            >
              <Badge variant="outline" className={roleColors.ANALYST}>Analyst</Badge>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => roleChangeMutation.mutate('PM')}
              disabled={user.role === 'PM'}
              data-testid="role-pm"
            >
              <Badge variant="outline" className={roleColors.PM}>Portfolio Manager</Badge>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => roleChangeMutation.mutate('COMPLIANCE')}
              disabled={user.role === 'COMPLIANCE'}
              data-testid="role-compliance"
            >
              <Badge variant="outline" className={roleColors.COMPLIANCE}>Compliance</Badge>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => roleChangeMutation.mutate('ADMIN')}
              disabled={user.role === 'ADMIN'}
              data-testid="role-admin"
            >
              <Badge variant="outline" className={roleColors.ADMIN}>Administrator</Badge>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => window.location.href = '/api/logout'}
          className="text-destructive focus:text-destructive"
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
