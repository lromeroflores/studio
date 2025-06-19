
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Moon, Info, Palette, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false); // Mock state
  const [language, setLanguage] = useState('en'); // Mock state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Mock state

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    toast({
      title: `Theme Changed (Simulated)`,
      description: `Theme set to ${checked ? 'Dark Mode' : 'Light Mode'}. Actual theme switching requires more setup.`,
    });
    // In a real app, you would call a function to update the theme globally (e.g., using next-themes)
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
     toast({
      title: `Language Changed (Simulated)`,
      description: `Language set to ${value}. Actual localization requires i18n setup.`,
    });
  };

  const handleNotificationsToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
     toast({
      title: `Notifications ${checked ? 'Enabled' : 'Disabled'} (Simulated)`,
      description: `This is a placeholder for notification settings.`,
    });
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
          <CardTitle className="text-2xl flex items-center"><Languages className="mr-3 h-6 w-6 text-primary" /> Preferences</CardTitle>
          <CardDescription>Manage your language and notification settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
                <Label htmlFor="language-select" className="text-base font-medium">
                Language
                </Label>
                <p className="text-sm text-muted-foreground">
                Choose your preferred language for the interface.
                </p>
            </div>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language-select" className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español (Simulated)</SelectItem>
                <SelectItem value="fr">Français (Simulated)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
