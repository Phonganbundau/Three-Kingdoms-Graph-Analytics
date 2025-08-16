
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from neo4j import GraphDatabase
import os
import re

# ---------- App & Drivers ----------
app = FastAPI(title="Tam Quoc API — Graph Suite")

# Primary app driver
driver = GraphDatabase.driver(
    uri=os.getenv("NEO4J_URI", "bolt://localhost:7687"),
    auth=(os.getenv("NEO4J_USER", "neo4j"), os.getenv("NEO4J_PASSWORD", "changeit")),
)

# Raw driver for ad‑hoc Cypher/GDS
_RAW_NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
_RAW_NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
_RAW_NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "changeit")
_raw_driver = GraphDatabase.driver(_RAW_NEO4J_URI, auth=(_RAW_NEO4J_USER, _RAW_NEO4J_PASSWORD))

# CORS to let your web frontend call these endpoints directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
def _shutdown_all():
    try:
        driver.close()
    except Exception:
        pass
    try:
        _raw_driver.close()
    except Exception:
        pass

# ---------- Models ----------
class CharacterIn(BaseModel):
    name: str
    born: Optional[int] = None
    faction: Optional[str] = None
    info: Optional[str] = None

class CharacterOut(CharacterIn):
    id: str

class RelationshipIn(BaseModel):
    from_id: str
    to_id: str
    rel_type: str
    since: Optional[int] = None
    properties: Optional[Dict[str, Any]] = None

# ---------- Helpers ----------
def _path_record_to_graph(rec: Dict[str, Any]) -> Dict[str, Any]:
    path = rec.get("path")
    if path is None:
        # Try detect in any value
        for v in rec.values():
            if hasattr(v, "nodes") and hasattr(v, "relationships"):
                path = v
                break
    if path is None:
        return {"nodes": [], "edges": []}

    nodes = {}
    edges = []
    for node in path.nodes:
        nodes[node.id] = {"id": node.id, "labels": list(node.labels), **dict(node)}
    for rel in path.relationships:
        edges.append({
            "id": rel.id,
            "type": rel.type,
            "start": rel.start_node.id,
            "end": rel.end_node.id,
            "properties": dict(rel),
        })
    return {"nodes": list(nodes.values()), "edges": edges}

