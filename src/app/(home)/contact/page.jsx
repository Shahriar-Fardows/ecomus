"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {  MessageSquare,  User,  Mail,  Phone,  Send,  MapPin,  Clock,} from "lucide-react";

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await axios.get("/api/site-info");
        const contactData = res.data.find((item) => item.type === "contact");
        setContactInfo(contactData?.data || null);
      } catch (error) {
        console.error("Error fetching contact info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, []);

  // Skeleton loader
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="text-center mb-12">
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-96 bg-gray-200 rounded mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 space-y-4">
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
            <div className="h-32 w-full bg-gray-200 rounded"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-[50vh]"></div>
      </div>
    );
  }

  if (!contactInfo) {
    return <p className="text-center py-10">No contact info found.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Contact Us</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We'd love to hear from you! Whether you have a question about features,
          trials, pricing, need a demo, or anything else, our team is ready to
          answer all your questions.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Contact Form */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            <MessageSquare className="w-6 h-6 text-[#ce967e] mr-3" />
            <h2 className="text-[16px] md:text-2xl font-bold text-gray-800">
              Do You Have Any Questions?
            </h2>
          </div>

          <form
            action={`https://formspree.io/f/${contactInfo.formspreeCode}`}
            method="POST"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ce967e] focus:border-transparent transition-colors"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ce967e] focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ce967e] focus:border-transparent transition-colors"
              />
            </div>

            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ce967e] focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <textarea
                name="message"
                rows="5"
                placeholder="Your message"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ce967e] focus:border-transparent transition-colors resize-vertical"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#ce967e] text-white px-6 py-3 rounded-md hover:bg-[#967364] transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Phone className="w-6 h-6 text-[#ce967e] mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">
              {contactInfo.heading}
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-6 h-6 text-[#ce967e] mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Address</h3>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {contactInfo.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-6 h-6 text-[#ce967e] mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Contact No.</h3>
                <p className="text-gray-600">{contactInfo.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-6 h-6 text-[#ce967e] mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                <p className="text-gray-600">{contactInfo.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 text-[#ce967e] mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Store Info</h3>
                <p className="text-gray-600">{contactInfo.storeInfo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-[#ce967e]" />
            <h2 className="text-xl font-bold text-gray-800">Our Location</h2>
          </div>
        </div>
        <div className="w-full h-[50vh]">
          <iframe
            title="Ecomus Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019876812246!2d-122.40237308468183!3d37.78980057975765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064f8e1bb55%3A0x21c1f2de68139de1!2s33%20New%20Montgomery%20St%2C%20San%20Francisco%2C%20CA%2094105!5e0!3m2!1sen!2sus!4v1695200000000!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
