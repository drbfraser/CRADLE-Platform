from pathlib import Path
import sys
import xml.etree.ElementTree as ET
import json
import argparse
from pathlib import Path
from datetime import datetime

MOBILE_TOOLS = [
    ['logos/junit.png', 'JUnit', 'Unit tests', 'v29.7.0'],
    ['logos/jacoco.png', 'JaCoCo', 'Code coverage', 'v20.27.0'],
    ['logos/gradle.svg', 'Gradle', 'Running tests and generating reports', 'v20.27.0']
]


"""
Usage: python3 ./report-generator.py --mobile-artifacts [path to artifacts]
Flag is either --mobile-artifacts or --platform-artifacts
Can use one flag or both at a time
"""
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mobile-artifacts", type=Path)
    parser.add_argument("--platform-artifacts", type=Path)
    args = parser.parse_args()
    if args.mobile_artifacts is None and args.platform_artifacts is None:
        parser.error("Provide either --mobile-artifacts or --platform-artifacts, or both.")
    
    if args.mobile_artifacts is not None:
        coverage_files = list(args.mobile_artifacts.rglob("jacocoCombinedReport/jacocoCombinedReport.xml"))
        if len(coverage_files) != 1:
            raise ValueError(f"Expected a JaCoCo report, found {len(coverage_files)}")
        unit_test_files = sorted(args.mobile_artifacts.rglob("TEST-*.xml"))
        if not unit_test_files:
            raise FileNotFoundError("Unit test xml's not found")
        mobile_coverage = get_mobile_coverage(coverage_files[0])
        mobile_unit_tests = get_mobile_unit_tests(unit_test_files)
    # TODO: add one for platform

    # Write data in a JavaScript file, later used in index.html 
    write_mobile_data(mobile_coverage, mobile_unit_tests) 



# Get code coverage from jacoco's report
def get_mobile_coverage(coverage_files):
    code_cov_root = ET.parse(coverage_files).getroot()
    coverage = {}
    for counter in code_cov_root.findall("counter"):
        kind = counter.attrib["type"]
        if kind in {"LINE", "BRANCH"}:
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

def write_mobile_data(coverage, unit_tests):
    time = datetime.now()
    data = {
        "mobile": {
            "total": unit_tests["ran"],
            "passed": unit_tests["passed"],
            "failed": unit_tests["failures"],
            "skipped": unit_tests["skipped"],
            "tools": MOBILE_TOOLS,
            "coverage": [
                ['Branch', coverage['branch'][0], coverage['branch'][1]], 
                ['Line', coverage['line'][0], coverage['line'][1]]
            ],
            "overall": round((coverage['branch'][0] / coverage['branch'][1]) * 100, 1),
        },
        "lastUpdated": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    output_path = Path(__file__).resolve().parent / "page" / "report-data.js"
    output_path.write_text("const DATA = " + json.dumps(data, indent=2) + ";\n", encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())