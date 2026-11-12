package pk.edu.gpschambai.schoolapp.ui.screens

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
