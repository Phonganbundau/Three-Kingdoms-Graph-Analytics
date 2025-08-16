"use client";
import { useState } from 'react';
import { Crown, Network, Database, BarChart3, Settings, Menu, X } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '#dashboard', icon: Crown, current: true },
  { name: 'Network View', href: '#network', icon: Network, current: false },
  { name: 'Characters', href: '#characters', icon: Database, current: false },
  { name: 'Analytics', href: '#analytics', icon: BarChart3, current: false },
  { name: 'Settings', href: '#settings', icon: Settings, current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar({ activeTab, onTabChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Crown className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Tam Quốc
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = activeTab === item.href.slice(1);
                return (
                  <button
                    key={item.name}
                    onClick={() => onTabChange(item.href.slice(1))}
                    className={classNames(
                      isActive
                        ? 'border-red-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Health Status */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2 mr-4">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-500">API Connected</span>
            </div>
            
            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = activeTab === item.href.slice(1);
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    onTabChange(item.href.slice(1));
                    setMobileMenuOpen(false);
                  }}
                  className={classNames(
                    isActive
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                    'block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}