"use client";
import { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Eye, User } from 'lucide-react';
import { charactersAPI, graphQueriesAPI } from '../../lib/api';
import NetworkGraph from '../NetworkGraph/NetworkGraph';
import { convertToVisNetwork } from '../../lib/api';

export default function NetworkTab() {
  const [networkData, setNetworkData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [characters, setCharacters] = useState([]);
  const [viewMode, setViewMode] = useState('subgraph'); // 'full', 'subgraph', 'neighbors'
  const [maxDepth, setMaxDepth] = useState(2);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    loadCharacters();
    loadFullNetwork();
  }, []);

  const loadCharacters = async () => {
    try {
      const chars = await charactersAPI.list(100);
      setCharacters(chars);
      if (chars.length > 0) {
        setSelectedCharacter(chars[0].name);
      }
    } catch (error) {
      console.error('Error loading characters:', error);
    }
  };

  const loadFullNetwork = async () => {
    setLoading(true);
    try {
      // Load a sample character's subgraph to start
      if (characters.length > 0) {
        const visual = await graphQueriesAPI.visual(characters[0].name, 3);
        const networkData = convertToVisNetwork(visual);
        setNetworkData(networkData);
      }
    } catch (error) {
      console.error('Error loading network:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubgraph = async (characterName, depth = 2) => {
    if (!characterName) return;
    
    setLoading(true);
    try {
      const visual = await graphQueriesAPI.visual(characterName, depth);
      const networkData = convertToVisNetwork(visual);
      setNetworkData(networkData);
    } catch (error) {
      console.error('Error loading subgraph:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNeighbors = async (characterName, depth = 1) => {
    if (!characterName) return;
    
    setLoading(true);
    try {
      const result = await graphQueriesAPI.multiHop(characterName, depth, 'any', null, 500);
      const networkData = convertToVisNetwork(result);
      setNetworkData(networkData);
    } catch (error) {
      console.error('Error loading neighbors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (selectedCharacter) {
      switch (mode) {
        case 'subgraph':
          loadSubgraph(selectedCharacter, maxDepth);
          break;
        case 'neighbors':
          loadNeighbors(selectedCharacter, maxDepth);
          break;
        case 'full':
          loadFullNetwork();
          break;
      }
    }
  };

  const handleCharacterSelect = (characterName) => {
    setSelectedCharacter(characterName);
    switch (viewMode) {
      case 'subgraph':
        loadSubgraph(characterName, maxDepth);
        break;
      case 'neighbors':
        loadNeighbors(characterName, maxDepth);
        break;
    }
  };

  const handleDepthChange = (depth) => {
    setMaxDepth(depth);
    if (selectedCharacter) {
      switch (viewMode) {
        case 'subgraph':
          loadSubgraph(selectedCharacter, depth);
          break;
        case 'neighbors':
          loadNeighbors(selectedCharacter, depth);
          break;
      }
    }
  };

  const handleNodeClick = (nodeData) => {
    setSelectedNode(nodeData);
    console.log('Node clicked:', nodeData);
  };

  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mạng lưới nhân vật</h1>
        <p className="mt-1 text-sm text-gray-500">
          Khám phá mối quan hệ giữa các nhân vật trong Tam Quốc diễn nghĩa
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Character Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn nhân vật
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm nhân vật..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <select
              value={selectedCharacter}
              onChange={(e) => handleCharacterSelect(e.target.value)}
              className="mt-2 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn nhân vật...</option>
              {filteredCharacters.map((char) => (
                <option key={char.id} value={char.name}>
                  {char.name} ({char.faction})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chế độ xem
            </label>
            <div className="flex space-x-2">
              {[
                { value: 'subgraph', label: 'Subgraph', icon: Eye },
                { value: 'neighbors', label: 'Neighbors', icon: User },
                { value: 'full', label: 'Full', icon: Filter }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleViewModeChange(value)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    viewMode === value
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Depth Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ sâu: {maxDepth}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={maxDepth}
              onChange={(e) => handleDepthChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          {/* Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hành động
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewModeChange(viewMode)}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => {/* TODO: Export functionality */}}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Network Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Network */}
        <div className="lg:col-span-3">
          <NetworkGraph
            nodes={networkData.nodes}
            edges={networkData.edges}
            onNodeClick={handleNodeClick}
            title={`Mạng lưới - ${viewMode} ${selectedCharacter ? `(${selectedCharacter})` : ''}`}
            className="h-[600px]"
          />
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Selected Node Info */}
          {selectedNode && (
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Thông tin nhân vật
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Tên:</span>
                  <p className="text-sm text-gray-900">{selectedNode.label}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Thế lực:</span>
                  <p className="text-sm text-gray-900">{selectedNode.faction || 'Không xác định'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">ID:</span>
                  <p className="text-sm text-gray-900">{selectedNode.id}</p>
                </div>
              </div>
            </div>
          )}

          {/* Network Stats */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Thống kê mạng lưới
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Nhân vật:</span>
                <span className="text-sm font-medium text-gray-900">
                  {networkData.nodes.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Mối quan hệ:</span>
                <span className="text-sm font-medium text-gray-900">
                  {networkData.edges.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Độ sâu:</span>
                <span className="text-sm font-medium text-gray-900">
                  {maxDepth}
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Chú giải
            </h3>
            <div className="space-y-2">
              {[
                { color: '#4CAF50', label: 'Thục Hán' },
                { color: '#2196F3', label: 'Tào Ngụy' },
                { color: '#FF9800', label: 'Đông Ngô' },
                { color: '#9C27B0', label: 'Khác' }
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
