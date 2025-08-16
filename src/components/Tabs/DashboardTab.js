"use client";
import { useState, useEffect } from 'react';
import { Users, Network, GitBranch, Activity, TrendingUp, Crown } from 'lucide-react';
import { charactersAPI, graphQueriesAPI, healthAPI } from '../../lib/api';
import NetworkGraph from '../NetworkGraph/NetworkGraph';
import { convertToVisNetwork } from '../../lib/api';

const StatCard = ({ title, value, icon: Icon, color = "blue", change = null }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="h-4 w-4" />
                  {Math.abs(change)}%
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const FactionCard = ({ faction, count, color, characters }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{faction}</h3>
          <p className="text-3xl font-bold" style={{ color }}>{count}</p>
          <p className="text-sm text-gray-500">nhân vật</p>
        </div>
        <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
          <Crown className="h-8 w-8" style={{ color }} />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-sm text-gray-600">
          Tiêu biểu: {characters.slice(0, 3).map(c => c.name).join(', ')}
          {characters.length > 3 && ` +${characters.length - 3} khác`}
        </div>
      </div>
    </div>
  </div>
);

export default function DashboardTab() {
  const [stats, setStats] = useState({
    totalCharacters: 0,
    totalRelationships: 0,
    factions: [],
    apiHealth: false
  });
  const [networkData, setNetworkData] = useState({ nodes: [], edges: [] });
  const [topCharacters, setTopCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Check API health
      const healthStatus = await healthAPI.check();
      
      // Load characters
      const characters = await charactersAPI.list(100);
      
      // Get sample network data (first character's subgraph)
      let sampleNetwork = { nodes: [], edges: [] };
      if (characters.length > 0) {
        try {
          const firstChar = characters[0];
          const visual = await graphQueriesAPI.visual(firstChar.name, 2);
          sampleNetwork = convertToVisNetwork(visual);
        } catch (error) {
          console.warn('Could not load sample network:', error);
        }
      }

      // Group characters by faction
      const factionGroups = characters.reduce((acc, char) => {
        const faction = char.faction || 'Unknown';
        if (!acc[faction]) {
          acc[faction] = [];
        }
        acc[faction].push(char);
        return acc;
      }, {});

      // Get centrality data for top characters
      let topChars = [];
      try {
        const centralityData = await graphQueriesAPI.centrality('degree', 10);
        topChars = centralityData.results || [];
      } catch (error) {
        console.warn('Could not load centrality data:', error);
      }

      setStats({
        totalCharacters: characters.length,
        totalRelationships: sampleNetwork.edges.length,
        factions: Object.entries(factionGroups).map(([name, chars]) => ({
          name,
          count: chars.length,
          characters: chars,
          color: chars[0]?.color || '#666'
        })),
        apiHealth: true
      });

      setNetworkData(sampleNetwork);
      setTopCharacters(topChars);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats(prev => ({ ...prev, apiHealth: false }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 animate-spin text-blue-600" />
          <span>Đang tải dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Tam Quốc</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tổng quan về mạng lưới nhân vật và mối quan hệ trong Tam Quốc diễn nghĩa
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng nhân vật"
          value={stats.totalCharacters}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Mối quan hệ"
          value={stats.totalRelationships}
          icon={GitBranch}
          color="green"
        />
        <StatCard
          title="Thế lực"
          value={stats.factions.length}
          icon={Crown}
          color="purple"
        />
        <StatCard
          title="API Status"
          value={stats.apiHealth ? "Connected" : "Offline"}
          icon={Activity}
          color={stats.apiHealth ? "green" : "red"}
        />
      </div>

      {/* Factions Overview */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Phân bố theo thế lực</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.factions.map((faction) => (
            <FactionCard
              key={faction.name}
              faction={faction.name}
              count={faction.count}
              color={faction.color}
              characters={faction.characters}
            />
          ))}
        </div>
      </div>

      {/* Network Preview & Top Characters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Preview */}
        <div className="lg:col-span-2">
          <NetworkGraph
            nodes={networkData.nodes}
            edges={networkData.edges}
            title="Mạng lưới mối quan hệ (Mẫu)"
            className="h-96"
          />
        </div>

        {/* Top Characters by Centrality */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Nhân vật quan trọng nhất
            </h3>
            <div className="space-y-3">
              {topCharacters.slice(0, 8).map((char, index) => (
                <div key={char.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-900">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {char.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">
                      {char.score} kết nối
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Hành động nhanh
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              <Network className="h-4 w-4 mr-2" />
              Xem toàn bộ mạng lưới
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Users className="h-4 w-4 mr-2" />
              Quản lý nhân vật
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <GitBranch className="h-4 w-4 mr-2" />
              Phân tích mối quan hệ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
