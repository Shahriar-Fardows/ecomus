"use client"

import React, { useEffect, useState } from "react"
import Marquee from "react-fast-marquee"
import { SunDim } from "lucide-react"
import axios from "axios"

const Announcement = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get("/api/general-settings")
        setData(res.data)
      } catch (error) {
        console.error("Error fetching announcements:", error)
      }
    }
    fetchAnnouncements()
  }, [])

  if (!data || !data.announcementsStatus || !data.announcements?.length) return null

  return (
    <div className="bg-black text-white p-[11px] overflow-hidden">
      <Marquee
        pauseOnHover
        speed={60}
        gradient={false}
        className="text-sm whitespace-nowrap marquee-min-w-off"
      >
        {data.announcements.map((item, index) => (
          <span key={index} className="flex items-center">
            <span className="mx-4 flex items-center text-[12px]">{item.text}</span>
            <SunDim className="mx-2 w-4 h-4" />
          </span>
        ))}
      </Marquee>
    </div>
  )
}

export default Announcement
