#!/usr/bin/env python3
"""
Test GDS (Graph Data Science) availability
"""

from neo4j import GraphDatabase

def test_gds_availability():
    """Test if GDS procedures are available"""
    driver = GraphDatabase.driver(
        'bolt://localhost:7687', 
        auth=('neo4j', 'changeit')
    )
    
    try:
        with driver.session() as session:
            # Test GDS procedures directly
            print("Testing GDS procedures directly:")
            
            # Test PageRank
            try:
                result = session.run("CALL gds.pageRank.stream({nodeProjection: 'Character', relationshipProjection: '*'}) YIELD nodeId, score RETURN count(*) as count LIMIT 1")
                count = result.single()['count']
                print(f"  ✅ PageRank: Available (test returned {count} results)")
            except Exception as e:
                print(f"  ❌ PageRank: {e}")
            
            # Test Betweenness
            try:
                result = session.run("CALL gds.betweenness.stream({nodeProjection: 'Character', relationshipProjection: '*'}) YIELD nodeId, score RETURN count(*) as count LIMIT 1")
                count = result.single()['count']
                print(f"  ✅ Betweenness: Available (test returned {count} results)")
            except Exception as e:
                print(f"  ❌ Betweenness: {e}")
                
            # Test GDS version
            try:
                result = session.run("CALL gds.version() YIELD version RETURN version")
                version = result.single()['version']
                print(f"  📦 GDS Version: {version}")
            except Exception as e:
                print(f"  ❌ GDS Version check failed: {e}")
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    print("🔬 Testing GDS Availability")
    print("=" * 30)
    test_gds_availability()
