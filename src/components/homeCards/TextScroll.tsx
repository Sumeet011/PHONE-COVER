"use client"
 
import { TextScroll } from "../ui/text-scroll"
import { useState, useEffect } from "react"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://phone-wraps-backend.onrender.com";
 
export function TextScrollDemo() {
  const [settings, setSettings] = useState({
    textScrollContent: "Phone Wraps  ",
    textScrollVelocity: 5
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/site-settings`);
        const data = await response.json();
        if (data.success && data.data) {
          setSettings({
            textScrollContent: data.data.textScrollContent,
            textScrollVelocity: data.data.textScrollVelocity
          });
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <TextScroll
      className="font-display mt-4  sm:mt-0 text-center text-2xl font-semibold tracking-tighter  text-white md:text-3xl md:leading-[5rem]"
      text={settings.textScrollContent}
      default_velocity={settings.textScrollVelocity}
    />
  )
}

export default TextScrollDemo
