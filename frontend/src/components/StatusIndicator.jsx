import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';

const StatusIndicator = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        timeout: 3000
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackendStatus(data.status === 'healthy' ? 'online' : 'error');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    // Check immediately on mount
    checkBackendHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (backendStatus) {
      case 'online':
        return {
          icon: Wifi,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'Backend Online',
          description: 'ML processing available'
        };
      case 'offline':
        return {
          icon: WifiOff,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'Backend Offline',
          description: 'Please start the backend server'
        };
      case 'error':
        return {
          icon: WifiOff,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'Backend Error',
          description: 'Check backend console'
        };
      default:
        return {
          icon: Activity,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'Checking...',
          description: 'Connecting to backend'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${config.bg} ${config.border} border`}>
      <Icon size={12} className={config.color} />
      <span className={`font-medium ${config.color}`}>{config.text}</span>
      <span className="text-gray-500">•</span>
      <span className="text-gray-500">{config.description}</span>
      {lastCheck && (
        <>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">
            {lastCheck.toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </>
      )}
    </div>
  );
};

export default StatusIndicator;