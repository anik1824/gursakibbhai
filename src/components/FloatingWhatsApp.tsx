import React from 'react';
import { STORE_INFO } from '../data/gurData';

export const FloatingWhatsApp: React.FC = () => {
  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-18 sm:bottom-6 right-3.5 sm:right-6 z-50 flex items-center justify-center">
      {/* Outer subtle pulsing aura ring (S size) */}
      <div className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />

      {/* Main Circular WhatsApp Button (S Size) */}
      <a
        href={STORE_INFO.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative group w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-lg ring-2 ring-[#25D366]/40 hover:ring-[#25D366]/70 transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
      >
        {/* WhatsApp Official SVG Logo (S size) */}
        <svg
          viewBox="0 0 32 32"
          className="w-5 h-5 sm:w-6 sm:h-6 fill-current filter drop-shadow-2xs"
        >
          <path d="M16.01 2.5C8.56 2.5 2.5 8.56 2.5 16.01c0 2.5.68 4.85 1.86 6.88L2.5 29.5l6.81-1.79a13.43 13.43 0 0 0 6.7 1.79c7.45 0 13.51-6.06 13.51-13.49C29.52 8.56 23.46 2.5 16.01 2.5zm0 24.64c-2.12 0-4.1-.58-5.81-1.6l-.42-.25-4.32 1.13 1.15-4.21-.27-.44a11.08 11.08 0 0 1-1.7-5.76c0-6.14 5-11.14 11.15-11.14 6.15 0 11.15 5 11.15 11.14 0 6.14-5 11.13-11.15 11.13zm6.11-8.35c-.34-.17-1.99-.98-2.3-1.09-.31-.11-.53-.17-.76.17-.22.34-.88 1.09-1.08 1.32-.2.22-.4.25-.74.08-.34-.17-1.42-.52-2.7-1.66-1-.89-1.67-1.99-1.87-2.33-.2-.34-.02-.52.15-.69.15-.15.34-.4.5-.59.17-.2.23-.34.34-.56.11-.22.06-.42-.03-.59-.09-.17-.76-1.83-1.04-2.5-.27-.67-.55-.58-.76-.59-.2-.01-.42-.01-.65-.01-.22 0-.59.08-.9.42-.31.34-1.19 1.16-1.19 2.84 0 1.67 1.22 3.29 1.39 3.52.17.22 2.39 3.66 5.8 5.13.81.35 1.44.56 1.94.72.82.26 1.56.22 2.15.14.66-.1 1.99-.81 2.27-1.6.28-.78.28-1.46.2-1.6-.08-.14-.3-.22-.64-.39z" />
        </svg>

        {/* Hover Tooltip */}
        <span className="absolute right-full mr-2.5 px-2.5 py-1 rounded-md bg-[#1f2937] text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md">
          হোয়াটসঅ্যাপ সাপোর্ট
        </span>
      </a>
    </aside>
  );
};
