import React from 'react';
import { StorageService } from '../../services/storage';

export interface MonoIconProps {
  size?: number;
  className?: string;
  color?: string;
  iconKey?: string;
}

/**
 * Helper wrapper that checks if a custom icon image was uploaded in Profile -> Full Customization
 */
const CustomIconWrapper: React.FC<{
  iconKey?: string;
  size: number;
  className?: string;
  children: React.ReactNode;
}> = ({ iconKey, size, className = '', children }) => {
  if (iconKey) {
    try {
      const cust = StorageService.getCustomization();
      const customUrl = cust?.customIcons?.[iconKey];
      if (customUrl) {
        return (
          <img
            src={customUrl}
            alt={iconKey}
            style={{ width: size, height: size }}
            className={`object-contain inline-block shrink-0 ${className}`}
          />
        );
      }
    } catch {
      // ignore fallback to monochrome SVG
    }
  }
  return <>{children}</>;
};

/** 1. Lesson Plans (Document with horizontal lines and diagonal pencil) */
export const MonoLessonPlansIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'lesson_plans' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M12 8H42V24L38 28V12H16V52H38V42L42 38V56H12V8Z" fill={color} />
      <rect x="20" y="18" width="16" height="3.5" rx="1" fill={color} />
      <rect x="20" y="25" width="16" height="3.5" rx="1" fill={color} />
      <rect x="20" y="32" width="12" height="3.5" rx="1" fill={color} />
      <rect x="20" y="39" width="10" height="3.5" rx="1" fill={color} />
      <rect x="20" y="46" width="14" height="3.5" rx="1" fill={color} />
      <path d="M52.5 16.5L56.5 20.5L36.5 40.5L30.5 42.5L32.5 36.5L52.5 16.5Z" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** 2. Youtube Videos (Monitor with webcam on top, presenter on left, two video boxes on right) */
export const MonoYoutubeVideosIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'videos' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      {/* Webcam on top */}
      <circle cx="32" cy="8" r="3.5" stroke={color} strokeWidth="2.5" />
      <circle cx="32" cy="8" r="1.2" fill={color} />
      <path d="M29 12H35L36 14H28L29 12Z" fill={color} />
      {/* Monitor frame */}
      <rect x="8" y="14" width="48" height="34" rx="2.5" stroke={color} strokeWidth="3" />
      <line x1="8" y1="43" x2="56" y2="43" stroke={color} strokeWidth="2.5" />
      <line x1="36" y1="14" x2="36" y2="43" stroke={color} strokeWidth="2.2" />
      <line x1="36" y1="28.5" x2="56" y2="28.5" stroke={color} strokeWidth="2.2" />
      {/* Main speaker person */}
      <circle cx="22" cy="25" r="4.5" fill={color} />
      <path d="M14 38C14 33.5 17.5 31 22 31C26.5 31 30 33.5 30 38H14Z" fill={color} />
      {/* Right top participant */}
      <circle cx="46" cy="20" r="2.5" fill={color} />
      <path d="M41 26.5C41 24.2 43 23 46 23C49 23 51 24.2 51 26.5H41Z" fill={color} />
      {/* Right bottom participant */}
      <circle cx="46" cy="34" r="2.5" fill={color} />
      <path d="M41 40.5C41 38.2 43 37 46 37C49 37 51 38.2 51 40.5H41Z" fill={color} />
      {/* Stand */}
      <path d="M28 48H36L38 55H26L28 48Z" fill={color} />
      <rect x="22" y="55" width="20" height="3" rx="1.5" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** 3. Admissions (Document with folded corner, user portrait at top-left, lines below) */
export const MonoAdmissionsIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'admission' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M14 12C14 9.8 15.8 8 18 8H39L50 19V52C50 54.2 48.2 56 46 56H18C15.8 56 14 54.2 14 52V12Z" stroke={color} strokeWidth="3.5" />
      <path d="M38 8V19H50" stroke={color} strokeWidth="3.2" strokeLinejoin="round" />
      {/* Portrait */}
      <circle cx="25" cy="20" r="3.5" fill={color} />
      <path d="M19 28C19 25.2 21.5 24 25 24C28.5 24 31 25.2 31 28H19Z" fill={color} />
      {/* Form lines */}
      <rect x="19" y="33" width="16" height="3" rx="1" fill={color} />
      <rect x="19" y="39" width="26" height="3" rx="1" fill={color} />
      <rect x="19" y="45" width="26" height="3" rx="1" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** 4. Students (Student silhouette at desk writing) */
