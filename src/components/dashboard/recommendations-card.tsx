"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface RecommendationsCardProps {
  title: string;
  recommendations: string[];
}

export default function RecommendationsCard({
  title,
  recommendations,
}: RecommendationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Complete your daily check-in to receive recommendations.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
