// src/components/TestApiConnection.jsx
import React, { useEffect, useState } from 'react';
import { getAdminCourses } from '../api/courseApi';

export function TestApiConnection() {
  const [status, setStatus] = useState('Testing...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing API connection...');
        console.log('API Base URL:', process.env.REACT_APP_API_URL);
        
        const response = await getAdminCourses();
        console.log('API Response:', response);
        
        setStatus('✅ Connected successfully!');
        setData(response.data);
      } catch (err) {
        console.error('API Test Error:', err);
        setStatus('❌ Connection failed');
        setError(err.message);
      }
    };
    
    testConnection();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', maxWidth: 600, margin: '0 auto' }}>
      <h2>API Connection Test</h2>
      <div style={{ 
        padding: 15, 
        borderRadius: 8, 
        background: status.includes('✅') ? '#d4edda' : '#f8d7da',
        border: `1px solid ${status.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        <strong>{status}</strong>
      </div>
      
      {error && (
        <div style={{ marginTop: 15, padding: 10, background: '#f8d7da', borderRadius: 8 }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div style={{ marginTop: 15 }}>
          <strong>Data:</strong>
          <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 8, overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: 15, fontSize: 12, color: '#666' }}>
        <div>Backend URL: {process.env.REACT_APP_API_URL}</div>
        <div>Environment: {process.env.NODE_ENV}</div>
      </div>
    </div>
  );
}