export const MonoStudentsIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'students' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="32" cy="16" r="9" fill={color} />
      <path d="M16 42C16 32 22 27 32 27C42 27 48 32 48 42V46H16V42Z" fill={color} />
      {/* Desk / Paper */}
      <path d="M20 42H44L47 54H17L20 42Z" fill="white" stroke={color} strokeWidth="3" />
      <path d="M40 35L45 45" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  </CustomIconWrapper>
);

/** 5. PTC Members (Group of 3 people in formal suits with ties) */
export const MonoPtcMembersIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'ptc_members' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      {/* Left person */}
      <circle cx="16" cy="20" r="6" fill={color} />
      <path d="M6 42C6 34 10 30 16 30C20 30 23 32 25 35H6V42Z" fill={color} />
      {/* Right person */}
      <circle cx="48" cy="20" r="6" fill={color} />
      <path d="M39 35C41 32 44 30 48 30C54 30 58 34 58 42H39V35Z" fill={color} />
      {/* Center leader */}
      <circle cx="32" cy="22" r="7.5" fill={color} />
      <path d="M18 50C18 39 23.5 33 32 33C40.5 33 46 39 46 50H18Z" fill={color} />
      {/* Tie cutout */}
      <polygon points="32,35 30,41 32,46 34,41" fill="white" />
    </svg>
  </CustomIconWrapper>
);

/** 6. PDF E-Book (Tablet with "Ebook" label banner) */
export const MonoPdfEbookIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'books' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="12" y="8" width="32" height="48" rx="4" stroke={color} strokeWidth="3.5" />
      <line x1="12" y1="14" x2="44" y2="14" stroke={color} strokeWidth="2.5" />
      <line x1="12" y1="48" x2="44" y2="48" stroke={color} strokeWidth="2.5" />
      <circle cx="28" cy="52" r="1.8" fill={color} />
      {/* Ebook Flag */}
      <rect x="17" y="23" width="36" height="15" rx="2.5" fill={color} />
      <text x="21" y="34" fill="white" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">Ebook</text>
    </svg>
  </CustomIconWrapper>
);

/** 7. Periods (Calendar with grid cells) */
export const MonoPeriodsIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'periods' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="10" y="14" width="44" height="42" rx="6" stroke={color} strokeWidth="3.5" />
      <path d="M10 24H54V18C54 15.8 52.2 14 50 14H14C11.8 14 10 15.8 10 18V24Z" fill={color} />
      <rect x="20" y="8" width="4" height="9" rx="2" fill={color} />
      <rect x="40" y="8" width="4" height="9" rx="2" fill={color} />
      {/* Grid squares */}
      {[29, 37, 45].map((y) =>
        [17, 26, 35, 44].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1" fill={color} />
        ))
      )}
    </svg>
  </CustomIconWrapper>
);

/** 8. Books Demands (Stack of 3 books with bookmark) */
export const MonoBooksDemandsIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'books_demand' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      {/* Top Book */}
      <path d="M32 10L54 18L32 27L10 18L32 10Z" fill={color} />
      <path d="M12 21L32 29L52 21V27L32 35L12 27V21Z" stroke={color} strokeWidth="3" fill="none" />
      {/* Middle Book */}
      <path d="M12 31L32 39L52 31V37L32 45L12 37V31Z" stroke={color} strokeWidth="3" fill="none" />
      {/* Bottom Book */}
      <path d="M12 41L32 49L52 41V47L32 55L12 47V41Z" stroke={color} strokeWidth="3" fill="none" />
      {/* Bookmark ribbon */}
      <path d="M42 25V36L45 33L48 36V23" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** 9. Manual Attendance (Rounded square with diagonal pencil) */
