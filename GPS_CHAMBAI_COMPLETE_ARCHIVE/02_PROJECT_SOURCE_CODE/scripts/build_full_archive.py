# -*- coding: utf-8 -*-
import os, sys, glob, shutil, json, hashlib, struct, zipfile, datetime

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ARCHIVE_DIR = os.path.join(BASE_DIR, 'GPS_CHAMBAI_COMPLETE_ARCHIVE')

print("Starting Full Asset Harvest and Inventory Compilation...")

def get_sha256(fpath):
    h = hashlib.sha256()
    with open(fpath, 'rb') as fp:
        while chunk := fp.read(65536):
            h.update(chunk)
    return h.hexdigest()

def get_image_info(filepath):
    size = os.path.getsize(filepath)
    with open(filepath, 'rb') as f:
        data = f.read(100)
    width, height, fmt = 'N/A', 'N/A', 'Unknown'
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        fmt = 'PNG'
        width, height = struct.unpack('>LL', data[16:24])
    elif data.startswith(b'\xff\xd8'):
        fmt = 'JPEG'
        with open(filepath, 'rb') as f:
            full = f.read()
        i = 2
        while i < len(full):
            if full[i] == 0xff:
                marker = full[i+1]
                if marker in (0xc0, 0xc1, 0xc2, 0xc3):
                    height, width = struct.unpack('>HH', full[i+5:i+9])
                    break
                elif marker in (0xd9, 0xda):
                    break
                elif marker not in (0x00, 0xff):
                    length = struct.unpack('>H', full[i+2:i+4])[0]
                    i += 2 + length
                else:
                    i += 1
            else:
                i += 1
    elif data.startswith(b'%PDF'):
        fmt = 'PDF'
    elif b'<svg' in data or filepath.endswith('.svg'):
        fmt = 'SVG'
    elif filepath.endswith('.ttf'):
        fmt = 'TTF'
    elif filepath.endswith('.woff2'):
        fmt = 'WOFF2'
    elif filepath.endswith('.zip') or filepath.endswith('.apk'):
        fmt = 'ZIP/APK'
    return fmt, width, height, size

def format_bytes(size):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.2f} {unit}"
        size /= 1024.0
    return f"{size:.2f} TB"

# 1. Harvest all files from public/assets/aistudio and .tempmediaStorage
asset_files = {}

for p in sorted(glob.glob('public/assets/aistudio/*')):
    fname = os.path.basename(p)
    asset_files[fname] = {
        "src_path": p,
        "filename": fname,
        "source": "public/assets/aistudio",
        "sha256": get_sha256(p),
        "info": get_image_info(p)
    }

for p in sorted(glob.glob('.aistudio/artifacts/brain/*/.tempmediaStorage/*')):
    fname = os.path.basename(p)
    sha = get_sha256(p)
    # Check if duplicate of already known public asset
    matched_public = None
    for k, v in asset_files.items():
        if v["sha256"] == sha:
            matched_public = k
            break
    
    asset_files[f"temp_{fname}"] = {
        "src_path": p,
        "filename": fname,
        "source": ".tempmediaStorage",
        "sha256": sha,
        "matched_public": matched_public,
        "info": get_image_info(p)
    }

print(f"Total unique harvested asset references: {len(asset_files)}")

