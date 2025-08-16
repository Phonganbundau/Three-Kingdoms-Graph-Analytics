# Full script to load all Tam Quoc data from three_kingdoms.js into Neo4j
import json
from neo4j import GraphDatabase
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Neo4j connection details
URI = "bolt://localhost:7687"
AUTH = ("neo4j", "changeit")  # Neo4j credentials

# Full data from three_kingdoms.js
NODES = [
    # --- Thục Hán ---
    {"id": 1, "label": "Lưu Bị", "group": "Thục Hán", "color": "#4CAF50"},
    {"id": 2, "label": "Quan Vũ", "group": "Thục Hán", "color": "#4CAF50"},
    {"id": 3, "label": "Trương Phi", "group": "Thục Hán", "color": "#4CAF50"},
    {"id": 4, "label": "Triệu Vân", "group": "Thục Hán", "color": "#4CAF50"},
    {"id": 5, "label": "Mã Siêu", "group": "Thục Hán", "color": "#4CAF50"},
    {"id": 6, "label": "Hoàng Trung", "group": "Thục Hán", "color": "#4CAF50"},
    {"id": 7, "label": "Gia Cát Lượng", "group": "Thục Hán", "color": "#4CAF50"},
    {"id": 8, "label": "Bàng Thống", "group": "Thục Hán", "color": "#4CAF50"},
    {"id": 9, "label": "Khương Duy", "group": "Thục Hán", "color": "#4CAF50"},
    {"id": 10, "label": "Ngụy Diên", "group": "Thục Hán", "color": "#4CAF50"},

    # --- Tào Ngụy ---
    {"id": 20, "label": "Tào Tháo", "group": "Tào Ngụy", "color": "#2196F3"},
    {"id": 21, "label": "Tào Phi", "group": "Tào Ngụy", "color": "#2196F3"},
    {"id": 22, "label": "Tào Chân", "group": "Tào Ngụy", "color": "#2196F3"},
    {"id": 23, "label": "Tư Mã Ý", "group": "Tào Ngụy", "color": "#2196F3"},
    {"id": 24, "label": "Hạ Hầu Đôn", "group": "Tào Ngụy", "color": "#2196F3"},
    {"id": 25, "label": "Hạ Hầu Uyên", "group": "Tào Ngụy", "color": "#2196F3"},
    {"id": 26, "label": "Trương Liêu", "group": "Tào Ngụy", "color": "#2196F3"},
    {"id": 27, "label": "Hứa Chử", "group": "Tào Ngụy", "color": "#2196F3"},
    {"id": 28, "label": "Từ Hoảng", "group": "Tào Ngụy", "color": "#2196F3"},
    {"id": 29, "label": "Vu Cấm", "group": "Tào Ngụy", "color": "#2196F3"},

    # --- Đông Ngô ---
    {"id": 40, "label": "Tôn Kiên", "group": "Đông Ngô", "color": "#FF9800"},
    {"id": 41, "label": "Tôn Sách", "group": "Đông Ngô", "color": "#FF9800"},
    {"id": 42, "label": "Tôn Quyền", "group": "Đông Ngô", "color": "#FF9800"},
    {"id": 43, "label": "Chu Du", "group": "Đông Ngô", "color": "#FF9800"},
    {"id": 44, "label": "Lỗ Túc", "group": "Đông Ngô", "color": "#FF9800"},
    {"id": 45, "label": "Lữ Mông", "group": "Đông Ngô", "color": "#FF9800"},
    {"id": 46, "label": "Lục Tốn", "group": "Đông Ngô", "color": "#FF9800"},
    {"id": 47, "label": "Cam Ninh", "group": "Đông Ngô", "color": "#FF9800"},
    {"id": 48, "label": "Hoàng Cái", "group": "Đông Ngô", "color": "#FF9800"},
    {"id": 49, "label": "Đinh Phụng", "group": "Đông Ngô", "color": "#FF9800"},

    # --- Thế lực khác ---
    {"id": 60, "label": "Đổng Trác", "group": "Khác", "color": "#9C27B0"},
    {"id": 61, "label": "Lữ Bố", "group": "Khác", "color": "#9C27B0"},
    {"id": 62, "label": "Điêu Thuyền", "group": "Khác", "color": "#9C27B0"},
    {"id": 63, "label": "Hoa Đà", "group": "Khác", "color": "#9C27B0"},
    {"id": 64, "label": "Viên Thiệu", "group": "Khác", "color": "#9C27B0"},
    {"id": 65, "label": "Viên Thuật", "group": "Khác", "color": "#9C27B0"},
    {"id": 66, "label": "Trương Tùng", "group": "Khác", "color": "#9C27B0"},
]

