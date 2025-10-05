"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay, EffectFade } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/effect-fade"

export default function HeroSection() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [swiperInstance, setSwiperInstance] = useState(null)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/banners")
        const data = await response.json()
        setBanners(data)
      } catch (error) {
        console.error("Error fetching banners:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handlePrevSlide = () => {
    if (swiperInstance) {
      swiperInstance.slidePrev()
    }
  }

  const handleNextSlide = () => {
    if (swiperInstance) {
      swiperInstance.slideNext()
    }
  }

  // Skeleton Loader
  if (loading) {
    return (
      <section className="relative h-[60vh] flex items-center justify-center bg-gray-100">
        <div className="w-full h-[60vh] relative">
          <div className="absolute inset-0 bg-gray-300 animate-pulse" />
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-2xl">
                <div className="h-12 w-3/4 bg-gray-400 rounded animate-pulse mb-6"></div>
                <div className="h-6 w-full bg-gray-400 rounded animate-pulse mb-4"></div>
                <div className="h-6 w-5/6 bg-gray-400 rounded animate-pulse mb-8"></div>
                <div className="flex gap-4">
                  <div className="h-12 w-32 bg-gray-400 rounded-lg animate-pulse"></div>
                  <div className="h-12 w-32 bg-gray-400 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (banners.length === 0) {
    return (
      <section className="relative h-[60vh] flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">No banners available</p>
      </section>
    )
  }

  return (
    <section className="relative h-[60vh] overflow-hidden">
      <Swiper
        modules={[Navigation, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={800}
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        loop={true}
        onSwiper={setSwiperInstance}
        className="w-full h-full"
      >
        {banners.map((banner, index) => {
          const currentImage = isMobile && banner?.mobileImage ? banner.mobileImage : banner?.image

          return (
            <SwiperSlide key={index}>
              {isMobile ? (
                // --- Mobile Part ---
                <div className="flex flex-col h-full">
                  {/* Mobile Image Section */}
                  <div className="relative overflow-hidden h-1/2">
                    <img
                      src={currentImage || "/placeholder.svg"}
                      alt={banner?.heading || "Banner"}
                      className="w-full h-full object-cover"
                    />
                    {/* <div className="absolute inset-0 bg-black/30" /> */}
                  </div>

                  {/* Mobile Content Section */}
                  <div className="flex-1 flex items-center justify-center bg-white px-4 py-8">
                    <div className="text-center max-w-md">
                      <h1
                        className="font-bold leading-tight mb-4"
                        style={{
                          fontSize: banner?.headingStyle?.mobileSize || "24px",
                          color: banner?.headingStyle?.color || "#333",
                          fontWeight: banner?.headingStyle?.fontWeight || "bold",
                        }}
                      >
                        {banner?.heading || ""}
                      </h1>
                      <p
                        className="mb-6"
                        style={{
                          fontSize: banner?.descriptionStyle?.mobileSize || "16px",
                          color: banner?.descriptionStyle?.color || "#666",
                          fontWeight: banner?.descriptionStyle?.fontWeight || "normal",
                        }}
                      >
                        {banner?.description || ""}
                      </p>
                      {banner?.buttons?.some((btn) => btn.enabled) && (
                        <div className="flex flex-col gap-3">
                          {banner.buttons.map(
                            (button, buttonIndex) =>
                              button.enabled && (
                                <Button
                                  key={buttonIndex}
                                  size="lg"
                                  className="w-full py-3 shadow-lg hover:opacity-90 transition-all duration-300 hover:scale-105"
                                  style={{
                                    backgroundColor: button.mobileStyle?.bgColor || "#ff6c2f",
                                    color: button.mobileStyle?.textColor || "#fff",
                                    borderColor: button.mobileStyle?.borderColor || "#ff6c2f",
                                    borderRadius: button.mobileStyle?.borderRadius || "6px",
                                    fontSize: button.mobileStyle?.fontSize || "16px",
                                  }}
                                  onClick={() => button.link && window.open(button.link, "_blank")}
                                >
                                  {button.text}
                                </Button>
                              ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Background */}
                  <div className="absolute inset-0">
                    <img
                      src={currentImage || "/placeholder.svg"}
                      alt={banner?.heading || "Banner"}
                      className="w-full h-full object-cover"
                    />
                    {/* <div className="absolute inset-0 bg-black/50" /> */}
                  </div>

                  {/* Desktop Content */}
                  <div className="relative z-10 flex items-center h-full">
                    <div className="container mx-auto px-4 lg:px-8">
                      <div className="max-w-2xl text-left text-white">
                        <h1
                          className="font-bold leading-tight mb-6"
                          style={{
                            fontSize: banner?.headingStyle?.desktopSize || "56px",
                            color: banner?.headingStyle?.color || "#fff",
                            fontWeight: banner?.headingStyle?.fontWeight || "bold",
                          }}
                        >
                          {banner?.heading || ""}
                        </h1>
                        <p
                          className="mb-8"
                          style={{
                            fontSize: banner?.descriptionStyle?.desktopSize || "20px",
                            color: banner?.descriptionStyle?.color || "#f1f1f1",
                            fontWeight: banner?.descriptionStyle?.fontWeight || "normal",
                          }}
                        >
                          {banner?.description || ""}
                        </p>
                        {banner?.buttons?.some((btn) => btn.enabled) && (
                          <div className="flex flex-row gap-4 justify-start">
                            {banner.buttons.map(
                              (button, buttonIndex) =>
                                button.enabled && (
                                  <Button
                                    key={buttonIndex}
                                    size="lg"
                                    className="px-8 py-6 shadow-lg hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                    style={{
                                      backgroundColor: button.desktopStyle?.bgColor || "#ff6c2f",
                                      color: button.desktopStyle?.textColor || "#fff",
                                      borderColor: button.desktopStyle?.borderColor || "#ff6c2f",
                                      borderRadius: button.desktopStyle?.borderRadius || "8px",
                                      fontSize: button.desktopStyle?.fontSize || "16px",
                                    }}
                                    onClick={() => button.link && window.open(button.link, "_blank")}
                                  >
                                    {button.text}
                                  </Button>
                                ),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </SwiperSlide>
          )
        })}
      </Swiper>

      <button
        onClick={handlePrevSlide}
        className={`absolute ${isMobile ? "left-4 w-10 h-10" : "left-4 w-12 h-12"} top-1/2 -translate-y-1/2 rounded-full ${isMobile ? "bg-black/40" : "bg-white/20"} border border-white/30 shadow-lg flex items-center justify-center hover:${isMobile ? "bg-black/60" : "bg-white/30"} hover:scale-110 text-white z-20 transition-all duration-300`}
      >
        <ChevronLeft className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} text-black`} />
      </button>
      <button
        onClick={handleNextSlide}
        className={`absolute ${isMobile ? "right-4 w-10 h-10" : "right-4 w-12 h-12"} top-1/2 -translate-y-1/2 rounded-full ${isMobile ? "bg-black/40" : "bg-white/20"} border border-white/30 shadow-lg flex items-center justify-center hover:${isMobile ? "bg-black/60" : "bg-white/30"} hover:scale-110 text-white z-20 transition-all duration-300`}
      >
        <ChevronRight className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} text-black`} />
      </button>
    </section>
  )
}
