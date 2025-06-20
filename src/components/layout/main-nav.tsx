
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FileText, ListOrdered } from 'lucide-react'; 

const menuItems = [
  { href: '/opportunities', label: 'Opportunities', icon: ListOrdered },
  { href: '/editor', label: 'Contract Editor', icon: FileText },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                isActive ? 'bg-accent text-accent-foreground' : 'transparent',
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
