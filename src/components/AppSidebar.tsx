import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, Bell, Sparkles, Shield, Pill, LogOut } from "lucide-react";

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/hooks/use-auth";

const items = [
  { title: "Today", url: "/", icon: Home },
  { title: "Reminders", url: "/reminders", icon: Bell },
  { title: "Medicines", url: "/medicines", icon: Pill },
  { title: "Small wins", url: "/wins", icon: Sparkles },
  { title: "Privacy", url: "/privacy", icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-bloom shadow-petal">
            <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display text-base font-semibold text-foreground">Petal</p>
              <p className="text-[11px] text-muted-foreground">Gentle care, daily 🌸</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Your space</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
          <div className="rounded-2xl bg-gradient-blossom p-3 text-xs text-foreground/80 shadow-petal">
            <p className="font-medium">You're doing beautifully 💙</p>
            <p className="mt-1 text-[11px] text-muted-foreground">We're here whenever you need us.</p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
