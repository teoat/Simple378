"""
Utility module for Simple378 application.
Contains helper classes and functions for managing codes.
"""

from datetime import datetime
from config import MAX_DISPLAY_WIDTH, DATE_FORMAT, STATUS_COMPLETED


class CodeManager:
    """Manager class for handling completed codes."""
    
    def __init__(self):
        """Initialize the CodeManager with an empty code registry."""
        self.codes = []
    
    def add_code(self, code_id, description, status):
        """
        Add a new code to the registry.
        
        Args:
            code_id (str): Unique identifier for the code
            description (str): Description of the code
            status (str): Current status of the code
        """
        code_entry = {
            'id': code_id,
            'description': description,
            'status': status,
            'timestamp': datetime.now().strftime(DATE_FORMAT)
        }
        self.codes.append(code_entry)
    
    def get_completed_codes(self):
        """
        Retrieve all completed codes.
        
        Returns:
            list: List of completed code entries
        """
        return [code for code in self.codes if code['status'] == STATUS_COMPLETED]
    
    def display_codes(self, codes=None):
        """
        Display codes in a formatted manner.
        
        Args:
            codes (list, optional): List of codes to display. If None, displays all completed codes.
        """
        if codes is None:
            codes = self.get_completed_codes()
        
        if not codes:
            print("No completed codes to display.")
            return
        
        separator = "=" * MAX_DISPLAY_WIDTH
        print(separator)
        print(f"{'ID':<12} {'Description':<30} {'Status':<12} {'Timestamp'}")
        print(separator)
        
        for code in codes:
            print(f"{code['id']:<12} {code['description']:<30} "
                  f"{code['status']:<12} {code['timestamp']}")
        
        print(separator)


def display_banner():
    """Display application banner."""
    banner = """
    ╔═══════════════════════════════════════════════════════╗
    ║             Simple378 - Code Manager                  ║
    ║             Pulling Completed Codes                   ║
    ╚═══════════════════════════════════════════════════════╝
    """
    print(banner)
