"""
Docker health check verification script.
Run this in CI/CD to verify health endpoints exist and are accessible.
"""
import asyncio
import httpx
import sys
from typing import List, Tuple


async def verify_health_endpoints(
    base_url: str = "http://localhost:8000",
    timeout: float = 5.0
) -> Tuple[bool, List[str]]:
    """
    Verify that all required health endpoints exist.
    
    Args:
        base_url: Base URL of the service
        timeout: Timeout for requests
        
    Returns:
        Tuple of (all_healthy, issues)
    """
    endpoints = [
        ("/health", "Basic health check"),
        ("/health/ready", "Readiness check"),
        ("/health/live", "Liveness check (optional)"),
    ]
    
    issues = []
    
    async with httpx.AsyncClient(timeout=timeout) as client:
        for endpoint, description in endpoints:
            try:
                response = await client.get(f"{base_url}{endpoint}")
                
                if response.status_code != 200:
                    issues.append(
                        f"{endpoint}: Expected 200, got {response.status_code}"
                    )
                    print(f"❌ {endpoint} ({description}): {response.status_code}")
                else:
                    print(f"✅ {endpoint} ({description}): OK")
                    
            except httpx.ConnectError:
                issues.append(f"{endpoint}: Connection failed")
                print(f"❌ {endpoint} ({description}): Connection failed")
            except httpx.TimeoutException:
                issues.append(f"{endpoint}: Timeout")
                print(f"❌ {endpoint} ({description}): Timeout")
            except Exception as e:
                issues.append(f"{endpoint}: {str(e)}")
                print(f"❌ {endpoint} ({description}): {str(e)}")
    
    all_healthy = len(issues) == 0
    return all_healthy, issues


async def main():
    """Run health checks."""
    print("Starting health endpoint verification...")
    print()
    
    all_healthy, issues = await verify_health_endpoints()
    
    print()
    if all_healthy:
        print("✅ All health endpoints verified successfully!")
        return 0
    else:
        print("❌ Some health endpoints failed verification:")
        for issue in issues:
            print(f"  - {issue}")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