export const MonoManualAttendanceIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'manual_attendance' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M36 14H18C14.7 14 12 16.7 12 20V46C12 49.3 14.7 52 18 52H44C47.3 52 50 49.3 50 46V28" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M47 11L55 19L33 41L23 43L25 33L47 11Z" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** 10. Exam (Clipboard with EXAM text, checkboxes, and pencil) */
export const MonoExamIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'exam' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="12" y="12" width="36" height="44" rx="4" stroke={color} strokeWidth="3.2" />
      <path d="M22 8H38V15H22V8Z" fill={color} />
      <text x="19" y="23" fill={color} fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">EXAM</text>
      {/* Checkboxes & lines */}
      <rect x="17" y="27" width="5" height="5" stroke={color} strokeWidth="2" />
      <line x1="25" y1="30" x2="40" y2="30" stroke={color} strokeWidth="2.2" />
      <rect x="17" y="36" width="5" height="5" stroke={color} strokeWidth="2" />
      <line x1="25" y1="39" x2="36" y2="39" stroke={color} strokeWidth="2.2" />
      <rect x="17" y="45" width="5" height="5" stroke={color} strokeWidth="2" />
      <line x1="25" y1="48" x2="38" y2="48" stroke={color} strokeWidth="2.2" />
      {/* Pencil on right */}
      <path d="M52 22L57 27L43 41L37 42L38 36L52 22Z" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** 11. Customize (Gear with wrench) */
export const MonoCustomizeIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'customize' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <path
        d="M28 10H36L37.5 15.5L42.5 17.5L47.5 14.5L53 20L50 25L52 30L57.5 31.5V39.5L52 41L49.5 46L44 40.5C44 33 38.5 27.5 31 27.5C23.5 27.5 18 33 18 40.5C18 45 20.5 49 24.5 51L20 55.5L14.5 50L17.5 45L15.5 40L10 38.5V30.5L15.5 29L17.5 24L14.5 19L20 13.5L25 16.5L28 10Z"
        fill={color}
      />
      <path d="M35 34L52 51C53.5 52.5 53.5 55 52 56.5C50.5 58 48 58 46.5 56.5L29.5 39.5L35 34Z" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** 12. Timetable (Calendar with clock in bottom right) */
export const MonoTimetableIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'timetable' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M10 22H48V32M10 22V48C10 50.2 11.8 52 14 52H32M10 22V16C10 13.8 11.8 12 14 12H44C46.2 12 48 13.8 48 16V22" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <rect x="18" y="7" width="4" height="9" rx="2" fill={color} />
      <rect x="36" y="7" width="4" height="9" rx="2" fill={color} />
      <rect x="16" y="28" width="5" height="5" rx="1" fill={color} />
      <rect x="25" y="28" width="5" height="5" rx="1" fill={color} />
      <rect x="34" y="28" width="5" height="5" rx="1" fill={color} />
      <rect x="16" y="37" width="5" height="5" rx="1" fill={color} />
      <rect x="25" y="37" width="5" height="5" rx="1" fill={color} />
      {/* Clock */}
      <circle cx="44" cy="44" r="11" fill="white" stroke={color} strokeWidth="3.5" />
      <path d="M44 38V44H49" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </CustomIconWrapper>
);

/** 13. Staff Data (Teacher at board pointing with 3 people below) */
export const MonoStaffDataIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'staff' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      {/* Board */}
      <rect x="12" y="8" width="40" height="25" rx="2" stroke={color} strokeWidth="3.2" />
      {/* Teacher */}
      <circle cx="23" cy="16" r="3.5" fill={color} />
      <path d="M16 28C16 23.5 19 21 23 21C27 21 30 23.5 30 28H16Z" fill={color} />
      <line x1="29" y1="23" x2="42" y2="15" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* 3 Staff / Students row below */}
      {[18, 32, 46].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="42" r="4" fill={color} />
          <path d={`M${cx - 6} 54C${cx - 6} 49.5 ${cx - 3.5} 47.5 ${cx} 47.5C${cx + 3.5} 47.5 ${cx + 6} 49.5 ${cx + 6} 54H${cx - 6}Z`} fill={color} />
        </g>
      ))}
    </svg>
  </CustomIconWrapper>
);

