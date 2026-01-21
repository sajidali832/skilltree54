'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
  textClassName?: string
}

export function Logo({ size = 40, className, showText = false, textClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <rect width="48" height="48" rx="12" fill="url(#bgGradient)" />
        <path
          d="M24 38V26"
          stroke="url(#trunkGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M24 26V18"
          stroke="url(#trunkGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M24 22L18 16"
          stroke="url(#branchGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M24 22L30 16"
          stroke="url(#branchGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M24 18L20 12"
          stroke="url(#branchGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M24 18L28 12"
          stroke="url(#branchGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="18" cy="16" r="3.5" fill="url(#nodeGradient1)" />
        <circle cx="30" cy="16" r="3.5" fill="url(#nodeGradient1)" />
        <circle cx="20" cy="12" r="3" fill="url(#nodeGradient2)" />
        <circle cx="28" cy="12" r="3" fill="url(#nodeGradient2)" />
        <circle cx="24" cy="26" r="4" fill="url(#centerNode)" />
        <circle cx="18" cy="16" r="1.5" fill="white" fillOpacity="0.9" />
        <circle cx="30" cy="16" r="1.5" fill="white" fillOpacity="0.9" />
        <circle cx="20" cy="12" r="1.2" fill="white" fillOpacity="0.9" />
        <circle cx="28" cy="12" r="1.2" fill="white" fillOpacity="0.9" />
        <circle cx="24" cy="26" r="1.8" fill="white" fillOpacity="0.9" />
        <defs>
          <linearGradient id="bgGradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0d1829" />
            <stop offset="1" stopColor="#1a2744" />
          </linearGradient>
          <linearGradient id="trunkGradient" x1="24" y1="38" x2="24" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06b6d4" />
            <stop offset="1" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="branchGradient" x1="18" y1="22" x2="30" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06b6d4" />
            <stop offset="1" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="nodeGradient1" x1="18" y1="12" x2="30" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06b6d4" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="nodeGradient2" x1="20" y1="9" x2="28" y2="15" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#6ee7b7" />
          </linearGradient>
          <linearGradient id="centerNode" x1="20" y1="22" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06b6d4" />
            <stop offset="1" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className={cn(
          "text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent",
          textClassName
        )}>
          LifeTree
        </span>
      )}
    </div>
  )
}

export function LogoIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="48" rx="12" fill="url(#bgGradientIcon)" />
      <path
        d="M24 38V26"
        stroke="url(#trunkGradientIcon)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 26V18"
        stroke="url(#trunkGradientIcon)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M24 22L18 16"
        stroke="url(#branchGradientIcon)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 22L30 16"
        stroke="url(#branchGradientIcon)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 18L20 12"
        stroke="url(#branchGradientIcon)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 18L28 12"
        stroke="url(#branchGradientIcon)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="18" cy="16" r="3.5" fill="url(#nodeGradient1Icon)" />
      <circle cx="30" cy="16" r="3.5" fill="url(#nodeGradient1Icon)" />
      <circle cx="20" cy="12" r="3" fill="url(#nodeGradient2Icon)" />
      <circle cx="28" cy="12" r="3" fill="url(#nodeGradient2Icon)" />
      <circle cx="24" cy="26" r="4" fill="url(#centerNodeIcon)" />
      <circle cx="18" cy="16" r="1.5" fill="white" fillOpacity="0.9" />
      <circle cx="30" cy="16" r="1.5" fill="white" fillOpacity="0.9" />
      <circle cx="20" cy="12" r="1.2" fill="white" fillOpacity="0.9" />
      <circle cx="28" cy="12" r="1.2" fill="white" fillOpacity="0.9" />
      <circle cx="24" cy="26" r="1.8" fill="white" fillOpacity="0.9" />
      <defs>
        <linearGradient id="bgGradientIcon" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d1829" />
          <stop offset="1" stopColor="#1a2744" />
        </linearGradient>
        <linearGradient id="trunkGradientIcon" x1="24" y1="38" x2="24" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="branchGradientIcon" x1="18" y1="22" x2="30" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="nodeGradient1Icon" x1="18" y1="12" x2="30" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="nodeGradient2Icon" x1="20" y1="9" x2="28" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#6ee7b7" />
        </linearGradient>
        <linearGradient id="centerNodeIcon" x1="20" y1="22" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
    </svg>
  )
}