def _records_to_nodes_edges(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    nodes = {}
    edges = []
    for r in records:
        for v in r.values():
            # Node
            if hasattr(v, "labels") and hasattr(v, "id"):
                nodes[v.id] = {"id": v.id, "labels": list(v.labels), **dict(v)}
            # Relationship
            elif hasattr(v, "type") and hasattr(v, "start_node"):
                edges.append({
                    "id": v.id,
                    "type": v.type,
                    "start": v.start_node.id,
                    "end": v.end_node.id,
                    "properties": dict(v),
                })
    return {"nodes": list(nodes.values()), "edges": edges}

def _clean_label_or_rel(s: str) -> str:
    return re.sub(r"[^A-Za-z0-9_]", "", s or "").upper()

def _props_to_set_fragment(props: Dict[str, Any], alias: str) -> str:
    if not props:
        return ""
    keys = [k for k in props.keys() if re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", k)]
    if not keys:
        return ""
    return " SET " + ", ".join([f"{alias}.{k} = $props.{k}" for k in keys])

def _supports_gds() -> bool:
    try:
        with _raw_driver.session() as s:
            rec = s.run("SHOW PROCEDURES YIELD name WHERE name STARTS WITH 'gds.' RETURN count(*) AS c").single()
            return (rec and rec.get("c", 0) > 0) or False
    except Exception:
        return False

# ---------- Core CRUD (using raw driver) ----------
@app.get('/characters', response_model=List[CharacterOut])
def list_characters(limit: int = 100):
    try:
        with _raw_driver.session() as s:
            result = s.run("MATCH (c:Character) RETURN c LIMIT $limit", {"limit": limit})
            characters = []
            for record in result:
                node = record["c"]
                char_data = dict(node)
                char_data["id"] = str(node.id)
                characters.append(char_data)
            return characters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/characters/{char_id}', response_model=CharacterOut)
def get_character(char_id: str):
    try:
        with _raw_driver.session() as s:
            result = s.run("MATCH (c:Character) WHERE c.name = $char_id OR id(c) = $char_id RETURN c", {"char_id": char_id})
            record = result.single()
            if not record:
                raise HTTPException(status_code=404, detail='Character not found')
            node = record["c"]
            char_data = dict(node)
            char_data["id"] = str(node.id)
            return char_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/characters', response_model=CharacterOut, status_code=201)
def create_character(payload: CharacterIn):
    try:
        with _raw_driver.session() as s:
            result = s.run(
                "CREATE (c:Character) SET c += $props RETURN c",
                {"props": payload.dict()}
            )
            node = result.single()["c"]
            char_data = dict(node)
            char_data["id"] = str(node.id)
            return char_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put('/characters/{char_id}', response_model=CharacterOut)
def update_character(char_id: str, payload: CharacterIn):
    try:
        with _raw_driver.session() as s:
            result = s.run(
                "MATCH (c:Character) WHERE c.name = $char_id OR id(c) = $char_id SET c += $props RETURN c",
                {"char_id": char_id, "props": payload.dict()}
            )
            record = result.single()
            if not record:
                raise HTTPException(status_code=404, detail='Character not found')
            node = record["c"]
            char_data = dict(node)
            char_data["id"] = str(node.id)
            return char_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete('/characters/{char_id}', status_code=204)
def delete_character(char_id: str):
    try:
        with _raw_driver.session() as s:
            result = s.run(
                "MATCH (c:Character) WHERE c.name = $char_id OR id(c) = $char_id DELETE c RETURN count(c) as deleted",
                {"char_id": char_id}
            )
            deleted = result.single()["deleted"]
            if deleted == 0:
                raise HTTPException(status_code=404, detail='Character not found')
            return
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/factions')
def list_factions():
    try:
        with _raw_driver.session() as s:
            result = s.run("MATCH (c:Character) RETURN DISTINCT c.faction as faction")
            return [record["faction"] for record in result if record["faction"]]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/relationships', status_code=201)
def create_relationship(payload: RelationshipIn):
    try:
        with _raw_driver.session() as s:
            result = s.run(
                "MATCH (a:Character), (b:Character) WHERE a.name = $from_id AND b.name = $to_id CREATE (a)-[r:" + payload.rel_type.upper() + "]->(b) RETURN r",
                {"from_id": payload.from_id, "to_id": payload.to_id}
            )
            if result.single():
                return {'status': 'created'}
            else:
                raise HTTPException(status_code=400, detail='Could not create relationship')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/search')
def search(name: str):
    try:
        with _raw_driver.session() as s:
            result = s.run(
                "MATCH (c:Character) WHERE c.name CONTAINS $name RETURN c LIMIT 10",
                {"name": name}
            )
            characters = []
            for record in result:
                node = record["c"]
                char_data = dict(node)
                char_data["id"] = str(node.id)
                characters.append(char_data)
            return characters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Advanced Graph Queries ----------

# 1) Complex undirected relationship query within N hops, returning paths
@app.get("/query/complex")
def api_complex(from_name: str, to_name: str, max_hops: int = 4, limit: int = 50):
    cypher = "MATCH path=(a:Character {name:$from})-[*1..$max_hops]-(b:Character {name:$to}) RETURN path LIMIT $limit"
    try:
        with _raw_driver.session() as s:
            result = s.run(cypher, {"from": from_name, "to": to_name, "max_hops": max_hops, "limit": limit})
            paths = [_path_record_to_graph({"path": r["path"]}) for r in result if r.get("path") is not None]
        return {"count": len(paths), "paths": paths}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2) Shortest path (native Cypher). If GDS is available, optional K-shortest with Yen's algorithm.
@app.get("/query/shortest_path")
def api_shortest_path(from_name: str, to_name: str, max_len: int = 15, k: int = 1):
    try:
        if k <= 1:
            # FIXED: Use literal number instead of parameter in pattern
            cypher = "MATCH (a:Character {name:$from}), (b:Character {name:$to}) MATCH p = shortestPath((a)-[*..15]-(b)) RETURN p AS path"
            with _raw_driver.session() as s:
                recs = s.run(cypher, {"from": from_name, "to": to_name})
                paths = []
                for r in recs:
                    p = r.get("path")
                    if p is not None:
                        paths.append(_path_record_to_graph({"path": p}))
                return {"count": len(paths), "paths": paths}
        
        # Try GDS Yen's k-shortest if requested
        if _supports_gds():
            query = """
            MATCH (source:Character {name:$from}), (target:Character {name:$to})
            CALL gds.shortestPath.yens.stream({
              sourceNode: id(source),
              targetNode: id(target),
              k: $k,
              relationshipTypes: null,
              nodeProjection: 'Character',
              relationshipProjection: '*'
            })
            YIELD index, path
            RETURN index, path
            """
            with _raw_driver.session() as s:
                recs = s.run(query, {"from": from_name, "to": to_name, "k": k})
                paths = [_path_record_to_graph({"path": r["path"]}) for r in recs if r.get("path")]
                return {"count": len(paths), "paths": paths, "engine": "gds.yens"}
        
        # Fallback: just return single shortest via Cypher
        return api_shortest_path(from_name, to_name, max_len, 1)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3) Centrality: degree (Cypher), PageRank & Betweenness (GDS if available)
