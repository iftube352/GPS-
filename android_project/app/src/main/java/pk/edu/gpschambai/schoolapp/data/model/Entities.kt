package pk.edu.gpschambai.schoolapp.data.model

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