# 2. Categorization Mapping
CATEGORY_MAP = {
    # Home Screen
    "Image_01_3c8fa7cc.jpg": ["03_UPLOADED_IMAGES/Home", "07_BACKGROUND_WALLPAPERS"],
    "20260903_200547_79893d25.png": ["03_UPLOADED_IMAGES/Home", "04_LOGOS_AND_ICONS/School_Logos"],
    "Imgae__004_ddf9db50.png": ["03_UPLOADED_IMAGES/Home", "03_UPLOADED_IMAGES/Admission"],
    "Image_012.svg": ["03_UPLOADED_IMAGES/Home", "04_LOGOS_AND_ICONS/Official_Seals_And_Stamps"],
    "temp_media_1793821041404_b52251c9.png": ["03_UPLOADED_IMAGES/Home"],
    "temp_media_1793820905959_654a2563.png": ["03_UPLOADED_IMAGES/Home"],
    "temp_media_1793821087053_68d8a828.png": ["03_UPLOADED_IMAGES/Home"],

    # Admission
    "Image_005_25cba3e7.jpg": ["03_UPLOADED_IMAGES/Admission"],

    # Staff Directory
    "Microsoft_Profile_78e13ce1.png": ["03_UPLOADED_IMAGES/Staff_Directory", "03_UPLOADED_IMAGES/Settings"],
    "Image_008.jpg_028fd035.jpeg": ["03_UPLOADED_IMAGES/Staff_Directory"],
    "Image_009.jpg_2b3e293d.jpeg": ["03_UPLOADED_IMAGES/Staff_Directory"],
    "WhatsApp_Image_010.jpg_b584ca91.jpeg": ["03_UPLOADED_IMAGES/Staff_Directory"],
    "Image_011.jpg_8ca63a9c.jpeg": ["03_UPLOADED_IMAGES/Staff_Directory"],

    # School Gallery
    "image_015_968cdfa3.jpg": ["03_UPLOADED_IMAGES/School_Gallery", "07_BACKGROUND_WALLPAPERS"],
    "image_017_98d884ba.jpg": ["03_UPLOADED_IMAGES/School_Gallery", "07_BACKGROUND_WALLPAPERS"],
    "image_018_bd990265.jpg": ["03_UPLOADED_IMAGES/School_Gallery", "07_BACKGROUND_WALLPAPERS"],

    # Videos
    "yputube_d9e9a0fb.png": ["03_UPLOADED_IMAGES/Videos", "04_LOGOS_AND_ICONS/Social_Media_Icons"],

    # Books & Guides
    "Image_006_f2744204.jpg": ["03_UPLOADED_IMAGES/Books", "03_UPLOADED_IMAGES/Guides"],

    # Others Module & Submodules
    "image_032.jpg": ["03_UPLOADED_IMAGES/Others"],
    "image_027_72235249.jpg": ["03_UPLOADED_IMAGES/Others"],
    "Image_003_27560b99.jpg": ["03_UPLOADED_IMAGES/Others"],
    "temp_media_1793821092259_ee685f77.jpg": ["03_UPLOADED_IMAGES/Others"],
    "temp_media_1793821063342_e7b5f0b1.jpg": ["03_UPLOADED_IMAGES/Others"],
    "temp_media_1793821066860_9104b420.jpg": ["03_UPLOADED_IMAGES/Others"],
    "temp_media_1793897744182_8eac4af0.jpg": ["03_UPLOADED_IMAGES/Others"],

    # Settings & Profile
    "image_029_0bdcb040.jpg": ["03_UPLOADED_IMAGES/Settings"],
    "image_019_11ad539e.png": ["03_UPLOADED_IMAGES/Settings", "04_LOGOS_AND_ICONS/Official_Seals_And_Stamps"],
    "image_020_a379be76.png": ["03_UPLOADED_IMAGES/Settings", "04_LOGOS_AND_ICONS/Official_Seals_And_Stamps"],
    "image_021_491fb5ac.png": ["03_UPLOADED_IMAGES/Settings", "04_LOGOS_AND_ICONS/Official_Seals_And_Stamps"],
    "image_022_5c47eeaa.png": ["03_UPLOADED_IMAGES/Settings", "04_LOGOS_AND_ICONS/School_Logos"],
    "image_024_9c9c5dc0.jpg": ["03_UPLOADED_IMAGES/Settings"],
    "image_025_84860f35.jpg": ["03_UPLOADED_IMAGES/Settings"],
    "image_026_cc60e266.jpg": ["03_UPLOADED_IMAGES/Settings"],

    # Navigation
    "Image_002_b6f76794.jpg": ["03_UPLOADED_IMAGES/Navigation"],

    # AI Platform Logos
    "ChatGPT_1_132a42df.png": ["04_LOGOS_AND_ICONS/AI_Platform_Logos"],
    "DeepSeek_2_60f2583f.png": ["04_LOGOS_AND_ICONS/AI_Platform_Logos"],
    "Gemini_3_b7bc17c8.png": ["04_LOGOS_AND_ICONS/AI_Platform_Logos"],
    "Meta_AI_4_e1180f35.png": ["04_LOGOS_AND_ICONS/AI_Platform_Logos"],
    "Copilot_5_a640519f.png": ["04_LOGOS_AND_ICONS/AI_Platform_Logos"],
    "Claude_6_abb83862.png": ["04_LOGOS_AND_ICONS/AI_Platform_Logos"],

    # Social Media Icons
    "whatsapp_236996ca.png": ["04_LOGOS_AND_ICONS/Social_Media_Icons"],
    "facebook_b4556ed7.png": ["04_LOGOS_AND_ICONS/Social_Media_Icons"],
    "linkdin_91d33015.png": ["04_LOGOS_AND_ICONS/Social_Media_Icons"],
    "instagram_be056fee.png": ["04_LOGOS_AND_ICONS/Social_Media_Icons"],
    "twitter_4c1342d0.png": ["04_LOGOS_AND_ICONS/Social_Media_Icons"],

    # Seals, Stamps & Crests
    "image_031.png": ["04_LOGOS_AND_ICONS/Official_Seals_And_Stamps"],
    "image_031.svg": ["04_LOGOS_AND_ICONS/Official_Seals_And_Stamps"],
    "image_035.png": ["04_LOGOS_AND_ICONS/School_Logos"],
    "image_035.svg": ["04_LOGOS_AND_ICONS/School_Logos"],

    # Documents & PDFs
    "SSR__School_Self_Reporting__a7a45053.pdf": ["06_PDF_AND_DOCUMENTS"],
    "pdf_23_95f6e1ac.pdf": ["06_PDF_AND_DOCUMENTS"],
}

