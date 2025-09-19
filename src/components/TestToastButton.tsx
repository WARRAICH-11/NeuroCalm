'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast-context';

export function TestToastButton() {
  const { toast } = useToast();
  
  const handleClick = () => {
    try {
      toast({
        title: "Test Toast",
        description: "This is a test toast message.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error showing toast:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button onClick={handleClick} variant="outline">
        Test Toast
      </Button>
    </div>
  );
}
