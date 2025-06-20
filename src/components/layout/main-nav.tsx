
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, ListOrdered, Menu } from 'lucide-react'; 

const menuItems = [
  { href: '/opportunities', label: 'Opportunities', icon: ListOrdered },
  { href: '/editor', label: 'Contract Editor', icon: FileText },
];

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Menu className="mr-2 h-4 w-4" />
          Navegación
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Menú Principal</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <DropdownMenuItem
              key={item.href}
              className={cn(
                'cursor-pointer',
                isActive ? 'bg-accent text-accent-foreground' : 'transparent'
              )}
              onClick={() => router.push(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
