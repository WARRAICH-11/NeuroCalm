"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'xl',
  padding = 'md'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 xs:px-3 sm:px-4',
    md: 'px-3 xs:px-4 sm:px-6 lg:px-8',
    lg: 'px-4 xs:px-6 sm:px-8 lg:px-12'
  };

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2 xs:gap-3',
    md: 'gap-3 xs:gap-4 sm:gap-6',
    lg: 'gap-4 xs:gap-6 sm:gap-8',
    xl: 'gap-6 xs:gap-8 sm:gap-10'
  };

  const getGridCols = () => {
    const classes = [];
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.xs) classes.push(`xs:grid-cols-${cols.xs}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    return classes.join(' ');
  };

  return (
    <div className={cn(
      'grid',
      getGridCols(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface MobileOptimizedCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function MobileOptimizedCard({ 
  children, 
  className,
  padding = 'md'
}: MobileOptimizedCardProps) {
  const paddingClasses = {
    sm: 'p-3 xs:p-4',
    md: 'p-4 xs:p-6',
    lg: 'p-6 xs:p-8'
  };

  return (
    <div className={cn(
      'bg-card text-card-foreground rounded-lg border shadow-sm',
      paddingClasses[padding],
      'touch-manipulation', // Improve touch responsiveness
      className
    )}>
      {children}
    </div>
  );
}
