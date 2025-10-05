"use client";

import { useEffect, useState } from "react";

const Page = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch("/api/site-info");
        const data = await res.json();
        const aboutData = data.find((item) => item.type === "about");
        setAbout(aboutData?.data || null);
      } catch (error) {
        console.error("Error fetching about data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  // Skeleton loader
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-6"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-8"></div>

        <div className="space-y-6">
          <div>
            <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!about) {
    return <p className="text-center py-10">No about data found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-center mb-6">{about.title}</h1>
      <p className="text-gray-700 text-lg mb-8 leading-relaxed text-justify">
        {about.content}
      </p>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-[16px] md:text-2xl ">{about.mission}</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed">{about.vision}</p>
        </div>
      </div>
    </div>
  );
};

export default Page;
