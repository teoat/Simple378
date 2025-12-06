import { useEffect, useState, useCallback } from 'react';

interface HealthMetrics {
  timestamp: number;
  responseTime: number;
  errorRate: number;
  uptime: number;
  activeUsers: number;
}

interface AlertRule {
  name: string;
  metric: string;
  threshold: number;
  duration: number; // ms
  severity: 'info' | 'warning' | 'critical';
}

/**
 * Hook for advanced monitoring and alerting
 */
export function useMonitoring() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isHealthy, setIsHealthy] = useState(true);

  useEffect(() => {
    const pollMetrics = setInterval(async () => {
      try {
        const response = await fetch('/api/monitoring/health');
        const data: HealthMetrics = await response.json();
        setMetrics(data);

        // Evaluate alert rules
        const alertRules: AlertRule[] = [
          { name: 'High Response Time', metric: 'responseTime', threshold: 1000, duration: 60000, severity: 'warning' },
          { name: 'High Error Rate', metric: 'errorRate', threshold: 0.05, duration: 30000, severity: 'critical' },
          { name: 'Low Uptime', metric: 'uptime', threshold: 0.95, duration: 300000, severity: 'critical' },
        ];

        const activeAlerts: string[] = [];
        alertRules.forEach((rule) => {
          const value = data[rule.metric as keyof HealthMetrics] as number;
          if (value > rule.threshold) {
            activeAlerts.push(`${rule.name}: ${value}`);
          }
        });

        setAlerts(activeAlerts);
        setIsHealthy(activeAlerts.every((a) => !a.includes('critical')));
      } catch (error) {
        console.error('Metrics poll failed:', error);
        setAlerts(['Monitoring service unavailable']);
        setIsHealthy(false);
      }
    }, 10000); // Poll every 10s

    return () => clearInterval(pollMetrics);
  }, []);

  const sendCustomMetric = useCallback(
    async (name: string, value: number, tags?: Record<string, string>) => {
      try {
        await fetch('/api/monitoring/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, value, tags, timestamp: Date.now() }),
        });
      } catch (error) {
        console.error('Metric send failed:', error);
      }
    },
    []
  );

  return {
    metrics,
    alerts,
    isHealthy,
    sendCustomMetric,
  };
}

/**
 * Hook for SLA tracking and compliance
 */
export function useSLA() {
  const [slaStatus, setSlaStatus] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchSlaStatus = async () => {
      try {
        const response = await fetch('/api/sla/status');
        const data = await response.json();
        setSlaStatus(data);
      } catch (error) {
        console.error('SLA status fetch failed:', error);
      }
    };

    fetchSlaStatus();
    const interval = setInterval(fetchSlaStatus, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const getSLAPercentage = useCallback((service: string): number => {
    return slaStatus[service] ?? 100;
  }, [slaStatus]);

  return {
    slaStatus,
    getSLAPercentage,
  };
}
