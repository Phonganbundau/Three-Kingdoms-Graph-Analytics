#!/usr/bin/env python3
"""
Direct Neo4j test for degree centrality query
"""

from neo4j import GraphDatabase

def test_degree_centrality():
    """Test the degree centrality query directly"""
    driver = GraphDatabase.driver(
        'bolt://localhost:7687', 
        auth=('neo4j', 'changeit')
    )
    
    try:
        with driver.session() as session:
            # Test the fixed query from the API
            query = "MATCH (n:Character) RETURN n.name AS name, COUNT {(n)--()} AS score ORDER BY score DESC LIMIT 5"
            print(f"Testing query: {query}")
            
            result = session.run(query)
            print("\nResults:")
            for record in result:
                print(f"  {record['name']}: {record['score']}")
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.close()

def test_character_count():
    """Test basic character count"""
    driver = GraphDatabase.driver(
        'bolt://localhost:7687', 
        auth=('neo4j', 'changeit')
    )
    
    try:
        with driver.session() as session:
            result = session.run("MATCH (n:Character) RETURN count(n) as count")
            count = result.single()['count']
            print(f"Total characters: {count}")
            
            # Check if characters have relationships
            result = session.run("MATCH ()-[r]-() RETURN count(r) as rel_count")
            rel_count = result.single()['rel_count']
            print(f"Total relationships: {rel_count}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    print("🧪 Testing Neo4j Direct Connection")
    print("=" * 40)
    
    test_character_count()
    print()
    test_degree_centrality()
