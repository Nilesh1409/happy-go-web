"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api";

const STORAGE_KEY = "happygo_landing_popup_seen";

export default function Popup() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    title: "Welcome to HappyGo",
    message: "We are a team of bike enthusiasts who are passionate about providing the best bike rental experience to our customers.",
    imageUrl: "https://lokeshshah.wordpress.com/wp-content/uploads/2015/12/bikeridejawadihills_001.jpg?w=1024&h=573",
    ctaLink: "/search",
    ctaText: "Explore Bikes",
    showOnce: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchPopup = async () => {
      try {
        const res = await apiService.getPopup();
        if (res?.success && res?.data) {
          const isShowOnce = res.data.show === "once";
          const seen = localStorage.getItem(STORAGE_KEY);

          setData({
            ...data,
            title: res.data.title || data.title,
            message: res.data.description || data.message,
            imageUrl: res.data.imageUrl || data.imageUrl,
            ctaText: res.data.ctaText || data.ctaText,
            ctaLink: res.data.ctaLink || data.ctaLink,
            showOnce: isShowOnce,
          });

          // Only skip if it's "show once" AND has been seen
          if (isShowOnce && seen === "true") {
            setOpen(false);
          } else {
            setOpen(true);
          }
        }
      } catch (err) {
        console.warn("Popup fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopup();
  }, []);

  const handleClose = () => {
    if (data?.showOnce) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setOpen(false);
  };

  const handleCtaClick = () => {
    if (data?.showOnce) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setOpen(false);
  };

  if (loading || !open || !data) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        className="fixed left-1/2 top-1/2 z-[101] w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-gray-500 hover:bg-orange-200 hover:text-gray-200 transition-colors"
          aria-label="Close popup"
        >
          <X className="h-5 w-5 text-bold text-white" />
        </button>

        <div className="bg-gradient-to-br from-[#F47B20] to-[#E06A0F] px-6 pt-6 pb-4 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Bike className="h-6 w-6" />
            </div>
            <h2 id="popup-title" className="text-xl font-bold">
              {data.title}
            </h2>
          </div>
          <p className="text-white/95 text-sm leading-relaxed">
            {data.message}
          </p>
        </div>

        {data.imageUrl && (
          <div className="relative h-40 w-full overflow-hidden bg-gray-100">
            <img
              src={data.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-6 pt-4">
          <Button
            asChild
            className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white font-semibold h-11 rounded-lg shadow-md"
          >
            <Link href={data.ctaLink || "/search"} onClick={handleCtaClick}>
              {data.ctaText || "Explore Bikes"}
            </Link>
          </Button>
          <p className="text-center text-xs text-gray-500 mt-3">
            Anywhere Everytime
          </p>
        </div>
      </div>
    </>
  );
}
