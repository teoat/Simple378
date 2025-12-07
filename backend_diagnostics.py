#!/usr/bin/env python3
"""
Backend Diagnostics Module for AntiGravity Fraud Detection System
"""

import os
import json
import time
import psutil
import logging
from datetime import datetime
from typing import Dict, Any, List
import subprocess

class BackendDiagnostics:
    """Comprehensive backend diagnostic framework"""

    def __init__(self):
        self.logger = logging.getLogger('backend_diagnostics')
        self.start_time = time.time()

    def system_health_check(self) -> Dict[str, Any]:
        """Comprehensive system health check"""
        try:
            return {
                'timestamp': datetime.now().isoformat(),
                'uptime_seconds': time.time() - self.start_time,
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_usage_percent': psutil.disk_usage('/').percent,
                'network_connections': len(psutil.net_connections()),
                'process_count': len(psutil.pids()),
                'status': 'healthy'
            }
        except Exception as e:
            return {
                'timestamp': datetime.now().isoformat(),
                'status': 'error',
                'error': str(e)
            }

    def database_connection_check(self) -> Dict[str, Any]:
        """Database connectivity and performance check"""
        try:
            # Test database connection using psql
            result = subprocess.run(
                ['docker', 'exec', 'simple378-db-1', 'pg_isready', '-U', 'fraud_admin'],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode == 0:
                # Get database stats
                stats_result = subprocess.run(
                    ['docker', 'exec', 'simple378-db-1', 'psql', '-U', 'fraud_admin', '-d', 'fraud_detection', '-c',
                     'SELECT count(*) as connections FROM pg_stat_activity;'],
                    capture_output=True,
                    text=True,
                    timeout=10
                )

                connection_count = 0
                if stats_result.returncode == 0:
                    # Parse the result
                    lines = stats_result.stdout.strip().split('\n')
                    if len(lines) >= 3:
                        try:
                            connection_count = int(lines[2].strip())
                        except:
                            pass

                return {
                    'status': 'healthy',
                    'connection': True,
                    'active_connections': connection_count,
                    'message': 'Database connection successful'
                }
            else:
                return {
                    'status': 'unhealthy',
                    'connection': False,
                    'error': result.stderr.strip(),
                    'message': 'Database connection failed'
                }

        except Exception as e:
            return {
                'status': 'error',
                'connection': False,
                'error': str(e),
                'message': 'Database check failed'
            }

    def api_endpoint_analysis(self) -> Dict[str, Any]:
        """API endpoint performance and error analysis"""
        try:
            import requests

            endpoints = [
                'http://localhost:8000/health',
                'http://localhost:8000/cases/',
                'http://localhost:8000/dashboard/metrics'
            ]

            results = {}
            total_response_time = 0
            successful_calls = 0

            for endpoint in endpoints:
                try:
                    start_time = time.time()
                    response = requests.get(endpoint, timeout=5)
                    response_time = time.time() - start_time

                    total_response_time += response_time

                    results[endpoint] = {
                        'status_code': response.status_code,
                        'response_time': round(response_time * 1000, 2),  # ms
                        'success': response.status_code < 400
                    }

                    if response.status_code < 400:
                        successful_calls += 1

                except Exception as e:
                    results[endpoint] = {
                        'status_code': None,
                        'response_time': None,
                        'success': False,
                        'error': str(e)
                    }

            avg_response_time = (total_response_time / len(endpoints)) * 1000 if endpoints else 0

            return {
                'total_endpoints_tested': len(endpoints),
                'successful_calls': successful_calls,
                'average_response_time_ms': round(avg_response_time, 2),
                'endpoint_results': results,
                'overall_status': 'healthy' if successful_calls == len(endpoints) else 'degraded'
            }

        except ImportError:
            return {
                'status': 'error',
                'message': 'requests library not available',
                'total_endpoints_tested': 0,
                'successful_calls': 0
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e),
                'total_endpoints_tested': 0,
                'successful_calls': 0
            }

    def memory_analysis(self) -> Dict[str, Any]:
        """Memory usage and leak detection"""
        try:
            process = psutil.Process()
            memory_info = process.memory_info()

            return {
                'rss_memory_mb': round(memory_info.rss / 1024 / 1024, 2),
                'vms_memory_mb': round(memory_info.vms / 1024 / 1024, 2),
                'memory_percent': process.memory_percent(),
                'open_files': len(process.open_files()),
                'threads': process.num_threads(),
                'status': 'healthy' if process.memory_percent() < 80 else 'warning'
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }

    def dependency_check(self) -> Dict[str, Any]:
        """External dependency health check"""
        dependencies = {}

        # Check Redis
        try:
            result = subprocess.run(
                ['docker', 'exec', 'fraud_redis', 'redis-cli', 'ping'],
                capture_output=True,
                text=True,
                timeout=5
            )
            dependencies['redis'] = {
                'status': 'healthy' if result.returncode == 0 and 'PONG' in result.stdout else 'unhealthy',
                'response': result.stdout.strip() if result.returncode == 0 else result.stderr.strip()
            }
        except Exception as e:
            dependencies['redis'] = {
                'status': 'error',
                'error': str(e)
            }

        # Check Qdrant
        try:
            import requests
            response = requests.get('http://localhost:6333/health', timeout=5)
            dependencies['qdrant'] = {
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'status_code': response.status_code
            }
        except Exception as e:
            dependencies['qdrant'] = {
                'status': 'error',
                'error': str(e)
            }

        # Check Prometheus
        try:
            import requests
            response = requests.get('http://localhost:9090/-/healthy', timeout=5)
            dependencies['prometheus'] = {
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'status_code': response.status_code
            }
        except Exception as e:
            dependencies['prometheus'] = {
                'status': 'error',
                'error': str(e)
            }

        overall_status = 'healthy'
        for dep in dependencies.values():
            if dep['status'] != 'healthy':
                overall_status = 'degraded'
                break

        return {
            'overall_status': overall_status,
            'dependencies': dependencies
        }

    def run_full_diagnostics(self) -> Dict[str, Any]:
        """Run complete diagnostic suite"""
        self.logger.info("🔍 Starting full backend diagnostics")

        diagnostics = {
            'timestamp': datetime.now().isoformat(),
            'system_health': self.system_health_check(),
            'database': self.database_connection_check(),
            'api_performance': self.api_endpoint_analysis(),
            'memory_usage': self.memory_analysis(),
            'dependencies': self.dependency_check(),
            'recommendations': self._generate_recommendations()
        }

        self.logger.info("✅ Backend diagnostics complete")
        return diagnostics

    def _generate_recommendations(self) -> List[str]:
        """Generate actionable recommendations based on diagnostics"""
        recommendations = []

        # Check system health
        system_health = self.system_health_check()
        if system_health.get('cpu_percent', 0) > 80:
            recommendations.append("High CPU usage detected - consider scaling or optimization")
        if system_health.get('memory_percent', 0) > 85:
            recommendations.append("High memory usage - check for memory leaks")

        # Check database
        db_check = self.database_connection_check()
        if db_check.get('status') != 'healthy':
            recommendations.append("Database connectivity issues - check connection pool and network")

        # Check API performance
        api_analysis = self.api_endpoint_analysis()
        if api_analysis.get('average_response_time_ms', 0) > 2000:
            recommendations.append("Slow API response times - optimize database queries and caching")

        # Check dependencies
        deps = self.dependency_check()
        if deps.get('overall_status') != 'healthy':
            recommendations.append("External dependencies have issues - check Redis, Qdrant, and Prometheus")

        return recommendations

