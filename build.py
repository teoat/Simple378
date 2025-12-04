#!/usr/bin/env python3
"""Build script for Simple378 project."""
import sys
import subprocess
import os


def run_command(cmd, description):
    """Run a command and report results."""
    print(f"\n{'='*70}")
    print(f"Running: {description}")
    print(f"Command: {' '.join(cmd)}")
    print('='*70)
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    
    return result.returncode == 0


def build():
    """Build the project."""
    print("="*70)
    print("SIMPLE378 BUILD PROCESS")
    print("="*70)
    
    # Check Python version
    print(f"\nPython version: {sys.version}")
    print(f"Python executable: {sys.executable}")
    
    # Install in development mode
    if not run_command(
        [sys.executable, "-m", "pip", "install", "-e", "."],
        "Installing package in development mode"
    ):
        print("\n❌ Build failed during package installation")
        return False
    
    print("\n✅ Build completed successfully!")
    return True


if __name__ == "__main__":
    success = build()
    sys.exit(0 if success else 1)
