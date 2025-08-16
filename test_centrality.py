#!/usr/bin/env python3
"""
Test script for centrality endpoint
Tests all three centrality methods: degree, pagerank, betweenness
"""

import urllib.request
import urllib.parse
import json
import sys

def test_centrality_endpoint(base_url="http://localhost:8000"):
    """Test the centrality endpoint with different methods"""
    
    print("🧪 Testing Centrality Endpoint")
    print("=" * 50)
    
    # Test 1: Degree centrality (default)
    print("\n1️⃣ Testing Degree Centrality (default):")
    try:
        url = f"{base_url}/query/centrality"
        print(f"   URL: {url}")
        
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(f"   Status: {response.status}")
            print(f"   Method: {data.get('method')}")
            print(f"   Results count: {len(data.get('results', []))}")
            if data.get('results'):
                print(f"   Top 3 results:")
                for i, result in enumerate(data['results'][:3]):
                    print(f"     {i+1}. {result.get('name')}: {result.get('score')}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Degree centrality with custom limit
    print("\n2️⃣ Testing Degree Centrality with limit=5:")
    try:
        url = f"{base_url}/query/centrality?method=degree&limit=5"
        print(f"   URL: {url}")
        
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(f"   Status: {response.status}")
            print(f"   Results count: {len(data.get('results', []))}")
            if data.get('results'):
                print(f"   All results:")
                for i, result in enumerate(data['results']):
                    print(f"     {i+1}. {result.get('name')}: {result.get('score')}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: PageRank centrality
    print("\n3️⃣ Testing PageRank Centrality:")
    try:
        url = f"{base_url}/query/centrality?method=pagerank&limit=10"
        print(f"   URL: {url}")
        
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(f"   Status: {response.status}")
            print(f"   Method: {data.get('method')}")
            print(f"   Engine: {data.get('graph', 'N/A')}")
            print(f"   Results count: {len(data.get('results', []))}")
            if data.get('results'):
                print(f"   Top 5 results:")
                for i, result in enumerate(data['results'][:5]):
                    print(f"     {i+1}. {result.get('name')}: {result.get('score'):.6f}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 4: Betweenness centrality
    print("\n4️⃣ Testing Betweenness Centrality:")
    try:
        url = f"{base_url}/query/centrality?method=betweenness&limit=10"
        print(f"   URL: {url}")
        
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(f"   Status: {response.status}")
            print(f"   Method: {data.get('method')}")
            print(f"   Engine: {data.get('graph', 'N/A')}")
            print(f"   Results count: {len(data.get('results', []))}")
            if data.get('results'):
                print(f"   Top 5 results:")
                for i, result in enumerate(data['results'][:5]):
                    print(f"     {i+1}. {result.get('name')}: {result.get('score'):.6f}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 5: Invalid method
    print("\n5️⃣ Testing Invalid Method:")
    try:
        url = f"{base_url}/query/centrality?method=invalid"
        print(f"   URL: {url}")
        
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(f"   Status: {response.status}")
            print(f"   Response: {data}")
    except urllib.error.HTTPError as e:
        print(f"   Status: {e.code}")
        print(f"   Error: {e.read().decode()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

def test_server_health(base_url="http://localhost:8000"):
    """Test if the server is running"""
    print("🏥 Testing Server Health")
    print("=" * 30)
    
    try:
        url = f"{base_url}/health"
        print(f"   URL: {url}")
        
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(f"   Status: {response.status}")
            print(f"   Response: {data}")
            return True
    except Exception as e:
        print(f"   ❌ Server not responding: {e}")
        return False

if __name__ == "__main__":
    # Check if custom base URL is provided
    base_url = "http://localhost:8000"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    print(f"🚀 Starting tests against: {base_url}")
    
    # First check if server is running
    if test_server_health(base_url):
        print("\n✅ Server is running! Proceeding with centrality tests...")
        test_centrality_endpoint(base_url)
    else:
        print("\n❌ Server is not running. Please start the FastAPI server first:")
        print("   python main.py")
        print("   or")
        print("   uvicorn main:app --reload")
    
    print("\n🏁 Testing completed!")
