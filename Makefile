.PHONY: help build diagnose run clean test

help:
	@echo "Simple378 Build System"
	@echo "======================"
	@echo ""
	@echo "Available targets:"
	@echo "  build     - Build the project"
	@echo "  diagnose  - Run build diagnostics"
	@echo "  run       - Run the application"
	@echo "  clean     - Clean build artifacts"
	@echo "  test      - Run build and diagnostics"
	@echo "  help      - Show this help message"

build:
	@python3 build.py

diagnose:
	@python3 diagnose.py

run:
	@python3 -m simple378.main

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf build/ dist/ *.egg-info src/*.egg-info
	@find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete
	@echo "✅ Clean complete"

test: build diagnose
	@echo ""
	@echo "✅ Build and diagnostics complete!"
