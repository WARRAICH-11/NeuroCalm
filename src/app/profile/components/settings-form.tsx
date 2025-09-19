'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { updateProfile, updateEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserSettings {
  displayName: string;
  email: string;
  photoURL: string;
  notifications: boolean;
  darkMode: boolean;
}

export function SettingsForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>({
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
    notifications: true,
    darkMode: false,
  });

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Load user settings
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;
      
      try {
        // Get user profile from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSettings({
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            notifications: userData?.preferences?.notifications ?? true,
            darkMode: userData?.preferences?.darkMode ?? false,
          });
        } else {
          // Initialize with default values if user document doesn't exist
          setSettings({
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            notifications: true,
            darkMode: false,
          });
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user settings',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    updateSettings({
      [name]: type === 'checkbox' ? checked : value,
    } as Pick<UserSettings, keyof UserSettings>);
  };

  const handleSwitchChange = (name: keyof Pick<UserSettings, 'notifications' | 'darkMode'>, checked: boolean) => {
    updateSettings({ [name]: checked } as Pick<UserSettings, 'notifications' | 'darkMode'>);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: settings.displayName,
        photoURL: settings.photoURL || null,
      });

      // Update email if changed
      if (user.email !== settings.email) {
        await updateEmail(user, settings.email);
      }

      // Update user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName: settings.displayName,
        email: settings.email,
        photoURL: settings.photoURL || null,
        preferences: {
          notifications: settings.notifications,
          darkMode: settings.darkMode,
        },
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'There was an error updating your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Please sign in to view settings</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={settings.photoURL} alt={settings.displayName} />
              <AvatarFallback>
                {settings.displayName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute -bottom-2 -right-2"
              onClick={() => {
                // Handle photo upload
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    // In a real app, you would upload the file to storage
                    // and then update the photoURL
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setSettings(prev => ({
                        ...prev,
                        photoURL: event.target?.result as string,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
            >
              Change
            </Button>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Profile Picture</h2>
            <p className="text-sm text-muted-foreground">JPG, GIF or PNG. Max 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              value={settings.displayName}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={settings.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              disabled // Email should be changed via Firebase Auth's updateEmail
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photoURL">Profile Picture URL</Label>
          <Input
            id="photoURL"
            name="photoURL"
            value={settings.photoURL || ''}
            onChange={handleInputChange}
            placeholder="Enter image URL"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preferences</h3>
        
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications about your account
            </p>
          </div>
          <Switch
            id="notifications"
            checked={settings.notifications}
            onCheckedChange={(checked) => handleSwitchChange('notifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="darkMode">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Toggle between light and dark theme
            </p>
          </div>
          <Switch
            id="darkMode"
            checked={settings.darkMode}
            onCheckedChange={(checked) => handleSwitchChange('darkMode', checked)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
