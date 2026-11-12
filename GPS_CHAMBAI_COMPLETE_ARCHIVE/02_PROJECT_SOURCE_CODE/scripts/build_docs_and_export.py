# -*- coding: utf-8 -*-
import os, sys, glob, shutil, json, hashlib, struct, zipfile, datetime

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ARCHIVE_DIR = os.path.join(BASE_DIR, 'GPS_CHAMBAI_COMPLETE_ARCHIVE')

print("Generating Source Code Export, Documentation, Excel Inventory, Visual Gallery, and Final Reports...")

# 1. Export Source Code into 02_PROJECT_SOURCE_CODE
src_code_dir = os.path.join(ARCHIVE_DIR, '02_PROJECT_SOURCE_CODE')
os.makedirs(src_code_dir, exist_ok=True)

# Copy src
if os.path.exists(os.path.join(src_code_dir, 'src')):
    shutil.rmtree(os.path.join(src_code_dir, 'src'))
shutil.copytree(os.path.join(BASE_DIR, 'src'), os.path.join(src_code_dir, 'src'), ignore=shutil.ignore_patterns('*.tmp', '*.log'))

# Copy android_project
if os.path.exists(os.path.join(src_code_dir, 'android_project')):
    shutil.rmtree(os.path.join(src_code_dir, 'android_project'))
shutil.copytree(os.path.join(BASE_DIR, 'android_project'), os.path.join(src_code_dir, 'android_project'), ignore=shutil.ignore_patterns('.gradle', 'build', '*.apk', '*.zip'))

# Copy scripts
if os.path.exists(os.path.join(src_code_dir, 'scripts')):
    shutil.rmtree(os.path.join(src_code_dir, 'scripts'))
shutil.copytree(os.path.join(BASE_DIR, 'scripts'), os.path.join(src_code_dir, 'scripts'), ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))

# Copy public
if os.path.exists(os.path.join(src_code_dir, 'public')):
    shutil.rmtree(os.path.join(src_code_dir, 'public'))
shutil.copytree(os.path.join(BASE_DIR, 'public'), os.path.join(src_code_dir, 'public'), ignore=shutil.ignore_patterns('*.apk', '*.zip'))

# Copy root config files
config_files = [
    'package.json', 'tsconfig.json', 'vite.config.ts', 'metadata.json',
    'index.html', 'version-manifest.json', 'firebase-applet-config.json',
    '.env.example', '.gitignore'
]
for cf in config_files:
    src_f = os.path.join(BASE_DIR, cf)
    if os.path.exists(src_f):
        shutil.copy2(src_f, os.path.join(src_code_dir, cf))

print("02_PROJECT_SOURCE_CODE exported successfully.")