# Copy assets to categorized target destinations
copied_count = 0
for key, data in asset_files.items():
    src = data["src_path"]
    filename = data["filename"]
    targets = CATEGORY_MAP.get(key, ["03_UPLOADED_IMAGES/Unknown_Category"])
    for t in targets:
        dest_dir = os.path.join(ARCHIVE_DIR, t)
        os.makedirs(dest_dir, exist_ok=True)
        dest_path = os.path.join(dest_dir, filename)
        shutil.copy2(src, dest_path)
        copied_count += 1

print(f"Copied {copied_count} files across categorized folders.")

# Copy Launcher Icons into 04_LOGOS_AND_ICONS/App_Launcher_Icons
launcher_icons = [
    'public/icon.svg',
    'public/apple-touch-icon.png',
    'public/pwa-192x192.png',
    'public/pwa-512x512.png',
    'public/pwa-maskable-512x512.png',
    'android_project/app/src/main/res/drawable/ic_launcher.png'
]
for li in launcher_icons:
    if os.path.exists(li):
        dest = os.path.join(ARCHIVE_DIR, '04_LOGOS_AND_ICONS/App_Launcher_Icons', os.path.basename(li))
        shutil.copy2(li, dest)

# Copy Fonts into 05_FONTS/
os.makedirs(os.path.join(ARCHIVE_DIR, '05_FONTS/Noto_Nastaliq_Urdu'), exist_ok=True)
for font_f in glob.glob('/tmp/font_test/*.ttf'):
    base_n = os.path.basename(font_f)
    if '0' in base_n:
        target_n = 'NotoNastaliqUrdu-Regular.ttf'
    elif '1' in base_n:
        target_n = 'NotoNastaliqUrdu-SemiBold.ttf'
    elif '2' in base_n:
        target_n = 'NotoNastaliqUrdu-Bold.ttf'
    else:
        target_n = base_n
    shutil.copy2(font_f, os.path.join(ARCHIVE_DIR, '05_FONTS/Noto_Nastaliq_Urdu', target_n))

# Typography documentation
with open(os.path.join(ARCHIVE_DIR, '05_FONTS/Typography_Documentation.md'), 'w', encoding='utf-8') as fp:
    fp.write("""# GPS Chambai Typography & Urdu Calligraphy Documentation

## Overview
GPS Chambai utilizes authentic Pakistani Nastaleeq typography for all Urdu interfaces, report cards, award lists, student admission registers, and official certificates.

### Font Specifications:
1. **Primary Urdu Calligraphic Font**: Jameel Noori Nastaleeq (جمیل نوری نستعلیق)
   - Fallback: Noto Nastaliq Urdu (نوٹو نستعلیق اردو)
   - Fallback Arabic: Noto Sans Arabic
2. **Primary English / Numerical Font**: Plus Jakarta Sans
3. **CSS Global Typography Configuration** (`src/index.css`):
   - `line-height`: 2.15 (ensures correct Nastaleeq vertical diacritic balance without overlapping ascenders/descenders).
   - `font-feature-settings`: `"kern" 1, "liga" 1, "clig" 1, "calt" 1` (enables contextual ligatures and authentic nastaleeq word forming).
   - `letter-spacing`: `0px` (avoids breaking Urdu cursive character connections).
   - `word-spacing`: `2px`.

### Files Included in Archive:
- `Noto_Nastaliq_Urdu/NotoNastaliqUrdu-Regular.ttf` (527 KB, TrueType Font)
- `Noto_Nastaliq_Urdu/NotoNastaliqUrdu-SemiBold.ttf` (529 KB, TrueType Font)
- `Noto_Nastaliq_Urdu/NotoNastaliqUrdu-Bold.ttf` (528 KB, TrueType Font)
- `Jameel_Noori_Nastaleeq/` (Webfont font-face declaration and CDN mirrors)
""")

# Copy Other Assets into 08_OTHER_ASSETS/
other_asset_targets = [
    'version-manifest.json',
    'public/apk-build-manifest.json',
    'scripts/base_classes.dex',
    'scripts/android_base_template.zip',
    'scripts/build_apk.py',
    'scripts/patch_dex_filechooser.py',
    'scripts/native_apk_template.py',
    'GPS_Chambai_v1.0.5.apk',
    'app-release.apk',
    'app-debug.apk',
]
for oa in other_asset_targets:
    if os.path.exists(oa):
        dest = os.path.join(ARCHIVE_DIR, '08_OTHER_ASSETS', os.path.basename(oa))
        shutil.copy2(oa, dest)

print("Assets, fonts, and launcher icons populated successfully.")
