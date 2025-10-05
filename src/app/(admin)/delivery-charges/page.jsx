"use client";
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, MapPin, Truck, Clock, DollarSign, Plus, Search, Filter, CheckCircle, AlertCircle, X } from 'lucide-react';

const DeliveryChargesManager = () => {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form data state
  const [formData, setFormData] = useState({
    area: '',
    charge: '',
    estimatedDays: '',
    note: ''
  });

  // Global settings state
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [defaultCharge, setDefaultCharge] = useState('');
  const [freeAbove, setFreeAbove] = useState('');

  const API_BASE = '/api/delivery-charges';

  // Fetch all delivery charges
  const fetchCharges = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setCharges(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Error loading delivery charges: ' + err.message);
      setCharges([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new delivery charge
  const addCharge = async () => {
    if (!formData.area || !formData.charge) {
      setError('Area and Charge are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        area: formData.area.trim(),
        charge: parseInt(formData.charge),
        estimatedDays: formData.estimatedDays || '2-3',
        customData: { note: formData.note }
      };

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add delivery charge');
      }
      
      setSuccess('Delivery charge added successfully!');
      resetForm();
      fetchCharges();
    } catch (err) {
      setError('Error adding delivery charge: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update delivery charge
  const updateCharge = async () => {
    if (!formData.charge) {
      setError('Charge is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: editingId,
        charge: parseInt(formData.charge),
        ...(formData.area && { area: formData.area.trim() }),
        ...(formData.estimatedDays && { estimatedDays: formData.estimatedDays }),
        ...(formData.note && { customData: { note: formData.note } })
      };

      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update delivery charge');
      }
      
      setSuccess('Delivery charge updated successfully!');
      resetForm();
      fetchCharges();
    } catch (err) {
      setError('Error updating delivery charge: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete delivery charge
  const deleteCharge = async (id) => {
    if (!confirm('Are you sure you want to delete this delivery charge?')) return;

    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete delivery charge');
      }
      
      setSuccess('Delivery charge deleted successfully!');
      fetchCharges();
    } catch (err) {
      setError('Error deleting delivery charge: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ area: '', charge: '', estimatedDays: '', note: '' });
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  // Handle edit
  const handleEdit = (charge) => {
    setFormData({
      area: charge.area || '',
      charge: charge.charge.toString() || '',
      estimatedDays: charge.estimatedDays || '',
      note: charge.customData?.note || ''
    });
    setEditingId(charge.id || charge._id);
    setShowForm(true);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateCharge();
    } else {
      addCharge();
    }
  };

  // Filter charges based on search term
  const filteredCharges = charges.filter(charge =>
    charge.area?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load data on component mount
  useEffect(() => {
    fetchCharges();
  }, []);

  // Auto-hide messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-6">
      <div className=" mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
                <p className="text-gray-600 mt-1">Manage delivery charges, areas, and configurations</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {charges.length} Areas Active
                </span>
              </div>
              
              <button 
                onClick={() => {
                  resetForm();
                  setShowForm(!showForm);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Area</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Add/Edit Form */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingId ? 'Edit Area' : 'Add New Area'}
                  </h3>
                </div>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area Name *
                  </label>
                  <input 
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    placeholder="e.g., Dhaka City, Chittagong"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Charge (৳) *
                  </label>
                  <input 
                    type="number"
                    value={formData.charge}
                    onChange={(e) => setFormData({...formData, charge: e.target.value})}
                    placeholder="Enter charge amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery Days
                  </label>
                  <input 
                    type="text"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({...formData, estimatedDays: e.target.value})}
                    placeholder="e.g., 2-3 days, 1 week"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Note
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    placeholder="e.g., Free delivery above 2000 Tk"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-sm rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      editingId ? 'Update Area' : 'Add New Area'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Delivery Areas List */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-orange-100">
              
              {/* Search and Filter Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Delivery Areas</h3>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search areas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Areas List */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3 text-orange-600">
                      <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Loading delivery areas...</span>
                    </div>
                  </div>
                ) : filteredCharges.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">
                      {searchTerm ? 'No areas found' : 'No delivery areas yet'}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {searchTerm 
                        ? 'Try adjusting your search terms' 
                        : 'Start by adding your first delivery area'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCharges.map((charge, index) => (
                      <div key={charge.id || charge._id || index} 
                           className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {charge.area || 'Unknown Area'}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEdit(charge)}
                                  className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                  title="Edit area"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteCharge(charge.id || charge._id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                  title="Delete area"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Charge</p>
                                  <p className="text-sm font-semibold text-gray-900">৳{charge.charge}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Delivery Time</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {charge.estimatedDays || 'Not specified'}
                                  </p>
                                </div>
                              </div>

                              {charge.customData?.note && (
                                <div className="md:col-span-1">
                                  <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                      <AlertCircle className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Note</p>
                                      <p className="text-sm text-gray-700 line-clamp-2">
                                        {charge.customData.note}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 max-w-md">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 text-sm font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError('')} 
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {success && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50 max-w-md">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-800 text-sm font-medium">Success</p>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
            <button 
              onClick={() => setSuccess('')} 
              className="text-green-400 hover:text-green-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryChargesManager;