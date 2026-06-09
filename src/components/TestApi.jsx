// src/components/TestApi.jsx
import React, { useEffect, useState } from 'react';
import { getAllPdfs } from '../api/pdfApi';

export default function TestApi() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const test = async () => {
      try {
        const response = await getAllPdfs();
        setResult({ success: true, data: response.data });
      } catch (error) {
        setResult({ success: false, error: error.message });
      }
    };
    test();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h3>API Test Result:</h3>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}