@app.get("/query/centrality")
def api_centrality(method: str = "degree", limit: int = 20):
    m = method.lower()
    try:
        with _raw_driver.session() as s:
            if m == "degree":
                cypher = "MATCH (n:Character) RETURN n.name AS name, COUNT {(n)--()} AS score ORDER BY score DESC LIMIT $limit"
                recs = s.run(cypher, {"limit": limit})
                return {"method": "degree", "results": [dict(r) for r in recs]}
            elif m in ("pagerank", "betweenness") and _supports_gds():
                # GDS 2.13.2 requires creating a named graph first
                graph_name = f"temp_graph_{m}_{limit}"
                
                # Create temporary graph
                create_graph_query = f"""
                CALL gds.graph.project('{graph_name}', 'Character', '*')
                YIELD graphName, nodeCount, relationshipCount
                RETURN graphName, nodeCount, relationshipCount
                """
                
                try:
                    # Create the graph
                    s.run(create_graph_query).consume()
                    
                    # Run the algorithm
                    if m == "pagerank":
                        algo_query = f"""
                        CALL gds.pageRank.stream('{graph_name}')
                        YIELD nodeId, score
                        RETURN gds.util.asNode(nodeId).name AS name, score
                        ORDER BY score DESC LIMIT $limit
                        """
                    else:  # betweenness
                        algo_query = f"""
                        CALL gds.betweenness.stream('{graph_name}')
                        YIELD nodeId, score
                        RETURN gds.util.asNode(nodeId).name AS name, score
                        ORDER BY score DESC LIMIT $limit
                        """
                    
                    recs = s.run(algo_query, {"limit": limit})
                    results = [dict(r) for r in recs]
                    
                    # Clean up temporary graph
                    s.run(f"CALL gds.graph.drop('{graph_name}')").consume()
                    
                    return {"method": m, "results": results, "graph": graph_name}
                    
                except Exception as e:
                    # Clean up on error
                    try:
                        s.run(f"CALL gds.graph.drop('{graph_name}')").consume()
                    except:
                        pass
                    raise e
            else:
                raise HTTPException(status_code=400, detail="Unsupported method or GDS not available. Use method=degree|pagerank|betweenness.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4) Multi-hop traversal with direction & relationship type filter
@app.get("/query/multi_hop")
def api_multi_hop(
    name: str,
    hops: int = 2,
    direction: str = "any",
    rel_types: Optional[str] = None,
    limit: int = 500,
):
    if hops < 1:
        raise HTTPException(status_code=400, detail="hops must be >= 1")
    dir_map = {"out": "->", "in": "<-", "any": "-"}
    arrow = dir_map.get(direction.lower(), "-")
    # sanitize relationship types
    rel_clause = ""
    if rel_types:
        cleaned = [_clean_label_or_rel(rt) for rt in rel_types.split(",") if _clean_label_or_rel(rt)]
        if cleaned:
            rel_clause = ":" + "|".join(cleaned)
    pattern = f"-[{rel_clause}*{hops}]{arrow}"
    cypher = f"MATCH (p:Character {{name:$name}}){pattern}(other) RETURN DISTINCT other LIMIT $limit"
    try:
        with _raw_driver.session() as s:
            recs = s.run(cypher, {"name": name, "limit": limit})
            return _records_to_nodes_edges([r.data() for r in recs])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5) Filter by a specific relationship type
@app.get("/query/filter_relation")
def api_filter_relation(name: str, rel_type: str, limit: int = 500):
    cleaned = _clean_label_or_rel(rel_type)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Invalid relationship type")
    cypher = f"MATCH (p:Character {{name:$name}})-[r:{cleaned}]->(other) RETURN other, r LIMIT $limit"
    try:
        with _raw_driver.session() as s:
            recs = s.run(cypher, {"name": name, "limit": limit})
            return _records_to_nodes_edges([r.data() for r in recs])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6) Subgraph extraction (APOC if present, else pure Cypher)
