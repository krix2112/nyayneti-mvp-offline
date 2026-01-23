#!/usr/bin/env python3
"""
NyayNeti Demo Data Collection Script

Downloads sample Indian judgments from public sources for hackathon demonstration.
All judgments are from public domain (Indian government court records).

Usage:
    python collect_demo_data.py

Note: For hackathon purposes, you may also manually download PDFs from:
- https://indiankanoon.org
- https://ecourts.gov.in
- https://sci.gov.in (Supreme Court of India)
"""

import os
import sys
from pathlib import Path
from typing import List, Dict

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))


# Sample landmark cases for demo (these are well-known public domain cases)
DEMO_CASES = [
    {
        "name": "Kesavananda_Bharati_v_State_of_Kerala_1973.txt",
        "description": "Basic Structure Doctrine - Landmark constitutional case",
        "year": "1973",
        "court": "Supreme Court of India",
        "citation": "AIR 1973 SC 1461",
        "topics": ["Constitutional Law", "Basic Structure", "Amendment"],
    },
    {
        "name": "Maneka_Gandhi_v_Union_of_India_1978.txt",
        "description": "Right to Life and Personal Liberty - Article 21 expansion",
        "year": "1978",
        "court": "Supreme Court of India",
        "citation": "(1978) 1 SCC 248",
        "topics": ["Fundamental Rights", "Article 21", "Due Process"],
    },
    {
        "name": "Vishaka_v_State_of_Rajasthan_1997.txt",
        "description": "Sexual Harassment at Workplace Guidelines",
        "year": "1997",
        "court": "Supreme Court of India",
        "citation": "AIR 1997 SC 3011",
        "topics": ["Women Rights", "Workplace Safety", "Constitutional Mandate"],
    },
    {
        "name": "State_of_Rajasthan_v_Balchand_1977.txt",
        "description": "Bail Principles - Triple Test for Bail",
        "year": "1977",
        "court": "Supreme Court of India",
        "citation": "(1977) 4 SCC 308",
        "topics": ["Criminal Law", "Bail", "CrPC Section 437"],
    },
    {
        "name": "Dr_Vimla_v_Delhi_Administration_1963.txt",
        "description": "IPC Section 420 - Cheating Elements",
        "year": "1963",
        "court": "Supreme Court of India",
        "citation": "AIR 1963 SC 1572",
        "topics": ["Criminal Law", "IPC 420", "Cheating", "Fraud"],
    },
]


def create_sample_judgment(case: Dict) -> str:
    """Create a sample judgment text for demo purposes."""
    return f"""
SUPREME COURT OF INDIA

{case['name'].replace('_', ' ').replace('.txt', '')}

Citation: {case['citation']}
Year: {case['year']}
Court: {case['court']}

---

JUDGMENT

This is a placeholder summary for demonstration purposes.

Case Description:
{case['description']}

Key Topics: {', '.join(case['topics'])}

---

BACKGROUND:

This landmark case addressed fundamental questions of Indian jurisprudence.
The Hon'ble Supreme Court examined the constitutional provisions and 
established important precedents that continue to guide legal interpretation.

---

LEGAL ISSUES:

1. Primary constitutional/legal question involved
2. Interpretation of relevant statutory provisions
3. Application of established legal principles

---

DECISION:

The Court, after considering the submissions of learned counsel and 
examining the relevant precedents, held that...

[For full judgment text, please refer to the official sources:
- Indian Kanoon: https://indiankanoon.org
- Supreme Court of India: https://sci.gov.in
- eCourts: https://ecourts.gov.in]

---

CITED PRECEDENTS:

1. Previous relevant case law
2. Constitutional provisions interpreted
3. Statutory sections applied

---

Note: This is a demonstration placeholder. For actual legal research,
please download the complete judgment from official sources.

{case['citation']}
"""


def create_demo_data_directory():
    """Create demo data with sample judgments."""
    demo_dir = Path(__file__).parent.parent / "backend" / "demo_data"
    demo_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("NyayNeti Demo Data Generator")
    print("=" * 60)
    print(f"\nCreating demo judgments in: {demo_dir}\n")

    for case in DEMO_CASES:
        filepath = demo_dir / case["name"]
        content = create_sample_judgment(case)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"Created: {case['name']}")
        print(f"  - {case['description']}")
        print(f"  - Citation: {case['citation']}")
        print()

    # Create index file
    index_path = demo_dir / "INDEX.md"
    with open(index_path, "w", encoding="utf-8") as f:
        f.write("# Demo Judgments Index\n\n")
        f.write("These are placeholder summaries for hackathon demonstration.\n")
        f.write("For actual legal research, download complete judgments from:\n\n")
        f.write("- [Indian Kanoon](https://indiankanoon.org)\n")
        f.write("- [Supreme Court of India](https://sci.gov.in)\n")
        f.write("- [eCourts](https://ecourts.gov.in)\n\n")
        f.write("## Cases\n\n")
        for case in DEMO_CASES:
            f.write(f"### {case['name'].replace('_', ' ').replace('.txt', '')}\n")
            f.write(f"- **Citation:** {case['citation']}\n")
            f.write(f"- **Year:** {case['year']}\n")
            f.write(f"- **Topics:** {', '.join(case['topics'])}\n")
            f.write(f"- **Description:** {case['description']}\n\n")

    print(f"Created index: INDEX.md")
    print("\n" + "=" * 60)
    print("Demo data setup complete!")
    print("=" * 60)
    print("\nIMPORTANT: For hackathon demo, download actual PDFs from:")
    print("  1. https://indiankanoon.org - Search for case names")
    print("  2. https://sci.gov.in/judgments - Official SC judgments")
    print("\nRecommended demo PDFs to download:")
    for case in DEMO_CASES:
        print(f"  - {case['citation']}: {case['description'][:50]}...")


def print_download_instructions():
    """Print instructions for downloading actual judgment PDFs."""
    print("""
============================================================
HOW TO GET REAL JUDGMENT PDFs FOR DEMO
============================================================

1. INDIAN KANOON (Recommended for quick access):
   - Visit: https://indiankanoon.org
   - Search for case names or citations
   - Click "Download PDF" on judgment page
   - Save to: backend/demo_data/

2. SUPREME COURT OF INDIA:
   - Visit: https://sci.gov.in
   - Go to: Judgments > Search
   - Download PDF version
   
3. eCOURTS:
   - Visit: https://ecourts.gov.in
   - Select court and search
   - Download case documents

SUGGESTED CASES FOR DEMO:
""")
    for i, case in enumerate(DEMO_CASES, 1):
        print(f"  {i}. {case['citation']}")
        print(f"     Search: \"{case['name'].replace('_', ' ').replace('.txt', '')}\"")
        print()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="NyayNeti Demo Data Collection")
    parser.add_argument(
        "--instructions",
        action="store_true",
        help="Print instructions for downloading real PDFs"
    )
    args = parser.parse_args()

    if args.instructions:
        print_download_instructions()
    else:
        create_demo_data_directory()
        print("\nRun with --instructions for PDF download guide.")
