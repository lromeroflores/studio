
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon, Info, Palette, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); 

  useEffect(() => {
    // Initialize isDarkMode state based on the current theme
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      toast({
        title: `Theme Changed`,
        description: `Theme set to Dark Mode.`,
      });
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      toast({
        title: `Theme Changed`,
        description: `Theme set to Light Mode.`,
      });
    }
  };
  
  const handleNotificationsToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
     toast({
      title: `Notifications ${checked ? 'Enabled' : 'Disabled'} (Simulated)`,
      description: `This is a placeholder for notification settings.`,
    });
  };

  const handleLogout = () => {
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/');
  };


  return (
    <div className="container mx-auto max-w-3xl space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Palette className="mr-3 h-6 w-6 text-primary" /> Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
                <Label htmlFor="dark-mode-toggle" className="text-base font-medium">
                Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                Toggle between light and dark themes.
                </p>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className={`h-5 w-5 ${!isDarkMode ? 'text-accent' : 'text-muted-foreground'}`} />
              <Switch
                id="dark-mode-toggle"
                checked={isDarkMode}
                onCheckedChange={handleThemeToggle}
                aria-label="Toggle dark mode"
              />
              <Moon className={`h-5 w-5 ${isDarkMode ? 'text-accent' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Info className="mr-3 h-6 w-6 text-primary" /> Preferences</CardTitle>
          <CardDescription>Manage your notification settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
                <Label htmlFor="notifications-toggle" className="text-base font-medium">
                Enable Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                Receive updates and alerts from the application.
                </p>
            </div>
            <Switch
              id="notifications-toggle"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationsToggle}
              aria-label="Toggle notifications"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-destructive/50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center text-destructive"><LogOut className="mr-3 h-6 w-6" /> Account</CardTitle>
          <CardDescription>End your current session.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
            </Button>
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">
              You will be returned to the main login page.
            </p>
        </CardFooter>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Info className="mr-3 h-6 w-6 text-primary" /> About</CardTitle>
          <CardDescription>Information about this application.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">
            <strong>Application Name:</strong> ContractEase by Covalto
          </p>
          <p className="text-sm text-foreground mt-1">
            <strong>Version:</strong> 1.0.0 (Prototype)
          </p>
          <p className="text-sm text-foreground mt-1">
            <strong>Developer:</strong> Covalto
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            This application is designed to streamline contract management using AI-powered tools and efficient workflows.
          </p>
        </CardContent>
        <CardFooter className="border-t pt-4">
            <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Covalto ContractEase Inc. All rights reserved.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
