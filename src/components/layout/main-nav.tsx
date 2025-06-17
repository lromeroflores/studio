
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, ListOrdered, Settings, FolderOpenDot, Wand2 } from 'lucide-react'; // Replaced LayoutDashboard with ListOrdered
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/opportunities', label: 'Opportunities', icon: ListOrdered },
  { href: '/editor', label: 'Contract Editor', icon: FileText },
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
              (pathname === item.href || (item.href === '/editor' && pathname.startsWith('/editor')) || (item.href === '/opportunities' && pathname.startsWith('/opportunities')))
                ? 'bg-sidebar-primary text-sidebar-primary-foreground' // Using sidebar primary for active
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
            isActive={pathname === item.href || (item.href === '/editor' && pathname.startsWith('/editor')) || (item.href === '/opportunities' && pathname.startsWith('/opportunities'))}
            tooltip={{ children: item.label, className: "text-xs" }}
          >
            <Link href={item.href}>
              <item.icon className={cn( (pathname === item.href || (item.href === '/editor' && pathname.startsWith('/editor')) || (item.href === '/opportunities' && pathname.startsWith('/opportunities'))) ? "text-sidebar-primary-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground")} />
              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
