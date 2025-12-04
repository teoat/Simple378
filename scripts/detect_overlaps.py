#!/usr/bin/env python3
"""
Overlap Detector - Detect overlapping functions across the codebase.

This script analyzes Python source files to find functions with similar
implementations, helping identify code duplication and opportunities for
refactoring.

Usage:
    python detect_overlaps.py [directory] [--threshold 0.7] [--json]
"""

import ast
import json
import os
import sys
from collections import defaultdict
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Optional


@dataclass
class FunctionInfo:
    """Information about a function."""

    name: str
    file_path: str
    line_number: int
    end_line: int
    body: str
    args: list[str]
    decorators: list[str]
    docstring: Optional[str]


@dataclass
class OverlapResult:
    """Result of overlap detection between two functions."""

    func1: FunctionInfo
    func2: FunctionInfo
    similarity: float
    overlap_type: str  # 'exact', 'high', 'moderate', 'similar_name'


def extract_functions(file_path: str) -> list[FunctionInfo]:
    """Extract all function definitions from a Python file."""
    functions = []

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            source = f.read()

        tree = ast.parse(source)
        lines = source.split("\n")

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) or isinstance(
                node, ast.AsyncFunctionDef
            ):
                start = node.lineno - 1
                end = node.end_lineno if node.end_lineno else start + 1

                # Extract body (excluding decorators)
                body_lines = lines[start:end]
                body = "\n".join(body_lines)

                # Extract arguments
                args = [arg.arg for arg in node.args.args]

                # Extract decorators
                decorators = []
                for dec in node.decorator_list:
                    if isinstance(dec, ast.Name):
                        decorators.append(dec.id)
                    elif isinstance(dec, ast.Attribute):
                        decorators.append(dec.attr)
                    elif isinstance(dec, ast.Call):
                        if isinstance(dec.func, ast.Name):
                            decorators.append(dec.func.id)

                # Extract docstring
                docstring = ast.get_docstring(node)

                functions.append(
                    FunctionInfo(
                        name=node.name,
                        file_path=file_path,
                        line_number=node.lineno,
                        end_line=end,
                        body=body,
                        args=args,
                        decorators=decorators,
                        docstring=docstring,
                    )
                )

    except (SyntaxError, UnicodeDecodeError) as e:
        print(f"⚠️  Could not parse {file_path}: {e}", file=sys.stderr)

    return functions


def normalize_code(code: str) -> str:
    """Normalize code for comparison by removing comments and extra whitespace."""
    lines = []
    for line in code.split("\n"):
        # Remove inline comments
        if "#" in line:
            line = line.split("#")[0]
        # Strip whitespace
        line = line.strip()
        # Skip empty lines and docstrings
        if line and not line.startswith('"""') and not line.startswith("'''"):
            lines.append(line)
    return "\n".join(lines)


def calculate_similarity(func1: FunctionInfo, func2: FunctionInfo) -> float:
    """Calculate similarity ratio between two functions."""
    # Normalize both function bodies
    body1 = normalize_code(func1.body)
    body2 = normalize_code(func2.body)

    # Calculate base similarity
    return SequenceMatcher(None, body1, body2).ratio()


def classify_overlap(similarity: float) -> str:
    """Classify the type of overlap based on similarity score."""
    if similarity >= 0.95:
        return "exact"
    elif similarity >= 0.80:
        return "high"
    elif similarity >= 0.60:
        return "moderate"
    else:
        return "low"


def find_overlaps(
    directory: str, threshold: float = 0.7, min_lines: int = 5
) -> list[OverlapResult]:
    """Find function pairs with similarity above threshold."""
    all_functions: list[FunctionInfo] = []

    # Collect all functions from Python files
    for root, _, files in os.walk(directory):
        # Skip common non-source directories
        if any(skip in root for skip in ["__pycache__", ".git", "venv", "node_modules"]):
            continue

        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                all_functions.extend(extract_functions(path))

    overlaps: list[OverlapResult] = []
    seen_pairs: set[tuple[str, str]] = set()

    print(f"📊 Analyzing {len(all_functions)} functions...\n", file=sys.stderr)

    # Compare all function pairs
    for i, func1 in enumerate(all_functions):
        for func2 in all_functions[i + 1 :]:
            # Skip if same file and adjacent (likely intentional)
            if func1.file_path == func2.file_path:
                if abs(func1.line_number - func2.line_number) < 10:
                    continue

            # Skip trivial functions (less than min_lines)
            func1_lines = len(func1.body.split("\n"))
            func2_lines = len(func2.body.split("\n"))
            if func1_lines < min_lines or func2_lines < min_lines:
                continue

            # Create pair key for deduplication
            pair_key = tuple(
                sorted([f"{func1.file_path}:{func1.name}", f"{func2.file_path}:{func2.name}"])
            )
            if pair_key in seen_pairs:
                continue
            seen_pairs.add(pair_key)

            # Calculate similarity
            similarity = calculate_similarity(func1, func2)

            if similarity >= threshold:
                overlap_type = classify_overlap(similarity)
                overlaps.append(
                    OverlapResult(
                        func1=func1,
                        func2=func2,
                        similarity=similarity,
                        overlap_type=overlap_type,
                    )
                )

    return sorted(overlaps, key=lambda x: -x.similarity)


