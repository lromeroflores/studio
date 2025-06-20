
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { updateProfile } from 'firebase/auth';
import { updateUserProfile } from '@/services/firestore-service';

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, userProfile, loading } = useAuth();
  
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setAvatarUrl(user.photoURL || '');
      // Use display name from auth as a fallback if firestore profile is loading/missing
      setName(user.displayName || '');
    }
    if (userProfile) {
      setName(userProfile.name || user?.displayName || '');
      setAlias(userProfile.alias || '');
    }
  }, [user, userProfile]);

  const handleSaveChanges = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to save changes.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    
    try {
      // Update Firebase Auth profile displayName
      if(user.displayName !== name) {
        await updateProfile(user, { displayName: name });
      }
      
      // Update Firestore profile (name and alias)
      await updateUserProfile(user.uid, { name, alias });

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been successfully saved.',
      });
      // Note: The AuthProvider will automatically refetch the profile on next load,
      // but for instant UI update, you might use a state management library or pass a refetch function via context.
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: 'Save Failed',
        description: `Could not save your profile. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: 'Avatar Updated (Simulated)',
        description: 'New avatar previewed. Save changes to "apply". In a real app, this would upload to Firebase Storage.',
      });
    }
  };
  
  if (loading) {
      return (
          <div className="flex h-full items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="container mx-auto max-w-3xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
          <CardDescription>View and edit your personal information.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveChanges}>
          <CardContent className="space-y-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-muted group-hover:border-primary transition-colors">
                  <AvatarImage src={avatarUrl} alt="User Avatar" data-ai-hint="user portrait" />
                  <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="avatar-upload"
                  className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors group-hover:opacity-100 opacity-75"
                  title="Change profile picture"
                >
                  <Camera className="h-5 w-5" />
                  <Input
                    id="avatar-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alias">Alias / Username</Label>
                <Input
                  id="alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Your alias or username"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled // Email usually not editable by user directly or requires verification
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Email address cannot be changed through this interface.</p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={isSaving} className="ml-auto">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
