#!/usr/bin/env python3
"""
NyayNeti Demo Cases Downloader

Downloads 10 landmark Indian judgments for offline demo.
Supports both API-based download (with token) and manual download instructions.

Usage:
    python download_demo_cases.py                    # Show manual download instructions
    python download_demo_cases.py --token YOUR_TOKEN # Download via Indian Kanoon API
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

try:
    import requests
except ImportError:
    print("Installing requests...")
    os.system(f"{sys.executable} -m pip install requests")
    import requests


# Demo cases - 5 Supreme Court + 5 High Court
DEMO_CASES: List[Dict] = [
    # === SUPREME COURT (5 cases) ===
    {
        "id": "1628887",
        "name": "State_of_Rajasthan_v_Balchand_1977",
        "citation": "(1977) 4 SCC 308",
        "court": "Supreme Court",
        "year": "1977",
        "topic": "Bail Principles - Triple Test",
        "search_query": "State of Rajasthan vs Balchand 1977 bail",
        "url": "https://indiankanoon.org/doc/1628887/",
    },
    {
        "id": "445276",
        "name": "Arnesh_Kumar_v_State_of_Bihar_2014",
        "citation": "(2014) 8 SCC 273",
        "court": "Supreme Court",
        "year": "2014",
        "topic": "Arrest Guidelines - Section 41A CrPC",
        "search_query": "Arnesh Kumar vs State of Bihar arrest guidelines",
        "url": "https://indiankanoon.org/doc/445276/",
    },
    {
        "id": "127517806",
        "name": "KS_Puttaswamy_v_Union_of_India_2017",
        "citation": "(2017) 10 SCC 1",
        "court": "Supreme Court",
        "year": "2017",
        "topic": "Right to Privacy - Fundamental Right",
        "search_query": "Puttaswamy privacy judgment 2017",
        "url": "https://indiankanoon.org/doc/127517806/",
    },
    {
        "id": "1766147",
        "name": "Maneka_Gandhi_v_Union_of_India_1978",
        "citation": "(1978) 1 SCC 248",
        "court": "Supreme Court",
        "year": "1978",
        "topic": "Article 21 - Due Process",
        "search_query": "Maneka Gandhi passport impounded 1978",
        "url": "https://indiankanoon.org/doc/1766147/",
    },
    {
        "id": "1569253",
        "name": "Lalita_Kumari_v_Govt_of_UP_2014",
        "citation": "(2014) 2 SCC 1",
        "court": "Supreme Court",
        "year": "2014",
        "topic": "FIR Registration - Mandatory",
        "search_query": "Lalita Kumari FIR registration mandatory",
        "url": "https://indiankanoon.org/doc/1569253/",
    },
    # === HIGH COURTS (5 cases) ===
    {
        "id": "78aborc6",
        "name": "Sushil_Sharma_v_State_Tandoor_1996",
        "citation": "1996 CriLJ 3944",
        "court": "Delhi High Court",
        "year": "1996",
        "topic": "IPC 302/201 - Tandoor Murder Case",
        "search_query": "Sushil Sharma Tandoor murder Delhi",
        "url": "https://indiankanoon.org/search/?formInput=Sushil%20Sharma%20tandoor%20murder",
    },
    {
        "id": "1aborc2",
        "name": "Manu_Sharma_v_State_Jessica_Lal_2010",
        "citation": "(2010) 6 SCC 1",
        "court": "Delhi High Court",
        "year": "2010",
        "topic": "IPC 302 - Jessica Lal Murder",
        "search_query": "Manu Sharma Jessica Lal murder",
        "url": "https://indiankanoon.org/search/?formInput=Manu%20Sharma%20Jessica%20Lal",
    },
    {
        "id": "108348532",
        "name": "Santosh_Kumar_Singh_Priyadarshini_Mattoo_2006",
        "citation": "(2010) 9 SCC 747",
        "court": "Delhi High Court",
        "year": "2006",
        "topic": "IPC 302/376 - Priyadarshini Mattoo Case",
        "search_query": "Santosh Kumar Singh Priyadarshini Mattoo",
        "url": "https://indiankanoon.org/doc/108348532/",
    },
    {
        "id": "68aborc1",
        "name": "State_of_Punjab_v_Navjot_Singh_Sidhu_2018",
        "citation": "(2018) 10 SCC 711",
        "court": "Punjab and Haryana High Court",
        "year": "2018",
        "topic": "IPC 304 - Culpable Homicide",
        "search_query": "Navjot Singh Sidhu road rage 2018",
        "url": "https://indiankanoon.org/search/?formInput=Navjot%20Singh%20Sidhu%20road%20rage",
    },
    {
        "id": "170874260",
        "name": "Uber_India_v_CCI_2019",
        "citation": "2019 SCC OnLine Del 8865",
        "court": "Delhi High Court",
        "year": "2019",
        "topic": "Competition Law - Surge Pricing",
        "search_query": "Uber India Competition Commission surge pricing",
        "url": "https://indiankanoon.org/doc/170874260/",
    },
]


DEMO_DIR = Path(__file__).parent.parent / "backend" / "demo_data"
IK_API_BASE = "https://api.indiankanoon.org"


def download_via_api(token: str, doc_id: str) -> Optional[str]:
    """Download judgment text via Indian Kanoon API."""
    headers = {"Authorization": f"Token {token}"}
    
    try:
        # Try to get full document
        resp = requests.post(
            f"{IK_API_BASE}/doc/{doc_id}/",
            headers=headers,
            timeout=30
        )
        if resp.status_code == 200:
            return resp.text
        
        # Fallback to docfragment
        resp = requests.post(
            f"{IK_API_BASE}/docfragment/{doc_id}/",
            headers=headers,
            timeout=30
        )
        if resp.status_code == 200:
            return resp.text
            
    except requests.exceptions.RequestException as e:
        print(f"  API error: {e}")
    
    return None


def download_all_cases(token: str) -> None:
    """Download all demo cases via API."""
    DEMO_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"\nDownloading {len(DEMO_CASES)} cases to {DEMO_DIR}\n")
    
    success = 0
    for case in DEMO_CASES:
        print(f"[{case['court']}] {case['name']}")
        print(f"  Citation: {case['citation']}")
        
        content = download_via_api(token, case["id"])
        
        if content:
            filepath = DEMO_DIR / f"{case['name']}.txt"
            
            # Add metadata header
            full_content = f"""# {case['name'].replace('_', ' ')}
