#!/usr/bin/env python3
"""
Test GDS syntax for version 2.13.2
"""

from neo4j import GraphDatabase

def test_gds_syntax():
    """Test different GDS syntax versions"""
    driver = GraphDatabase.driver(
        'bolt://localhost:7687', 
        auth=('neo4j', 'changeit')
    )
    
    try:
        with driver.session() as session:
            print("🔬 Testing GDS Syntax for 2.13.2")
            print("=" * 50)
            
            # Test 1: Old syntax with nodeProjection
            print("\n1️⃣ Testing old syntax (nodeProjection):")
            try:
                result = session.run("""
                    CALL gds.pageRank.stream({
                        nodeProjection: 'Character',
                        relationshipProjection: '*'
                    })
                    YIELD nodeId, score
                    RETURN count(*) as count
                    LIMIT 1
                """)
                count = result.single()['count']
                print(f"  ✅ Old syntax works: {count} results")
            except Exception as e:
                print(f"  ❌ Old syntax failed: {e}")
            
            # Test 2: New syntax with direct parameters
            print("\n2️⃣ Testing new syntax (direct params):")
            try:
                result = session.run("""
                    CALL gds.pageRank.stream('Character', '*')
                    YIELD nodeId, score
                    RETURN count(*) as count
                    LIMIT 1
                """)
                count = result.single()['count']
                print(f"  ✅ New syntax works: {count} results")
            except Exception as e:
                print(f"  ❌ New syntax failed: {e}")
            
            # Test 3: Check GDS version info
            print("\n3️⃣ Checking GDS version:")
            try:
                result = session.run("SHOW PROCEDURES YIELD name, signature WHERE name = 'gds.pageRank.stream'")
                for record in result:
                    print(f"  Signature: {record['signature']}")
            except Exception as e:
                print(f"  ❌ Version check failed: {e}")
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    test_gds_syntax()
