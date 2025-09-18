"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function TestToast() {
  const { toast } = useToast();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Toast Test Page</h1>
      
      <Button
        onClick={() => {
          toast({
            title: "Default Toast",
            description: "This is a default toast message.",
          });
        }}
      >
        Show Default Toast
      </Button>
      
      <Button
        variant="destructive"
        onClick={() => {
          toast({
            variant: "destructive",
            title: "Error Toast",
            description: "This is an error toast message.",
          });
        }}
      >
        Show Error Toast
      </Button>
    </div>
  );
}