@app.get("/query/subgraph")
def api_subgraph(name: str, maxDepth: int = 2):
    # Try APOC first
    cypher_apoc = """
    MATCH (p:Character {name:$name})
    CALL apoc.path.subgraphAll(p, {maxLevel:$maxDepth})
    YIELD nodes, relationships
    RETURN nodes, relationships
    """
    try:
        with _raw_driver.session() as s:
            recs = s.run(cypher_apoc, {"name": name, "maxDepth": maxDepth})
            first = recs.single()
            if first:
                nodes = first["nodes"]
                rels = first["relationships"]
                nodes_map = {n.id: {"id": n.id, "labels": list(n.labels), **dict(n)} for n in nodes}
                edges = [{"id": r.id, "type": r.type, "start": r.start_node.id, "end": r.end_node.id, "properties": dict(r)} for r in rels]
                return {"nodes": list(nodes_map.values()), "edges": edges}
    except Exception:
        pass

    # Fallback without APOC - FIXED CYPHER QUERY
    if maxDepth == 0:
        cypher = """
        MATCH (p:Character {name:$name})
        RETURN collect(p) AS nodes, [] AS relationships
        """
    elif maxDepth == 1:
        cypher = """
        MATCH (p:Character {name:$name})
        OPTIONAL MATCH (p)-[r]-(x)
        RETURN collect(p) + collect(x) AS nodes, collect(r) AS relationships
        """
    elif maxDepth == 2:
        cypher = """
        MATCH (p:Character {name:$name})
        OPTIONAL MATCH (p)-[r1]-(x1)
        OPTIONAL MATCH (x1)-[r2]-(x2)
        RETURN collect(p) + collect(x1) + collect(x2) AS nodes, collect(r1) + collect(r2) AS relationships
        """
    else:
        cypher = """
        MATCH (p:Character {name:$name})
        OPTIONAL MATCH (p)-[r1]-(x1)
        OPTIONAL MATCH (x1)-[r2]-(x2)
        OPTIONAL MATCH (x2)-[r3]-(x3)
        RETURN collect(p) + collect(x1) + collect(x2) + collect(x3) AS nodes, collect(r1) + collect(r2) + collect(r3) AS relationships
        """

    try:
        with _raw_driver.session() as s:
            recs = s.run(cypher, {"name": name})
            first = recs.single()
            if not first:
                return {"nodes": [], "edges": []}
            nodes = first["nodes"]
            rels = first["relationships"]
            nodes_map = {n.id: {"id": n.id, "labels": list(n.labels), **dict(n)} for n in nodes}
            edges = [{"id": r.id, "type": r.type, "start": r.start_node.id, "end": r.end_node.id, "properties": dict(r)} for r in rels]
            return {"nodes": list(nodes_map.values()), "edges": edges}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 7) Visual graph format for frontends (nodes/edges with display labels)
@app.get("/query/visual")
def api_visual(name: str, maxDepth: int = 2):
    sg = api_subgraph(name, maxDepth)
    nodes = [{"id": n["id"], "label": n.get("name") or ",".join(n.get("labels", [])), "props": {k: v for k, v in n.items() if k not in ("id", "labels")}} for n in sg.get("nodes", [])]
    edges = [{"id": e["id"], "source": e["start"], "target": e["end"], "type": e["type"], "props": e.get("properties", {})} for e in sg.get("edges", [])]
    return {"nodes": nodes, "edges": edges}

# 8) Add a flexible relation type by names (MERGE) with optional properties
@app.post("/query/add_relation_type")
def api_add_relation_type(payload: Dict[str, Any] = Body(...)):
    from_name = payload.get("from_name")
    to_name = payload.get("to_name")
    rel_type = payload.get("rel_type", "")
    properties = payload.get("properties") or {}

    if not from_name or not to_name or not rel_type:
        raise HTTPException(status_code=400, detail="from_name, to_name and rel_type are required")

    rel = _clean_label_or_rel(rel_type)
    if not rel:
        raise HTTPException(status_code=400, detail="invalid rel_type")

    set_fragment = _props_to_set_fragment(properties, "r")
    cypher = f"MERGE (a:Character {{name:$from}}) MERGE (b:Character {{name:$to}}) MERGE (a)-[r:{rel}]->(b){set_fragment} RETURN a,b,r"
    try:
        with _raw_driver.session() as s:
            _ = s.run(cypher, {"from": from_name, "to": to_name, "props": properties}).consume()
            return {"status": "ok", "created_relation": rel, "from": from_name, "to": to_name, "properties": properties}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Flexible Schema Utilities ----------

# A) Introspect schema: labels & relationship types
@app.get("/schema/labels")
def get_labels():
    with _raw_driver.session() as s:
        recs = s.run("CALL db.labels() YIELD label RETURN label ORDER BY label")
        return [r["label"] for r in recs]

@app.get("/schema/relationship_types")
def get_rel_types():
    with _raw_driver.session() as s:
        recs = s.run("CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType ORDER BY relationshipType")
        return [r["relationshipType"] for r in recs]

