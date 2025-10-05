"use client";
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const JewelryBannerSection = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/ads-banner');
        const data = await response.json();
        // Take only first 3 banners
        setBanners(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-20 flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900"></div>
      </div>
    );
  }

  return (
    <section className="w-full  ">
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Banner - Large Left Side */}
          {banners[0] && (
            <div className="relative bg-white rounded-[5px] overflow-hidden group h-[600px] shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute inset-0">
                <img 
                  src={banners[0].image} 
                  alt={banners[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-8 right-8  text-black max-w-[43%]">
                <p className="text-sm font-medium tracking-wider mb-2 uppercase drop-shadow-lg">
                  {banners[0].subtitle}
                </p>
                <h2 className="text-4xl font-bold mb-4 leading-tight drop-shadow-lg">
                  {banners[0].title}
                </h2>
                <a 
                  href={banners[0].buttonLink}
                  className="inline-flex items-center gap-2 text-sm font-medium border-b-2 border-black pb-1 hover:gap-3 transition-all drop-shadow-lg"
                >
                  SHOP NOW
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
          )}

          {/* Right Side - Two Banners Stacked */}
          <div className="grid grid-rows-2 gap-6">
            {/* Second Banner */}
            {banners[1] && (
              <div className="relative bg-white rounded-[5px] overflow-hidden group h-[285px] shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute inset-0">
                  <img 
                    src={banners[1].image} 
                    alt={banners[1].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-6 right-6 text-black max-w-[40%]">
                  <p className="text-xs font-medium tracking-wider mb-2 uppercase drop-shadow-lg">
                    {banners[1].subtitle}
                  </p>
                  <h3 className="text-2xl font-bold mb-3 leading-tight drop-shadow-lg">
                    {banners[1].title}
                  </h3>
                  <a 
                    href={banners[1].buttonLink}
                    className="inline-flex items-center gap-2 text-sm font-medium border-b-2 border-black pb-1 hover:gap-3 transition-all drop-shadow-lg"
                  >
                    SHOP NOW
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            )}

            {/* Third Banner */}
            {banners[2] && (
              <div className="relative bg-white rounded-[5px] overflow-hidden group h-[285px] shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute inset-0">
                  <img 
                    src={banners[2].image} 
                    alt={banners[2].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-6 left-6 text-left text-black max-w-[40%]">
                  <p className="text-xs font-medium tracking-wider mb-2 uppercase drop-shadow-lg">
                    {banners[2].subtitle}
                  </p>
                  <h3 className="text-2xl font-bold mb-3 leading-tight drop-shadow-lg">
                    {banners[2].title}
                  </h3>
                  <a 
                    href={banners[2].buttonLink}
                    className="inline-flex items-center gap-2 text-sm font-medium border-b-2 border-black pb-1 hover:gap-3 transition-all drop-shadow-lg"
                  >
                    SHOP NOW
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JewelryBannerSection;