# Citation: {case['citation']}
# Court: {case['court']}
# Year: {case['year']}
# Topic: {case['topic']}
# Source: Indian Kanoon ({case['url']})
# Downloaded for NyayNeti Demo (Offline Legal Research)

---

{content}
"""
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(full_content)
            
            print(f"  Saved: {filepath.name}")
            success += 1
        else:
            print(f"  FAILED - Download manually from: {case['url']}")
        
        time.sleep(1)  # Rate limiting
    
    print(f"\n{'='*60}")
    print(f"Downloaded: {success}/{len(DEMO_CASES)} cases")
    if success < len(DEMO_CASES):
        print("For failed cases, download manually from Indian Kanoon website.")


def print_manual_instructions() -> None:
    """Print instructions for manual download."""
    print("""
============================================================
NYAYNETI DEMO CASES - MANUAL DOWNLOAD GUIDE
============================================================

Since the app works OFFLINE, download these 10 cases now:

SUPREME COURT CASES (5):
""")
    
    for i, case in enumerate(DEMO_CASES[:5], 1):
        print(f"""
{i}. {case['name'].replace('_', ' ')}
   Citation: {case['citation']}
   Topic: {case['topic']}
   URL: {case['url']}
   Save as: backend/demo_data/{case['name']}.pdf
""")
    
    print("""
HIGH COURT CASES (5):
""")
    
    for i, case in enumerate(DEMO_CASES[5:], 6):
        print(f"""
{i}. {case['name'].replace('_', ' ')}
   Citation: {case['citation']}
   Court: {case['court']}
   Topic: {case['topic']}
   URL: {case['url']}
   Save as: backend/demo_data/{case['name']}.pdf
""")
    
    print("""
============================================================
DOWNLOAD STEPS:
============================================================

1. Open each URL in browser
2. Click "Print/PDF" or use browser's Print > Save as PDF
3. Save to: backend/demo_data/
4. Name files exactly as shown above (or similar)

ALTERNATIVE - Use Indian Kanoon API:
   python download_demo_cases.py --token YOUR_IK_TOKEN

Get API token from: https://indiankanoon.org/api/

============================================================
""")
    
    # Create placeholder files with metadata
    DEMO_DIR.mkdir(parents=True, exist_ok=True)
    
    index_content = "# Demo Cases Index\n\n"
    index_content += "Download these cases from Indian Kanoon for offline demo:\n\n"
    
    for case in DEMO_CASES:
        index_content += f"## {case['name'].replace('_', ' ')}\n"
        index_content += f"- **Citation:** {case['citation']}\n"
        index_content += f"- **Court:** {case['court']}\n"
        index_content += f"- **Year:** {case['year']}\n"
        index_content += f"- **Topic:** {case['topic']}\n"
        index_content += f"- **URL:** {case['url']}\n\n"
    
    with open(DEMO_DIR / "DOWNLOAD_CASES.md", "w", encoding="utf-8") as f:
        f.write(index_content)
    
    print(f"Created index file: {DEMO_DIR / 'DOWNLOAD_CASES.md'}")


def create_sample_case_content(case: Dict) -> str:
    """Create sample content for a case (for demo without real data)."""
    return f"""
{case['name'].replace('_', ' ')}

Citation: {case['citation']}
Court: {case['court']}
Year: {case['year']}

JUDGMENT

This is a placeholder for the {case['topic']} case.

For the actual judgment, download from:
{case['url']}

---

SUMMARY:

This landmark case dealt with {case['topic'].lower()}.
The Hon'ble {case['court']} examined the constitutional/legal provisions
and established important precedents.

KEY POINTS:
1. Legal principle established
2. Application of relevant sections
3. Impact on future jurisprudence

---

[PLACEHOLDER - Replace with actual judgment from Indian Kanoon]
"""


def create_placeholder_files() -> None:
    """Create placeholder files for all cases."""
    DEMO_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"\nCreating placeholder files in {DEMO_DIR}\n")
    
    for case in DEMO_CASES:
        filepath = DEMO_DIR / f"{case['name']}.txt"
        content = create_sample_case_content(case)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        
        print(f"Created: {case['name']}.txt ({case['court']})")
    
    print(f"\n{'='*60}")
    print("Placeholder files created!")
    print("Replace with actual PDFs from Indian Kanoon for real demo.")


def main():
    parser = argparse.ArgumentParser(
        description="Download Indian Kanoon cases for NyayNeti offline demo"
    )
    parser.add_argument(
        "--token", "-t",
        help="Indian Kanoon API token"
    )
    parser.add_argument(
        "--placeholders", "-p",
        action="store_true",
        help="Create placeholder files (no download)"
    )
    args = parser.parse_args()
    
    if args.placeholders:
        create_placeholder_files()
    elif args.token:
        download_all_cases(args.token)
    else:
        print_manual_instructions()
        
        response = input("\nCreate placeholder files for now? (y/N): ").strip().lower()
        if response == "y":
            create_placeholder_files()


if __name__ == "__main__":
    main()
