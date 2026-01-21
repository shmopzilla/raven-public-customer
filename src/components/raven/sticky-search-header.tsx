"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useSearch } from '@/lib/contexts/search-context';
import { UserIcon } from '@/components/icons';

interface StickySearchHeaderProps {
  onSearchClick?: () => void; // Optional - falls back to context's openSearchModal
}

export function StickySearchHeader({ onSearchClick }: StickySearchHeaderProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { searchCriteria, formatSearchSummary, openSearchModal } = useSearch();

  // Use provided onSearchClick prop or fall back to context's openSearchModal
  const handleSearchClick = onSearchClick || openSearchModal;

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
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 gap-3 sm:gap-0">
        {/* Mobile: Logo + Burger Menu in Header Row */}
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
          {/* Raven Logo */}
          <Link href="/" className="flex items-center cursor-pointer group">
            <h1 className="font-['PP_Editorial_New'] text-2xl sm:text-3xl text-white font-normal transition-opacity duration-200 group-hover:opacity-80">
              Raven
            </h1>
          </Link>

          {/* Burger Menu Icon - Mobile Only */}
          <motion.button
            className="sm:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="w-6 h-0.5 bg-white rounded-full"
              animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="w-6 h-0.5 bg-white rounded-full"
              animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="w-6 h-0.5 bg-white rounded-full"
              animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            />
          </motion.button>
        </div>

        {/* Search Bar - Full Width on Mobile, Centered on Desktop */}
        <motion.div
          className={`group frosted-glass flex items-center px-4 sm:px-6 py-3 sm:py-4 hover:bg-[rgba(255,255,255,0.25)] transition-colors duration-200 cursor-pointer ${
            isScrolled
              ? 'w-full sm:w-[420px] md:w-[520px] lg:w-[620px] xl:w-[700px]'
              : 'w-full sm:w-[540px] md:w-[640px] lg:w-[750px] xl:w-[850px]'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearchClick}
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
          <p className="flex-1 font-['Archivo'] text-[#9696a5] group-hover:text-white text-[14px] sm:text-[16px] text-center leading-[20px] tracking-[0.08px] transition-colors duration-200 ml-2 sm:ml-4 truncate">
            {searchSummary || "Search for instructors..."}
          </p>
        </motion.div>

        {/* Sign In Button - Desktop Only */}
        <motion.button
          className="hidden sm:flex bg-white rounded-2xl px-3 sm:px-4 py-2.5 items-center gap-1 sm:gap-2 h-[44px] sm:h-[52px] shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <UserIcon className="w-5 h-5 text-[#0d0d0f]" />
          <span className="font-['Archivo'] font-medium text-[14px] sm:text-[16px] text-[#0d0d0f] leading-[20px] tracking-[0.08px]">
            Sign in
          </span>
        </motion.button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="sm:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-4">
              <motion.button
                className="w-full bg-white rounded-2xl px-4 py-3 flex items-center justify-center gap-2 h-[48px]"
                onClick={() => setIsMobileMenuOpen(false)}
                whileTap={{ scale: 0.98 }}
              >
                <UserIcon className="w-5 h-5 text-[#0d0d0f]" />
                <span className="font-['Archivo'] font-medium text-[16px] text-[#0d0d0f] leading-[20px] tracking-[0.08px]">
                  Sign in
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