EDGES = [
    # --- Quan hệ nghĩa huynh ---
    {"from": 1, "to": 2, "label": "Nghĩa huynh"},
    {"from": 1, "to": 3, "label": "Nghĩa huynh"},
    {"from": 2, "to": 3, "label": "Nghĩa huynh"},

    # --- Chủ - tướng Thục ---
    {"from": 1, "to": 4, "label": "Chủ - tướng"},
    {"from": 1, "to": 5, "label": "Chủ - tướng"},
    {"from": 1, "to": 6, "label": "Chủ - tướng"},
    {"from": 1, "to": 10, "label": "Chủ - tướng"},

    # --- Quân sư Thục ---
    {"from": 1, "to": 7, "label": "Quân sư"},
    {"from": 1, "to": 8, "label": "Quân sư"},
    {"from": 7, "to": 9, "label": "Kế thừa"},

    # --- Chủ - tướng Ngụy ---
    {"from": 20, "to": 21, "label": "Cha - con"},
    {"from": 20, "to": 22, "label": "Chủ - tướng"},
    {"from": 20, "to": 23, "label": "Quân sư"},
    {"from": 20, "to": 24, "label": "Chủ - tướng"},
    {"from": 20, "to": 25, "label": "Chủ - tướng"},
    {"from": 20, "to": 26, "label": "Chủ - tướng"},
    {"from": 20, "to": 27, "label": "Chủ - tướng"},
    {"from": 20, "to": 28, "label": "Chủ - tướng"},
    {"from": 20, "to": 29, "label": "Chủ - tướng"},

    # --- Chủ - tướng Ngô ---
    {"from": 40, "to": 41, "label": "Cha - con"},
    {"from": 41, "to": 42, "label": "Anh - em"},
    {"from": 42, "to": 43, "label": "Chủ - tướng"},
    {"from": 42, "to": 44, "label": "Chủ - tướng"},
    {"from": 42, "to": 45, "label": "Chủ - tướng"},
    {"from": 42, "to": 46, "label": "Chủ - tướng"},
    {"from": 42, "to": 47, "label": "Chủ - tướng"},
    {"from": 42, "to": 48, "label": "Chủ - tướng"},
    {"from": 42, "to": 49, "label": "Chủ - tướng"},

    # --- Quan hệ nổi bật khác ---
    {"from": 60, "to": 61, "label": "Chủ - tướng"},
    {"from": 61, "to": 62, "label": "Tình cảm"},
    {"from": 64, "to": 65, "label": "Anh - em"},
    {"from": 1, "to": 43, "label": "Đồng minh Xích Bích"},
    {"from": 42, "to": 1, "label": "Đồng minh Xích Bích"},
    {"from": 1, "to": 20, "label": "Kẻ thù"},
    {"from": 20, "to": 42, "label": "Kẻ thù"},
    {"from": 61, "to": 20, "label": "Từng phục vụ"},
]

