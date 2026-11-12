package pk.edu.gpschambai.schoolapp

import android.app.Application
import pk.edu.gpschambai.schoolapp.data.local.AppDatabase

class GPSChambaiApp : Application() {
    val database: AppDatabase by lazy { AppDatabase.getDatabase(this) }

    override fun onCreate() {
        super.onCreate()
    }
}