/** 14. QR Attendance (QR code with 4 corner brackets) */
export const MonoQrAttendanceIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'qr_scanner' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      {/* Corner brackets */}
      <path d="M10 20V12C10 10.9 10.9 10 12 10H20" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M44 10H52C53.1 10 54 10.9 54 12V20" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M10 44V52C10 53.1 10.9 54 12 54H20" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M54 44V52C54 53.1 53.1 54 52 54H44" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      {/* QR Finder squares */}
      <rect x="16" y="16" width="12" height="12" rx="2" stroke={color} strokeWidth="3" />
      <rect x="20" y="20" width="4" height="4" fill={color} />
      <rect x="36" y="16" width="12" height="12" rx="2" stroke={color} strokeWidth="3" />
      <rect x="40" y="20" width="4" height="4" fill={color} />
      <rect x="16" y="36" width="12" height="12" rx="2" stroke={color} strokeWidth="3" />
      <rect x="20" y="40" width="4" height="4" fill={color} />
      {/* QR matrix dots */}
      <rect x="34" y="34" width="5" height="5" fill={color} />
      <rect x="42" y="34" width="6" height="5" fill={color} />
      <rect x="34" y="42" width="6" height="6" fill={color} />
      <rect x="43" y="43" width="5" height="5" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** 15. Certificate (Certificate plaque with ribbon seal) */
export const MonoCertificateIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'certificate' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="8" y="10" width="48" height="36" rx="4" fill={color} />
      <rect x="14" y="17" width="28" height="3" rx="1.5" fill="white" />
      <rect x="14" y="24" width="20" height="3" rx="1.5" fill="white" />
      <rect x="14" y="31" width="18" height="3" rx="1.5" fill="white" />
      {/* Seal badge */}
      <circle cx="44" cy="34" r="8" fill="white" stroke={color} strokeWidth="2.5" />
      <circle cx="44" cy="34" r="4.5" fill={color} />
      <path d="M40 41L37 54L44 50L51 54L48 41" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** 16. Office Data (Briefcase) */
export const MonoOfficeDataIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'office' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M24 16V12C24 9.8 25.8 8 28 8H36C38.2 8 40 9.8 40 12V16" stroke={color} strokeWidth="4" />
      <rect x="8" y="16" width="48" height="38" rx="6" fill={color} />
      <path d="M8 32H56" stroke="white" strokeWidth="3" />
      <rect x="28" y="28" width="8" height="8" rx="2" fill="white" />
    </svg>
  </CustomIconWrapper>
);

/** 17. Videos (Video camera silhouette) */
export const MonoVideosIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'videos_cam' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="8" y="18" width="34" height="28" rx="6" fill={color} />
      <path d="M44 26L56 19V45L44 38V26Z" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** 18. Gallery (Stacked photo frames with sun & mountains) */
export const MonoGalleryIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'gallery' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="14" y="12" width="40" height="32" rx="4" stroke={color} strokeWidth="3.5" fill="white" />
      <circle cx="24" cy="21" r="3.5" fill={color} />
      <path d="M16 40L27 28L35 36L42 26L52 40H16Z" fill={color} />
      <path d="M10 22L8 46L44 52L45 45" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </CustomIconWrapper>
);

