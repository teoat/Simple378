# Simple378
Simplification - A simple application for pulling completed codes from the system.

## Overview
Simple378 is a lightweight Python application designed to manage and display completed code entries. It provides a simple interface to pull and view all completed codes from the system.

## Features
- Add and manage code entries
- Filter and display completed codes
- Timestamp tracking for each code entry
- Clean, formatted output display

## Requirements
- Python 3.6 or higher
- No external dependencies required

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/teoat/Simple378.git
   cd Simple378
   ```

2. No additional installation steps required - the application uses only Python standard library.

## Usage
Run the main application:
```bash
python3 main.py
```

The application will:
1. Initialize the Code Manager
2. Load sample completed codes
3. Display all completed codes in a formatted table

## Project Structure
```
Simple378/
├── main.py          # Main application entry point
├── utils.py         # Utility classes and functions
├── config.py        # Configuration settings
├── requirements.txt # Dependencies (none required)
└── README.md        # This file
```

## Example Output
```
    ╔═══════════════════════════════════════════════════════╗
    ║             Simple378 - Code Manager                  ║
    ║             Pulling Completed Codes                   ║
    ╚═══════════════════════════════════════════════════════╝

Initializing Code Manager...

Pulling completed codes from the system...

Total completed codes: 5

======================================================================
ID           Description                    Status       Timestamp
======================================================================
CODE001      User Authentication System     Completed    2025-12-03 06:20:00
CODE002      Database Integration           Completed    2025-12-03 06:20:00
CODE003      API Endpoints                  Completed    2025-12-03 06:20:00
CODE004      Frontend UI Components         Completed    2025-12-03 06:20:00
CODE005      Testing Suite                  Completed    2025-12-03 06:20:00
======================================================================
```

## License
This project is open source and available for educational purposes.
