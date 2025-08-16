// API client for Tam Quoc FastAPI backend
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// =============================================================================
// CHARACTERS API
// =============================================================================

export const charactersAPI = {
  // List all characters
  list: async (limit = 100) => {
    const response = await api.get(`/characters?limit=${limit}`);
    return response.data;
  },

  // Get character by ID
  get: async (charId) => {
    const response = await api.get(`/characters/${charId}`);
    return response.data;
  },

  // Create new character
  create: async (characterData) => {
    const response = await api.post('/characters', characterData);
    return response.data;
  },

  // Update character
  update: async (charId, characterData) => {
    const response = await api.put(`/characters/${charId}`, characterData);
    return response.data;
  },

  // Delete character
  delete: async (charId) => {
    const response = await api.delete(`/characters/${charId}`);
    return response.data;
  },

  // Search characters by name
  search: async (name) => {
    const response = await api.get(`/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },
};

// =============================================================================
// FACTIONS API
// =============================================================================

export const factionsAPI = {
  // List all factions
  list: async () => {
    const response = await api.get('/factions');
    return response.data;
  },
};

// =============================================================================
// RELATIONSHIPS API
// =============================================================================

export const relationshipsAPI = {
  // Create relationship
  create: async (relationshipData) => {
    const response = await api.post('/relationships', relationshipData);
    return response.data;
  },

  // Add relation type by names
  addByNames: async (fromName, toName, relType, properties = {}) => {
    const response = await api.post('/query/add_relation_type', {
      from_name: fromName,
      to_name: toName,
      rel_type: relType,
      properties,
    });
    return response.data;
  },

  // Upsert relationship by IDs
  upsert: async (relType, fromId, toId, properties = {}) => {
    const response = await api.post('/relationships/upsert', {
      rel_type: relType,
      from_id: fromId,
      to_id: toId,
      properties,
    });
    return response.data;
  },
};

// =============================================================================
// GRAPH QUERIES API
// =============================================================================

export const graphQueriesAPI = {
  // Complex relationship query with paths
  complex: async (fromName, toName, maxHops = 4, limit = 50) => {
    const response = await api.get('/query/complex', {
      params: { from_name: fromName, to_name: toName, max_hops: maxHops, limit },
    });
    return response.data;
  },

  // Shortest path between characters
  shortestPath: async (fromName, toName, maxLen = 15, k = 1) => {
    const response = await api.get('/query/shortest_path', {
      params: { from_name: fromName, to_name: toName, max_len: maxLen, k },
    });
    return response.data;
  },

  // Centrality analysis
  centrality: async (method = 'degree', limit = 20) => {
    const response = await api.get('/query/centrality', {
      params: { method, limit },
    });
    return response.data;
  },

  // Multi-hop traversal
  multiHop: async (name, hops = 2, direction = 'any', relTypes = null, limit = 500) => {
    const params = { name, hops, direction, limit };
    if (relTypes) params.rel_types = relTypes;
    const response = await api.get('/query/multi_hop', { params });
    return response.data;
  },

  // Filter by relationship type
  filterRelation: async (name, relType, limit = 500) => {
    const response = await api.get('/query/filter_relation', {
      params: { name, rel_type: relType, limit },
    });
    return response.data;
  },

  // Subgraph extraction
  subgraph: async (name, maxDepth = 2) => {
    const response = await api.get('/query/subgraph', {
      params: { name, maxDepth },
    });
    return response.data;
  },

  // Visual graph format
  visual: async (name, maxDepth = 2) => {
    const response = await api.get('/query/visual', {
      params: { name, maxDepth },
    });
    return response.data;
  },
};

// =============================================================================
// VISUAL API
// =============================================================================

export const visualAPI = {
  // Get neighbors of a node
  neighbors: async (id = null, name = null, depth = 1, offset = 0, limit = 50) => {
    const params = { depth, offset, limit };
    if (id !== null) params.id = id;
    if (name) params.name = name;
    const response = await api.get('/visual/neighbors', { params });
    return response.data;
  },
};

// =============================================================================
// SCHEMA API
// =============================================================================

export const schemaAPI = {
  // Get all labels
  labels: async () => {
    const response = await api.get('/schema/labels');
    return response.data;
  },

  // Get all relationship types
  relationshipTypes: async () => {
    const response = await api.get('/schema/relationship_types');
    return response.data;
  },
};

// =============================================================================
// NODES API
// =============================================================================

export const nodesAPI = {
  // Upsert node with arbitrary label
  upsert: async (label, key = 'name', payload) => {
    const response = await api.post(`/nodes/upsert?label=${label}&key=${key}`, payload);
    return response.data;
  },
};

// =============================================================================
// HEALTH API
// =============================================================================

export const healthAPI = {
  // Check API health
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Convert API graph data to vis-network format
export const convertToVisNetwork = (graphData) => {
  const nodes = graphData.nodes?.map(node => ({
    id: node.id,
    label: node.label || node.name || `Node ${node.id}`,
    color: node.color || node.props?.color || '#97C2FC',
    faction: node.faction || node.props?.faction,
    title: `${node.label || node.name || 'Unknown'}\nFaction: ${node.faction || node.props?.faction || 'Unknown'}`,
    ...node.props,
  })) || [];

  const edges = graphData.edges?.map(edge => ({
    id: edge.id,
    from: edge.start || edge.source,
    to: edge.end || edge.target,
    label: edge.type || edge.label,
    title: edge.type || edge.label,
    color: { color: '#848484' },
    ...edge.props,
  })) || [];

  return { nodes, edges };
};

// Handle API errors consistently
export const handleAPIError = (error, defaultMessage = 'An error occurred') => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.detail || error.response.data?.message || defaultMessage;
  } else if (error.request) {
    // Network error
    return 'Network error. Please check if the API server is running.';
  } else {
    // Other error
    return error.message || defaultMessage;
  }
};

export default api;