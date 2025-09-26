"use client";

import { errorTracker } from '../monitoring/error-tracker';

// Enhanced error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  AI_SERVICE = 'AI_SERVICE',
  FIRESTORE = 'FIRESTORE',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface EnhancedError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  code?: string;
  context?: Record<string, any>;
  userMessage: string;
  technicalMessage: string;
  recoverable: boolean;
  retryable: boolean;
  timestamp: Date;
}

// Error factory
export class ErrorFactory {
  static createNetworkError(
    originalError: Error,
    context?: Record<string, any>
  ): EnhancedError {
    return {
      ...originalError,
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      context,
      userMessage: 'Network connection issue. Please check your internet connection and try again.',
      technicalMessage: originalError.message,
      recoverable: true,
      retryable: true,
      timestamp: new Date()
    };
  }

  static createValidationError(
    field: string,
    value: any,
    rule: string,
    context?: Record<string, any>
  ): EnhancedError {
    return {
      name: 'ValidationError',
      message: `Validation failed for ${field}`,
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      context: { field, value, rule, ...context },
      userMessage: `Please check your ${field} and try again.`,
      technicalMessage: `Validation failed for ${field}: ${rule}`,
      recoverable: true,
      retryable: false,
      timestamp: new Date()
    };
  }

  static createAuthenticationError(
    originalError: Error,
    context?: Record<string, any>
  ): EnhancedError {
    return {
      ...originalError,
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      context,
      userMessage: 'Authentication failed. Please sign in again.',
      technicalMessage: originalError.message,
      recoverable: true,
      retryable: true,
      timestamp: new Date()
    };
  }

  static createAIServiceError(
    originalError: Error,
    context?: Record<string, any>
  ): EnhancedError {
    return {
      ...originalError,
      type: ErrorType.AI_SERVICE,
      severity: ErrorSeverity.MEDIUM,
      context,
      userMessage: 'AI service is temporarily unavailable. Please try again in a moment.',
      technicalMessage: originalError.message,
      recoverable: true,
      retryable: true,
      timestamp: new Date()
    };
  }

  static createFirestoreError(
    originalError: Error,
    operation: string,
    context?: Record<string, any>
  ): EnhancedError {
    return {
      ...originalError,
      type: ErrorType.FIRESTORE,
      severity: ErrorSeverity.MEDIUM,
      context: { operation, ...context },
      userMessage: 'Data operation failed. Please try again.',
      technicalMessage: `Firestore ${operation} failed: ${originalError.message}`,
      recoverable: true,
      retryable: true,
      timestamp: new Date()
    };
  }
}

// Enhanced error handler
export class EnhancedErrorHandler {
  private static retryAttempts = new Map<string, number>();
  private static maxRetries = 3;
  private static retryDelay = 1000; // 1 second

  static async handleError(
    error: Error | EnhancedError,
    context?: Record<string, any>
  ): Promise<{
    userMessage: string;
    shouldRetry: boolean;
    canRecover: boolean;
    severity: ErrorSeverity;
  }> {
    let enhancedError: EnhancedError;

    // Convert regular error to enhanced error if needed
    if (!('type' in error)) {
      enhancedError = this.categorizeError(error, context);
    } else {
      enhancedError = error as EnhancedError;
    }

    // Log error for monitoring
    errorTracker.captureError(enhancedError, {
      tags: {
        type: enhancedError.type,
        severity: enhancedError.severity,
        recoverable: enhancedError.recoverable.toString(),
        retryable: enhancedError.retryable.toString()
      },
      severity: enhancedError.severity,
      extra: enhancedError.context
    });

    // Determine retry eligibility
    const errorKey = this.getErrorKey(enhancedError);
    const currentAttempts = this.retryAttempts.get(errorKey) || 0;
    const shouldRetry = enhancedError.retryable && currentAttempts < this.maxRetries;

    if (shouldRetry) {
      this.retryAttempts.set(errorKey, currentAttempts + 1);
    } else {
      this.retryAttempts.delete(errorKey);
    }

    return {
      userMessage: enhancedError.userMessage,
      shouldRetry,
      canRecover: enhancedError.recoverable,
      severity: enhancedError.severity
    };
  }

  private static categorizeError(error: Error, context?: Record<string, any>): EnhancedError {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ErrorFactory.createNetworkError(error, context);
    }

    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
      return ErrorFactory.createAuthenticationError(error, context);
    }

    // AI service errors
    if (message.includes('ai') || message.includes('genkit') || message.includes('gemini')) {
      return ErrorFactory.createAIServiceError(error, context);
    }

    // Firestore errors
    if (message.includes('firestore') || message.includes('firebase')) {
      return ErrorFactory.createFirestoreError(error, 'unknown', context);
    }

    // Default to unknown error
    return {
      ...error,
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      context,
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: error.message,
      recoverable: true,
      retryable: true,
      timestamp: new Date()
    };
  }

  private static getErrorKey(error: EnhancedError): string {
    return `${error.type}_${error.message}_${JSON.stringify(error.context || {})}`;
  }

  // Retry mechanism with exponential backoff
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    errorContext?: Record<string, any>
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        const errorInfo = await this.handleError(lastError, {
          ...errorContext,
          attempt: attempt + 1
        });

        if (!errorInfo.shouldRetry || attempt === this.maxRetries - 1) {
          throw lastError;
        }

        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // Recovery suggestions
  static getRecoverySuggestions(error: EnhancedError): string[] {
    const suggestions: string[] = [];

    switch (error.type) {
      case ErrorType.NETWORK:
        suggestions.push('Check your internet connection');
        suggestions.push('Try refreshing the page');
        suggestions.push('Wait a moment and try again');
        break;
      
      case ErrorType.AUTHENTICATION:
        suggestions.push('Sign out and sign back in');
        suggestions.push('Clear your browser cache');
        suggestions.push('Check if your session has expired');
        break;
      
      case ErrorType.VALIDATION:
        suggestions.push('Review the information you entered');
        suggestions.push('Make sure all required fields are filled');
        suggestions.push('Check the format of your input');
        break;
      
      case ErrorType.AI_SERVICE:
        suggestions.push('Wait a moment and try again');
        suggestions.push('Try with a simpler request');
        suggestions.push('Check if the service is available');
        break;
      
      case ErrorType.FIRESTORE:
        suggestions.push('Check your internet connection');
        suggestions.push('Try again in a moment');
        suggestions.push('Make sure you have permission to access this data');
        break;
      
      default:
        suggestions.push('Refresh the page and try again');
        suggestions.push('Contact support if the problem persists');
        break;
    }

    return suggestions;
  }
}