/** 19. Daily Enrollment (4 Ring Binders) */
export const MonoDailyEnrollmentIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'daily_enrollment' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      {[10, 22, 34, 46].map((x) => (
        <g key={x}>
          <rect x={x} y="12" width="9" height="42" rx="1.5" fill={color} />
          <rect x={x + 2} y="17" width="5" height="10" rx="0.8" fill="white" />
          <circle cx={x + 4.5} cy="45" r="2" stroke="white" strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  </CustomIconWrapper>
);

/** 20. PTC Fund (Wallet with cash bills) */
export const MonoPtcFundIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'ptc_fund' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M16 22L42 10L48 22" stroke={color} strokeWidth="3" />
      <path d="M22 22L48 15L50 22" stroke={color} strokeWidth="3" />
      <rect x="10" y="22" width="44" height="32" rx="5" fill={color} />
      <rect x="38" y="33" width="16" height="10" rx="3" fill="white" stroke={color} strokeWidth="2.5" />
      <circle cx="43" cy="38" r="2" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** 21. Student Card (ID Badge with top clip, portrait and lines) */
export const MonoStudentCardIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'student_card' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="8" y="16" width="48" height="36" rx="5" fill={color} />
      <rect x="26" y="10" width="12" height="10" rx="3" fill={color} stroke="white" strokeWidth="2" />
      <circle cx="22" cy="31" r="4.5" fill="white" />
      <path d="M14 43C14 38.5 17.5 36.5 22 36.5C26.5 36.5 30 38.5 30 43H14Z" fill="white" />
      <rect x="34" y="27" width="16" height="3" rx="1.5" fill="white" />
      <rect x="34" y="34" width="16" height="3" rx="1.5" fill="white" />
      <rect x="34" y="41" width="12" height="3" rx="1.5" fill="white" />
    </svg>
  </CustomIconWrapper>
);

/** 22. Restore (Two bold circular sync arrows) */
export const MonoRestoreIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'restore' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M16 28C18 18 27 12 37 14C42 15 46 18 49 22" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
      <polygon points="52,12 54,26 40,24" fill={color} />
      <path d="M48 36C46 46 37 52 27 50C22 49 18 46 15 42" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
      <polygon points="12,52 10,38 24,40" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** 23. Backup (Server stack with circular arrow) */
export const MonoBackupIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'backup' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="10" y="10" width="34" height="10" rx="2.5" fill={color} />
      <circle cx="38" cy="15" r="1.5" fill="white" />
      <rect x="10" y="24" width="34" height="10" rx="2.5" fill={color} />
      <circle cx="38" cy="29" r="1.5" fill="white" />
      <rect x="10" y="38" width="24" height="10" rx="2.5" fill={color} />
      <circle cx="44" cy="44" r="11" fill="white" stroke={color} strokeWidth="3.2" />
      <path d="M44 37V44L48 47" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  </CustomIconWrapper>
);

/** 24. Printer (Printer with paper top and bottom) */
export const MonoPrinterIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'printer' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="18" y="8" width="28" height="12" fill={color} />
      <rect x="10" y="20" width="44" height="22" rx="4" fill={color} />
      <circle cx="46" cy="27" r="2" fill="white" />
      <rect x="18" y="36" width="28" height="18" fill="white" stroke={color} strokeWidth="3.5" />
      <line x1="23" y1="43" x2="41" y2="43" stroke={color} strokeWidth="2.5" />
      <line x1="23" y1="48" x2="41" y2="48" stroke={color} strokeWidth="2.5" />
    </svg>
  </CustomIconWrapper>
);

/** 25. Attendance (User silhouette with checkmark circle) */
export const MonoAttendanceIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'attendance' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="28" cy="18" r="10" fill={color} />
      <path d="M10 48C10 38 17 32 28 32C39 32 46 38 46 48H10Z" fill={color} />
      <circle cx="46" cy="46" r="10" fill={color} stroke="white" strokeWidth="2.5" />
      <path d="M41 46L44.5 49.5L51.5 42.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </CustomIconWrapper>
);

/** 26. Bank (Bank building with columns and currency sign) */
export const MonoBankIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'bank' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <polygon points="32,8 56,22 8,22" fill={color} />
      <rect x="10" y="23" width="44" height="3" fill={color} />
      <rect x="14" y="28" width="5" height="18" fill={color} />
      <rect x="45" y="28" width="5" height="18" fill={color} />
      <text x="26" y="43" fill={color} fontSize="18" fontWeight="bold" fontFamily="sans-serif">$</text>
      <rect x="10" y="48" width="44" height="4" fill={color} />
      <rect x="6" y="53" width="52" height="3" fill={color} />
    </svg>
  </CustomIconWrapper>
);

