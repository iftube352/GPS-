package pk.edu.gpschambai.schoolapp.data.local

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
