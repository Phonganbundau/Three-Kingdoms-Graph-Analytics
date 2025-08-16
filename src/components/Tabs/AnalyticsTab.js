"use client";
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, GitBranch, Search, Download } from 'lucide-react';
import { graphQueriesAPI, charactersAPI } from '../../lib/api';
import NetworkGraph from '../NetworkGraph/NetworkGraph';
import { convertToVisNetwork } from '../../lib/api';

const AnalyticsCard = ({ title, description, children, className = "" }) => (
  <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
    <div className="mb-4">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    {children}
  </div>
);

const CentralityAnalysis = () => {
  const [centralityData, setCentralityData] = useState([]);
  const [method, setMethod] = useState('degree');
  const [loading, setLoading] = useState(false);

  const loadCentralityData = async (selectedMethod = method) => {
    setLoading(true);
    try {
      const result = await graphQueriesAPI.centrality(selectedMethod, 20);
      setCentralityData(result.results || []);
    } catch (error) {
      console.error('Error loading centrality data:', error);
      setCentralityData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCentralityData();
  }, []);

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    loadCentralityData(newMethod);
  };

  return (
    <AnalyticsCard
      title="Phân tích độ quan trọng (Centrality)"
      description="Xác định những nhân vật có ảnh hưởng lớn nhất trong mạng lưới"
    >
      <div className="space-y-4">
        <div className="flex space-x-2">
          {[
            { value: 'degree', label: 'Degree Centrality' },
            { value: 'pagerank', label: 'PageRank' },
            { value: 'betweenness', label: 'Betweenness' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleMethodChange(value)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                method === value
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Đang phân tích...</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {centralityData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-900">
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {typeof item.score === 'number' ? item.score.toFixed(3) : item.score}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AnalyticsCard>
  );
};

const ShortestPathAnalysis = () => {
  const [characters, setCharacters] = useState([]);
  const [fromChar, setFromChar] = useState('');
  const [toChar, setToChar] = useState('');
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const chars = await charactersAPI.list(100);
      setCharacters(chars);
      if (chars.length >= 2) {
        setFromChar(chars[0].name);
        setToChar(chars[1].name);
      }
    } catch (error) {
      console.error('Error loading characters:', error);
    }
  };

  const findShortestPath = async () => {
    if (!fromChar || !toChar) return;
    
    setLoading(true);
    try {
      const result = await graphQueriesAPI.shortestPath(fromChar, toChar, 15, 1);
      setPathData(result);
    } catch (error) {
      console.error('Error finding shortest path:', error);
      setPathData({ count: 0, paths: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnalyticsCard
      title="Phân tích đường đi ngắn nhất"
      description="Tìm đường kết nối ngắn nhất giữa hai nhân vật"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ nhân vật
            </label>
            <select
              value={fromChar}
              onChange={(e) => setFromChar(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn nhân vật</option>
              {characters.map((char) => (
                <option key={char.id} value={char.name}>
                  {char.name} ({char.faction})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến nhân vật
            </label>
            <select
              value={toChar}
              onChange={(e) => setToChar(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn nhân vật</option>
              {characters.map((char) => (
                <option key={char.id} value={char.name}>
                  {char.name} ({char.faction})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={findShortestPath}
          disabled={!fromChar || !toChar || loading}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <Search className="h-4 w-4 mr-2" />
          {loading ? 'Đang tìm kiếm...' : 'Tìm đường đi ngắn nhất'}
        </button>

        {pathData && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Tìm thấy {pathData.count} đường đi
            </p>
            {pathData.paths && pathData.paths.length > 0 && (
              <div className="h-64">
                <NetworkGraph
                  nodes={convertToVisNetwork(pathData.paths[0]).nodes}
                  edges={convertToVisNetwork(pathData.paths[0]).edges}
                  title="Đường đi ngắn nhất"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </AnalyticsCard>
  );
};

const NetworkStatistics = () => {
  const [stats, setStats] = useState({
    totalNodes: 0,
    totalEdges: 0,
    density: 0,
    components: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNetworkStats();
  }, []);

  const loadNetworkStats = async () => {
    setLoading(true);
    try {
      // Load sample data to calculate stats
      const characters = await charactersAPI.list(100);
      
      // Try to get a large subgraph for analysis
      if (characters.length > 0) {
        const visual = await graphQueriesAPI.visual(characters[0].name, 3);
        const networkData = convertToVisNetwork(visual);
        
        const nodeCount = networkData.nodes.length;
        const edgeCount = networkData.edges.length;
        const maxPossibleEdges = nodeCount * (nodeCount - 1) / 2;
        const density = maxPossibleEdges > 0 ? (edgeCount / maxPossibleEdges * 100).toFixed(2) : 0;
        
        setStats({
          totalNodes: nodeCount,
          totalEdges: edgeCount,
          density,
          components: 1 // Simplified for demo
        });
      }
    } catch (error) {
      console.error('Error loading network stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
      <div className="ml-4">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );

  return (
    <AnalyticsCard
      title="Thống kê mạng lưới"
      description="Các chỉ số tổng quan về cấu trúc mạng lưới"
    >
      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Đang tính toán...</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            label="Tổng số nhân vật"
            value={stats.totalNodes}
            icon={Users}
          />
          <StatItem
            label="Tổng số mối quan hệ"
            value={stats.totalEdges}
            icon={GitBranch}
          />
          <StatItem
            label="Mật độ mạng (%)"
            value={`${stats.density}%`}
            icon={BarChart3}
          />
          <StatItem
            label="Thành phần liên thông"
            value={stats.components}
            icon={TrendingUp}
          />
        </div>
      )}
    </AnalyticsCard>
  );
};

export default function AnalyticsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phân tích mạng lưới</h1>
          <p className="mt-1 text-sm text-gray-500">
            Các công cụ phân tích và thống kê về mạng lưới nhân vật Tam Quốc
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" />
          Xuất báo cáo
        </button>
      </div>

      {/* Network Statistics */}
      <NetworkStatistics />

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Centrality Analysis */}
        <CentralityAnalysis />

        {/* Shortest Path Analysis */}
        <ShortestPathAnalysis />
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 gap-6">
        <AnalyticsCard
          title="Phân tích theo thế lực"
          description="Thống kê mối quan hệ giữa các thế lực"
        >
          <div className="text-center py-8 text-gray-500">
            Tính năng đang phát triển...
          </div>
        </AnalyticsCard>
      </div>
    </div>
  );
}
