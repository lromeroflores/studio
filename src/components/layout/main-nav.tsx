"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutDashboard, Settings, FolderOpenDot, Wand2 } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/', label: 'Contract Editor', icon: FileText },
  // { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  // { href: '/templates', label: 'Templates', icon: FolderOpenDot },
  // { href: '/ai-tools', label: 'AI Tools', icon: Wand2 },
  // { href: '/settings', label: 'Settings', icon: Settings },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            className={cn(
              pathname === item.href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
            isActive={pathname === item.href}
            tooltip={{ children: item.label, className: "text-xs" }}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
