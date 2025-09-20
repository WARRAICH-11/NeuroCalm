'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const [clientConfig, setClientConfig] = useState<any>(null);
  const [serverConfig, setServerConfig] = useState<any>(null);

  useEffect(() => {
    // Check client-side Firebase config
    const clientVars = {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '***SET***' : 'MISSING',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '***SET***' : 'MISSING',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '***SET***' : 'MISSING',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '***SET***' : 'MISSING',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '***SET***' : 'MISSING',
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '***SET***' : 'MISSING',
    };
    setClientConfig(clientVars);
  }, []);

  const checkServerConfig = async () => {
    try {
      const response = await fetch('/api/debug/config');
      const data = await response.json();
      setServerConfig(data);
    } catch (error) {
      setServerConfig({ error: 'Failed to fetch server config' });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Configuration Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Client-side Environment Variables</h3>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(clientConfig, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Server-side Configuration</h3>
            <Button onClick={checkServerConfig} className="mb-2">
              Check Server Config
            </Button>
            {serverConfig && (
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(serverConfig, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
