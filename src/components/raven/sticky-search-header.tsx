"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useSearch } from '@/lib/contexts/search-context';
import { UserIcon } from '@/components/icons';

interface StickySearchHeaderProps {
  onSearchClick?: () => void;
}

export function StickySearchHeader({ onSearchClick }: StickySearchHeaderProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { searchCriteria, formatSearchSummary } = useSearch();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const searchSummary = formatSearchSummary();

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-md' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between px-12 py-6">
        {/* Raven Logo */}
        <Link href="/raven" className="flex items-center cursor-pointer group">
          <h1 className="font-['PP_Editorial_New'] text-3xl text-white font-normal transition-opacity duration-200 group-hover:opacity-80">
            Raven
          </h1>
        </Link>

        {/* Search Bar */}
        <motion.div
          className={`group frosted-glass flex items-center px-6 py-4 hover:bg-[rgba(255,255,255,0.25)] transition-colors duration-200 cursor-pointer ${
            isScrolled ? 'w-[500px]' : 'w-[696px]'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSearchClick}
        >
          {/* Search Icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 shrink-0 text-[#9696a5] group-hover:text-white transition-colors duration-200"
          >
            <path
              d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Search Summary Text */}
          <p className="flex-1 font-['Archivo'] text-[#9696a5] group-hover:text-white text-[16px] text-center leading-[20px] tracking-[0.08px] transition-colors duration-200 ml-4">
            {searchSummary || "Search for instructors..."}
          </p>
        </motion.div>

        {/* Sign In Button */}
        <motion.button
          className="bg-white rounded-2xl px-4 py-2.5 flex items-center gap-2 h-[52px]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <UserIcon className="w-5 h-5 text-[#0d0d0f]" />
          <span className="font-['Archivo'] font-medium text-[16px] text-[#0d0d0f] leading-[20px] tracking-[0.08px]">
            Sign in
          </span>
        </motion.button>
      </div>

      {/* Subtle bottom border when scrolled */}
      {isScrolled && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.header>
  );
}