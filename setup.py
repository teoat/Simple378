"""Setup script for Simple378 project."""
from setuptools import setup, find_packages

setup(
    name="simple378",
    version="1.0.0",
    description="Simplification project",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.6",
    install_requires=[],
    entry_points={
        "console_scripts": [
            "simple378=simple378.main:main",
        ],
    },
)