/** Additional Monochrome Icons for Guides, Others, Class, Struck Off */
export const MonoGuidesIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'guides' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M12 14C12 11.8 13.8 10 16 10H30V52H16C13.8 52 12 50.2 12 48V14Z" stroke={color} strokeWidth="3.5" />
      <path d="M52 14C52 11.8 50.2 10 48 10H34V52H48C50.2 52 52 50.2 52 48V14Z" stroke={color} strokeWidth="3.5" />
      <line x1="18" y1="20" x2="26" y2="20" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="18" y1="28" x2="26" y2="28" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="38" y1="20" x2="46" y2="20" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="38" y1="28" x2="46" y2="28" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  </CustomIconWrapper>
);

export const MonoOthersIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'other' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="10" y="10" width="19" height="19" rx="4" fill={color} />
      <rect x="35" y="10" width="19" height="19" rx="4" fill={color} />
      <rect x="10" y="35" width="19" height="19" rx="4" fill={color} />
      <rect x="35" y="35" width="19" height="19" rx="4" stroke={color} strokeWidth="3.5" />
    </svg>
  </CustomIconWrapper>
);

export const MonoStruckOffIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'struck_off' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="26" cy="18" r="9" fill={color} />
      <path d="M10 46C10 36 16 31 26 31C36 31 42 36 42 46H10Z" fill={color} />
      <circle cx="46" cy="44" r="10" fill={color} stroke="white" strokeWidth="2.5" />
      <path d="M42 40L50 48M50 40L42 48" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </CustomIconWrapper>
);

export const MonoAiIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'other_ai' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <img
      src="/assets/aistudio/Image_012.svg"
      alt="AI Models Suite (Image 012)"
      style={{ width: size, height: size }}
      className={`object-contain rounded-lg inline-block shrink-0 shadow-2xs ${className}`}
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = 'none';
      }}
    />
  </CustomIconWrapper>
);

export const MonoSsrIcon: React.FC<MonoIconProps> = ({ size = 34, className = '', color = 'currentColor', iconKey = 'ssr' }) => (
  <CustomIconWrapper iconKey={iconKey} size={size} className={className}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="12" y="10" width="40" height="48" rx="4" stroke={color} strokeWidth="3" />
      <rect x="22" y="6" width="20" height="8" rx="2" fill={color} />
      <circle cx="32" cy="10" r="2" fill="white" />
      <path d="M26 23L32 18L38 23V25H26V23Z" fill={color} />
      <rect x="18" y="29" width="6" height="6" rx="1" fill={color} />
      <line x1="28" y1="32" x2="46" y2="32" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="18" y="38" width="6" height="6" rx="1" fill={color} />
      <line x1="28" y1="41" x2="46" y2="41" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="18" y="47" width="6" height="6" rx="1" fill={color} />
      <line x1="28" y1="50" x2="46" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M19.5 32L21 33.5L23 30.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.5 41L21 42.5L23 39.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.5 50L21 51.5L23 48.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </CustomIconWrapper>
);

