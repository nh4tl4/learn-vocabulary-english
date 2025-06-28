import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';

interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
}

export default function ConnectionTest() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await apiClient.get('/health');
      setHealthData(response.data);
      setBackendStatus('connected');
      console.log('Backend connected successfully:', response.data);
    } catch (err: any) {
      setBackendStatus('error');
      setError(err.response?.data?.message || err.message);
      console.error('Backend connection failed:', err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Connection Status</h2>

      <div className="space-y-4">
        {/* Backend Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            backendStatus === 'loading' ? 'bg-yellow-500' :
            backendStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">Backend:</span>
          <span className={
            backendStatus === 'connected' ? 'text-green-600' :
            backendStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
          }>
            {backendStatus === 'loading' ? 'Testing...' :
             backendStatus === 'connected' ? 'Connected' : 'Failed'}
          </span>
        </div>

        {/* Health Data */}
        {healthData && (
          <div className="bg-gray-50 p-3 rounded">
            <p><strong>Service:</strong> {healthData.service}</p>
            <p><strong>Status:</strong> {healthData.status}</p>
            <p><strong>Time:</strong> {new Date(healthData.timestamp).toLocaleString()}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Retry Button */}
        <button
          onClick={testBackendConnection}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Connection
        </button>
      </div>
    </div>
  );
}
