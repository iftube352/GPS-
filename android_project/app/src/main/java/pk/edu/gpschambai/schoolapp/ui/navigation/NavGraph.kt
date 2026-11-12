package pk.edu.gpschambai.schoolapp.ui.navigation

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
