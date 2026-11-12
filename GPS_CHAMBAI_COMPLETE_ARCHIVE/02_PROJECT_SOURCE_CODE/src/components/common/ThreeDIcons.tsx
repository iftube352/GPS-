import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * 3D-style Class Icon: Isometric Chalkboard Easel with depth, bevels, and chalk tray
 */
export const Class3DIcon: React.FC<IconProps> = ({ className = '', size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-lg ${className}`}
  >
    <defs>
      <linearGradient id="boardGrad" x1="16" y1="12" x2="64" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#064E3B" />
        <stop offset="50%" stopColor="#047857" />
        <stop offset="100%" stopColor="#065F46" />
      </linearGradient>
      <linearGradient id="woodGrad" x1="10" y1="8" x2="70" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="legGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <linearGradient id="goldStar" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
      <filter id="shadow3d" x="4" y="4" width="72" height="72" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#047857" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Tripod legs */}
    <path d="M22 48L14 74" stroke="url(#legGrad)" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M58 48L66 74" stroke="url(#legGrad)" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M40 50L40 76" stroke="url(#legGrad)" strokeWidth="4" strokeLinecap="round" />
    {/* Board shadow */}
    <rect x="13" y="15" width="54" height="38" rx="6" fill="#000000" fillOpacity="0.2" />
    {/* Wooden frame 3D */}
    <rect x="11" y="11" width="58" height="40" rx="6" fill="url(#woodGrad)" />
    <rect x="11" y="11" width="58" height="3" fill="#FDE68A" fillOpacity="0.6" rx="1.5" />
    {/* Inner green board */}
    <rect x="15" y="15" width="50" height="32" rx="4" fill="url(#boardGrad)" />
    {/* Board glass reflection */}
    <path d="M16 16L38 16L24 46L16 46Z" fill="white" fillOpacity="0.08" />
    {/* Chalk drawings on board: ABC & Urdu Alif-Be */}
    <text x="20" y="27" fill="#E2E8F0" fontSize="8" fontWeight="bold" fontFamily="sans-serif">ABC</text>
    <text x="46" y="28" fill="#FDE047" fontSize="10" fontFamily="'Noto Sans Arabic', sans-serif">ا ب ت</text>
    <line x1="20" y1="34" x2="40" y2="34" stroke="#A7F3D0" strokeWidth="1.5" strokeDasharray="2 2" />
    <line x1="20" y1="39" x2="58" y2="39" stroke="#A7F3D0" strokeWidth="1.2" strokeOpacity="0.7" />
    {/* Chalk ledge / tray */}
    <path d="M9 51H71C72.1 51 73 51.9 73 53C73 54.1 72.1 55 71 55H9C7.9 55 7 54.1 7 53C7 51.9 7.9 51 9 51Z" fill="#92400E" />
    {/* Chalk pieces */}
    <rect x="22" y="49.5" width="8" height="2" rx="1" fill="#FFFFFF" />
    <rect x="33" y="49.5" width="7" height="2" rx="1" fill="#FDE047" />
    <rect x="43" y="49.5" width="6" height="2" rx="1" fill="#6EE7B7" />
    {/* Floating 3D golden star */}
    <g transform="translate(56, 6) scale(0.9)">
      <polygon points="10,1 12.8,7.3 19.5,7.7 14.3,12.2 16,18.8 10,15 4,18.8 5.7,12.2 0.5,7.7 7.2,7.3" fill="url(#goldStar)" />
    </g>
  </svg>
);

/**
 * 3D-style Books Icon: Layered stack of vibrant primary school textbooks with embossed spines
 */
export const Books3DIcon: React.FC<IconProps> = ({ className = '', size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-lg ${className}`}
  >
    <defs>
      <linearGradient id="bookBlue" x1="12" y1="44" x2="68" y2="68" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E40AF" />
        <stop offset="50%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="bookGreen" x1="16" y1="28" x2="66" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="50%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="bookOrange" x1="20" y1="12" x2="64" y2="34" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#C2410C" />
        <stop offset="50%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
      <linearGradient id="pagesGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
    </defs>
    {/* Bottom Book (Blue) */}
    <rect x="12" y="52" width="56" height="15" rx="3.5" fill="url(#bookBlue)" />
    <path d="M12 55.5H68V63.5H12V55.5Z" fill="url(#pagesGrad)" />
    <rect x="10" y="52" width="9" height="15" rx="3" fill="#1E3A8A" />
    <line x1="14" y1="55" x2="14" y2="64" stroke="#93C5FD" strokeWidth="1.5" />
    <rect x="26" y="57" width="28" height="2" fill="#94A3B8" rx="1" />
    <rect x="26" y="60.5" width="18" height="2" fill="#94A3B8" rx="1" />

    {/* Middle Book (Green) */}
    <rect x="15" y="34" width="52" height="15" rx="3.5" fill="url(#bookGreen)" />
    <path d="M15 37.5H67V45.5H15V37.5Z" fill="url(#pagesGrad)" />
    <rect x="13" y="34" width="8.5" height="15" rx="3" fill="#064E3B" />
    <line x1="17" y1="37" x2="17" y2="46" stroke="#6EE7B7" strokeWidth="1.5" />
    <rect x="28" y="39" width="24" height="2" fill="#94A3B8" rx="1" />
    <rect x="28" y="42.5" width="16" height="2" fill="#94A3B8" rx="1" />

    {/* Top Book (Orange/Amber) */}
    <rect x="18" y="16" width="48" height="15" rx="3.5" fill="url(#bookOrange)" />
    <path d="M18 19.5H66V27.5H18V19.5Z" fill="url(#pagesGrad)" />
    <rect x="16" y="16" width="8" height="15" rx="3" fill="#9A3412" />
    <line x1="20" y1="19" x2="20" y2="28" stroke="#FDBA74" strokeWidth="1.5" />
    {/* Ribbon bookmark */}
    <path d="M46 16V30L51 26L56 30V16H46Z" fill="#DC2626" />
    <path d="M46 16H56V18H46V16Z" fill="#B91C1C" />
  </svg>
);

