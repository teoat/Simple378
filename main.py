#!/usr/bin/env python3
"""
Simple378 - Main Application
A simple application for pulling and displaying completed codes.
"""

import sys
from utils import CodeManager, display_banner


def main():
    """Main function to run the application."""
    display_banner()
    
    print("Initializing Code Manager...")
    manager = CodeManager()
    
    # Add some sample completed codes
    manager.add_code("CODE001", "User Authentication System", "Completed")
    manager.add_code("CODE002", "Database Integration", "Completed")
    manager.add_code("CODE003", "API Endpoints", "Completed")
    manager.add_code("CODE004", "Frontend UI Components", "Completed")
    manager.add_code("CODE005", "Testing Suite", "Completed")
    
    print("\nPulling completed codes from the system...\n")
    
    # Display all completed codes
    completed_codes = manager.get_completed_codes()
    
    if completed_codes:
        print(f"Total completed codes: {len(completed_codes)}\n")
        manager.display_codes()
    else:
        print("No completed codes found.")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
