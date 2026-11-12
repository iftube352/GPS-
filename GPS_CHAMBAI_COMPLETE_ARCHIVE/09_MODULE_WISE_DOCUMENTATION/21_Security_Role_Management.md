# Authentication & Role-Based Access Control (سیکیورٹی و اختیارات)
**Module Identifier**: `21_Security_Role_Management`
**Software System**: Government Primary School (GPS) Chambai Management Portal

---

## 1. Module Overview & Scope
Firebase-authenticated access control system defining four operational roles: Public Guest (read-only view), Student/Parent (individual profile/results), Teacher (marks entry, attendance, diary), and Headmaster/Administrator (full system control).

## 2. Associated Source Code Files
- `src/components/Auth.tsx`
- `src/context/AuthContext.tsx`
- `firestore.rules`

## 3. Associated Media Assets & Documents
- Microsoft_Profile_78e13ce1.png

## 4. Key Functional Features
- **Bilingual Interface**: Full bidirectional support for Urdu (Jameel Noori / Noto Nastaliq) and English (Inter / Sans-serif).
- **Responsive Layout**: Designed for mobile viewport (360px - 480px), tablet (768px - 1024px), and desktop monitor displays.
- **Offline Resiliency**: Client-side localStorage persistence and PWA service worker caching.
- **Export Capabilities**: Direct print styles and Excel/CSV data exports.

## 5. Historical Evolution & Status
- **Initial Implementation**: Version 1.0.0 (Release 001 - 2026-11-04)
- **Latest Modification**: Version 1.0.5 (Release 006 - 2026-11-06)
- **Status**: Production Verified & Archived.
