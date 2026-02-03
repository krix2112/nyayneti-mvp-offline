#!/usr/bin/env python3
"""
Complete test for Citation Finder functionality with real AI integration
"""

import sys
import os
import json
import requests
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_backend_connection():
    """Test if backend is running and responding"""
    try:
        response = requests.get('http://localhost:8000/api/health', timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_citation_endpoints():
    """Test the citation finder endpoints"""
    base_url = 'http://localhost:8000'
    
    # Test text analysis endpoint
    test_text = """
    In the case of Maneka Gandhi v. Union of India (1978) 1 SCC 248, 
    the Supreme Court held that Article 21 protects the right to life 
    and personal liberty. Section 420 IPC deals with cheating.
    """
    
    try:
        # Test text analysis
        response = requests.post(
            f'{base_url}/api/citation-finder/analyze-text',
            json={'text': test_text},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Text analysis endpoint working")
            print(f"   Found {result.get('citation_count', 0)} citations")
            print(f"   AI Analysis: {result.get('ai_analysis', 'No analysis')[:100]}...")
            return True
        else:
            print(f"❌ Text analysis failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Text analysis test failed: {e}")
        return False

def test_regex_extraction():
    """Test the citation extraction logic"""
    try:
        from backend.core.citation_parser import extract_all_citations_comprehensive
        
        sample_text = """
        Maneka Gandhi v. Union of India and Article 21 along with 
        Section 420 IPC and Section 438 CrPC are mentioned here.
        The Indian Evidence Act, 1872 is also relevant.
        """
        
        citations = extract_all_citations_comprehensive(sample_text)
        
        print("✅ Citation extraction working")
        print(f"   Case names: {len(citations['case_names'])}")
        print(f"   IPC sections: {len(citations['ipc_sections'])}")
        print(f"   CrPC sections: {len(citations['crpc_sections'])}")
        print(f"   Articles: {len(citations['articles'])}")
        print(f"   Acts: {len(citations['acts'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Citation extraction failed: {e}")
        return False

def main():
    print("🔍 Testing Citation Finder Implementation")
    print("=" * 50)
    
    tests = [
        ("Backend Connection", test_backend_connection),
        ("Citation Extraction", test_regex_extraction),
        ("API Endpoints", test_citation_endpoints)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🧪 Testing {test_name}...")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("📋 TEST RESULTS SUMMARY:")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n📈 Overall: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All tests passed! Citation Finder is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the implementation.")

if __name__ == "__main__":
    main()