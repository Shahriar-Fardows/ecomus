"use client";
import { useCloudinary } from '../../../../hooks/useCloudinary';
import axios from 'axios';
import { Edit, ImageIcon, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Simple Alert Component
const SimpleAlert = ({ type, title, message, onConfirm, onCancel, showCancel }) => {
  const getIcon = () => {
    switch(type) {
      case 'success': return <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"><svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>;
      case 'error': return <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></div>;
      case 'warning': return <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center"><svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>;
      default: return <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00000099] bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex flex-col items-center text-center">
          {getIcon()}
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
          <div className="mt-6 flex gap-3 w-full">
            {showCancel && (
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-md text-white transition-colors ${
                type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {showCancel ? 'Confirm' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BannerDashboard = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [alert, setAlert] = useState(null);

  const { uploadImage, deleteImage, uploading } = useCloudinary();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    buttonLink: ''
  });

  const showAlert = (type, title, message, callback, showCancel = false) => {
    setAlert({ type, title, message, callback, showCancel });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ads-banner');
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      showAlert('error', 'Error', 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    if (banners.length >= 4) {
      showAlert('warning', 'Limit Reached', 'You can add maximum 4 banners only');
      return;
    }
    setEditMode(false);
    setCurrentBanner(null);
    setFormData({ title: '', subtitle: '', image: '', buttonLink: '' });
    setImagePreview('');
    setSelectedFile(null);
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditMode(true);
    setCurrentBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      buttonLink: banner.buttonLink
    });
    setImagePreview(banner.image);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.subtitle || !formData.buttonLink) {
      showAlert('warning', 'Missing Fields', 'Please fill all required fields');
      return;
    }

    let imageUrl = formData.image;

    if (selectedFile) {
      const uploadResult = await uploadImage(selectedFile);
      if (uploadResult) {
        imageUrl = uploadResult.secure_url;
        
        if (editMode && currentBanner?.image) {
          const publicId = extractPublicId(currentBanner.image);
          if (publicId) await deleteImage(publicId);
        }
      } else {
        showAlert('error', 'Upload Failed', 'Failed to upload image');
        return;
      }
    }

    if (!imageUrl) {
      showAlert('warning', 'No Image', 'Please upload an image');
      return;
    }

    try {
      const bannerData = {
        title: formData.title,
        subtitle: formData.subtitle,
        image: imageUrl,
        buttonLink: formData.buttonLink
      };

      if (editMode) {
        await axios.put('/api/ads-banner', {
          id: currentBanner._id,
          ...bannerData
        });
        showAlert('success', 'Updated', 'Banner has been updated successfully', () => {
          setShowModal(false);
          fetchBanners();
        });
      } else {
        await axios.post('/api/ads-banner', bannerData);
        showAlert('success', 'Created', 'New banner has been added successfully', () => {
          setShowModal(false);
          fetchBanners();
        });
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      showAlert('error', 'Error', 'Failed to save banner');
    }
  };

  const handleDelete = async (banner) => {
    showAlert(
      'warning',
      'Delete Banner?',
      'This action cannot be undone',
      async () => {
        try {
          const publicId = extractPublicId(banner.image);
          if (publicId) await deleteImage(publicId);

          await axios.delete('/api/ads-banner', {
            data: { id: banner._id }
          });

          showAlert('success', 'Deleted', 'Banner has been deleted successfully', () => {
            fetchBanners();
          });
        } catch (error) {
          console.error('Error deleting banner:', error);
          showAlert('error', 'Error', 'Failed to delete banner');
        }
      },
      true
    );
  };

  const extractPublicId = (url) => {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      return `ecomus/${filename.split('.')[0]}`;
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto ">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Banner Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your advertisement banners (Maximum 4)</p>
            </div>
            <button
              onClick={openAddModal}
              disabled={banners.length >= 4}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                banners.length >= 4
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              <Plus size={18} />
              Add Banner
            </button>
          </div>
          <div className="mt-3">
            <span className="text-sm text-gray-600">
              Active Banners: <span className="font-medium text-gray-900">{banners.length}/4</span>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-gray-900"></div>
            <p className="text-gray-500 mt-3 text-sm">Loading banners...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <div key={banner._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon size={40} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{banner.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{banner.subtitle}</p>
                  <a
                    href={banner.buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block break-all"
                  >
                    {banner.buttonLink}
                  </a>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {banners.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <ImageIcon size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No banners found. Add your first banner!</p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-[#00000099] bg-opacity-30 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editMode ? 'Edit Banner' : 'Add New Banner'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Enter banner title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Enter banner subtitle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Link <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image {!editMode && <span className="text-red-500">*</span>}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              setSelectedFile(null);
                              if (!editMode) setFormData({ ...formData, image: '' });
                            }}
                            className="absolute top-2 right-2 bg-white border border-gray-300 text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-3">Click to upload image</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer inline-block px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
                          >
                            Select Image
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          {editMode ? 'Update' : 'Save'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {alert && (
          <SimpleAlert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            showCancel={alert.showCancel}
            onConfirm={() => {
              if (alert.callback) alert.callback();
              closeAlert();
            }}
            onCancel={closeAlert}
          />
        )}
      </div>
    </div>
  );
};

export default BannerDashboard;