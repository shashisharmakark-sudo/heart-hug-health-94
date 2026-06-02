import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, Bell, Sparkles, Shield, Pill, LogOut, Search, Salad, Users, UserRound } from "lucide-react";

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/hooks/use-auth";
import { useRole } from "@/lib/role";

const PATIENT_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Find a doctor", url: "/find-doctor", icon: Search },
  { title: "My medicines", url: "/medicines", icon: Pill },
  { title: "Reminders", url: "/reminders", icon: Bell },
  { title: "Diet chart", url: "/diet-chart", icon: Salad },
  { title: "Small wins", url: "/wins", icon: Sparkles },
];

const DOCTOR_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My patients", url: "/my-patients", icon: Users },
  { title: "My profile", url: "/onboarding-doctor", icon: UserRound },
];

const COMMON = [
  { title: "Privacy", url: "/privacy", icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) => currentPath === path;
  const { role } = useRole();

  const items = role === "doctor" ? DOCTOR_ITEMS : PATIENT_ITEMS;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-bloom shadow-petal">
            <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display text-base font-semibold text-ink">Petal</p>
              <p className="text-[11px] text-muted-foreground">{role === "doctor" ? "Clinical" : "Health"} portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>{role === "doctor" ? "Practice" : "Your space"}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {[...items, ...COMMON].map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className="rounded-xl">
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => signOut()} className="rounded-xl">
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Sign out</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="p-3">
          <div className="rounded-2xl bg-gradient-blossom p-3 text-xs text-ink shadow-petal">
            <p className="font-medium">Personal care, always</p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
