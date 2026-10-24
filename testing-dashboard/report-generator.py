from pathlib import Path
import sys
import xml.etree.ElementTree as ET
import json
import argparse
from pathlib import Path
from datetime import datetime

"""
Needs to be manually updated
"""
MOBILE_TOOLS = [
    ['logos/junit.png', 'JUnit Jupiter', 'Unit tests', 'v5.7.1'],
    ['logos/jacoco.png', 'JaCoCo', 'Code coverage', 'v0.8.9'],
    ['logos/gradle.svg', 'Gradle', 'Running tests and generating reports', 'v8.2']
]

"""
Comment whichever category wants to be skipped out
"""
COVERAGE_LABELS = {
    "branch": "Branched",
    "line": "Lines",
    "instruction": "Instructions",
    "method": "Methods",
    "class": "Classes",
    "complexity": "Complexity",
}


"""
Usage: python3 ./report-generator.py [flag] [path]
The flags are --mobile-artifacts, --platform-artifacts, and --previous
At least one artifact path must be provided, previous must be provided. 
Previous is a path containing the previously generated report-data.json, if none is found, trend
will not be available.
"""
def main():
    # Add arguments and parse
    parser = argparse.ArgumentParser()
    parser.add_argument("--mobile-artifacts", type=Path)
    parser.add_argument("--platform-artifacts", type=Path)
    parser.add_argument("--previous", type=Path, required=True)
    args = parser.parse_args()
    if args.mobile_artifacts is None and args.platform_artifacts is None:
        parser.error("Provide either --mobile-artifacts or --platform-artifacts, or both.")
    
    # Get previous data, if available
    prev_data = None
    if args.previous.is_file():
        with args.previous.open("r", encoding="utf-8") as prev_json:
            prev_data = json.load(prev_json)

    # Extract mobile test data
    if args.mobile_artifacts is not None:
        coverage_files = list(args.mobile_artifacts.rglob("jacocoCombinedReport.xml"))
        if len(coverage_files) != 1:
            raise ValueError(f"Expected a JaCoCo report, found {len(coverage_files)}")
        unit_test_files = sorted(args.mobile_artifacts.rglob("TEST-*.xml"))
        if not unit_test_files:
            raise FileNotFoundError("Unit test xml's not found")
        mobile_coverage = get_mobile_coverage(coverage_files[0])
        mobile_unit_tests = get_mobile_unit_tests(unit_test_files)

    # TODO: add one for platform
    if args.platform_artifacts is not None:
        print("Not yet implemented.")
        exit(0)

    # Write data in a JavaScript file, later used in index.html 
    write_mobile_data(mobile_coverage, mobile_unit_tests, prev_data) 



# Get code coverage from jacoco's report
def get_mobile_coverage(coverage_files):
    code_cov_root = ET.parse(coverage_files).getroot()
    coverage = {}

    for counter in code_cov_root.findall("counter"):
        kind = counter.attrib["type"].lower()
        missed = int(counter.attrib["missed"])
        covered = int(counter.attrib["covered"])
        total = covered + missed
        coverage[kind.lower()] = (covered, total) # covered, total
    return coverage

# Get unit test pass score
def get_mobile_unit_tests(unit_test_files):
    test_suite_roots = []
    for xml in unit_test_files:
        root = ET.parse(xml).getroot()
        test_suite_roots.append(root)

    test_stats = {"ran": 0, "passed": 0, "errors": 0, "skipped": 0, "failures": 0}
    for test_suite in test_suite_roots:
         ran = int(test_suite.attrib["tests"])
         failures = int(test_suite.attrib["failures"])
         errors = int(test_suite.attrib["errors"])
         skipped = int(test_suite.attrib["skipped"])
         test_stats["ran"] += ran
         test_stats["passed"] += ran - failures - skipped - errors
         test_stats["failures"] += failures + errors
         test_stats["skipped"] += skipped
    return test_stats

def write_mobile_data(coverage, unit_tests, prev_data):
    time = datetime.now()
    last_updated = time.strftime("%Y-%m-%d %H:%M:%S")
    
    total_covered = 0
    total_tests = 0
    for covered, total in coverage.values():
        total_covered += covered
        total_tests += total 
    overall_coverage = (
        round(total_covered / total_tests * 100, 1)
        if total_tests else None # zero guard
    )

    trend = None
    if prev_data is not None:
        trend = round(overall_coverage - prev_data["mobile"]["overall"], 1)

    data = {
        "mobile": {
            "total": unit_tests["ran"],
            "passed": unit_tests["passed"],
            "failed": unit_tests["failures"],
            "skipped": unit_tests["skipped"],
            "tools": MOBILE_TOOLS,
            "coverage": [
                [label, coverage[kind][0], coverage[kind][1]]
                for kind, label in COVERAGE_LABELS.items()
                if kind in coverage
            ],
            "overall": overall_coverage,
            "trend": trend if trend is not None else "N/A"
        },
        "lastUpdated": last_updated,
    }

    output_path = Path(__file__).resolve().parent / "page" / "report-data.json"
    output_path.write_text(json.dumps(data, indent=2), encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())