class TamQuocDataLoader:
    def __init__(self, uri, auth):
        self.driver = GraphDatabase.driver(uri, auth=auth)
    
    def close(self):
        self.driver.close()
    
    def clear_database(self):
        """Xóa toàn bộ database"""
        logger.info("🗑️  Clearing database...")
        with self.driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
        logger.info("✅ Database cleared")
    
    def create_constraints(self):
        """Tạo constraints và indexes"""
        logger.info("📋 Creating constraints and indexes...")
        with self.driver.session() as session:
            # Create uniqueness constraint on Character.character_id
            session.run("CREATE CONSTRAINT character_id_unique IF NOT EXISTS FOR (c:Character) REQUIRE c.character_id IS UNIQUE")
            # Create index on faction for better performance
            session.run("CREATE INDEX faction_index IF NOT EXISTS FOR (c:Character) ON (c.faction)")
        logger.info("✅ Constraints and indexes created")
    
    def create_characters(self):
        """Tạo tất cả nhân vật"""
        logger.info("👥 Creating characters...")
        
        # Group characters by faction for better organization
        factions = {}
        for node in NODES:
            faction = node["group"]
            if faction not in factions:
                factions[faction] = []
            factions[faction].append(node)
        
        with self.driver.session() as session:
            for faction, characters in factions.items():
                logger.info(f"   Creating {len(characters)} characters for {faction}...")
                
                for char in characters:
                    query = """
                    CREATE (c:Character {
                        character_id: $character_id,
                        name: $name,
                        faction: $faction,
                        color: $color
                    })
                    """
                    session.run(query, 
                               character_id=char["id"],
                               name=char["label"],
                               faction=char["group"],
                               color=char["color"])
        
        logger.info(f"✅ Created {len(NODES)} characters across {len(factions)} factions")
    
    def create_relationships(self):
        """Tạo tất cả mối quan hệ"""
        logger.info("🔗 Creating relationships...")
        
        # Group relationships by type for better logging
        relationship_types = {}
        for edge in EDGES:
            rel_type = edge["label"]
            if rel_type not in relationship_types:
                relationship_types[rel_type] = []
            relationship_types[rel_type].append(edge)
        
        with self.driver.session() as session:
            for rel_type, relationships in relationship_types.items():
                logger.info(f"   Creating {len(relationships)} '{rel_type}' relationships...")
                
                for edge in relationships:
                    # Convert Vietnamese relationship names to valid Neo4j relationship types
                    neo4j_rel_type = self.convert_to_neo4j_relationship(edge["label"])
                    
                    query = f"""
                    MATCH (from:Character {{character_id: $from_id}})
                    MATCH (to:Character {{character_id: $to_id}})
                    CREATE (from)-[r:{neo4j_rel_type} {{
                        type: $original_type,
                        description: $description
                    }}]->(to)
                    """
                    
                    session.run(query,
                               from_id=edge["from"],
                               to_id=edge["to"],
                               original_type=edge["label"],
                               description=edge["label"])
        
        logger.info(f"✅ Created {len(EDGES)} relationships of {len(relationship_types)} types")
    
    def convert_to_neo4j_relationship(self, vietnamese_label):
        """Chuyển đổi tên quan hệ tiếng Việt sang format Neo4j hợp lệ"""
        mapping = {
            "Nghĩa huynh": "SWORN_BROTHER",
            "Chủ - tướng": "SERVES_AS_GENERAL",
            "Quân sư": "SERVES_AS_ADVISOR",
            "Kế thừa": "SUCCESSOR",
            "Cha - con": "FATHER_SON",
            "Anh - em": "SIBLINGS",
            "Tình cảm": "ROMANTIC",
            "Đồng minh Xích Bích": "RED_CLIFF_ALLY",
            "Kẻ thù": "ENEMY",
            "Từng phục vụ": "FORMERLY_SERVED"
        }
        return mapping.get(vietnamese_label, "RELATED_TO")
    
    def create_summary_stats(self):
        """Tạo thống kê tổng quan"""
        logger.info("📊 Creating summary statistics...")
        
        with self.driver.session() as session:
            # Count characters by faction
            result = session.run("""
                MATCH (c:Character)
                RETURN c.faction as faction, count(c) as count
                ORDER BY count DESC
            """)
            
            logger.info("📈 Character distribution by faction:")
            for record in result:
                logger.info(f"   {record['faction']}: {record['count']} characters")
            
            # Count relationships by type
            result = session.run("""
                MATCH ()-[r]->()
                RETURN r.type as relationship_type, count(r) as count
                ORDER BY count DESC
            """)
            
            logger.info("📈 Relationship distribution by type:")
            for record in result:
                logger.info(f"   {record['relationship_type']}: {record['count']} relationships")
    
    def verify_data_integrity(self):
        """Kiểm tra tính toàn vẹn dữ liệu"""
        logger.info("🔍 Verifying data integrity...")
        
        with self.driver.session() as session:
            # Check for orphaned relationships
            result = session.run("""
                MATCH ()-[r]->()
                MATCH (from:Character), (to:Character)
                WHERE NOT EXISTS((from)-[r]->(to))
                RETURN count(r) as orphaned_relationships
            """)
            
            orphaned = result.single()["orphaned_relationships"]
            if orphaned > 0:
                logger.warning(f"⚠️  Found {orphaned} orphaned relationships")
            else:
                logger.info("✅ No orphaned relationships found")
            
            # Verify all expected characters exist
            result = session.run("MATCH (c:Character) RETURN count(c) as total_characters")
            total_chars = result.single()["total_characters"]
            
            if total_chars == len(NODES):
                logger.info(f"✅ All {total_chars} characters successfully created")
            else:
                logger.error(f"❌ Expected {len(NODES)} characters, found {total_chars}")
    
    def load_all_data(self):
        """Thực hiện toàn bộ quá trình load dữ liệu"""
        logger.info("🚀 Starting Tam Quoc data loading process...")
        
        try:
            self.clear_database()
            self.create_constraints()
            self.create_characters()
            self.create_relationships()
            self.create_summary_stats()
            self.verify_data_integrity()
            
            logger.info("🎉 Tam Quoc data loading completed successfully!")
            logger.info("🔗 You can now access the data via:")
            logger.info("   - Neo4j Browser: http://localhost:7474")
            logger.info("   - FastAPI endpoints: http://localhost:8000/docs")
            
        except Exception as e:
            logger.error(f"❌ Error during data loading: {str(e)}")
            raise

def main():
    """Main function to run the data loader"""
    loader = TamQuocDataLoader(URI, AUTH)
    
    try:
        loader.load_all_data()
    except Exception as e:
        logger.error(f"Failed to load data: {e}")
    finally:
        loader.close()

if __name__ == "__main__":
    main()