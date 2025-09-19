'use client';

import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

// Mock function since we don't have the actual db module yet
const getUserCheckInHistory = async (userId: string) => {
  return [];
};

const moodEmoji: Record<number, string> = {
  1: '😢', // Very sad
  2: '😞', // Sad
  3: '😐', // Neutral
  4: '🙂', // Happy
  5: '😊', // Very happy
};

const energyLevels: Record<string, string> = {
  very_low: 'Very Low',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  very_high: 'Very High'
};

export function ActivityHistory({ userId }: { userId: string }) {
  interface CheckIn {
    id: string;
    userId: string;
    mood: number;
    energy: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    sleepQuality: number;
    stressLevel: number;
    notes?: string;
    completedTasks: number;
    totalTasks: number;
    createdAt: Date;
    date: Date;
  }

  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const loadCheckIns = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // Get check-ins from Firestore
        const checkInsRef = collection(db, 'dailyCheckIns');
        const q = query(
          checkInsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(30)
        );
        
        const querySnapshot = await getDocs(q);
        const checkInData: CheckIn[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const checkIn: CheckIn = {
            id: doc.id,
            userId: data.userId || '',
            mood: Number(data.mood) || 3, // Default to neutral
            energy: ['very_low', 'low', 'medium', 'high', 'very_high'].includes(data.energy) 
              ? data.energy as CheckIn['energy'] 
              : 'medium',
            sleepQuality: Number(data.sleepQuality) || 3,
            stressLevel: Number(data.stressLevel) || 3,
            notes: data.notes,
            completedTasks: Number(data.completedTasks) || 0,
            totalTasks: Number(data.totalTasks) || 0,
            date: data.createdAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date()
          };
          checkInData.push(checkIn);
        });
        
        setCheckIns(checkInData);
      } catch (error) {
        console.error('Error loading check-in history:', error);
        toast({
          title: 'Error',
          description: 'Failed to load activity history',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCheckIns();
  }, [userId, timeRange]);

  const selectedCheckIn = selectedDate
    ? checkIns.find(
        (checkIn) =>
          checkIn.date.toDateString() === selectedDate.toDateString()
      )
    : null;

  const moodData = checkIns
    .slice(0, 14) // Last 14 days
    .map((checkIn) => ({
      date: format(checkIn.date, 'MMM d'),
      mood: checkIn.mood,
      energy: ['very_low', 'low', 'medium', 'high', 'very_high'].indexOf(checkIn.energy) + 1,
    }))
    .reverse();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="history">Full History</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Mood Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip 
                    formatter={(value: number) => [
                      moodEmoji[value as number] || value,
                      'Mood'
                    ]}
                  />
                  <Bar 
                    dataKey="mood" 
                    fill="#8884d8" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Energy Levels</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip 
                    formatter={(value: number) => [
                      energyLevels[Object.keys(energyLevels)[(value as number) - 1]] || value,
                      'Energy'
                    ]}
                  />
                  <Bar 
                    dataKey="energy" 
                    fill="#82ca9d" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily Check-in Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setSelectedDate(newDate);
                  }}
                  className="rounded-md border p-2"
                  classNames={{
                    day_hidden: 'invisible',
                    day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                  }}
                />
              </div>
              
              {selectedCheckIn ? (
                <div className="w-full md:w-1/2 space-y-4">
                  <h3 className="text-lg font-semibold">
                    {format(selectedCheckIn.date, 'MMMM d, yyyy')}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Mood</p>
                      <p className="text-2xl">
                        {moodEmoji[selectedCheckIn.mood] || selectedCheckIn.mood}/5
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Energy</p>
                      <p className="text-lg">
                        {energyLevels[selectedCheckIn.energy] || selectedCheckIn.energy}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Sleep Quality</p>
                      <p className="text-lg">{selectedCheckIn.sleepQuality}/5</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Tasks</p>
                      <p className="text-lg">
                        {selectedCheckIn.completedTasks}/{selectedCheckIn.totalTasks}
                      </p>
                    </div>
                  </div>
                  
                  {selectedCheckIn.notes && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="rounded-md bg-muted p-4">
                        {selectedCheckIn.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <p className="text-muted-foreground">
                    Select a date to view details
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Check-in History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead>Energy</TableHead>
                  <TableHead>Sleep</TableHead>
                  <TableHead>Tasks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.map((checkIn) => (
                  <TableRow key={checkIn.id}>
                    <TableCell>{format(checkIn.date, 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-2xl">
                      {moodEmoji[checkIn.mood] || checkIn.mood}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`h-3 w-3 rounded-full ${
                            checkIn.energy === 'very_low' ? 'bg-red-500' :
                            checkIn.energy === 'low' ? 'bg-orange-500' :
                            checkIn.energy === 'medium' ? 'bg-yellow-500' :
                            checkIn.energy === 'high' ? 'bg-green-500' : 'bg-emerald-500'
                          }`}
                        />
                        {energyLevels[checkIn.energy] || checkIn.energy}
                      </div>
                    </TableCell>
                    <TableCell>{checkIn.sleepQuality}/5</TableCell>
                    <TableCell>
                      {checkIn.completedTasks}/{checkIn.totalTasks}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
