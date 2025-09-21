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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <ul className="space-y-2 sm:space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 sm:gap-3">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground italic">
            Complete your daily check-in to receive recommendations.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
