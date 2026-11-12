import os, sys, glob, shutil, json, hashlib, struct, zipfile, datetime

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ARCHIVE_DIR = os.path.join(BASE_DIR, 'GPS_CHAMBAI_COMPLETE_ARCHIVE')

print("Starting generation in:", ARCHIVE_DIR)

# 1. Directory Structure Setup
SUBDIRS = [
    '01_ALL_ORIGINAL_PROMPTS',
    '02_PROJECT_SOURCE_CODE',
    '03_UPLOADED_IMAGES',
    '03_UPLOADED_IMAGES/Home',
    '03_UPLOADED_IMAGES/Admission',
    '03_UPLOADED_IMAGES/Staff_Directory',
    '03_UPLOADED_IMAGES/School_Gallery',
    '03_UPLOADED_IMAGES/Videos',
    '03_UPLOADED_IMAGES/Books',
    '03_UPLOADED_IMAGES/Guides',
    '03_UPLOADED_IMAGES/Others',
    '03_UPLOADED_IMAGES/Settings',
    '03_UPLOADED_IMAGES/Navigation',
    '03_UPLOADED_IMAGES/Wallpapers',
    '03_UPLOADED_IMAGES/Unknown_Category',
    '04_LOGOS_AND_ICONS',
    '04_LOGOS_AND_ICONS/School_Logos',
    '04_LOGOS_AND_ICONS/AI_Platform_Logos',
    '04_LOGOS_AND_ICONS/Social_Media_Icons',
    '04_LOGOS_AND_ICONS/Official_Seals_And_Stamps',
    '04_LOGOS_AND_ICONS/App_Launcher_Icons',
    '05_FONTS',
    '05_FONTS/Jameel_Noori_Nastaleeq',
    '05_FONTS/Noto_Nastaliq_Urdu',
    '06_PDF_AND_DOCUMENTS',
    '06_PDF_AND_DOCUMENTS/Official_Forms_And_Performas',
    '07_BACKGROUND_WALLPAPERS',
    '08_OTHER_ASSETS',
    '09_MODULE_WISE_DOCUMENTATION',
    '10_PROJECT_HISTORY',
    '11_ASSET_INVENTORY',
    '12_FINAL_EXPORT_REPORT'
]

if os.path.exists(ARCHIVE_DIR):
    shutil.rmtree(ARCHIVE_DIR)

for sd in SUBDIRS:
    os.makedirs(os.path.join(ARCHIVE_DIR, sd), exist_ok=True)

print("Directories created successfully.")
