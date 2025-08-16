"use client";
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Layout/Navbar';
import DashboardTab from '../components/Tabs/DashboardTab';
import NetworkTab from '../components/Tabs/NetworkTab';
import CharactersTab from '../components/Tabs/CharactersTab';
import AnalyticsTab from '../components/Tabs/AnalyticsTab';
import { healthAPI } from '../lib/api';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    checkAPIConnection();
  }, []);

  const checkAPIConnection = async () => {
    try {
      await healthAPI.check();
      setApiConnected(true);
    } catch (error) {
      console.warn('API not available:', error);
      setApiConnected(false);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'network':
        return <NetworkTab />;
      case 'characters':
        return <CharactersTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
              <p className="mt-1 text-sm text-gray-500">
                Cấu hình hệ thống và API
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Kết nối API
                    </h3>
                    <p className="text-sm text-gray-500">
                      Trạng thái kết nối với FastAPI backend
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${apiConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-sm text-gray-700">
                      {apiConnected ? 'Đã kết nối' : 'Không kết nối'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={checkAPIConnection}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Kiểm tra kết nối
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderActiveTab()}
        </div>
      </main>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />

      {/* API Connection Warning */}
      {!apiConnected && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-md p-4 max-w-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                API không khả dụng
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Đảm bảo FastAPI server đang chạy trên localhost:8000
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
