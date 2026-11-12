# GPS Chambai - Native Android Application
**Government Primary School Chambai Kohat, Khyber Pakhtunkhwa, Pakistan**

A complete native Android educational management application designed specifically for **Govt. Primary School Chambai Kohat**. Built with Kotlin, Jetpack Compose, Material 3, Room SQLite Database (offline-first), and comprehensive English and Urdu (RTL) localization.

---

## 📱 Modules & Features

1. **Classes (جماعتیں)**
   - Unlimited custom classes (preloaded with Kachi, Nursery, Class 1 to Class 5).
   - Class sections, room assignments, edit, delete with confirmation, and real-time linked statistics (students, books, videos).

2. **Books (درسی کتب)**
   - Curriculum textbook library with Storage Access Framework (SAF) PDF import.
   - Search by title/subject/author, class-wise filtering, and built-in document viewer.

3. **Guides (رہنما کتب)**
   - Separate category for teacher pedagogical handbooks, Single National Curriculum (SNC) outlines, and study guides.

4. **Videos (تعلیمی ویڈیوز)**
   - Educational YouTube lecture integration with official ID validation, thumbnail rendering, dedicated player screen, and fallback "Open in YouTube App".

5. **Other Dashboard (دیگر تعلیمی و انتظامی ریکارڈ)**
   - **Timetable**: Weekly master schedule by class and day (Monday–Saturday) with automated period overlap/conflict detection and printable schedule sheet.
   - **Results**: Marks management with subject-level breakdown, automatic total, percentage, grade (A+, A, B, C, D, F), pass/fail threshold, and printable official Student Report Card.
   - **Lesson Plans**: Teacher instructional plans with Student Learning Objectives (SLOs), pedagogy, activities, assessment, homework, and printable format.
   - **Attendance**: Daily roll call (Present, Absent, Leave, Late) with duplicate entry prevention and monthly percentage attendance analytics.

6. **Admission Register (داخلہ خارج رجسٹر)**
   - Comprehensive student admission form:
     - Admission Number (auto-generated sequential or manual with uniqueness enforcement)
     - Admission Date
     - Student Name & Father's Name
     - Date of Birth & Gender
     - Parent Mobile Number (Pakistan format)
     - NADRA B-Form / CNIC Number
     - Class selection
   - Printable official General Admission & Withdrawal Register.

7. **System & Offline Persistence**
   - Offline-first Room SQLite Database with full backup and restore to JSON.
   - Instant language toggle between English and Urdu with authentic RTL layout.

---

## 🛠️ Requirements & Tech Stack
- **OS**: Android 7.0+ (API level 24 minimum, target API level 35)
- **Language**: Kotlin 2.0+
- **Build System**: Gradle 8.7+ (Android Gradle Plugin 8.7.2)
- **Architecture**: MVVM with Repository Pattern, Kotlin Coroutines, and Flow
- **UI**: Jetpack Compose with Material 3 Design
- **Database**: AndroidX Room SQLite (Entities, DAOs, Database Callback)
- **Package Name**: `pk.edu.gpschambai.schoolapp`

---

## 🚀 How to Build and Run the APK

### Option A: In Android Studio (Recommended)
1. Download the project ZIP using the **"Download Android Studio Project (.ZIP)"** button in the app or extract the `/android_project` folder.
2. Launch **Android Studio** (Koala / Ladybug or newer recommended).
3. Select **File > Open...** and choose the root directory of the project.
4. Allow Gradle sync to complete and download the required AndroidX, Compose, and Room dependencies.
5. Connect your Android phone via USB debugging or start an Android Virtual Device (AVD).
6. Click the green **Run (Shift+F10)** button to install and launch the app.

### Option B: Build APK via Terminal / Command Line
Open your terminal in the project root directory:

#### 1. Build the Debug APK:
\`\`\`bash
./gradlew assembleDebug
\`\`\`
- **Output APK location**:
  \`app/build/outputs/apk/debug/app-debug.apk\`

#### 2. Build the Signed Release APK:
\`\`\`bash
./gradlew assembleRelease
\`\`\`
- **Output APK location**:
  \`app/build/outputs/apk/release/app-release-unsigned.apk\` (or signed via your \`keystore.properties\`)
- Or in Android Studio: Go to **Build > Generate Signed Bundle / APK...**, select **APK**, choose your Keystore, and click **Finish**.
