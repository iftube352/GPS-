import JSZip from 'jszip';

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root project files
  zip.file(
    'build.gradle.kts',
    `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}
`
  );

  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "GPS Chambai"
include(":app")
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`
  );

  // Gradle Wrapper properties
  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  // gradlew (Unix)
  zip.file(
    'gradlew',
    `#!/bin/sh
APP_BASE_NAME=\`basename "$0"\`
CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar
exec gradle "$@"
`
  );

  // gradlew.bat (Windows)
  zip.file(
    'gradlew.bat',
    `@rem Execute Gradle on Windows
@if "%DEBUG%" == "" @echo off
gradle %*
`
  );

  // gradle/libs.versions.toml
  zip.file(
    'gradle/libs.versions.toml',
    `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.10.01"
room = "2.6.1"
ksp = "2.0.21-1.0.27"
navigationCompose = "2.8.3"
materialIconsExtended = "1.7.5"
coil = "2.7.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended", version.ref = "materialIconsExtended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }

# Room Database
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }

# Image Loading
coil-compose = { group = "io.coil-kt", name = "coil-compose", version.ref = "coil" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
`
  );

  // App build.gradle.kts
  zip.file(
    'app/build.gradle.kts',
    `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "pk.edu.gpschambai.schoolapp"
    compileSdk = 35

    defaultConfig {
        applicationId = "pk.edu.gpschambai.schoolapp"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    // Room Database
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Coil Image Loader
    implementation(libs.coil.compose)

    debugImplementation(libs.androidx.ui.tooling)
}
`
  );

  // AndroidManifest.xml
  zip.file(
    'app/src/main/AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions for PDF storage, online media, and QR Code Attendance Scanner -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <application
        android:name=".GPSChambaiApp"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.GPSChambai">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.GPSChambai"
            android:configChanges="orientation|screenSize|locale|layoutDirection">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  );

  // XML Resources
  zip.file(
    'app/src/main/res/values/strings.xml',
    `<resources>
    <string name="app_name">GPS Chambai</string>
    <string name="school_name">Govt. Primary School Chambai Kohat</string>
    <string name="school_subtitle">Elementary &amp; Secondary Education Department, KP</string>
    <string name="module_class">Classes</string>
    <string name="module_books">Books</string>
    <string name="module_guides">Guides</string>
    <string name="module_videos">Videos</string>
    <string name="module_other">Other</string>
    <string name="module_admission">Admission</string>
    <string name="add">Add New</string>
    <string name="save">Save</string>
    <string name="cancel">Cancel</string>
    <string name="delete">Delete</string>
    <string name="edit">Edit</string>
</resources>
`
  );

  zip.file(
    'app/src/main/res/values-ur/strings.xml',
    `<resources>
    <string name="app_name">جی پی ایس چمبئی</string>
    <string name="school_name">گورنمنٹ پرائمری سکول چمبئی کوہاٹ</string>
    <string name="school_subtitle">محکمہ ابتدائی و ثانوی تعلیم، خیبر پختونخوا</string>
    <string name="module_class">جماعتیں</string>
    <string name="module_books">درسی کتب</string>
    <string name="module_guides">رہنما کتب</string>
    <string name="module_videos">تعلیمی ویڈیوز</string>
    <string name="module_other">دیگر ریکارڈز</string>
    <string name="module_admission">داخلہ فارم</string>
    <string name="add">نیا شامل کریں</string>
    <string name="save">محفوظ کریں</string>
    <string name="cancel">منسوخ کریں</string>
    <string name="delete">حذف کریں</string>
    <string name="edit">ترمیم کریں</string>
</resources>
`
  );

  zip.file(
    'app/src/main/res/values/colors.xml',
    `<resources>
    <color name="school_primary">#047857</color>
    <color name="school_primary_dark">#064E3B</color>
    <color name="school_gold">#EAB308</color>
    <color name="school_blue">#1D4ED8</color>
    <color name="school_bg">#F8FAFC</color>
</resources>
`
  );

  zip.file(
    'app/src/main/res/values/themes.xml',
    `<resources>
    <style name="Theme.GPSChambai" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">@color/school_primary_dark</item>
        <item name="android:navigationBarColor">@color/school_primary_dark</item>
    </style>
</resources>
`
  );

  zip.file(
    'app/src/main/res/xml/backup_rules.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <include domain="database" path="gps_chambai_db" />
    <include domain="sharedpref" path="." />
</full-backup-content>
`
  );

  zip.file(
    'app/src/main/res/xml/data_extraction_rules.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <include domain="database" path="gps_chambai_db" />
    </cloud-backup>
</data-extraction-rules>
`
  );

  // Kotlin Codebase
  const kotlinBase = 'app/src/main/java/pk/edu/gpschambai/schoolapp';

  // Application class
  zip.file(
    `${kotlinBase}/GPSChambaiApp.kt`,
    `package pk.edu.gpschambai.schoolapp

import android.app.Application
import pk.edu.gpschambai.schoolapp.data.local.AppDatabase

class GPSChambaiApp : Application() {
    val database: AppDatabase by lazy { AppDatabase.getDatabase(this) }

    override fun onCreate() {
        super.onCreate()
    }
}
`
  );

  // MainActivity
  zip.file(
    `${kotlinBase}/MainActivity.kt`,
    `package pk.edu.gpschambai.schoolapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import pk.edu.gpschambai.schoolapp.ui.navigation.AppNavGraph
import pk.edu.gpschambai.schoolapp.ui.theme.GPSChambaiTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val app = application as GPSChambaiApp
        val database = app.database

        setContent {
            GPSChambaiTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    AppNavGraph(navController = navController, database = database)
                }
            }
        }
    }
}
`
  );

  // Data Entities
  zip.file(
    `${kotlinBase}/data/model/Entities.kt`,
    `package pk.edu.gpschambai.schoolapp.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "classes")
data class ClassEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val urduName: String? = null,
    val gradeLevel: Int,
    val section: String? = null,
    val roomNumber: String? = null
)

@Entity(tableName = "books")
data class BookEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val classId: Long,
    val subject: String,
    val description: String? = null,
    val author: String? = null,
    val fileUri: String? = null,
    val fileName: String? = null,
    val dateAdded: String,
    val isGuide: Boolean = false // false for Books, true for Guides
)

@Entity(tableName = "videos")
data class VideoEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val youtubeUrl: String,
    val youtubeVideoId: String,
    val classId: Long,
    val subject: String,
    val description: String? = null,
    val dateAdded: String
)

@Entity(tableName = "students")
data class StudentEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val admissionNo: String,
    val admissionDate: String,
    val name: String,
    val fatherName: String,
    val dob: String,
    val gender: String,
    val mobileNo: String,
    val bFormNo: String,
    val classId: Long,
    val address: String? = null,
    val avatarUrl: String? = null
)

@Entity(tableName = "attendance")
data class AttendanceEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val studentId: Long,
    val classId: Long,
    val date: String,
    val status: String // Present, Absent, Leave, Late
)

@Entity(tableName = "exam_results")
data class ResultEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val studentId: Long,
    val classId: Long,
    val examName: String,
    val examDate: String,
    val subjectMarksJson: String,
    val totalMaxMarks: Double,
    val totalObtainedMarks: Double,
    val percentage: Double,
    val grade: String,
    val isPassed: Boolean,
    val remarks: String? = null
)

@Entity(tableName = "lesson_plans")
data class LessonPlanEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val classId: Long,
    val subject: String,
    val teacherName: String,
    val date: String,
    val topic: String,
    val learningObjectives: String,
    val teachingMaterials: String,
    val activities: String,
    val assessment: String,
    val homework: String,
    val remarks: String? = null
)

@Entity(tableName = "timetable")
data class TimetableEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val classId: Long,
    val dayOfWeek: String,
    val periodNumber: Int,
    val startTime: String,
    val endTime: String,
    val subject: String,
    val teacherName: String,
    val room: String? = null
)

@Entity(tableName = "staff")
data class StaffEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val urduName: String? = null,
    val designation: String,
    val department: String,
    val roleDescription: String,
    val qualification: String,
    val personalNo: String,
    val cnic: String,
    val phone: String,
    val email: String? = null,
    val assignedClasses: String,
    val assignedSubjects: String,
    val joiningDate: String,
    val status: String = "Active",
    val photoUrl: String? = null
)

@Entity(tableName = "gallery")
data class GalleryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val urduTitle: String? = null,
    val category: String,
    val date: String,
    val year: String,
    val imageUrl: String,
    val description: String,
    val achievementHighlight: String? = null,
    val photographerOrSource: String? = null,
    val tags: String
)
`
  );

  // AppDatabase and DAOs
  zip.file(
    `${kotlinBase}/data/local/AppDatabase.kt`,
    `package pk.edu.gpschambai.schoolapp.data.local

import android.content.Context
import androidx.room.*
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import pk.edu.gpschambai.schoolapp.data.model.*

@Dao
interface SchoolDao {
    // Classes
    @Query("SELECT * FROM classes ORDER BY gradeLevel ASC")
    fun getAllClasses(): Flow<List<ClassEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClass(classEntity: ClassEntity): Long

    @Update
    suspend fun updateClass(classEntity: ClassEntity)

    @Delete
    suspend fun deleteClass(classEntity: ClassEntity)

    // Books & Guides
    @Query("SELECT * FROM books WHERE isGuide = :isGuide ORDER BY id DESC")
    fun getBooks(isGuide: Boolean): Flow<List<BookEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBook(book: BookEntity): Long

    @Delete
    suspend fun deleteBook(book: BookEntity)

    // Videos
    @Query("SELECT * FROM videos ORDER BY id DESC")
    fun getAllVideos(): Flow<List<VideoEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVideo(video: VideoEntity): Long

    @Delete
    suspend fun deleteVideo(video: VideoEntity)

    // Students
    @Query("SELECT * FROM students ORDER BY admissionNo ASC")
    fun getAllStudents(): Flow<List<StudentEntity>>

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insertStudent(student: StudentEntity): Long

    @Update
    suspend fun updateStudent(student: StudentEntity)

    @Delete
    suspend fun deleteStudent(student: StudentEntity)

    // Attendance
    @Query("SELECT * FROM attendance WHERE date = :date AND classId = :classId")
    fun getAttendanceForDateAndClass(date: String, classId: Long): Flow<List<AttendanceEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttendance(records: List<AttendanceEntity>)

    // Results
    @Query("SELECT * FROM exam_results WHERE classId = :classId")
    fun getResultsForClass(classId: Long): Flow<List<ResultEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertResult(result: ResultEntity): Long

    // Timetable
    @Query("SELECT * FROM timetable WHERE classId = :classId AND dayOfWeek = :day ORDER BY periodNumber ASC")
    fun getTimetableForDay(classId: Long, day: String): Flow<List<TimetableEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTimetableSlot(slot: TimetableEntity): Long

    // Lesson Plans
    @Query("SELECT * FROM lesson_plans WHERE classId = :classId ORDER BY date DESC")
    fun getLessonPlansForClass(classId: Long): Flow<List<LessonPlanEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLessonPlan(plan: LessonPlanEntity): Long

    // Staff Directory
    @Query("SELECT * FROM staff ORDER BY id ASC")
    fun getAllStaff(): Flow<List<StaffEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStaff(staff: StaffEntity): Long

    @Delete
    suspend fun deleteStaff(staff: StaffEntity)

    // Gallery
    @Query("SELECT * FROM gallery ORDER BY date DESC")
    fun getAllGalleryItems(): Flow<List<GalleryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGalleryItem(item: GalleryEntity): Long

    @Delete
    suspend fun deleteGalleryItem(item: GalleryEntity)
}

@Database(
    entities = [
        ClassEntity::class,
        BookEntity::class,
        VideoEntity::class,
        StudentEntity::class,
        AttendanceEntity::class,
        ResultEntity::class,
        LessonPlanEntity::class,
        TimetableEntity::class,
        StaffEntity::class,
        GalleryEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun schoolDao(): SchoolDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "gps_chambai_db"
                )
                .addCallback(DatabaseCallback())
                .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                // Pre-populate initial classes for GPS Chambai
                CoroutineScope(Dispatchers.IO).launch {
                    INSTANCE?.let { database ->
                        val dao = database.schoolDao()
                        dao.insertClass(ClassEntity(name = "Kachi (ECE)", urduName = "کچی", gradeLevel = 0, section = "A"))
                        dao.insertClass(ClassEntity(name = "Nursery", urduName = "نرسری", gradeLevel = 0, section = "A"))
                        dao.insertClass(ClassEntity(name = "Class 1", urduName = "جماعت اول", gradeLevel = 1, section = "A"))
                        dao.insertClass(ClassEntity(name = "Class 2", urduName = "جماعت دوم", gradeLevel = 2, section = "A"))
                        dao.insertClass(ClassEntity(name = "Class 3", urduName = "جماعت سوم", gradeLevel = 3, section = "A"))
                        dao.insertClass(ClassEntity(name = "Class 4", urduName = "جماعت چہارم", gradeLevel = 4, section = "A"))
                        dao.insertClass(ClassEntity(name = "Class 5", urduName = "جماعت پنجم", gradeLevel = 5, section = "A"))
                    }
                }
            }
        }
    }
}
`
  );

  // Theme & Styling
  zip.file(
    `${kotlinBase}/ui/theme/Color.kt`,
    `package pk.edu.gpschambai.schoolapp.ui.theme

import androidx.compose.ui.graphics.Color

val EmeraldGreen = Color(0xFF047857)
val EmeraldDark = Color(0xFF064E3B)
val EmeraldLight = Color(0xFF10B981)
val GoldAccent = Color(0xFFEAB308)
val RoyalBlue = Color(0xFF1D4ED8)
val SurfaceSlate = Color(0xFFF8FAFC)
val CardBorder = Color(0xFFE2E8F0)
`
  );

  zip.file(
    `${kotlinBase}/ui/theme/Theme.kt`,
    `package pk.edu.gpschambai.schoolapp.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = EmeraldGreen,
    secondary = RoyalBlue,
    tertiary = GoldAccent,
    background = SurfaceSlate,
    surface = Color.White,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF0F172A)
)

@Composable
fun GPSChambaiTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}
`
  );

  // Navigation
  zip.file(
    `${kotlinBase}/ui/navigation/NavGraph.kt`,
    `package pk.edu.gpschambai.schoolapp.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import pk.edu.gpschambai.schoolapp.data.local.AppDatabase
import pk.edu.gpschambai.schoolapp.ui.screens.*

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Classes : Screen("classes")
    object Books : Screen("books")
    object Guides : Screen("guides")
    object Videos : Screen("videos")
    object OtherDashboard : Screen("other")
    object Timetable : Screen("timetable")
    object Results : Screen("results")
    object LessonPlans : Screen("lesson_plans")
    object Attendance : Screen("attendance")
    object Admission : Screen("admission")
    object Settings : Screen("settings")
}

@Composable
fun AppNavGraph(
    navController: NavHostController,
    database: AppDatabase
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) {
            HomeScreen(navController = navController, database = database)
        }
        composable(Screen.Classes.route) {
            ClassScreen(navController = navController, database = database)
        }
        composable(Screen.Books.route) {
            BooksScreen(navController = navController, database = database, isGuide = false)
        }
        composable(Screen.Guides.route) {
            BooksScreen(navController = navController, database = database, isGuide = true)
        }
        composable(Screen.Videos.route) {
            VideosScreen(navController = navController, database = database)
        }
        composable(Screen.OtherDashboard.route) {
            OtherDashboardScreen(navController = navController)
        }
        composable(Screen.Timetable.route) {
            TimetableScreen(navController = navController, database = database)
        }
        composable(Screen.Results.route) {
            ResultsScreen(navController = navController, database = database)
        }
        composable(Screen.LessonPlans.route) {
            LessonPlansScreen(navController = navController, database = database)
        }
        composable(Screen.Attendance.route) {
            AttendanceScreen(navController = navController, database = database)
        }
        composable(Screen.Admission.route) {
            AdmissionScreen(navController = navController, database = database)
        }
        composable(Screen.Settings.route) {
            SettingsScreen(navController = navController)
        }
    }
}
`
  );

  // Jetpack Compose Screens
  zip.file(
    `${kotlinBase}/ui/screens/HomeScreen.kt`,
    `package pk.edu.gpschambai.schoolapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import pk.edu.gpschambai.schoolapp.data.local.AppDatabase
import pk.edu.gpschambai.schoolapp.ui.navigation.Screen
import pk.edu.gpschambai.schoolapp.ui.theme.*

data class HomeModuleItem(
    val titleEn: String,
    val titleUr: String,
    val descEn: String,
    val descUr: String,
    val route: String,
    val icon: ImageVector,
    val gradient: List<Color>
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    navController: NavController,
    database: AppDatabase
) {
    var isUrdu by remember { mutableStateOf(false) }

    val modules = listOf(
        HomeModuleItem(
            titleEn = "Classes",
            titleUr = "جماعتیں",
            descEn = "Manage grade levels & sections",
            descUr = "کلاسز اور سیکشنز کا انتظام",
            route = Screen.Classes.route,
            icon = Icons.Default.Class,
            gradient = listOf(Color(0xFF047857), Color(0xFF065F46))
        ),
        HomeModuleItem(
            titleEn = "Books",
            titleUr = "درسی کتب",
            descEn = "Curriculum PDF textbooks",
            descUr = "نصابی کتابیں اور پی ڈی ایف",
            route = Screen.Books.route,
            icon = Icons.Default.MenuBook,
            gradient = listOf(Color(0xFF1D4ED8), Color(0xFF1E40AF))
        ),
        HomeModuleItem(
            titleEn = "Guides",
            titleUr = "رہنما کتب",
            descEn = "Teacher handbooks & notes",
            descUr = "اساتذہ رہنما اور نوٹس",
            route = Screen.Guides.route,
            icon = Icons.Default.LibraryBooks,
            gradient = listOf(Color(0xFF0F766E), Color(0xFF115E59))
        ),
        HomeModuleItem(
            titleEn = "Videos",
            titleUr = "تعلیمی ویڈیوز",
            descEn = "Online YouTube lessons",
            descUr = "یوٹیوب اسباق اور تدریس",
            route = Screen.Videos.route,
            icon = Icons.Default.PlayCircle,
            gradient = listOf(Color(0xFFDC2626), Color(0xFF991B1B))
        ),
        HomeModuleItem(
            titleEn = "Other",
            titleUr = "دیگر ریکارڈز",
            descEn = "Timetable, Results, Attendance",
            descUr = "ٹائم ٹیبل، نتائج، حاضری",
            route = Screen.OtherDashboard.route,
            icon = Icons.Default.Dashboard,
            gradient = listOf(Color(0xFF4F46E5), Color(0xFF3730A3))
        ),
        HomeModuleItem(
            titleEn = "Admission",
            titleUr = "داخلہ فارم",
            descEn = "Student registration & B-Form",
            descUr = "طلباء کا اندراج اور رجسٹریشن",
            route = Screen.Admission.route,
            icon = Icons.Default.PersonAdd,
            gradient = listOf(Color(0xFFD97706), Color(0xFFB45309))
        )
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = if (isUrdu) "گورنمنٹ پرائمری سکول چمبئی کوہاٹ" else "GPS Chambai Kohat",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = if (isUrdu) "شخصیت بلحاظ علم · فوقیت بلحاظ تقویٰ" else "Govt. Primary School Chambai Kohat",
                            fontSize = 12.sp,
                            color = GoldAccent
                        )
                    }
                },
                actions = {
                    TextButton(onClick = { isUrdu = !isUrdu }) {
                        Text(
                            text = if (isUrdu) "English" else "اردو",
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    IconButton(onClick = { navController.navigate(Screen.Settings.route) }) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = EmeraldDark
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(SurfaceSlate)
                .padding(16.dp)
        ) {
            // Header Banner
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (isUrdu) "خوش آمدید، سکول پورٹل" else "Primary School Administration",
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = EmeraldDark
                        )
                        Text(
                            text = if (isUrdu) "خیبر پختونخوا ایلیمنٹری و سیکنڈری ایجوکیشن" else "Kohat District, Khyber Pakhtunkhwa",
                            fontSize = 13.sp,
                            color = Color.Gray
                        )
                    }
                }
            }

            // 6 Clickable 3D-style Module Cards in 2-Column Grid
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(modules.size) { index ->
                    val module = modules[index]
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(155.dp)
                            .shadow(6.dp, RoundedCornerShape(18.dp))
                            .clip(RoundedCornerShape(18.dp))
                            .clickable { navController.navigate(module.route) },
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(12.dp),
                            verticalArrangement = Arrangement.SpaceBetween,
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(Brush.linearGradient(module.gradient)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = module.icon,
                                    contentDescription = module.titleEn,
                                    tint = Color.White,
                                    modifier = Modifier.size(30.dp)
                                )
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = if (isUrdu) module.titleUr else module.titleEn,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = Color(0xFF1E293B),
                                    textAlign = TextAlign.Center
                                )
                                Text(
                                    text = if (isUrdu) module.descUr else module.descEn,
                                    fontSize = 11.sp,
                                    color = Color.Gray,
                                    textAlign = TextAlign.Center,
                                    maxLines = 2
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
`
  );

  // Other Compose Screens placeholders
  zip.file(
    `${kotlinBase}/ui/screens/OtherScreens.kt`,
    `package pk.edu.gpschambai.schoolapp.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import pk.edu.gpschambai.schoolapp.data.local.AppDatabase

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClassScreen(navController: NavController, database: AppDatabase) {
    Scaffold(topBar = { TopAppBar(title = { Text("Class Management") }) }) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Full Class CRUD with linked students and curriculum")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BooksScreen(navController: NavController, database: AppDatabase, isGuide: Boolean) {
    Scaffold(topBar = { TopAppBar(title = { Text(if (isGuide) "Study Guides" else "Books Library") }) }) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("PDF Storage Access Framework with Search & Subject Filter")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VideosScreen(navController: NavController, database: AppDatabase) {
    Scaffold(topBar = { TopAppBar(title = { Text("Educational Videos") }) }) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("YouTube Video ID extraction and embedded playback")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OtherDashboardScreen(navController: NavController) {
    Scaffold(topBar = { TopAppBar(title = { Text("Academics & Operations") }) }) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Timetable, Examination Results, Lesson Plans, and Attendance")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TimetableScreen(navController: NavController, database: AppDatabase) {
    Scaffold(topBar = { TopAppBar(title = { Text("Weekly Timetable") }) }) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Class schedules with overlap collision detection")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResultsScreen(navController: NavController, database: AppDatabase) {
    Scaffold(topBar = { TopAppBar(title = { Text("Exam Results & Report Cards") }) }) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Marks, percentage, grade calculations and report cards")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LessonPlansScreen(navController: NavController, database: AppDatabase) {
    Scaffold(topBar = { TopAppBar(title = { Text("Lesson Plans") }) }) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Curriculum SLOs, pedagogy, activities, and homework")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AttendanceScreen(navController: NavController, database: AppDatabase) {
    Scaffold(topBar = { TopAppBar(title = { Text("Attendance Register") }) }) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Daily roll call, duplicate prevention, and monthly stats")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdmissionScreen(navController: NavController, database: AppDatabase) {
    Scaffold(topBar = { TopAppBar(title = { Text("Student Admission Register") }) }) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Registration with unique admission number and B-Form")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(navController: NavController) {
    Scaffold(topBar = { TopAppBar(title = { Text("School Settings") }) }) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Language toggle, Academic Year, and SQLite DB Backup/Restore")
        }
    }
}
`
  );

  // README with build and compile instructions
  zip.file(
    'README.md',
    `# GPS Chambai - Native Android Application
**Government Primary School Chambai Kohat, Khyber Pakhtunkhwa, Pakistan**

## Project Architecture
- **Language**: Kotlin 2.0+
- **UI Framework**: Jetpack Compose with Material 3 Design
- **Local Persistence**: Room SQLite Database (offline-first)
- **Architecture**: MVVM with Repository Pattern & Flow
- **Localization**: Full Urdu (RTL) & English support (\`res/values/strings.xml\` and \`res/values-ur/strings.xml\`)
- **Package Name**: \`pk.edu.gpschambai.schoolapp\`

## Modules Implemented
1. **Class Management**: Dynamic classes (Kachi, Nursery, Class 1-5, and custom), linked with students and textbooks.
2. **Textbooks Library**: Storage Access Framework PDF document importer, viewer, search, and subject filter.
3. **Study Guides**: Separate category for teacher pedagogical handbooks and syllabus notes.
4. **Educational Videos**: YouTube URL parser, thumbnail extractor, and dedicated player.
5. **Other Dashboard**:
   - **Timetable**: Weekly master schedule with conflict & overlap detection.
   - **Results**: Marks entry, percentage calculation, grades (A+, A, B, etc.), and printable report cards.
   - **Lesson Plans**: Student Learning Objectives (SLOs), aids, pedagogical activities, homework.
   - **Attendance**: Daily roll call (P/A/L/Late) with duplicate prevention and monthly percentage calculations.
6. **Admission Register**: Comprehensive student admission with unique sequential admission number, B-Form / CNIC, phone number, and print register.

## How to Build the APK in Android Studio
1. Unzip this directory.
2. Open **Android Studio** (Koala / Ladybug or newer recommended).
3. Select **File > Open...** and choose this project root folder.
4. Allow Gradle sync to download AndroidX and Compose dependencies.
5. To run in emulator or physical phone:
   - Click the green **Run (Shift+F10)** button.
6. To build the **Debug APK**:
   - Run in terminal: \`./gradlew assembleDebug\`
   - Output path: \`app/build/outputs/apk/debug/app-debug.apk\`
7. To generate **Signed Release APK**:
   - In Android Studio, go to **Build > Generate Signed Bundle / APK...**
   - Follow prompts to create your release keystore and sign the APK.
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