export const BUILT_IN_ICON_LIBRARY: {
  id: string;
  label: string;
  category: string;
  Icon: React.FC<MonoIconProps>;
}[] = [
  { id: 'admission', label: 'Student Admission Form', category: 'School', Icon: MonoAdmissionsIcon },
  { id: 'students', label: 'Student at Desk', category: 'School', Icon: MonoStudentsIcon },
  { id: 'student_card', label: 'Student ID Card', category: 'School', Icon: MonoStudentCardIcon },
  { id: 'qr_scanner', label: 'QR Attendance Scanner', category: 'Attendance', Icon: MonoQrAttendanceIcon },
  { id: 'attendance', label: 'Attendance Checkmark', category: 'Attendance', Icon: MonoAttendanceIcon },
  { id: 'manual_attendance', label: 'Manual Register', category: 'Attendance', Icon: MonoManualAttendanceIcon },
  { id: 'staff', label: 'Teachers & Staff', category: 'Staff', Icon: MonoStaffDataIcon },
  { id: 'ptc_fund', label: 'PTC Fund Wallet', category: 'Finance', Icon: MonoPtcFundIcon },
  { id: 'ptc_members', label: 'PTC Council Members', category: 'Finance', Icon: MonoPtcMembersIcon },
  { id: 'bank', label: 'Bank & Grants', category: 'Finance', Icon: MonoBankIcon },
  { id: 'books', label: 'Digital Textbooks (E-Book)', category: 'Academics', Icon: MonoPdfEbookIcon },
  { id: 'guides', label: 'Teacher Guides Book', category: 'Academics', Icon: MonoGuidesIcon },
  { id: 'books_demand', label: 'Books Stack & Demand', category: 'Academics', Icon: MonoBooksDemandsIcon },
  { id: 'lesson_plans', label: 'Lesson Plan Document', category: 'Academics', Icon: MonoLessonPlansIcon },
  { id: 'exam', label: 'Examination Clipboard', category: 'Exams', Icon: MonoExamIcon },
  { id: 'certificate', label: 'Official Certificate Seal', category: 'Records', Icon: MonoCertificateIcon },
  { id: 'struck_off', label: 'Struck Off Register', category: 'Records', Icon: MonoStruckOffIcon },
  { id: 'daily_enrollment', label: 'Enrollment Binders', category: 'Records', Icon: MonoDailyEnrollmentIcon },
  { id: 'timetable', label: 'Class Timetable Clock', category: 'Schedule', Icon: MonoTimetableIcon },
  { id: 'periods', label: 'Academic Calendar Grid', category: 'Schedule', Icon: MonoPeriodsIcon },
  { id: 'gallery', label: 'School Photo Gallery', category: 'Media', Icon: MonoGalleryIcon },
  { id: 'videos_cam', label: 'Video Camera', category: 'Media', Icon: MonoVideosIcon },
  { id: 'videos', label: 'Multimedia Monitor', category: 'Media', Icon: MonoYoutubeVideosIcon },
  { id: 'office', label: 'Office Briefcase', category: 'Admin', Icon: MonoOfficeDataIcon },
  { id: 'ssr', label: 'SSR School Checklist', category: 'Admin', Icon: MonoSsrIcon },
  { id: 'backup', label: 'Database Backup Server', category: 'System', Icon: MonoBackupIcon },
  { id: 'restore', label: 'Restore Sync Arrows', category: 'System', Icon: MonoRestoreIcon },
  { id: 'printer', label: 'Official Document Printer', category: 'System', Icon: MonoPrinterIcon },
  { id: 'customize', label: 'Settings & Tools', category: 'System', Icon: MonoCustomizeIcon },
  { id: 'other_ai', label: 'AI Teaching Suite', category: 'Smart', Icon: MonoAiIcon },
  { id: 'other', label: 'Dashboard Grid', category: 'General', Icon: MonoOthersIcon },
];

export const RenderModuleIcon: React.FC<{
  moduleKey: string;
  DefaultIcon: React.FC<MonoIconProps>;
  size?: number;
  className?: string;
  colorOverride?: string;
}> = ({ moduleKey, DefaultIcon, size = 24, className = '', colorOverride }) => {
  try {
    const cust = StorageService.getCustomization();
    const customUrl = cust?.customIcons?.[moduleKey];
    if (customUrl) {
      return (
        <img
          src={customUrl}
          alt={moduleKey}
          style={{ width: size, height: size }}
          className={`object-contain inline-block shrink-0 ${className}`}
        />
      );
    }
    const builtInId = cust?.cardBuiltInIcons?.[moduleKey];
    const iconColor = colorOverride || cust?.cardIconColors?.[moduleKey] || 'currentColor';
    if (builtInId) {
      const found = BUILT_IN_ICON_LIBRARY.find((item) => item.id === builtInId);
      if (found) {
        const ChosenIcon = found.Icon;
        return <ChosenIcon size={size} className={className} color={iconColor} iconKey={moduleKey} />;
      }
    }
    return <DefaultIcon size={size} className={className} color={iconColor} iconKey={moduleKey} />;
  } catch {
    return <DefaultIcon size={size} className={className} iconKey={moduleKey} />;
  }
};