/**
 * 3D-style Guides Icon: Handbook folio with glowing compass and bookmark
 */
export const Guides3DIcon: React.FC<IconProps> = ({ className = '', size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-lg ${className}`}
  >
    <defs>
      <linearGradient id="guideCover" x1="14" y1="10" x2="62" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0D9488" />
        <stop offset="50%" stopColor="#0F766E" />
        <stop offset="100%" stopColor="#115E59" />
      </linearGradient>
      <linearGradient id="compassRing" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <rect x="18" y="16" width="48" height="56" rx="6" fill="#000000" fillOpacity="0.25" />
    {/* Notebook back pages */}
    <rect x="19" y="13" width="46" height="55" rx="5" fill="#FEF3C7" />
    {/* Main folder cover */}
    <rect x="14" y="10" width="48" height="55" rx="5" fill="url(#guideCover)" />
    {/* Highlights */}
    <path d="M14 14C14 11.79 15.79 10 18 10H60C61.1 10 62 10.9 62 12V14H14Z" fill="white" fillOpacity="0.15" />
    {/* Ring binders on left */}
    <ellipse cx="14" cy="20" rx="3.5" ry="2" fill="#E2E8F0" />
    <ellipse cx="14" cy="32" rx="3.5" ry="2" fill="#E2E8F0" />
    <ellipse cx="14" cy="44" rx="3.5" ry="2" fill="#E2E8F0" />
    <ellipse cx="14" cy="56" rx="3.5" ry="2" fill="#E2E8F0" />
    {/* Central 3D Compass Emblem for Guide */}
    <circle cx="38" cy="36" r="16" fill="#134E4A" stroke="url(#compassRing)" strokeWidth="3" />
    <circle cx="38" cy="36" r="12" fill="#042F2E" />
    {/* Compass Needle */}
    <polygon points="38,26 41,36 38,34 35,36" fill="#EF4444" />
    <polygon points="38,46 41,36 38,38 35,36" fill="#93C5FD" />
    <circle cx="38" cy="36" r="2.5" fill="#FBBF24" />
    {/* Marker lines */}
    <line x1="24" y1="55" x2="52" y2="55" stroke="#5EEAD4" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="28" y1="59" x2="48" y2="59" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
  </svg>
);

/**
 * 3D-style Videos Icon: Curved OLED screen with 3D Play button and projector beam
 */
export const Videos3DIcon: React.FC<IconProps> = ({ className = '', size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-lg ${className}`}
  >
    <defs>
      <linearGradient id="tvGrad" x1="10" y1="12" x2="70" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="50%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="screenGrad" x1="14" y1="16" x2="66" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="50%" stopColor="#1D4ED8" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
      <linearGradient id="playBtnGrad" x1="28" y1="24" x2="54" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
      <linearGradient id="pedestalGrad" x1="30" y1="56" x2="50" y2="72" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
    </defs>
    {/* Pedestal stand */}
    <path d="M37 54H43V66H37V54Z" fill="url(#pedestalGrad)" />
    <path d="M26 66H54C55.1 66 56 66.9 56 68C56 69.1 55.1 70 54 70H26C24.9 70 24 69.1 24 68C24 66.9 24.9 66 26 66Z" fill="#1E293B" />
    <rect x="25" y="66" width="30" height="2" fill="#94A3B8" rx="1" />
    {/* Monitor chassis with 3D bezel */}
    <rect x="10" y="14" width="60" height="42" rx="7" fill="url(#tvGrad)" />
    <rect x="10" y="14" width="60" height="2" fill="#475569" rx="1" />
    {/* Inner screen */}
    <rect x="14" y="18" width="52" height="34" rx="4" fill="url(#screenGrad)" />
    {/* Screen reflection */}
    <path d="M14 18L36 18L20 52H14V18Z" fill="white" fillOpacity="0.1" />
    {/* YouTube style 3D button floating in center */}
    <g transform="translate(26, 23)">
      <rect x="0" y="0" width="28" height="22" rx="6" fill="url(#playBtnGrad)" />
      <rect x="0" y="0" width="28" height="2" fill="#FCA5A5" rx="1" />
      {/* 3D Triangle Play Arrow */}
      <polygon points="11,6 20,11 11,16" fill="#FFFFFF" />
    </g>
    {/* Floating broadcast waves */}
    <circle cx="68" cy="14" r="3" fill="#38BDF8" fillOpacity="0.8" />
    <path d="M64 8C67.5 9 70 11.5 71 15" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * 3D-style Other (Academics Dashboard) Icon: Multitool calendar, results grade medal & clock
 */
export const Other3DIcon: React.FC<IconProps> = ({ className = '', size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-lg ${className}`}
  >
    <defs>
      <linearGradient id="otherGrad" x1="12" y1="12" x2="68" y2="68" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="50%" stopColor="#4338CA" />
        <stop offset="100%" stopColor="#312E81" />
      </linearGradient>
      <linearGradient id="goldMedal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Clipboard / tablet body */}
    <rect x="14" y="16" width="52" height="52" rx="9" fill="url(#otherGrad)" />
    <rect x="14" y="16" width="52" height="2.5" fill="#818CF8" rx="1" />
    {/* Top binder clip */}
    <rect x="30" y="10" width="20" height="9" rx="3.5" fill="#E2E8F0" />
    <circle cx="40" cy="14" r="2" fill="#64748B" />
    {/* 4 Quadrants representing Timetable, Results, Lesson Plans, Attendance */}
    {/* Q1: Timetable grid */}
    <g transform="translate(20, 24)">
      <rect x="0" y="0" width="17" height="17" rx="3" fill="#3730A3" />
      <line x1="3" y1="5" x2="14" y2="5" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="9" x2="14" y2="9" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="13" x2="10" y2="13" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" />
    </g>
    {/* Q2: Results Medal / Star */}
    <g transform="translate(43, 24)">
      <rect x="0" y="0" width="17" height="17" rx="3" fill="#3730A3" />
      <circle cx="8.5" cy="8.5" r="5.5" fill="url(#goldMedal)" />
      <text x="5.5" y="11.5" fill="#78350F" fontSize="8" fontWeight="bold">A</text>
    </g>
    {/* Q3: Lesson Plan / Document */}
    <g transform="translate(20, 46)">
      <rect x="0" y="0" width="17" height="17" rx="3" fill="#3730A3" />
      <circle cx="5" cy="5" r="1.5" fill="#34D399" />
      <line x1="8" y1="5" x2="14" y2="5" stroke="#E2E8F0" strokeWidth="1.2" />
      <circle cx="5" cy="9" r="1.5" fill="#34D399" />
      <line x1="8" y1="9" x2="14" y2="9" stroke="#E2E8F0" strokeWidth="1.2" />
      <circle cx="5" cy="13" r="1.5" fill="#34D399" />
      <line x1="8" y1="13" x2="12" y2="13" stroke="#E2E8F0" strokeWidth="1.2" />
    </g>
    {/* Q4: Attendance checkmark */}
    <g transform="translate(43, 46)">
      <rect x="0" y="0" width="17" height="17" rx="3" fill="#3730A3" />
      <circle cx="8.5" cy="8.5" r="6" fill="#059669" />
      <path d="M5.5 8.5L7.5 10.5L11.5 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

/**
 * 3D-style Admission Icon: Mortarboard graduation cap with golden tassel, diploma scroll & seal
 */
export const Admission3DIcon: React.FC<IconProps> = ({ className = '', size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-lg ${className}`}
  >
    <defs>
      <linearGradient id="capGrad" x1="10" y1="18" x2="70" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="50%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="scrollGrad" x1="16" y1="46" x2="64" y2="66" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
      <linearGradient id="tasselGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* 3D Mortarboard Rhombus Top */}
    <polygon points="40,12 70,24 40,36 10,24" fill="url(#capGrad)" />
    <polygon points="40,12 70,24 40,36 10,24" stroke="#475569" strokeWidth="1.5" />
    {/* Skull cap under rhombus */}
    <path d="M22 29V39C22 46 30 50 40 50C50 50 58 46 58 39V29L40 36L22 29Z" fill="#0F172A" />
    {/* Button on top */}
    <ellipse cx="40" cy="24" rx="3.5" ry="2" fill="#FBBF24" />
    {/* Golden Tassel */}
    <path d="M40 24C44 26 58 27 60 38" stroke="url(#tasselGrad)" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="58" y="38" width="5" height="10" rx="1.5" fill="url(#tasselGrad)" />

    {/* Admission Diploma Scroll at bottom */}
    <g transform="translate(14, 52)">
      {/* Scroll cylinder */}
      <rect x="4" y="0" width="44" height="14" rx="3.5" fill="url(#scrollGrad)" stroke="#D97706" strokeWidth="1" />
      {/* Red ribbon band */}
      <rect x="22" y="0" width="8" height="14" fill="#DC2626" />
      {/* Golden Seal stamp */}
      <circle cx="26" cy="7" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
      <polygon points="26,4 27.5,6.5 30,7 28,8.5 28.5,11 26,9.5 23.5,11 24,8.5 22,7 24.5,6.5" fill="#92400E" />
    </g>
  </svg>
);

/**
 * 3D-style Staff Icon: Lecturer/Teacher bust with badge of honor and golden laurel wreath
 */
export const Staff3DIcon: React.FC<IconProps> = ({ className = '', size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-lg ${className}`}
  >
    <defs>
      <linearGradient id="staffBgGrad" x1="12" y1="12" x2="68" y2="68" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0284C7" />
        <stop offset="50%" stopColor="#0369A1" />
        <stop offset="100%" stopColor="#075985" />
      </linearGradient>
      <linearGradient id="coatGrad" x1="18" y1="46" x2="62" y2="76" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <linearGradient id="goldBadgeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="faceGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FED7AA" />
        <stop offset="100%" stopColor="#FDBA74" />
      </linearGradient>
    </defs>
    {/* Base shadow ellipse */}
    <ellipse cx="40" cy="74" rx="28" ry="4" fill="#000" fillOpacity="0.15" />
    {/* Background podium circle with metallic rim */}
    <circle cx="40" cy="40" r="34" fill="url(#staffBgGrad)" stroke="#38BDF8" strokeWidth="2" />
    <circle cx="40" cy="40" r="31" stroke="white" strokeWidth="1" strokeOpacity="0.2" />

    {/* Teacher Coat & Collar */}
    <path
      d="M20 70C20 54 28 47 40 47C52 47 60 54 60 70H20Z"
      fill="url(#coatGrad)"
      stroke="#065F46"
      strokeWidth="1.5"
    />
    {/* White Shirt Collar */}
    <polygon points="40,47 34,58 40,65 46,58" fill="white" />
    {/* Emerald/Gold Tie */}
    <polygon points="38,58 42,58 44,70 40,73 36,70" fill="url(#goldBadgeGrad)" />

    {/* Head & Face */}
    <circle cx="40" cy="32" r="14" fill="url(#faceGrad)" />
    {/* Hair style */}
    <path d="M26 30C26 21 32 17 40 17C48 17 54 21 54 30C52 26 47 24 40 24C33 24 28 26 26 30Z" fill="#1E293B" />
    {/* Spectacles/Glasses */}
    <circle cx="34" cy="32" r="4.5" stroke="#0F172A" strokeWidth="1.5" fill="none" />
    <circle cx="46" cy="32" r="4.5" stroke="#0F172A" strokeWidth="1.5" fill="none" />
    <line x1="38.5" y1="32" x2="41.5" y2="32" stroke="#0F172A" strokeWidth="1.5" />

    {/* Golden Laurel Star Badge */}
    <g transform="translate(50, 14)">
      <circle cx="10" cy="10" r="9" fill="url(#goldBadgeGrad)" stroke="#FEF08A" strokeWidth="1.5" />
      <polygon points="10,4 12,8 16,8.5 13,11.5 14,16 10,13.5 6,16 7,11.5 4,8.5 8,8" fill="white" />
    </g>
  </svg>
);

/**
 * 3D-style Gallery Icon: Retro educational Polaroid camera with gold lens, lens glass gleam, and photos
 */
export const Gallery3DIcon: React.FC<IconProps> = ({ className = '', size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-lg ${className}`}
  >
    <defs>
      <linearGradient id="cameraBody" x1="12" y1="18" x2="68" y2="68" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#854D0E" />
        <stop offset="50%" stopColor="#A16207" />
        <stop offset="100%" stopColor="#713F12" />
      </linearGradient>
      <linearGradient id="lensRing" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
      <linearGradient id="lensGlass" x1="28" y1="30" x2="52" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="40%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0C4A6E" />
      </linearGradient>
      <linearGradient id="photoBorder" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F1F5F9" />
      </linearGradient>
    </defs>

    {/* Photo coming out of bottom */}
    <g transform="translate(24, 46) rotate(6)">
      <rect x="0" y="0" width="30" height="26" rx="2" fill="url(#photoBorder)" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="3" y="3" width="24" height="15" rx="1" fill="#047857" />
      {/* Mountain & Sun graphic inside printed photo */}
      <polygon points="5,16 12,9 18,16" fill="#10B981" />
      <polygon points="14,16 19,11 25,16" fill="#34D399" />
      <circle cx="21" cy="7" r="2.5" fill="#FBBF24" />
    </g>

    {/* Camera Main Body */}
    <rect x="14" y="20" width="52" height="38" rx="8" fill="url(#cameraBody)" stroke="#EAB308" strokeWidth="1.5" />
    {/* Camera Top Plate */}
    <rect x="14" y="20" width="52" height="10" rx="4" fill="#451A03" />

    {/* Flash Unit with Glow */}
    <rect x="20" y="23" width="8" height="5" rx="1.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
    <circle cx="24" cy="25.5" r="1.5" fill="white" />

    {/* Viewfinder window */}
    <rect x="52" y="23" width="8" height="5" rx="1" fill="#0284C7" stroke="#38BDF8" strokeWidth="0.8" />

    {/* Big 3D Lens Ring & Glass */}
    <circle cx="40" cy="42" r="15" fill="url(#lensRing)" stroke="#78350F" strokeWidth="1.5" />
    <circle cx="40" cy="42" r="12" fill="url(#lensGlass)" />
    <circle cx="40" cy="42" r="7" fill="#0F172A" />

    {/* Lens reflection light flare */}
    <ellipse cx="37" cy="38" rx="4" ry="2" fill="white" fillOpacity="0.45" transform="rotate(-30 37 38)" />
    <circle cx="43" cy="45" r="1.5" fill="white" fillOpacity="0.6" />

    {/* Shutter Button on top */}
    <rect x="22" y="16" width="6" height="4" rx="1" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8" />
  </svg>
);

/**
 * 3D-style PTC Fund & Council Icon: Isometric Bank Safe / Treasury Vault with 3 Grants, Golden Coins & Official Seal
 */
export const PtcFund3DIcon: React.FC<IconProps> = ({ className = '', size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-xl ${className}`}
  >
    <defs>
      <linearGradient id="vaultBody" x1="10" y1="14" x2="70" y2="72" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="50%" stopColor="#065F46" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <linearGradient id="vaultDoor" x1="16" y1="20" x2="64" y2="68" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="70%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="goldCoinGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="wheelGrad" x1="28" y1="32" x2="52" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <filter id="ptcDrop" x="4" y="8" width="72" height="68" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="3" floodColor="#064E3B" floodOpacity="0.3" />
      </filter>
    </defs>

    {/* Vault Outer Safe Box */}
    <rect x="12" y="14" width="56" height="52" rx="10" fill="url(#vaultBody)" stroke="#34D399" strokeWidth="1.5" />
    <rect x="15" y="17" width="50" height="46" rx="7" fill="url(#vaultDoor)" stroke="#064E3B" strokeWidth="1" />

    {/* Beveled bolts on corners */}
    <circle cx="19" cy="21" r="2" fill="#FDE047" />
    <circle cx="61" cy="21" r="2" fill="#FDE047" />
    <circle cx="19" cy="59" r="2" fill="#FDE047" />
    <circle cx="61" cy="59" r="2" fill="#FDE047" />

    {/* Bank Vault Rotary Locking Wheel in Center */}
    <circle cx="40" cy="40" r="14" fill="url(#wheelGrad)" stroke="#78350F" strokeWidth="1.5" />
    <circle cx="40" cy="40" r="9" fill="#047857" stroke="#FDE68A" strokeWidth="1" />
    
    {/* Wheel Spoke handles */}
    <rect x="38.5" y="23" width="3" height="6" rx="1.5" fill="#FDE047" />
    <rect x="38.5" y="51" width="3" height="6" rx="1.5" fill="#FDE047" />
    <rect x="23" y="38.5" width="6" height="3" rx="1.5" fill="#FDE047" />
    <rect x="51" y="38.5" width="6" height="3" rx="1.5" fill="#FDE047" />

    {/* Center Rupee Symbol 'Rs / ₨' */}
    <text x="34" y="44" fill="#FEF08A" fontSize="11" fontWeight="bold" fontFamily="sans-serif">₨</text>

    {/* Stacks of Golden Grant Coins emerging from top right */}
    <g transform="translate(50, 4) rotate(12)">
      <ellipse cx="10" cy="14" rx="8" ry="4" fill="#92400E" />
      <rect x="2" y="11" width="16" height="3" fill="#B45309" />
      <ellipse cx="10" cy="11" rx="8" ry="4" fill="url(#goldCoinGrad)" stroke="#FEF08A" strokeWidth="0.8" />

      <rect x="2" y="7" width="16" height="3" fill="#B45309" />
      <ellipse cx="10" cy="7" rx="8" ry="4" fill="url(#goldCoinGrad)" stroke="#FEF08A" strokeWidth="0.8" />
    </g>

    {/* Official 3 Grants Badge Ribbon (Green, Gold, Blue) */}
    <g transform="translate(14, 8)">
      <rect x="0" y="0" width="18" height="6" rx="2" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
      <text x="3" y="5" fill="white" fontSize="4.5" fontWeight="bold">PTC</text>
    </g>
  </svg>
);