def main():
    """Main diagnostic runner"""
    print("🚀 AntiGravity Backend Diagnostics")
    print("=" * 40)

    diag = BackendDiagnostics()
    results = diag.run_full_diagnostics()

    print("\n📊 DIAGNOSTIC RESULTS")
    print("-" * 30)

    # System Health
    sys_health = results['system_health']
    print(f"🖥️  System Health: {sys_health.get('status', 'unknown')}")
    print(f"   Uptime: {sys_health.get('uptime_seconds', 0):.0f} seconds")
    print(f"   CPU: {sys_health.get('cpu_percent', 0):.1f}%")
    print(f"   Memory: {sys_health.get('memory_percent', 0):.1f}%")

    # Database
    db_check = results['database']
    print(f"\n🗄️  Database: {db_check.get('status', 'unknown')}")
    if db_check.get('connection'):
        print(f"   Active Connections: {db_check.get('active_connections', 0)}")

    # API Performance
    api_perf = results['api_performance']
    print(f"\n🌐 API Performance: {api_perf.get('overall_status', 'unknown')}")
    print(f"   Endpoints Tested: {api_perf.get('total_endpoints_tested', 0)}")
    print(f"   Successful: {api_perf.get('successful_calls', 0)}")
    print(f"   Avg Response Time: {api_perf.get('average_response_time_ms', 0):.0f}ms")

    # Dependencies
    deps = results['dependencies']
    print(f"\n🔗 Dependencies: {deps.get('overall_status', 'unknown')}")
    for name, status in deps.get('dependencies', {}).items():
        print(f"   {name}: {status.get('status', 'unknown')}")

    # Recommendations
    recommendations = results.get('recommendations', [])
    if recommendations:
        print(f"\n💡 RECOMMENDATIONS ({len(recommendations)})")
        print("-" * 20)
        for i, rec in enumerate(recommendations, 1):
            print(f"{i}. {rec}")

    print(f"\n✅ Diagnostics completed at {results['timestamp']}")

if __name__ == "__main__":
    main()