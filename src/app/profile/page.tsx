'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from './components/settings-form';
import { ActivityHistory } from './components/activity-history';
import { useAuth } from '@/lib/firebase/auth-provider';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="settings" className="space-y-6">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
          <TabsList className="mt-4">
            <TabsTrigger value="settings">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <SettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityHistory userId={user.uid} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
