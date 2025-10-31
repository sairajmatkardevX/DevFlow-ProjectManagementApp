// app/DeleteDebugger.tsx
"use client";
import { useEffect } from 'react';

export default function DeleteDebugger() {
  useEffect(() => {
    console.log('🟢 DeleteDebugger mounted - intercepting ALL requests');
    
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const [url, options] = args;
      const method = options?.method || 'GET';
      
      if (method === 'DELETE' && typeof url === 'string' && url.includes('/api/auth/session')) {
        console.error('🚨 DELETE REQUEST DETECTED!');
        console.error('URL:', url);
        console.error('Full Stack Trace:');
        const error = new Error('DELETE Request Origin');
        console.error(error.stack);
      }
      
      return originalFetch.apply(this, args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}