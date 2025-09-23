'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function TestFirebasePage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState('');

  const testSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setResult(`Sign in successful: ${userCredential.user.email}`);
    } catch (error: any) {
      setResult(`Sign in failed: ${error.message}`);
    }
  };

  const testSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setResult(`Sign up successful: ${userCredential.user.email}`);
    } catch (error: any) {
      setResult(`Sign up failed: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Firebase Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="space-x-4">
          <button
            onClick={testSignIn}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Sign In
          </button>
          
          <button
            onClick={testSignUp}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Sign Up
          </button>
        </div>
        
        {result && (
          <div className="p-4 bg-gray-100 rounded">
            <strong>Result:</strong> {result}
          </div>
        )}
      </div>
    </div>
  );
}
