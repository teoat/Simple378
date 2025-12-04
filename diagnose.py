#!/usr/bin/env python3
"""Diagnostic tool for Simple378 project."""
import sys
import os
import subprocess
import importlib.util


def check_python_version():
    """Check if Python version meets requirements."""
    print("\n" + "="*70)
    print("1. Python Version Check")
    print("="*70)
    
    version = sys.version_info
    print(f"Current Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major >= 3 and version.minor >= 6:
        print("✅ Python version is compatible (>=3.6)")
        return True
    else:
        print("❌ Python version is too old (requires >=3.6)")
        return False


def check_package_structure():
    """Check if package structure is correct."""
    print("\n" + "="*70)
    print("2. Package Structure Check")
    print("="*70)
    
    required_files = [
        "setup.py",
        "src/simple378/__init__.py",
        "src/simple378/main.py",
    ]
    
    all_present = True
    for file in required_files:
        path = os.path.join(os.path.dirname(__file__), file)
        if os.path.exists(path):
            print(f"✅ {file} exists")
        else:
            print(f"❌ {file} missing")
            all_present = False
    
    return all_present


def check_package_installed():
    """Check if package is installed."""
    print("\n" + "="*70)
    print("3. Package Installation Check")
    print("="*70)
    
    try:
        import simple378
        print(f"✅ simple378 package is installed")
        print(f"   Version: {simple378.__version__}")
        print(f"   Location: {simple378.__file__}")
        return True
    except ImportError as e:
        print(f"❌ simple378 package is not installed: {e}")
        return False


def check_entry_point():
    """Check if entry point works."""
    print("\n" + "="*70)
    print("4. Entry Point Check")
    print("="*70)
    
    result = subprocess.run(
        [sys.executable, "-m", "simple378.main"],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ Entry point works correctly")
        print(f"   Output: {result.stdout.strip()}")
        return True
    else:
        print("❌ Entry point failed")
        print(f"   Error: {result.stderr}")
        return False


def check_build_system():
    """Check if build system files are present."""
    print("\n" + "="*70)
    print("5. Build System Check")
    print("="*70)
    
    build_files = ["setup.py", "build.py", "diagnose.py"]
    all_present = True
    
    for file in build_files:
        if os.path.exists(file):
            print(f"✅ {file} exists")
        else:
            print(f"❌ {file} missing")
            all_present = False
    
    return all_present


def main():
    """Run all diagnostic checks."""
    print("="*70)
    print("SIMPLE378 BUILD DIAGNOSTICS")
    print("="*70)
    print("\nRunning comprehensive build diagnostics...")
    
    checks = [
        ("Python Version", check_python_version),
        ("Package Structure", check_package_structure),
        ("Package Installation", check_package_installed),
        ("Entry Point", check_entry_point),
        ("Build System", check_build_system),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ {name} check failed with exception: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "="*70)
    print("DIAGNOSTIC SUMMARY")
    print("="*70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nOverall: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n✅ All diagnostics passed! Build is successful and working.")
        return 0
    else:
        print(f"\n❌ {total - passed} diagnostic(s) failed. Build needs attention.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