def check_similar_names(directory: str) -> list[tuple[FunctionInfo, FunctionInfo]]:
    """Find functions with similar names that might be duplicates."""
    all_functions: list[FunctionInfo] = []

    for root, _, files in os.walk(directory):
        if any(skip in root for skip in ["__pycache__", ".git", "venv"]):
            continue
        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                all_functions.extend(extract_functions(path))

    # Group by similar names
    similar: list[tuple[FunctionInfo, FunctionInfo]] = []

    for i, func1 in enumerate(all_functions):
        for func2 in all_functions[i + 1 :]:
            if func1.file_path == func2.file_path:
                continue

            # Check name similarity
            name_sim = SequenceMatcher(None, func1.name, func2.name).ratio()
            if name_sim > 0.8 and func1.name != func2.name:
                similar.append((func1, func2))

    return similar


def format_output(
    overlaps: list[OverlapResult],
    similar_names: list[tuple[FunctionInfo, FunctionInfo]],
    as_json: bool = False,
) -> str:
    """Format the output for display."""
    if as_json:
        data = {
            "overlaps": [
                {
                    "function1": {
                        "name": o.func1.name,
                        "file": o.func1.file_path,
                        "line": o.func1.line_number,
                    },
                    "function2": {
                        "name": o.func2.name,
                        "file": o.func2.file_path,
                        "line": o.func2.line_number,
                    },
                    "similarity": round(o.similarity, 3),
                    "type": o.overlap_type,
                }
                for o in overlaps
            ],
            "similar_names": [
                {
                    "function1": {"name": f1.name, "file": f1.file_path},
                    "function2": {"name": f2.name, "file": f2.file_path},
                }
                for f1, f2 in similar_names
            ],
        }
        return json.dumps(data, indent=2)

    # Text format
    lines = []
    lines.append("╔════════════════════════════════════════════════════════════╗")
    lines.append("║           OVERLAP DETECTION RESULTS                        ║")
    lines.append("╚════════════════════════════════════════════════════════════╝")
    lines.append("")

    if overlaps:
        lines.append("┌────────────────────────────────────────────────────────────┐")
        lines.append("│ CODE OVERLAPS                                              │")
        lines.append("└────────────────────────────────────────────────────────────┘")
        lines.append("")

        for i, overlap in enumerate(overlaps[:20], 1):
            severity = "🔴" if overlap.overlap_type == "exact" else "🟡" if overlap.overlap_type == "high" else "🟢"
            lines.append(f"{severity} [{overlap.overlap_type.upper()}] {overlap.similarity:.0%} similarity")
            lines.append(f"   ├── {Path(overlap.func1.file_path).name}:{overlap.func1.name}() (line {overlap.func1.line_number})")
            lines.append(f"   └── {Path(overlap.func2.file_path).name}:{overlap.func2.name}() (line {overlap.func2.line_number})")
            lines.append("")

        if len(overlaps) > 20:
            lines.append(f"   ... and {len(overlaps) - 20} more")
            lines.append("")
    else:
        lines.append("✅ No significant code overlaps found")
        lines.append("")

    if similar_names:
        lines.append("┌────────────────────────────────────────────────────────────┐")
        lines.append("│ SIMILAR FUNCTION NAMES                                     │")
        lines.append("└────────────────────────────────────────────────────────────┘")
        lines.append("")

        for f1, f2 in similar_names[:10]:
            lines.append(f"   ⚠️  {f1.name}() ↔ {f2.name}()")
            lines.append(f"      {Path(f1.file_path).name} vs {Path(f2.file_path).name}")
            lines.append("")

        if len(similar_names) > 10:
            lines.append(f"   ... and {len(similar_names) - 10} more")
            lines.append("")

    # Summary
    lines.append("┌────────────────────────────────────────────────────────────┐")
    lines.append("│ SUMMARY                                                    │")
    lines.append("└────────────────────────────────────────────────────────────┘")
    lines.append("")
    lines.append(f"   Total overlaps found:     {len(overlaps)}")
    lines.append(f"   Exact duplicates:         {sum(1 for o in overlaps if o.overlap_type == 'exact')}")
    lines.append(f"   High similarity:          {sum(1 for o in overlaps if o.overlap_type == 'high')}")
    lines.append(f"   Similar names:            {len(similar_names)}")
    lines.append("")

    return "\n".join(lines)


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Detect overlapping functions in Python code"
    )
    parser.add_argument(
        "directory",
        nargs="?",
        default="backend/app",
        help="Directory to scan (default: backend/app)",
    )
    parser.add_argument(
        "--threshold",
        "-t",
        type=float,
        default=0.7,
        help="Similarity threshold (default: 0.7)",
    )
    parser.add_argument(
        "--min-lines",
        "-m",
        type=int,
        default=5,
        help="Minimum function lines to consider (default: 5)",
    )
    parser.add_argument(
        "--json",
        "-j",
        action="store_true",
        help="Output as JSON",
    )

    args = parser.parse_args()

    if not os.path.isdir(args.directory):
        print(f"❌ Directory not found: {args.directory}", file=sys.stderr)
        sys.exit(1)

    print(f"🔍 Scanning {args.directory} (threshold: {args.threshold:.0%})...\n", file=sys.stderr)

    overlaps = find_overlaps(args.directory, args.threshold, args.min_lines)
    similar_names = check_similar_names(args.directory)

    output = format_output(overlaps, similar_names, args.json)
    print(output)

    # Exit with error if exact duplicates found
    exact_count = sum(1 for o in overlaps if o.overlap_type == "exact")
    if exact_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
