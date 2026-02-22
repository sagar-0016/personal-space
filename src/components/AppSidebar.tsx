"use client"

import React from 'react';
import { 
  Lightbulb, 
  Bell, 
  Pencil, 
  Archive, 
  Trash2,
  Settings,
  HelpCircle
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Notes", icon: Lightbulb, active: true },
  { title: "Reminders", icon: Bell },
];

const labelItems = [
  { title: "Edit labels", icon: Pencil },
];

const archiveItems = [
  { title: "Archive", icon: Archive },
  { title: "Trash", icon: Trash2 },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r-0 pt-16">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title} 
                  isActive={item.active}
                  className="rounded-r-full mr-2"
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Labels</SidebarGroupLabel>
          <SidebarMenu>
            {labelItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} className="rounded-r-full mr-2">
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            {archiveItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} className="rounded-r-full mr-2">
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
