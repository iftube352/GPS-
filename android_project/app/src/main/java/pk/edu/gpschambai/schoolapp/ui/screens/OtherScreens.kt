package pk.edu.gpschambai.schoolapp.ui.screens

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
