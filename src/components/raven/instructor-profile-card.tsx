"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  CalendarCheckIcon,
  TranslateIcon,
  FrenchFlag,
  ItalianFlag,
  EnglishFlag,
  SpanishFlag,
  GreekFlag,
} from "@/components/icons";
import {
  Instructor,
  calculateAge,
  formatLanguages,
  getNationalityText,
} from "@/lib/mock-data/instructors";

interface InstructorProfileCardProps {
  instructor: Instructor;
  className?: string;
  onClick?: () => void;
}

const getFlagComponent = (nationality: string) => {
  switch (nationality) {
    case "FR":
      return FrenchFlag;
    case "IT":
      return ItalianFlag;
    case "EN":
      return EnglishFlag;
    case "SP":
      return SpanishFlag;
    case "GR":
      return GreekFlag;
    default:
      return FrenchFlag;
  }
};

export function InstructorProfileCard({
  instructor,
  className,
  onClick,
}: InstructorProfileCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const age = calculateAge(instructor.dateOfBirth);
  const languageSentence = formatLanguages(instructor.languages);
  const nationalityText = getNationalityText(instructor.nationality);
  const FlagComponent = getFlagComponent(instructor.nationality);


  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? instructor.actionShotUrls.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      (prev + 1) % instructor.actionShotUrls.length
    );
  };

  const handleDotClick = (index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <motion.div
      className={cn(
        "flex flex-col gap-3 w-full cursor-pointer group",
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Carousel Section */}
      <div className="relative rounded-2xl overflow-hidden h-[232px] w-full">
        {/* Images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('${instructor.actionShotUrls[currentImageIndex]}')`,
              }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-80" />
          </motion.div>
        </AnimatePresence>

        {/* Sport Badge - Top Left */}
        <div className="absolute top-[15px] left-[15px] z-10">
          <div className="backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] rounded-lg px-2 py-2 h-5 flex items-center justify-center">
            <span className="font-['Archivo'] font-medium text-[12px] text-black leading-[1.4] tracking-[0.06px]">
              {instructor.sport.charAt(0).toUpperCase() + instructor.sport.slice(1)}
            </span>
          </div>
        </div>

        {/* Price Badge - Top Right */}
        <div className="absolute top-[15.5px] right-[15px] z-10">
          <div className="backdrop-blur-[10px] backdrop-filter bg-white rounded-lg px-1 py-2 h-5 flex items-center justify-center">
            <span className="font-['Archivo'] font-medium text-[14px] text-[#0d0d0f] leading-[16px] tracking-[0.06px]">
              €{instructor.priceHourlyEuros}/h
            </span>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full backdrop-blur-[10px] bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
          onClick={handlePrevImage}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full backdrop-blur-[10px] bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
          onClick={handleNextImage}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12L10 8L6 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-[17px] left-0 right-0 flex gap-1.5 items-center justify-center z-10">
          {instructor.actionShotUrls.map((_, index) => (
            <button
              key={index}
              onClick={handleDotClick(index)}
              className={cn(
                "w-[5px] h-[5px] rounded-full transition-all",
                index === currentImageIndex
                  ? "bg-white"
                  : "bg-white/50"
              )}
            />
          ))}
        </div>

      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-2 w-full">
        {/* Name Row */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <h3 className="font-['PP_Editorial_New'] font-normal text-[24px] text-white leading-[1.4] tracking-[0.12px]">
              {instructor.fullName}
            </h3>
            <span className="font-['Archivo'] font-light text-[16px] text-[#bbbbbd] leading-[1.4]">
              {age}
            </span>
          </div>
          <div className="flex items-center gap-[7px]">
            <FlagComponent className="w-3 h-3" />
            <span className="font-['Archivo'] font-light text-[14px] text-[#d5d5d6] leading-[1.4]">
              {nationalityText}
            </span>
          </div>
        </div>

        {/* Tagline Pill */}
        <div className="backdrop-blur-[2.5px] backdrop-filter bg-[rgba(255,255,255,0.1)] rounded-[500px] h-9 flex items-center justify-between pl-1.5 pr-3 py-1 w-full">
          <div className="flex items-center gap-2 flex-1">
            <img
              src={instructor.profileThumbUrl}
              alt={instructor.fullName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <p className="font-['Archivo'] font-medium text-[14px] text-white leading-[18px] tracking-[0.07px] flex-1">
              {instructor.tagline}
            </p>
          </div>
          <div className="backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.08)] rounded-lg px-1 py-2 h-5 flex items-center justify-center">
            <span className="font-['Archivo'] font-medium text-[12px] text-white leading-[16px] tracking-[0.06px]">
              +1
            </span>
          </div>
        </div>

        {/* Availability Row */}
        <div className="flex items-start gap-2 w-full">
          <CalendarCheckIcon className="w-5 h-5 text-[#d5d5d6] shrink-0 mt-0.5" />
          <p className="font-['Archivo'] font-light text-[14px] text-[#d5d5d6] leading-[1.4]">
            Available on your dates
          </p>
        </div>

        {/* Languages Row */}
        <div className="flex items-start gap-2 w-full">
          <TranslateIcon className="w-5 h-5 text-[#d5d5d6] shrink-0 mt-0.5" />
          <p className="font-['Archivo'] font-light text-[14px] text-[#d5d5d6] leading-[1.4]">
            {languageSentence}
          </p>
        </div>
      </div>
    </motion.div>
  );
}