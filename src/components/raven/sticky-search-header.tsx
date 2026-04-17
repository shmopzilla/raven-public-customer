"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useSearch } from '@/lib/contexts/search-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { UserIcon } from '@/components/icons';

interface StickySearchHeaderProps {
  onSearchClick?: () => void; // Optional - falls back to context's openSearchModal
}

export function StickySearchHeader({ onSearchClick }: StickySearchHeaderProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { searchCriteria, formatSearchSummary, openSearchModal } = useSearch();
  const { user, loading: authLoading, signOut } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* Auth Button - Desktop Only */}
        {!authLoading && user ? (
          <div className="hidden sm:block relative" ref={dropdownRef}>
            <motion.button
              className="flex bg-white rounded-2xl px-3 sm:px-4 py-2.5 items-center gap-2 h-[44px] sm:h-[52px] shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
                  <span className="font-['Archivo'] text-xs font-bold text-white">
                    {(user.user_metadata?.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-['Archivo'] font-medium text-[14px] sm:text-[16px] text-[#0d0d0f] leading-[20px] tracking-[0.08px]">
                {user.user_metadata?.first_name || 'Account'}
              </span>
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[rgba(20,20,24,0.95)] border border-[#3B3B40] rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-[25px]"
                >
                  <Link
                    href="/raven/account"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-3 font-['Archivo'] text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/raven/account/bookings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-3 font-['Archivo'] text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    My Bookings
                  </Link>
                  <div className="border-t border-white/10" />
                  <button
                    onClick={async () => {
                      setIsDropdownOpen(false);
                      await signOut();
                      window.location.href = '/raven';
                    }}
                    className="w-full text-left px-4 py-3 font-['Archivo'] text-sm text-red-400 hover:bg-white/10 transition-colors"
                  >
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link href="/raven/login" className="hidden sm:block">
            <motion.div
              className="flex bg-white rounded-2xl px-3 sm:px-4 py-2.5 items-center gap-1 sm:gap-2 h-[44px] sm:h-[52px] shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserIcon className="w-5 h-5 text-[#0d0d0f]" />
              <span className="font-['Archivo'] font-medium text-[14px] sm:text-[16px] text-[#0d0d0f] leading-[20px] tracking-[0.08px]">
                Sign in
              </span>
            </motion.div>
          </Link>
        )}
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
            <div className="px-4 py-4 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/raven/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full bg-white rounded-2xl px-4 py-3 text-center"
                  >
                    <span className="font-['Archivo'] font-medium text-[16px] text-[#0d0d0f]">
                      My Account
                    </span>
                  </Link>
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await signOut();
                      window.location.href = '/raven';
                    }}
                    className="block w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-center"
                  >
                    <span className="font-['Archivo'] font-medium text-[16px] text-red-400">
                      Sign out
                    </span>
                  </button>
                </>
              ) : (
                <Link
                  href="/raven/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full"
                >
                  <motion.div
                    className="w-full bg-white rounded-2xl px-4 py-3 flex items-center justify-center gap-2 h-[48px]"
                    whileTap={{ scale: 0.98 }}
                  >
                    <UserIcon className="w-5 h-5 text-[#0d0d0f]" />
                    <span className="font-['Archivo'] font-medium text-[16px] text-[#0d0d0f] leading-[20px] tracking-[0.08px]">
                      Sign in
                    </span>
                  </motion.div>
                </Link>
              )}
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