# B) Upsert a node with arbitrary label & properties
@app.post("/nodes/upsert")
def upsert_node(label: str, key: str = "name", payload: Dict[str, Any] = Body(...)):
    safe_label = _clean_label_or_rel(label)
    if not safe_label:
        raise HTTPException(status_code=400, detail="Invalid label")
    if key not in payload:
        raise HTTPException(status_code=400, detail=f"Missing key property '{key}' in payload")

    props = payload.copy()
    set_fragment = _props_to_set_fragment(props, "n")
    cypher = f"MERGE (n:{safe_label} {{{key}: $keyVal}}){set_fragment} RETURN id(n) AS id, labels(n) AS labels, n AS node"
    try:
        with _raw_driver.session() as s:
            rec = s.run(cypher, {"keyVal": props[key], "props": props}).single()
            node = rec["node"]
            return {"id": rec["id"], "labels": rec["labels"], **dict(node)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# C) Upsert relationship between two nodes by ids with arbitrary type & props
@app.post("/relationships/upsert")
def upsert_rel(
    rel_type: str,
    from_id: int,
    to_id: int,
    properties: Optional[Dict[str, Any]] = Body(default=None),
):
    safe_rel = _clean_label_or_rel(rel_type)
    if not safe_rel:
        raise HTTPException(status_code=400, detail="Invalid relationship type")
    set_fragment = _props_to_set_fragment(properties or {}, "r")
    cypher = f"""
    MATCH (a) WHERE id(a) = $from_id
    MATCH (b) WHERE id(b) = $to_id
    MERGE (a)-[r:{safe_rel}]->(b){set_fragment}
    RETURN id(r) AS id, type(r) AS type, id(a) AS start, id(b) AS end, r AS rel
    """
    try:
        with _raw_driver.session() as s:
            rec = s.run(cypher, {"from_id": from_id, "to_id": to_id, "props": properties or {}}).single()
            if not rec:
                raise HTTPException(status_code=400, detail="Could not create relationship")
            rel = rec["rel"]
            return {"id": rec["id"], "type": rec["type"], "start": rec["start"], "end": rec["end"], "properties": dict(rel)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# D) Visual navigation: fetch neighborhood of a node (by id or name) with paging
@app.get("/visual/neighbors")
def visual_neighbors(
    id: Optional[int] = None,
    name: Optional[str] = None,
    depth: int = 1,
    offset: int = 0,
    limit: int = 50
):
    if depth < 0:
        raise HTTPException(status_code=400, detail="depth must be >= 0")
    if id is None and not name:
        raise HTTPException(status_code=400, detail="Provide id or name")

    where = "id(n) = $id" if id is not None else "n.name = $name"
    params = {"id": id, "name": name, "offset": offset, "limit": limit, "depth": depth}

    # Collect nodes within depth
    cy_nodes = f"""
    MATCH (n:Character) WHERE {where}
    CALL apoc.path.subgraphNodes(n, {{maxLevel:$depth}}) YIELD node
    RETURN node SKIP $offset LIMIT $limit
    """
    # Fallback if APOC missing: basic neighborhood for depth 0/1
    cy_basic = f"""
    MATCH (n:Character) WHERE {where}
    WITH n
    OPTIONAL MATCH (n)-[r]-(m)
    WITH collect(n) + collect(m) AS nodes
    UNWIND nodes AS node
    RETURN DISTINCT node SKIP $offset LIMIT $limit
    """

    try:
        with _raw_driver.session() as s:
            try:
                recs = list(s.run(cy_nodes, params))
            except Exception:
                recs = list(s.run(cy_basic, params))

            nodes = [{"id": v["node"].id, "label": v["node"].get("name") or ",".join(list(v["node"].labels)), "props": dict(v["node"])} for v in recs if v.get("node")]
            # fetch edges among returned nodes
            node_ids = [n["id"] for n in nodes]
            if node_ids:
                rels = s.run("MATCH (a)-[r]-(b) WHERE id(a) IN $ids AND id(b) IN $ids RETURN id(r) AS id, type(r) AS type, id(a) AS start, id(b) AS end, r", {"ids": node_ids})
                edges = [{"id": r["id"], "type": r["type"], "source": r["start"], "target": r["end"], "props": dict(r["r"])} for r in rels]
            else:
                edges = []
            return {"nodes": nodes, "edges": edges, "page": {"offset": offset, "limit": limit}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Health ----------
@app.get("/health")
def health():
    try:
        with _raw_driver.session() as s:
            s.run("RETURN 1 AS ok").single()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
