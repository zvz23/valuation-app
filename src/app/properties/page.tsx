'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Eye, Building, FileText, CheckCircle, BarChart3, FileType, Download, Eye as Preview, Sparkles, Home, MapPin, DollarSign, Calendar, User as UserIcon, Shield, Settings, LogOut, ChevronDown } from 'lucide-react';
import { getCurrentUser, signOut, type User as AuthUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import axios from 'axios';
interface Property {
  _id?: string;
  jobNumber: string;
  address: string;
  propertyValuer: string;
  dateCreated: string;
  lastModified: string;
  status: 'Automated Data Collection' | 'Fillout' | 'Market Evidence' | 'Check' | 'Revision' | 'Closed';
  clientName?: string;
  propertyType?: string;
  marketValue?: string;
}

export default function PropertiesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Automated Data Collection' | 'Fillout' | 'Market Evidence' | 'Check' | 'Revision' | 'Closed'>('all');
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [userButtonPosition, setUserButtonPosition] = useState({ top: 0, right: 0 });

  // Track user button position for dropdown placement
  const userButtonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (userButtonRef.current && isUserMenuOpen) {
      const rect = userButtonRef.current.getBoundingClientRect();
      setUserButtonPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isUserMenuOpen]);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        console.error('Authentication check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await axios.get('/api/property');
        setProperties(res.data);
      } catch (e) {
        setProperties([]);
      }
    }
    fetchProperties();
  }, []);

  // Filter properties based on search term and status
  const filteredProperties = properties.filter((property) => {
    const matchesSearch = 
      (property.jobNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.propertyValuer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.propertyType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = async () => {
  try {
    const newProperty = {
      jobNumber: `VAL${String(properties.length + 1).padStart(3, '0')}`,
      address: '',
      propertyValuer: '',
      dateCreated: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      status: 'Automated Data Collection'
    };
    const csrfRes = await axios.get('/api/csrf', { withCredentials: true });
    const csrfToken = csrfRes.data.csrfToken;
    const res = await axios.post('/api/property', newProperty, {
      headers: {
        'x-csrf-token': csrfToken,
      },
      withCredentials: true,
    });
    console.log('Property creation response:', res.data);
    if (res.data && res.data._id) {
      setProperties([...properties, res.data]);
      window.location.href = `/property/${res.data._id}`;
    } else {
      alert('Failed to create property: No ID returned.');
    }
  } catch (e) {
    alert('Failed to create property.');
    console.log(e);
  }
};

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this property valuation?')) {
      try {
        await axios.delete(`/api/property/${id}`);
        setProperties(properties.filter(p => p._id !== id && p._id !== id));
      } catch (e) {
        alert('Failed to delete property.');
      }
    }
  };


  const handleEdit = (id: string) => {
    window.location.href = `/property/${id}`;
  };

  const handleView = (id: string) => {
    window.location.href = `/property/${id}?mode=view`;
  };

  const handleSelectProperty = (id: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProperties(newSelected);
  };

  const handleMarkStageComplete = () => {
    if (selectedProperties.size === 0) {
      alert('Please select at least one property to mark stage as complete.');
      return;
    }
    
    const stageProgression = {
      'Automated Data Collection': 'Fillout',
      'Fillout': 'Market Evidence',
      'Market Evidence': 'Check',
      'Check': 'Revision',
      'Revision': 'Closed',
      'Closed': 'Closed'
    };

    setProperties(properties.map(property => {
      if (selectedProperties.has(property._id ?? '')) {
        const nextStatus = stageProgression[property.status as keyof typeof stageProgression];
        return {
          ...property,
          status: nextStatus as Property['status'],
          lastModified: new Date().toISOString().split('T')[0]
        };
      }
      return property;
    }));

    setSelectedProperties(new Set());
    alert(`${selectedProperties.size} property(ies) moved to next stage.`);
  };

  const handleReports = () => {
    alert('Reports functionality coming soon...');
  };

  const handleLogs = () => {
    alert('Logs functionality coming soon...');
  };

  const handlePreview = () => {
    if (selectedProperties.size === 0) {
      alert('Please select at least one property to preview.');
      return;
    }
    alert('PDF Preview functionality coming soon...');
  };

  const handleGenerateReport = () => {
    if (selectedProperties.size === 0) {
      alert('Please select at least one property to generate report.');
      return;
    }
    alert('Generate PDF Report functionality coming soon...');
  };

  const handleGoHome = () => {
    window.location.href = '/properties';
  };

  const handleLogout = () => {
    signOut();
    router.push('/login');
  };

  const handleAdminPanel = () => {
    router.push('/admin');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'valuer': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'valuer': return UserIcon;
      default: return UserIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Automated Data Collection': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fillout': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Market Evidence': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Check': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Revision': return 'bg-red-100 text-red-800 border-red-200';
      case 'Closed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading Properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 relative overflow-hidden">
      {/* User Menu Dropdown Portal - At the very top */}
      {isUserMenuOpen && currentUser && (
        <div className="fixed inset-0 z-[999999]">
          {/* Dropdown Menu */}
          <div 
            className="absolute w-64 bg-white rounded-2xl shadow-2xl border border-gray-200"
            style={{
              top: `${userButtonPosition.top}px`,
              right: `${userButtonPosition.right}px`
            }}
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                  currentUser.role === 'admin' 
                    ? 'bg-gradient-to-br from-red-500 to-red-700' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-700'
                }`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-sm text-gray-600">{currentUser.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(currentUser.role)}`}>
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-2">
              {currentUser.role === 'admin' && (
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    router.push('/admin');
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 cursor-pointer"
                >
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-900">Admin Panel</span>
                </div>
              )}
              
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  signOut();
                  router.push('/login');
                }}
                className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 cursor-pointer"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Logout</span>
              </div>

              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsUserMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 cursor-pointer"
              >
                <span className="font-medium text-gray-900">Close Menu</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-xl overflow-visible">
        <div className="px-8 py-6 overflow-visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative group cursor-pointer" onClick={handleGoHome}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl transform transition-transform duration-300 group-hover:scale-110">
                  <Building className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>
              <div className="cursor-pointer" onClick={handleGoHome}>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent drop-shadow-lg hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 transition-all duration-300">
                  Smart Val
                </h1>
                <p className="text-gray-600 font-medium">Alliance Australia Property</p>
                <div className="mt-2 h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full shadow-lg shadow-blue-500/30"></div>
              </div>
            </div>
            
            {/* User Menu and Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              {currentUser && (
                <div className="relative">
                  <button
                    ref={userButtonRef}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                      currentUser.role === 'admin' 
                        ? 'bg-gradient-to-br from-red-500 to-red-700' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-700'
                    }`}>
                      {currentUser.name.charAt(0).toUpperCase()}
                      {currentUser.role === 'admin' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                      <p className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(currentUser.role)}`}>
                        {currentUser.role}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}

              <button
                onClick={handleReports}
                className="group relative inline-flex items-center px-6 py-3 text-sm font-bold rounded-2xl text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <BarChart3 className="relative w-5 h-5 mr-2 group-hover:animate-bounce" />
                <span className="relative">Reports</span>
              </button>
              
              <button
                onClick={handleCreateNew}
                className="group relative inline-flex items-center px-8 py-4 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="relative w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative">Create New Property</span>
                <Sparkles className="relative w-5 h-5 ml-2 opacity-80 group-hover:animate-spin" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0 lg:space-x-6">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-2xl group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-700/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="Search by job number, address, valuer, client, or property type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 text-lg text-gray-900 placeholder-gray-500 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="relative px-6 py-4 text-base font-medium text-gray-900 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white shadow-sm hover:shadow-md appearance-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Automated Data Collection">Automated Data Collection</option>
                  <option value="Fillout">Fillout</option>
                  <option value="Market Evidence">Market Evidence</option>
                  <option value="Check">Check</option>
                  <option value="Revision">Revision</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProperties.size > 0 && (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 mb-8 animate-slide-down">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-semibold text-gray-900">
                    {selectedProperties.size} propert{selectedProperties.size === 1 ? 'y' : 'ies'} selected
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleMarkStageComplete}
                    className="group inline-flex items-center px-6 py-3 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <CheckCircle className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Mark Stage Complete
                  </button>
                  
                  <button
                    onClick={handlePreview}
                    className="group inline-flex items-center px-6 py-3 text-sm font-bold rounded-xl text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Preview className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Preview
                  </button>
                  
                  <button
                    onClick={handleGenerateReport}
                    className="group inline-flex items-center px-6 py-3 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProperties.map((property, index) => (
              <div
                key={property._id || property._id || index}
                className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 transform hover:scale-[1.02] animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredCard(property._id ?? '')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Blue Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl blur-xl"></div>
                
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-20">
                  <input
                    type="checkbox"
                    checked={selectedProperties.has(property._id ?? '' )}
                    onChange={() => handleSelectProperty(property._id ?? '')}
                    className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2 transition-all duration-300 hover:scale-110"
                  />
                </div>

                {/* Card Header */}
                <div className="relative p-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                  <div className="absolute top-2 right-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all duration-300 ${getStatusColor(property.status)}`}>
                      {property.status}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <Home className="w-6 h-6 drop-shadow-lg" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold drop-shadow-lg">{property.jobNumber}</h3>
                      <p className="text-blue-100 text-sm font-medium">Property Valuation</p>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="relative p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-900 font-medium text-sm">{property.address || 'Address not specified'}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">{property.propertyValuer || 'Valuer not assigned'}</p>
                    </div>
                    
                    {property.marketValue && (
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <p className="text-green-600 font-bold text-lg">{property.marketValue}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <p className="text-gray-600 text-sm">Modified: {new Date(property.lastModified).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleView(property._id ?? '')}
                      className="group/btn inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                    >
                      <Eye className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                      View
                    </button>
                    
                    <button
                      onClick={() => handleEdit(property._id ?? '')}
                      className="group/btn inline-flex items-center px-6 py-2 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Edit3 className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDelete(property._id?? '')}
                      className="group/btn inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-300 transform hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Cute Sparkle Effect on Hover */}
                {hoveredCard === property._id && (
                  <div className="absolute top-4 right-4 animate-ping">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProperties.length === 0 && (
            <div className="text-center py-16">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-700/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building className="w-12 h-12 text-blue-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No properties found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first property valuation.'}
              </p>
              <button
                onClick={handleCreateNew}
                className="group inline-flex items-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
              >
                <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                Create New Property
                <Sparkles className="w-5 h-5 ml-2 opacity-80 group-hover:animate-spin" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Stats */}
      <div className="fixed bottom-8 left-8 z-50">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-4 transform transition-all duration-500 hover:scale-105">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="text-sm font-medium text-gray-700">
              {filteredProperties.length} of {properties.length} properties
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Sparkle */}
      <div className="fixed bottom-8 right-8 z-50 animate-bounce">
        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60"></div>
      </div>
    </div>
  );
} 