#!/usr/bin/env python3
"""
Simple test script for CodeManager functionality.
Verifies that optimizations don't break existing behavior.
"""

import sys
from utils import CodeManager
from config import STATUS_COMPLETED, STATUS_IN_PROGRESS, STATUS_PENDING


def test_add_code():
    """Test adding codes to the manager."""
    manager = CodeManager()
    manager.add_code("TEST001", "Test Code", STATUS_COMPLETED)
    
    assert len(manager.codes) == 1, "Should have 1 code"
    assert manager.codes[0]['id'] == "TEST001", "Code ID should match"
    assert manager.codes[0]['status'] == STATUS_COMPLETED, "Status should match"
    print("✓ test_add_code passed")


def test_get_completed_codes():
    """Test filtering completed codes."""
    manager = CodeManager()
    manager.add_code("CODE001", "Completed Task", STATUS_COMPLETED)
    manager.add_code("CODE002", "In Progress Task", STATUS_IN_PROGRESS)
    manager.add_code("CODE003", "Another Completed", STATUS_COMPLETED)
    manager.add_code("CODE004", "Pending Task", STATUS_PENDING)
    
    completed = manager.get_completed_codes()
    
    assert len(completed) == 2, "Should have 2 completed codes"
    assert all(c['status'] == STATUS_COMPLETED for c in completed), "All should be completed"
    print("✓ test_get_completed_codes passed")


def test_display_codes_with_parameter():
    """Test that display_codes can accept pre-filtered codes."""
    manager = CodeManager()
    manager.add_code("CODE001", "Task 1", STATUS_COMPLETED)
    manager.add_code("CODE002", "Task 2", STATUS_COMPLETED)
    
    # Get codes once
    codes = manager.get_completed_codes()
    
    # Display should accept the pre-fetched codes (no redundant filtering)
    print("\nTesting display with pre-fetched codes:")
    manager.display_codes(codes)
    print("✓ test_display_codes_with_parameter passed")


def test_display_codes_without_parameter():
    """Test that display_codes works without parameter (backward compatibility)."""
    manager = CodeManager()
    manager.add_code("CODE001", "Task 1", STATUS_COMPLETED)
    
    print("\nTesting display without parameter (backward compatibility):")
    manager.display_codes()
    print("✓ test_display_codes_without_parameter passed")


def test_empty_display():
    """Test displaying when no codes exist."""
    manager = CodeManager()
    
    print("\nTesting empty display:")
    manager.display_codes()
    print("✓ test_empty_display passed")


def run_all_tests():
    """Run all tests."""
    print("Running CodeManager tests...\n")
    
    try:
        test_add_code()
        test_get_completed_codes()
        test_display_codes_with_parameter()
        test_display_codes_without_parameter()
        test_empty_display()
        
        print("\n" + "=" * 50)
        print("All tests passed! ✓")
        print("=" * 50)
        return 0
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
