"use client"

import { cn } from "@/lib/utils"

interface DisciplineInfoProps {
  id: number
  name: string
  minPrice: number
  color_id?: number
  className?: string
}

// Map discipline names to icon file paths
const getDisciplineIcon = (disciplineName: string): string => {
  const disciplineMap: { [key: string]: string } = {
    'Skiing': '/images/disciplines/skiing.png',
    'Snowboarding': '/images/disciplines/snowboarding.png',
    'Mountain Guide': '/images/disciplines/mountain-guide.png',
    'Telemark': '/images/disciplines/telemark.png',
    'Ski-Touring': '/images/disciplines/ski-touring.png',
    'Free-ride (off-piste)': '/images/disciplines/free-ride.png',
    'Cross-Country': '/images/disciplines/cross-country.png',
    'Free-style (Snowpark)': '/images/disciplines/free-style.png',
    'Adaptive': '/images/disciplines/adaptive.png'
  }

  return disciplineMap[disciplineName] || '/images/disciplines/skiing.png' // Default fallback to skiing
}

export function DisciplineInfo({
  id,
  name,
  minPrice,
  color_id,
  className
}: DisciplineInfoProps) {
  const iconSrc = getDisciplineIcon(name)

  return (
    <div
      className={cn(
        "content-stretch flex gap-3 items-center justify-start relative w-full",
        className
      )}
      data-name="Discipline Info"
    >
      {/* Icon Container */}
      <div className="content-stretch flex gap-[5px] items-center justify-start relative shrink-0">
        <div className="box-border content-stretch flex items-center justify-start pl-0 pr-[5px] py-0 relative shrink-0">
          <div className="mr-[-5px] relative shrink-0 size-6">
            <div className="absolute inset-[-16.667%]">
              <img
                alt={name}
                className="block max-w-none size-full rounded-full object-cover"
                height="32"
                src={iconSrc}
                width="32"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Discipline Name */}
      <div
        className="basis-0 bg-clip-text font-['Archivo'] font-light grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[16px] tracking-[0.08px]"
        style={{
          WebkitTextFillColor: "transparent",
          backgroundImage: "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(215,215,215,1) 50%, rgba(175,175,175,1) 100%)"
        }}
      >
        <p className="leading-[24px]">{name}</p>
      </div>

      {/* Price Tag */}
      <div className="backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.1)] box-border content-stretch flex gap-2 h-5 items-center justify-center pb-[7px] pt-2 px-2 relative rounded-[8px] shrink-0">
        <div className="font-['Archivo'] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-white tracking-[0.06px]">
          <p className="leading-[1.4] whitespace-pre">€{minPrice}/h</p>
        </div>
      </div>
    </div>
  )
}