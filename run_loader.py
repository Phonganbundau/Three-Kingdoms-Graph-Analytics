#!/usr/bin/env python3
"""
Quick runner script for the Tam Quoc data loader
Usage: python run_loader.py
"""

import sys
import os
from full_data_loader import main, logger

def check_neo4j_connection():
    """Check if Neo4j is running and accessible"""
    try:
        from neo4j import GraphDatabase
        
        # Try to connect
        driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "changeit"))
        with driver.session() as session:
            session.run("RETURN 1")
        driver.close()
        return True
    except Exception as e:
        logger.error(f"❌ Cannot connect to Neo4j: {e}")
        logger.error("💡 Make sure Neo4j is running on localhost:7687")
        logger.error("💡 Check your username/password in full_data_loader.py")
        return False

def main_runner():
    """Main runner with pre-checks"""
    print("🔍 Checking Neo4j connection...")
    
    if not check_neo4j_connection():
        print("❌ Neo4j connection failed. Please check:")
        print("   1. Neo4j Desktop/Server is running")
        print("   2. Database is accessible on bolt://localhost:7687")
        print("   3. Username/password is correct (default: neo4j/password)")
        sys.exit(1)
    
    print("✅ Neo4j connection successful!")
    print("🚀 Starting data loading process...")
    
    try:
        main()
        print("\n🎉 Data loading completed successfully!")
        print("\n🔗 Next steps:")
        print("   1. Open Neo4j Browser: http://localhost:7474")
        print("   2. Run your FastAPI server: python main.py")
        print("   3. Test API endpoints: http://localhost:8000/docs")
        
    except KeyboardInterrupt:
        print("\n⚠️  Data loading interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Data loading failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main_runner()