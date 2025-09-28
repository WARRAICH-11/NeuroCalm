"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

interface DailyCheckinCardProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any) => void;
  isPending: boolean;
}

export default function DailyCheckinCard({
  form,
  onSubmit,
  isPending,
}: DailyCheckinCardProps) {
  return (
    <Card className="compact-mobile-card">
      <CardHeader className="pb-3 xxs:pb-4 xs:pb-6">
        <CardTitle className="text-base xxs:text-lg xs:text-xl">Daily Check-in</CardTitle>
        <CardDescription className="text-xs xxs:text-sm">
          Log your daily metrics to get personalized insights.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 xxs:space-y-3 xs:space-y-4 sm:space-y-6"
          >
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs xs:text-sm sm:text-base">Mood (1-10): {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sleep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs xs:text-sm sm:text-base">Sleep (hours): {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={16}
                      step={0.5}
                      defaultValue={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="diet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs xs:text-sm sm:text-base">Diet</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Balanced meals, high-protein..." 
                      {...field} 
                      className="min-h-[70px] xs:min-h-[80px] sm:min-h-[100px] text-xs xs:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exercise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs xs:text-sm sm:text-base">Exercise</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., 30-min walk, gym session..." 
                      {...field} 
                      className="min-h-[70px] xs:min-h-[80px] sm:min-h-[100px] text-xs xs:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="stressors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs xs:text-sm sm:text-base">Stressors</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Work deadlines, personal project..." 
                      {...field} 
                      className="min-h-[70px] xs:min-h-[80px] sm:min-h-[100px] text-xs xs:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-8 xxs:h-9 xs:h-10 compact-mobile-button" disabled={isPending}>
              {isPending && <Loader2 className="mr-1 xxs:mr-2 h-3 w-3 xs:h-4 xs:w-4 animate-spin" />}
              <span className="text-xs xxs:text-sm">Update & Analyze</span>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
