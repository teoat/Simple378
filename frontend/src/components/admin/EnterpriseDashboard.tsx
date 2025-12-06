import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useMonitoring, useSLA } from '../../hooks/useMonitoring';

/**
 * Admin dashboard for enterprise monitoring, alerts, and SLA tracking
 */
export function EnterpriseDashboard() {
  const { metrics, alerts, isHealthy, sendCustomMetric } = useMonitoring();
  const { slaStatus, getSLAPercentage } = useSLA();

  const serviceList = ['API', 'Database', 'Cache', 'Search', 'Storage'];

  return (
    <div className="space-y-6 p-6">
      {/* Health Overview */}
      <Card className={isHealthy ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isHealthy ? '✅ All Systems Operational' : '⚠️ Issues Detected'}
          </div>
          {metrics && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Response Time</p>
                <p className="text-lg font-semibold">{metrics.responseTime}ms</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Error Rate</p>
                <p className="text-lg font-semibold">{(metrics.errorRate * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Uptime</p>
                <p className="text-lg font-semibold">{(metrics.uptime * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Users</p>
                <p className="text-lg font-semibold">{metrics.activeUsers}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle>Active Alerts ({alerts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alerts.map((alert, idx) => (
                <li key={idx} className="text-sm text-amber-800">
                  • {alert}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* SLA Status */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {serviceList.map((service) => {
              const slaPercentage = getSLAPercentage(service);
              const isCompliant = slaPercentage >= 99.9;
              return (
                <div key={service} className="flex items-center justify-between">
                  <span className="font-medium">{service}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isCompliant ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(slaPercentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{slaPercentage.toFixed(2)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnterpriseDashboard;
