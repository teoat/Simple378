from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import asyncio
import time
import statistics
import aiohttp
import psutil
from concurrent.futures import ThreadPoolExecutor
import json
import os

class LoadTester:
    """
    Comprehensive load testing and performance monitoring system.
    """

    def __init__(self):
        self.test_results: Dict[str, Any] = {}
        self.baseline_metrics: Dict[str, Any] = {}
        self.monitoring_active = False

    async def run_comprehensive_load_test(self) -> Dict[str, Any]:
        """
        Run comprehensive load testing across all system components.
        """
        test_scenarios = {
            "api_endpoints": await self._test_api_endpoints(),
            "ai_processing": await self._test_ai_processing(),
            "database_operations": await self._test_database_operations(),
            "file_processing": await self._test_file_processing(),
            "concurrent_users": await self._test_concurrent_users(),
            "stress_testing": await self._test_stress_limits(),
            "memory_leak_detection": await self._test_memory_leak_detection()
        }

        # Analyze results
        analysis = self._analyze_test_results(test_scenarios)

        # Generate recommendations
        recommendations = self._generate_performance_recommendations(analysis)

        return {
            "test_scenarios": test_scenarios,
            "analysis": analysis,
            "recommendations": recommendations,
            "performance_score": self._calculate_performance_score(analysis),
            "bottlenecks_identified": analysis.get("bottlenecks", []),
            "scalability_assessment": analysis.get("scalability", {})
        }

    async def _test_api_endpoints(self) -> Dict[str, Any]:
        """Test API endpoint performance under load."""
        endpoints = [
            {"url": "/api/v1/subjects/", "method": "GET", "description": "List subjects"},
            {"url": "/api/v1/cases/", "method": "GET", "description": "List cases"},
            {"url": "/api/v1/subjects/test-id", "method": "GET", "description": "Get subject details"},
            {"url": "/api/v1/cases/test-id/ai-analysis", "method": "POST", "description": "AI analysis"},
            {"url": "/api/v1/reports/generate", "method": "POST", "description": "Generate report"}
        ]

        results = {}

        for endpoint in endpoints:
            # Test with different concurrency levels
            concurrency_levels = [1, 5, 10, 25, 50]

            endpoint_results = {}
            for concurrency in concurrency_levels:
                try:
                    result = await self._load_test_endpoint(
                        endpoint["url"],
                        endpoint["method"],
                        concurrency,
                        duration=30  # 30 seconds
                    )
                    endpoint_results[f"concurrency_{concurrency}"] = result
                except Exception as e:
                    endpoint_results[f"concurrency_{concurrency}"] = {"error": str(e)}

            results[endpoint["description"]] = endpoint_results

        return results

    async def _test_ai_processing(self) -> Dict[str, Any]:
        """Test AI processing performance."""
        ai_tests = {
            "case_categorization": {
                "description": "AI-powered case categorization",
                "test_function": self._test_ai_case_categorization,
                "expected_duration": "< 5 seconds"
            },
            "fraud_prediction": {
                "description": "Real-time fraud prediction",
                "test_function": self._test_ai_fraud_prediction,
                "expected_duration": "< 2 seconds"
            },
            "evidence_analysis": {
                "description": "Document/image evidence analysis",
                "test_function": self._test_ai_evidence_analysis,
                "expected_duration": "< 10 seconds"
            },
            "pattern_recognition": {
                "description": "Transaction pattern recognition",
                "test_function": self._test_ai_pattern_recognition,
                "expected_duration": "< 3 seconds"
            }
        }

        results = {}
        for test_name, test_config in ai_tests.items():
            try:
                result = await test_config["test_function"]()
                results[test_name] = {
                    "description": test_config["description"],
                    "result": result,
                    "expected_duration": test_config["expected_duration"],
                    "passed": result.get("duration", 0) < self._parse_duration(test_config["expected_duration"])
                }
            except Exception as e:
                results[test_name] = {
                    "description": test_config["description"],
                    "error": str(e),
                    "passed": False
                }

        return results

    async def _test_database_operations(self) -> Dict[str, Any]:
        """Test database operation performance."""
        db_tests = {
            "case_queries": {
                "description": "Case list and detail queries",
                "operations": ["SELECT", "INSERT", "UPDATE"],
                "concurrency": [1, 10, 50]
            },
            "transaction_queries": {
                "description": "Transaction aggregation queries",
                "operations": ["COUNT", "SUM", "GROUP BY"],
                "concurrency": [1, 5, 20]
            },
            "bulk_operations": {
                "description": "Bulk data operations",
                "operations": ["BATCH INSERT", "BULK UPDATE"],
                "data_sizes": [100, 1000, 10000]
            },
            "search_operations": {
                "description": "Full-text search operations",
                "query_types": ["exact", "fuzzy", "regex"],
                "data_sizes": ["small", "medium", "large"]
            }
        }

        results = {}
        for test_name, test_config in db_tests.items():
            results[test_name] = await self._execute_db_test(test_config)

        return results

    async def _test_file_processing(self) -> Dict[str, Any]:
        """Test file processing performance."""
        file_tests = {
            "pdf_processing": {
                "file_types": ["small_pdf", "large_pdf", "complex_pdf"],
                "operations": ["text_extraction", "metadata_analysis", "tampering_detection"]
            },
            "image_processing": {
                "file_types": ["small_image", "large_image", "scanned_document"],
                "operations": ["ocr", "quality_analysis", "tampering_detection"]
            },
            "bulk_upload": {
                "scenarios": ["single_large_file", "multiple_files", "mixed_file_types"],
                "concurrency": [1, 5, 10]
            }
        }

        results = {}
        for test_name, test_config in file_tests.items():
            results[test_name] = await self._execute_file_test(test_config)

        return results

    async def _test_concurrent_users(self) -> Dict[str, Any]:
        """Test system performance with concurrent users."""
        user_scenarios = [
            {
                "name": "light_usage",
                "users": 50,
                "think_time": 2.0,  # seconds between actions
                "duration": 300  # 5 minutes
            },
            {
                "name": "moderate_usage",
                "users": 200,
                "think_time": 1.0,
                "duration": 300
            },
            {
                "name": "heavy_usage",
                "users": 500,
                "think_time": 0.5,
                "duration": 300
            },
            {
                "name": "peak_usage",
                "users": 1000,
                "think_time": 0.2,
                "duration": 180  # 3 minutes
            }
        ]

        results = {}
        for scenario in user_scenarios:
            results[scenario["name"]] = await self._simulate_user_load(scenario)

        return results

    async def _test_stress_limits(self) -> Dict[str, Any]:
        """Test system limits and failure points."""
        stress_tests = {
            "memory_stress": await self._test_memory_limits(),
            "cpu_stress": await self._test_cpu_limits(),
            "network_stress": await self._test_network_limits(),
            "database_stress": await self._test_database_limits(),
            "disk_io_stress": await self._test_disk_io_limits()
        }

        return stress_tests

    async def _test_memory_leak_detection(self) -> Dict[str, Any]:
        """Test for memory leaks under sustained load."""
        # Run sustained load test
        test_duration = 600  # 10 minutes
        monitoring_interval = 30  # 30 seconds

        memory_readings = []
        start_time = time.time()

        while time.time() - start_time < test_duration:
            # Record memory usage
            memory_info = psutil.virtual_memory()
            memory_readings.append({
                "timestamp": time.time(),
                "used_percent": memory_info.percent,
                "used_gb": memory_info.used / (1024**3),
                "available_gb": memory_info.available / (1024**3)
            })

            # Run some operations to stress memory
            await self._generate_memory_load()

            await asyncio.sleep(monitoring_interval)

        # Analyze memory pattern
        memory_analysis = self._analyze_memory_pattern(memory_readings)

        return {
            "test_duration_minutes": test_duration / 60,
            "memory_readings": memory_readings,
            "analysis": memory_analysis,
            "leak_detected": memory_analysis.get("leak_probability", 0) > 0.7,
            "recommendations": self._generate_memory_recommendations(memory_analysis)
        }

    async def _load_test_endpoint(self, url: str, method: str, concurrency: int, duration: int) -> Dict[str, Any]:
        """Load test a specific endpoint."""
        results = {
            "concurrency": concurrency,
            "duration": duration,
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "response_times": [],
            "error_rate": 0.0,
            "avg_response_time": 0.0,
            "p95_response_time": 0.0,
            "requests_per_second": 0.0
        }

        # In a real implementation, this would use locust or similar load testing tool
        # For now, simulate results
        results.update({
            "total_requests": concurrency * duration * 2,  # Rough estimate
            "successful_requests": int(concurrency * duration * 1.8),
            "failed_requests": int(concurrency * duration * 0.2),
            "response_times": [0.1, 0.2, 0.15, 0.3, 0.1, 0.25, 0.18, 0.12],
            "error_rate": 0.1,
            "avg_response_time": 0.18,
            "p95_response_time": 0.3,
            "requests_per_second": concurrency * 2
        })

        return results

    def _analyze_test_results(self, test_scenarios: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze comprehensive test results."""
        analysis = {
            "overall_performance": "good",
            "bottlenecks": [],
            "scalability": {},
            "recommendations": [],
            "risk_assessment": {}
        }

        # Analyze API performance
        api_results = test_scenarios.get("api_endpoints", {})
        api_bottlenecks = []
        for endpoint, results in api_results.items():
            for concurrency_key, result in results.items():
                if isinstance(result, dict) and result.get("error_rate", 0) > 0.1:
                    api_bottlenecks.append(f"{endpoint} at {concurrency_key}")

        if api_bottlenecks:
            analysis["bottlenecks"].extend(api_bottlenecks)

        # Analyze AI performance
        ai_results = test_scenarios.get("ai_processing", {})
        ai_performance = {}
        for test_name, result in ai_results.items():
            if result.get("passed", False):
                ai_performance[test_name] = "good"
            else:
                ai_performance[test_name] = "needs_improvement"
                analysis["bottlenecks"].append(f"AI {test_name}")

        analysis["ai_performance"] = ai_performance

        # Analyze database performance
        db_results = test_scenarios.get("database_operations", {})
        db_bottlenecks = []
        for test_name, result in db_results.items():
            if result.get("avg_response_time", 0) > 1.0:  # > 1 second
                db_bottlenecks.append(test_name)

        if db_bottlenecks:
            analysis["bottlenecks"].extend(db_bottlenecks)

        # Assess scalability
        concurrent_user_results = test_scenarios.get("concurrent_users", {})
        scalability = {
            "max_concurrent_users": 0,
            "performance_degradation_point": 0,
            "recommended_max_users": 0
        }

        for scenario_name, result in concurrent_user_results.items():
            users = result.get("target_users", 0)
            if result.get("success_rate", 1.0) > 0.95:
                scalability["max_concurrent_users"] = max(scalability["max_concurrent_users"], users)
            else:
                scalability["performance_degradation_point"] = users
                break

        scalability["recommended_max_users"] = int(scalability["max_concurrent_users"] * 0.8)
        analysis["scalability"] = scalability

        # Overall assessment
        bottleneck_count = len(analysis["bottlenecks"])
        if bottleneck_count == 0:
            analysis["overall_performance"] = "excellent"
        elif bottleneck_count <= 2:
            analysis["overall_performance"] = "good"
        elif bottleneck_count <= 5:
            analysis["overall_performance"] = "needs_improvement"
        else:
            analysis["overall_performance"] = "critical"

        return analysis

    def _generate_performance_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate performance improvement recommendations."""
        recommendations = []

        # Based on bottlenecks
        bottlenecks = analysis.get("bottlenecks", [])
        if any("api" in b.lower() for b in bottlenecks):
            recommendations.extend([
                "Implement API response caching",
                "Add database query optimization",
                "Consider API rate limiting adjustments"
            ])

        if any("ai" in b.lower() for b in bottlenecks):
            recommendations.extend([
                "Optimize AI model inference",
                "Implement AI result caching",
                "Consider GPU instance scaling"
            ])

        if any("database" in b.lower() for b in bottlenecks):
            recommendations.extend([
                "Add database indexes",
                "Implement read replicas",
                "Optimize slow queries"
            ])

        # Based on scalability
        scalability = analysis.get("scalability", {})
        max_users = scalability.get("recommended_max_users", 0)
        if max_users < 100:
            recommendations.append("Implement horizontal scaling for user load")
        elif max_users < 500:
            recommendations.append("Optimize for moderate concurrent usage")
        else:
            recommendations.append("System handles high concurrency well")

        # General recommendations
        recommendations.extend([
            "Implement comprehensive monitoring",
            "Set up automated performance testing",
            "Establish performance baselines",
            "Create performance improvement roadmap"
        ])

        return list(set(recommendations))  # Remove duplicates

    def _calculate_performance_score(self, analysis: Dict[str, Any]) -> float:
        """Calculate overall performance score (0-100)."""
        score = 100.0

        # Deduct for bottlenecks
        bottleneck_penalty = len(analysis.get("bottlenecks", [])) * 5
        score -= min(bottleneck_penalty, 40)

        # Deduct for scalability issues
        scalability = analysis.get("scalability", {})
        max_users = scalability.get("recommended_max_users", 1000)
        if max_users < 100:
            score -= 30
        elif max_users < 500:
            score -= 15

        # Deduct for AI performance issues
        ai_performance = analysis.get("ai_performance", {})
        ai_issues = sum(1 for perf in ai_performance.values() if perf != "good")
        score -= ai_issues * 3

        return max(0, min(100, score))

    # Placeholder methods for testing (would be implemented with actual testing logic)
    async def _test_ai_case_categorization(self) -> Dict[str, Any]:
        return {"duration": 2.5, "success": True}

    async def _test_ai_fraud_prediction(self) -> Dict[str, Any]:
        return {"duration": 1.2, "success": True}

    async def _test_ai_evidence_analysis(self) -> Dict[str, Any]:
        return {"duration": 8.5, "success": True}

    async def _test_ai_pattern_recognition(self) -> Dict[str, Any]:
        return {"duration": 1.8, "success": True}

    async def _execute_db_test(self, config: Dict[str, Any]) -> Dict[str, Any]:
        return {"avg_response_time": 0.15, "success_rate": 0.98}

    async def _execute_file_test(self, config: Dict[str, Any]) -> Dict[str, Any]:
        return {"processing_time": 3.2, "success_rate": 0.95}

    async def _simulate_user_load(self, scenario: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "target_users": scenario["users"],
            "success_rate": 0.92 if scenario["users"] < 500 else 0.85,
            "avg_response_time": 0.3 + (scenario["users"] * 0.001)
        }

    async def _test_memory_limits(self) -> Dict[str, Any]:
        return {"max_memory_usage": 0.85, "memory_limit_reached": False}

    async def _test_cpu_limits(self) -> Dict[str, Any]:
        return {"max_cpu_usage": 0.78, "cpu_limit_reached": False}

    async def _test_network_limits(self) -> Dict[str, Any]:
        return {"max_network_usage": 0.65, "network_limit_reached": False}

    async def _test_database_limits(self) -> Dict[str, Any]:
        return {"max_connections": 45, "connection_limit_reached": False}

    async def _test_disk_io_limits(self) -> Dict[str, Any]:
        return {"max_io_usage": 0.72, "io_limit_reached": False}

    async def _generate_memory_load(self) -> None:
        """Generate memory load for testing."""
        # Create some memory pressure for testing
        large_list = [i for i in range(100000)]
        await asyncio.sleep(0.1)  # Simulate processing
        del large_list

    def _analyze_memory_pattern(self, readings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze memory usage pattern for leak detection."""
        if not readings:
            return {"leak_probability": 0.0}

        used_percentages = [r["used_percent"] for r in readings]

        # Simple trend analysis
        if len(used_percentages) >= 10:
            first_half = used_percentages[:len(used_percentages)//2]
            second_half = used_percentages[len(used_percentages)//2:]

            first_avg = sum(first_half) / len(first_half)
            second_avg = sum(second_half) / len(second_half)

            trend = second_avg - first_avg
            leak_probability = min(1.0, max(0.0, trend / 10))  # Normalize trend
        else:
            leak_probability = 0.0

        return {
            "leak_probability": leak_probability,
            "average_usage": sum(used_percentages) / len(used_percentages),
            "peak_usage": max(used_percentages),
            "trend": "increasing" if leak_probability > 0.3 else "stable"
        }

    def _generate_memory_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate memory optimization recommendations."""
        recommendations = []

        if analysis.get("leak_probability", 0) > 0.5:
            recommendations.extend([
                "Investigate memory leaks in application code",
                "Implement memory profiling",
                "Add memory monitoring alerts"
            ])

        if analysis.get("peak_usage", 0) > 85:
            recommendations.extend([
                "Increase instance memory allocation",
                "Optimize memory-intensive operations",
                "Implement memory-efficient data structures"
            ])

        if analysis.get("trend") == "increasing":
            recommendations.append("Monitor memory usage trends closely")

        return recommendations

    def _parse_duration(self, duration_str: str) -> float:
        """Parse duration string like '< 5 seconds' to seconds."""
        if '<' in duration_str:
            parts = duration_str.replace('<', '').strip().split()
            value = float(parts[0])
            unit = parts[1].lower()
            if 'second' in unit:
                return value
            elif 'minute' in unit:
                return value * 60
        return 10.0  # Default fallback