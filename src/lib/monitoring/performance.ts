"use client";

import { trace } from 'firebase/performance';
import { perf } from '@/lib/firebase/config';

export class PerformanceMonitor {
  private static traces: Map<string, any> = new Map();

  // Start a custom trace
  static startTrace(traceName: string): void {
    if (!perf || typeof window === 'undefined') return;

    try {
      const customTrace = trace(perf, traceName);
      customTrace.start();
      this.traces.set(traceName, customTrace);
    } catch (error) {
      console.warn('Failed to start performance trace:', error);
    }
  }

  // Stop a custom trace
  static stopTrace(traceName: string): void {
    if (!perf || typeof window === 'undefined') return;

    try {
      const customTrace = this.traces.get(traceName);
      if (customTrace) {
        customTrace.stop();
        this.traces.delete(traceName);
      }
    } catch (error) {
      console.warn('Failed to stop performance trace:', error);
    }
  }

  // Add custom attributes to a trace
  static addTraceAttribute(traceName: string, attribute: string, value: string): void {
    if (!perf || typeof window === 'undefined') return;

    try {
      const customTrace = this.traces.get(traceName);
      if (customTrace) {
        customTrace.putAttribute(attribute, value);
      }
    } catch (error) {
      console.warn('Failed to add trace attribute:', error);
    }
  }

  // Measure function execution time
  static async measureAsync<T>(
    traceName: string, 
    fn: () => Promise<T>,
    attributes?: Record<string, string>
  ): Promise<T> {
    this.startTrace(traceName);
    
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        this.addTraceAttribute(traceName, key, value);
      });
    }

    try {
      const result = await fn();
      this.addTraceAttribute(traceName, 'status', 'success');
      return result;
    } catch (error) {
      this.addTraceAttribute(traceName, 'status', 'error');
      this.addTraceAttribute(traceName, 'error', String(error));
      throw error;
    } finally {
      this.stopTrace(traceName);
    }
  }

  // Measure synchronous function execution time
  static measure<T>(
    traceName: string, 
    fn: () => T,
    attributes?: Record<string, string>
  ): T {
    this.startTrace(traceName);
    
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        this.addTraceAttribute(traceName, key, value);
      });
    }

    try {
      const result = fn();
      this.addTraceAttribute(traceName, 'status', 'success');
      return result;
    } catch (error) {
      this.addTraceAttribute(traceName, 'status', 'error');
      this.addTraceAttribute(traceName, 'error', String(error));
      throw error;
    } finally {
      this.stopTrace(traceName);
    }
  }

  // Monitor page load performance
  static monitorPageLoad(pageName: string): void {
    if (typeof window === 'undefined') return;

    // Monitor navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.startTrace(`page_load_${pageName}`);
        this.addTraceAttribute(`page_load_${pageName}`, 'page', pageName);
        this.addTraceAttribute(`page_load_${pageName}`, 'load_time', String(navigation.loadEventEnd - navigation.navigationStart));
        this.addTraceAttribute(`page_load_${pageName}`, 'dom_content_loaded', String(navigation.domContentLoadedEventEnd - navigation.navigationStart));
        this.stopTrace(`page_load_${pageName}`);
      }, 0);
    });
  }

  // Monitor component render performance
  static monitorComponentRender(componentName: string, renderCount: number): void {
    const traceName = `component_render_${componentName}`;
    this.startTrace(traceName);
    this.addTraceAttribute(traceName, 'component', componentName);
    this.addTraceAttribute(traceName, 'render_count', String(renderCount));
    
    // Stop trace after a short delay to capture render time
    setTimeout(() => {
      this.stopTrace(traceName);
    }, 0);
  }

  // Monitor AI request performance
  static async monitorAIRequest<T>(
    requestType: string,
    request: () => Promise<T>
  ): Promise<T> {
    return this.measureAsync(
      `ai_request_${requestType}`,
      request,
      { request_type: requestType }
    );
  }

  // Monitor Firestore operations
  static async monitorFirestoreOperation<T>(
    operation: string,
    request: () => Promise<T>
  ): Promise<T> {
    return this.measureAsync(
      `firestore_${operation}`,
      request,
      { operation }
    );
  }
}

// Hook for monitoring component performance
export function usePerformanceMonitoring(componentName: string) {
  const startRender = () => {
    PerformanceMonitor.startTrace(`${componentName}_render`);
  };

  const endRender = () => {
    PerformanceMonitor.stopTrace(`${componentName}_render`);
  };

  return { startRender, endRender };
}