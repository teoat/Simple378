import { useEffect, useState, useCallback } from 'react';

interface TenantConfig {
  id: string;
  name: string;
  region?: string;
  plan?: string;
  domain?: string;
  features: string[];
  limits?: {
    api_calls_per_month?: number;
    storage_gb?: number;
    team_members?: number;
    cases?: number;
  };
  compliance_standards?: string[];
}

/**
 * Hook for multi-tenant isolation and context
 */
export function useTenant() {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTenant = async () => {
      try {
        // Extract tenant from subdomain or auth token
        const response = await fetch('/api/tenant/config');
        const data = await response.json();
        setTenant(data);
      } catch (error) {
        console.error('Tenant config load failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTenant();
  }, []);

  const isTenantFeatureEnabled = useCallback(
    (feature: string): boolean => {
      return tenant?.features.includes(feature) ?? false;
    },
    [tenant]
  );

  const getApiBaseUrl = useCallback(
    (path: string = ''): string => {
      const region = tenant?.region || 'us-east';
      const regionUrls: Record<string, string> = {
        'us-east': 'https://api-us-east.example.com/v1',
        'us-west': 'https://api-us-west.example.com/v1',
        'eu-west': 'https://api-eu-west.example.com/v1',
        'eu-central': 'https://api-eu-central.example.com/v1',
        'ap-southeast': 'https://api-ap-southeast.example.com/v1',
      };
      const base = regionUrls[region] || regionUrls['us-east'];
      return path ? `${base}/${path}` : base;
    },
    [tenant]
  );

  return {
    tenant,
    isLoading,
    isTenantFeatureEnabled,
    getApiBaseUrl,
  };
}

/**
 * Hook for data residency compliance
 */
export function useDataResidency() {
  const [region, setRegion] = useState<string>('us-east-1');

  useEffect(() => {
    const detectRegion = async () => {
      try {
        const response = await fetch('/api/geo/region');
        const data = await response.json();
        setRegion(data.region);
      } catch (error) {
        console.error('Region detection failed:', error);
      }
    };

    detectRegion();
  }, []);

  const getApiBaseUrl = useCallback((): string => {
    const baseUrls: Record<string, string> = {
      'us-east-1': 'https://api.us-east-1.simple378.app',
      'eu-west-1': 'https://api.eu-west-1.simple378.app',
      'ap-southeast-1': 'https://api.ap-southeast-1.simple378.app',
    };
    return baseUrls[region] || 'https://api.simple378.app';
  }, [region]);

  return {
    region,
    getApiBaseUrl,
  };
}
