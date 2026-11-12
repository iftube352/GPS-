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

print("Helper functions ready.")
