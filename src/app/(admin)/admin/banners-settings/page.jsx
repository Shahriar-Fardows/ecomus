"use client"

import axios from 'axios';
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import BannerCreateModal from '../../../../components/admin/Banner/bannerCreateModal';
import BannerEditModal from '../../../../components/admin/Banner/bannerEditModal';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';


export default function BannersPage() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [deleting, setDeleting] = useState(null);

    // Fetch banners from API
    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/banners');
            setBanners(response.data);
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    // Delete banner
    const handleDeleteBanner = async (bannerId) => {
        try {
            setDeleting(bannerId);
            await axios.delete("/api/banners", {
                data: { id: bannerId }
            });

            setBanners(banners.filter(banner => banner._id !== bannerId));
        } catch (error) {
            console.error('Error deleting banner:', error);
        } finally {
            setDeleting(null);
        }
    };

    // Handle banner creation
    const handleBannerCreated = (newBanner) => {
        setBanners([...banners, newBanner]);
        setShowCreateModal(false);
    };

    // Handle banner update
    const handleBannerUpdated = (updatedBanner) => {
        setBanners(banners.map(banner =>
            banner._id === updatedBanner._id ? updatedBanner : banner
        ));
        setShowEditModal(false);
    };

    // Open edit modal
    const handleEditBanner = (banner) => {
        setSelectedBanner(banner);
        setShowEditModal(true);
    };


    useEffect(() => {
        fetchBanners();
    }, []);

    if (loading) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg">Loading settings...</span>
            </div>
          </div>
        )
    }

    return (
        <div className="min-h-screen  p-6">
            <div className=" mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
                        <p className="text-gray-600 mt-2">Create and manage your website banners</p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-[#ff6c2f] hover:bg-[#e55a26] text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Banner
                    </Button>
                </div>

                {/* Banners Grid */}
                {banners.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                            <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No banners yet</h3>
                        <p className="text-gray-500 mb-4">Create your first banner to get started</p>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-[#ff6c2f] hover:bg-[#e55a26] text-white"
                        >
                            Create Banner
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {banners.map((banner, index) => (
                            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow pt-0 border-none rounded-none">
                                <div className="aspect-video bg-gray-100 overflow-hidden">
                                    <img
                                        src={banner.image}
                                        alt={banner.heading}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg line-clamp-1">{banner.heading}</CardTitle>
                                    <p className="text-sm text-gray-600 line-clamp-2">{banner.description}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {banner.buttons?.map((button, index) => (
                                            <Badge
                                                key={index}
                                                variant={button.enabled ? "default" : "secondary"}
                                                className={`text-xs ${button.enabled ? 'bg-[#ff6c2f]' : ''}`}
                                            >
                                                {button.text}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEditBanner(banner)}
                                            className="flex-1"
                                        >
                                            <Edit className="w-3 h-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDeleteBanner(banner._id)}
                                            disabled={deleting === banner._id}
                                            className="flex-1 bg-orange-500"
                                        >
                                            {deleting === banner._id ? (
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                            ) : (
                                                <Trash2 className="w-3 h-3 mr-1" />
                                            )}
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Modals */}
                

                <BannerCreateModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onBannerCreated={handleBannerCreated}
                />

                <BannerEditModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    banner={selectedBanner}
                    onBannerUpdated={handleBannerUpdated}
                />

            </div>
        </div>
    );
}