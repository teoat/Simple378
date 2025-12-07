/**
 * Dashboard Health Check Utility
 * Validates that all required dashboard endpoints are accessible
 */

export interface HealthCheckResult {
  endpoint: string;
  status: 'ok' | 'error';
  message: string;
}

export async function checkDashboardHealth(apiUrl: string): Promise<HealthCheckResult[]> {
  const endpoints = [
    '/dashboard/metrics',
    '/dashboard/activity',
    '/dashboard/charts',
  ];

  const results: HealthCheckResult[] = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      results.push({
        endpoint,
        status: response.ok ? 'ok' : 'error',
        message: response.ok ? 'Endpoint accessible' : `HTTP ${response.status}`,
      });
    } catch (error) {
      results.push({
        endpoint,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

export function logDashboardDiagnostics(results: HealthCheckResult[]): void {
  console.group('Dashboard Health Check');
  results.forEach(result => {
    const icon = result.status === 'ok' ? '✅' : '❌';
    console.log(`${icon} ${result.endpoint}: ${result.message}`);
  });
  console.groupEnd();
}
