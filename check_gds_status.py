#!/usr/bin/env python3
"""
Check GDS status after installation
"""

from neo4j import GraphDatabase

def check_gds_status():
    """Check if GDS is working after installation"""
    driver = GraphDatabase.driver(
        'bolt://localhost:7687', 
        auth=('neo4j', 'changeit')
    )
    
    try:
        with driver.session() as session:
            print("🔬 Checking GDS Status")
            print("=" * 40)
            
            # Check GDS version
            try:
                result = session.run("CALL gds.version() YIELD version")
                version = result.single()['version']
                print(f"✅ GDS Version: {version}")
            except Exception as e:
                print(f"❌ GDS Version check failed: {e}")
            
            # Check GDS procedures
            try:
                result = session.run("SHOW PROCEDURES YIELD name WHERE name STARTS WITH 'gds.'")
                gds_procedures = [record['name'] for record in result]
                print(f"✅ GDS Procedures found: {len(gds_procedures)}")
                if gds_procedures:
                    print("  Top procedures:")
                    for proc in gds_procedures[:5]:
                        print(f"    - {proc}")
            except Exception as e:
                print(f"❌ GDS Procedures check failed: {e}")
            
            # Test PageRank specifically
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
                print(f"✅ PageRank test successful: {count} results")
            except Exception as e:
                print(f"❌ PageRank test failed: {e}")
            
            # Test Betweenness specifically
            try:
                result = session.run("""
                    CALL gds.betweenness.stream({
                        nodeProjection: 'Character',
                        relationshipProjection: '*'
                    })
                    YIELD nodeId, score
                    RETURN count(*) as count
                    LIMIT 1
                """)
                count = result.single()['count']
                print(f"✅ Betweenness test successful: {count} results")
            except Exception as e:
                print(f"❌ Betweenness test failed: {e}")
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    check_gds_status()
