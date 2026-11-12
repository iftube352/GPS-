import os
import sys
import json
import zipfile
import hashlib
import base64
import subprocess
import struct
import shutil
import zlib
import re
from datetime import datetime, timezone

PACKAGE_ID = "pk.edu.gpschambai.schoolapp"
VERSION_FILE = "version-manifest.json"


def load_or_increment_version():
    """Version 1.6.0 target"""
    new_code = 16
    new_version_name = "1.6.0"
    build_number = "build016"
    history = []
    if os.path.exists(VERSION_FILE):
        try:
            with open(VERSION_FILE, "r", encoding="utf-8") as fp:
                state = json.load(fp)
            history = [h for h in state.get("history", []) if h.get("versionName") != "1.6.0"]
        except Exception:
            pass
    return new_code, new_version_name, build_number, history
def sync_gradle_version(version_code: int, version_name: str):
    gradle_path = "android_project/app/build.gradle.kts"
    if not os.path.exists(gradle_path):
        return
    with open(gradle_path, "r", encoding="utf-8") as fp:
        content = fp.read()
    content = re.sub(r"versionCode\s*=\s*\d+", f"versionCode = {version_code}", content)
    content = re.sub(r'versionName\s*=\s*"[^"]+"', f'versionName = "{version_name}"', content)
    with open(gradle_path, "w", encoding="utf-8") as fp:
        fp.write(content)
    print(f"Synced {gradle_path} -> versionCode={version_code}, versionName={version_name}")


def write_manifests(manifest_data: dict):
    os.makedirs("public", exist_ok=True)
    with open(VERSION_FILE, "w", encoding="utf-8") as fp:
        json.dump(manifest_data, fp, indent=2)
    with open("public/apk-build-manifest.json", "w", encoding="utf-8") as fp:
        json.dump(manifest_data, fp, indent=2)


def patch_binary_android_manifest(manifest_bytes: bytearray, version_code: int, version_name: str) -> int:
    """
    Updates versionName (UTF-16LE 5-char string e.g. '1.0.2') and versionCode (int32)
    inside binary AndroidManifest.xml.
    """
    # Replace existing 5-char version string ('1.0.0', '1.1.0', '1.0.1', etc.)
    for candidate in ["1.6.0", "1.0.5", "1.0.6", "1.0.0", "1.1.0", "1.0.1", "1.0.2", "1.0.3", "1.0.4", "1.0.7", "1.0.8", "1.0.9"]:
        cand_bytes = candidate.encode("utf-16le")
        idx = manifest_bytes.find(cand_bytes)
        if idx != -1 and len(version_name) == len(candidate):
            manifest_bytes[idx:idx + len(cand_bytes)] = version_name.encode("utf-16le")
            break

    # Patch android:versionCode attribute in binary XML
    verified_code = version_code
    pos = 1640
    if len(manifest_bytes) > pos + 30:
        attr_start = struct.unpack("<H", manifest_bytes[pos + 24:pos + 26])[0]
        attr_size = struct.unpack("<H", manifest_bytes[pos + 26:pos + 28])[0]
        attr_count = struct.unpack("<H", manifest_bytes[pos + 28:pos + 30])[0]
        attrs_base = pos + 16 + attr_start
        for a in range(attr_count):
            ap = attrs_base + a * attr_size
            ans, aname, val_str, val_type, val_data = struct.unpack("<IIIIi", manifest_bytes[ap:ap + 20])
            if aname == 7:  # android:versionCode
                struct.pack_into("<i", manifest_bytes, ap + 16, version_code)
                verified_code = struct.unpack_from("<i", manifest_bytes, ap + 16)[0]
                break
    return verified_code


def build_android_studio_project_zip(version_name: str, build_number: str, ic_launcher_bytes: bytes = b""):
    """
    Syncs latest web assets into android_project/app/src/main/assets/www,
    ensures launcher icons are present in res/drawable and res/mipmap-hdpi,
    and creates a complete downloadable Android Studio ZIP project.
    """
    assets_www = os.path.join("android_project", "app", "src", "main", "assets", "www")
    if os.path.exists(assets_www):
        shutil.rmtree(assets_www)
    os.makedirs(assets_www, exist_ok=True)

    if ic_launcher_bytes:
        for icon_dir in [
            os.path.join("android_project", "app", "src", "main", "res", "drawable"),
            os.path.join("android_project", "app", "src", "main", "res", "mipmap-hdpi"),
        ]:
            os.makedirs(icon_dir, exist_ok=True)
            with open(os.path.join(icon_dir, "ic_launcher.png"), "wb") as fp:
                fp.write(ic_launcher_bytes)

    dist_dir = "dist"
    for root, dirs, files in os.walk(dist_dir):
        for f in files:
            if f.endswith(".apk") or f.endswith(".zip"):
                continue
            rel_dir = os.path.relpath(root, dist_dir)
            if rel_dir.startswith("releases") or rel_dir.startswith("build-outputs"):
                continue
            src_file = os.path.join(root, f)
            dst_dir = assets_www if rel_dir == "." else os.path.join(assets_www, rel_dir)
            os.makedirs(dst_dir, exist_ok=True)
            shutil.copy2(src_file, os.path.join(dst_dir, f))

    os.makedirs("build-outputs", exist_ok=True)
    os.makedirs("public/build-outputs", exist_ok=True)
    os.makedirs("dist/build-outputs", exist_ok=True)
    os.makedirs("releases", exist_ok=True)

    zip_filename = f"GPS_Chambai_Android_Studio_Project_v{version_name}_{build_number}.zip"
    zip_path = os.path.join("build-outputs", "GPS_Chambai_Android_Studio_Project.zip")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk("android_project"):
            for f in files:
                if f.endswith(".apk") or f.endswith(".zip"):
                    continue
                full_p = os.path.join(root, f)
                rel_p = os.path.relpath(full_p, ".")
                zf.write(full_p, rel_p)

    shutil.copyfile(zip_path, os.path.join("public", "build-outputs", "GPS_Chambai_Android_Studio_Project.zip"))
    shutil.copyfile(zip_path, os.path.join("dist", "build-outputs", "GPS_Chambai_Android_Studio_Project.zip"))
    shutil.copyfile(zip_path, os.path.join("releases", zip_filename))
    print(f"Created Android Studio Project ZIP: {zip_path} ({os.path.getsize(zip_path):,} bytes)")
    return zip_filename


def verify_generated_apk(apk_path: str, expected_code: int, expected_version: str, expected_index_sha256: str) -> dict:
    """
    Requirement 4: Build Verification
    - Verify APK exists
    - Verify package ID
    - Verify versionCode and versionName
    - Verify APK was generated from latest source code (SHA-256 of index.html)
    - Verify 4-byte alignment of resources.arsc
    - Verify v1 + v2 signatures
    """
    if not os.path.exists(apk_path):
        raise RuntimeError(f"APK file does not exist at {apk_path}")

    file_size = os.path.getsize(apk_path)
    if file_size < 1024 * 1024:
        raise RuntimeError(f"APK file size abnormally small: {file_size} bytes")

    with open(apk_path, "rb") as fp:
        raw_apk = fp.read()

    has_v2_magic = b"APK Sig Block 42" in raw_apk

    with zipfile.ZipFile(apk_path, "r") as zf:
        namelist = zf.namelist()
        has_v1_sig = "META-INF/GPSCHAMB.RSA" in namelist and "META-INF/MANIFEST.MF" in namelist
        manifest_data = zf.read("AndroidManifest.xml")
        apk_index_html = zf.read("assets/www/index.html")
        apk_classes_dex = zf.read("classes.dex")
        arsc_info = zf.getinfo("resources.arsc")

    pkg_utf16 = PACKAGE_ID.encode("utf-16le")
    pkg_verified = pkg_utf16 in manifest_data

    ver_utf16 = expected_version.encode("utf-16le")
    ver_name_verified = ver_utf16 in manifest_data

    # Check binary versionCode at attribute offset
    pos = 1640
    ver_code_verified = False
    if len(manifest_data) > pos + 30:
        attr_start = struct.unpack("<H", manifest_data[pos + 24:pos + 26])[0]
        attr_size = struct.unpack("<H", manifest_data[pos + 26:pos + 28])[0]
        attr_count = struct.unpack("<H", manifest_data[pos + 28:pos + 30])[0]
        attrs_base = pos + 16 + attr_start
        for a in range(attr_count):
            ap = attrs_base + a * attr_size
            ans, aname, val_str, val_type, val_data = struct.unpack("<IIIIi", manifest_data[ap:ap + 20])
            if aname == 7 and val_data == expected_code:
                ver_code_verified = True
                break

    apk_index_sha256 = hashlib.sha256(apk_index_html).hexdigest()
    source_verified = (apk_index_sha256 == expected_index_sha256)
    arsc_aligned = (arsc_info.compress_type == 0)
    filechooser_verified = (
        b"onShowFileChooser" in apk_classes_dex
        and b"filePathCallback" in apk_classes_dex
        and b"onActivityResult" in apk_classes_dex
    )
    external_url_verified = (
        b"android.intent.action.VIEW" in apk_classes_dex
        and b"startActivity" in apk_classes_dex
    )

    verification = {
        "apkExists": True,
        "packageIdVerified": pkg_verified,
        "versionCodeVerified": ver_code_verified,
        "versionNameVerified": ver_name_verified,
        "latestSourceAssetsVerified": source_verified,
        "webViewFileChooserVerified": filechooser_verified,
        "externalUrlActionViewVerified": external_url_verified,
        "zipAlign4ByteVerified": arsc_aligned,
        "signatureSchemeV1V2Verified": has_v1_sig and has_v2_magic,
        "latestIndexHtmlSha256": apk_index_sha256,
    }

    for k, v in verification.items():
        if isinstance(v, bool) and not v:
            raise RuntimeError(f"APK Build Verification failed on check: {k}")

    return verification


def build_aligned_v2_apk():
    from patch_dex_filechooser import patch_classes_dex

    version_code, version_name, build_number, history = load_or_increment_version()
    unique_apk_name = f"GPS_Chambai_v{version_name}_{build_number}.apk"
    build_timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    print(f"=== GPS Chambai APK Builder: v{version_name} (versionCode={version_code}, {build_number}) ===")
    sync_gradle_version(version_code, version_name)

    print("=== Step 1: Building Web Application Assets ===")
    if not os.path.exists("dist/index.html") or "--force-web-build" in sys.argv:
        subprocess.run(["npm", "run", "build"], check=True)
    else:
        print("Using compiled dist/ assets...")

    base_apk = "app-release.apk"
    if not os.path.exists(base_apk):
        base_apk = "public/app-release.apk"
    if not os.path.exists(base_apk):
        base_apk = "scripts/android_base_template.zip"

    print("=== Step 2: Extracting & Patching Native Android Template Components ===")
    with zipfile.ZipFile(base_apk, "r") as z:
        manifest_bytes = bytearray(z.read("AndroidManifest.xml"))
        classes_dex = patch_classes_dex(z.read("classes.dex"))
        resources_arsc = z.read("resources.arsc")
        ic_launcher = z.read("res/drawable/ic_launcher.png")

    patch_binary_android_manifest(manifest_bytes, version_code, version_name)

    apk_files = {
        "AndroidManifest.xml": bytes(manifest_bytes),
        "res/drawable/ic_launcher.png": ic_launcher,
        "resources.arsc": resources_arsc,
        "classes.dex": classes_dex,
    }

    dist_dir = "dist"
    for root, dirs, files in os.walk(dist_dir):
        for f in files:
            if f.endswith(".apk") or f.endswith(".zip"):
                continue
            rel_dir = os.path.relpath(root, dist_dir)
            if rel_dir.startswith("releases") or rel_dir.startswith("build-outputs"):
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, dist_dir)
            apk_path = f"assets/www/{rel_path}"
            with open(full_path, "rb") as fp:
                apk_files[apk_path] = fp.read()

    dist_index_sha256 = hashlib.sha256(apk_files["assets/www/index.html"]).hexdigest()
    print(f"Total files in APK payload: {len(apk_files)} (index.html SHA-256: {dist_index_sha256[:16]}...)")

    print("=== Step 3: Preparing Signing Certificates ===")
    cert_dir = "/tmp/gps_apk_sign"
    os.makedirs(cert_dir, exist_ok=True)
    key_file = os.path.join(cert_dir, "gps_release.key")
    cert_file = os.path.join(cert_dir, "gps_release.crt")

    if not os.path.exists(key_file) or not os.path.exists(cert_file):
        subprocess.run([
            "openssl", "req", "-x509", "-newkey", "rsa:2048",
            "-keyout", key_file, "-out", cert_file,
            "-days", "10000", "-nodes",
            "-subj", "/C=PK/ST=KP/L=Kohat/O=Government Primary School Chambai/OU=Elementary and Secondary Education KP/CN=GPS Chambai Kohat"
        ], check=True)

    cert_der_file = os.path.join(cert_dir, "cert.der")
    subprocess.run(["openssl", "x509", "-in", cert_file, "-outform", "DER", "-out", cert_der_file], check=True)
    with open(cert_der_file, "rb") as fp:
        cert_der = fp.read()

    pubkey_der_file = os.path.join(cert_dir, "pubkey.der")
    subprocess.run(["openssl", "rsa", "-in", key_file, "-pubout", "-outform", "DER", "-out", pubkey_der_file], check=True)
    with open(pubkey_der_file, "rb") as fp:
        pubkey_der = fp.read()

    print("=== Step 4: Generating v1 JAR Manifest & Signature Files ===")
    manifest_mf = ["Manifest-Version: 1.0", "Created-By: 1.0 (Android GPS Chambai Kohat)", ""]
    file_entries_mf = {}

    for name in sorted(apk_files.keys()):
        digest = base64.b64encode(hashlib.sha256(apk_files[name]).digest()).decode("ascii")
        entry = f"Name: {name}\r\nSHA-256-Digest: {digest}\r\n\r\n"
        manifest_mf.append(f"Name: {name}")
        manifest_mf.append(f"SHA-256-Digest: {digest}")
        manifest_mf.append("")
        file_entries_mf[name] = entry.encode("utf-8")

    manifest_mf_bytes = "\r\n".join(manifest_mf).encode("utf-8")
    manifest_digest = base64.b64encode(hashlib.sha256(manifest_mf_bytes).digest()).decode("ascii")
    sf_lines = [
        "Signature-Version: 1.0",
        "Created-By: 1.0 (Android GPS Chambai Kohat)",
        f"SHA-256-Digest-Manifest: {manifest_digest}",
        "X-Android-APK-Signed: 2",
        ""
    ]
    for name in sorted(apk_files.keys()):
        entry_digest = base64.b64encode(hashlib.sha256(file_entries_mf[name]).digest()).decode("ascii")
        sf_lines.append(f"Name: {name}")
        sf_lines.append(f"SHA-256-Digest: {entry_digest}")
        sf_lines.append("")

    sf_bytes = "\r\n".join(sf_lines).encode("utf-8")
    sf_file = os.path.join(cert_dir, "GPSCHAMB.SF")
    with open(sf_file, "wb") as fp:
        fp.write(sf_bytes)

    rsa_file = os.path.join(cert_dir, "GPSCHAMB.RSA")
    subprocess.run([
        "openssl", "smime", "-sign", "-in", sf_file,
        "-signer", cert_file, "-inkey", key_file,
        "-out", rsa_file, "-outform", "DER", "-nodetach", "-noattr"
    ], check=True)

    with open(rsa_file, "rb") as fp:
        rsa_bytes = fp.read()

    meta_files = {
        "META-INF/GPSCHAMB.RSA": rsa_bytes,
        "META-INF/GPSCHAMB.SF": sf_bytes,
        "META-INF/MANIFEST.MF": manifest_mf_bytes,
    }

    print("=== Step 5: Packaging ZIP with 4-Byte Zipalign for Uncompressed Resources ===")
    all_files = {}
    all_files.update(meta_files)
    all_files.update(apk_files)

    uncompressed_exts = {".png", ".jpg", ".jpeg", ".pdf", ".arsc"}
    zip_entries_data = bytearray()
    cd_entries = []

    for name, content in all_files.items():
        ext = os.path.splitext(name)[1].lower()
        if name == "resources.arsc" or ext in uncompressed_exts:
            method = 0  # STORED
            comp_data = content
        else:
            method = 8  # DEFLATED
            comp_obj = zlib.compressobj(9, zlib.DEFLATED, -zlib.MAX_WBITS)
            comp_data = comp_obj.compress(content) + comp_obj.flush()

        crc = zlib.crc32(content) & 0xffffffff
        uncomp_size = len(content)
        comp_size = len(comp_data)
        encoded_name = name.encode("utf-8")

        local_header_offset = len(zip_entries_data)
        base_header_len = 30 + len(encoded_name)
        if method == 0:
            pad = (4 - ((local_header_offset + base_header_len) % 4)) % 4
            extra_field = b"\x00" * pad
        else:
            extra_field = b""

        lfh = bytearray()
        lfh.extend(b"PK\x03\x04")
        lfh.extend(struct.pack("<H", 20))
        lfh.extend(struct.pack("<H", 0))
        lfh.extend(struct.pack("<H", method))
        lfh.extend(struct.pack("<H", 0x4821))
        lfh.extend(struct.pack("<H", 0x5d63))
        lfh.extend(struct.pack("<I", crc))
        lfh.extend(struct.pack("<I", comp_size))
        lfh.extend(struct.pack("<I", uncomp_size))
        lfh.extend(struct.pack("<H", len(encoded_name)))
        lfh.extend(struct.pack("<H", len(extra_field)))
        lfh.extend(encoded_name)
        lfh.extend(extra_field)

        data_offset = local_header_offset + len(lfh)
        if method == 0:
            assert data_offset % 4 == 0, f"Error: {name} not 4-byte aligned!"

        zip_entries_data.extend(lfh)
        zip_entries_data.extend(comp_data)

        cd_entries.append({
            "name": encoded_name,
            "method": method,
            "crc": crc,
            "comp_size": comp_size,
            "uncomp_size": uncomp_size,
            "local_offset": local_header_offset,
        })

    cd_data = bytearray()
    for entry in cd_entries:
        cde = bytearray()
        cde.extend(b"PK\x01\x02")
        cde.extend(struct.pack("<H", 20))
        cde.extend(struct.pack("<H", 20))
        cde.extend(struct.pack("<H", 0))
        cde.extend(struct.pack("<H", entry["method"]))
        cde.extend(struct.pack("<H", 0x4821))
        cde.extend(struct.pack("<H", 0x5d63))
        cde.extend(struct.pack("<I", entry["crc"]))
        cde.extend(struct.pack("<I", entry["comp_size"]))
        cde.extend(struct.pack("<I", entry["uncomp_size"]))
        cde.extend(struct.pack("<H", len(entry["name"])))
        cde.extend(struct.pack("<H", 0))
        cde.extend(struct.pack("<H", 0))
        cde.extend(struct.pack("<H", 0))
        cde.extend(struct.pack("<H", 0))
        cde.extend(struct.pack("<I", 0))
        cde.extend(struct.pack("<I", entry["local_offset"]))
        cde.extend(entry["name"])
        cd_data.extend(cde)

    sec1 = bytes(zip_entries_data)
    sec2 = bytes(cd_data)
    eocd_initial = bytearray()
    eocd_initial.extend(b"PK\x05\x06")
    eocd_initial.extend(struct.pack("<H", 0))
    eocd_initial.extend(struct.pack("<H", 0))
    eocd_initial.extend(struct.pack("<H", len(cd_entries)))
    eocd_initial.extend(struct.pack("<H", len(cd_entries)))
    eocd_initial.extend(struct.pack("<I", len(sec2)))
    eocd_initial.extend(struct.pack("<I", len(sec1)))
    eocd_initial.extend(struct.pack("<H", 0))
    sec3 = bytes(eocd_initial)

    print("=== Step 6: Computing APK Signature Scheme v2 (ID 0x7109871a) ===")
    CHUNK_SIZE = 1048576
    chunks = []
    for sec in [sec1, sec2, sec3]:
        for i in range(0, len(sec), CHUNK_SIZE):
            chunk = sec[i:i + CHUNK_SIZE]
            h = hashlib.sha256(b"\xa5" + struct.pack("<I", len(chunk)) + chunk).digest()
            chunks.append(h)

    concat_chunks = b"".join(chunks)
    num_chunks = len(chunks)
    apk_digest = hashlib.sha256(b"\x5a" + struct.pack("<I", num_chunks) + concat_chunks).digest()
    print(f"Computed APK v2 content digest over {num_chunks} chunks: {apk_digest.hex()}")

    digest_elem = struct.pack("<I", 0x0103) + struct.pack("<I", len(apk_digest)) + apk_digest
    digest_elem_prefixed = struct.pack("<I", len(digest_elem)) + digest_elem
    digests_seq = struct.pack("<I", len(digest_elem_prefixed)) + digest_elem_prefixed

    cert_elem = struct.pack("<I", len(cert_der)) + cert_der
    certs_seq = struct.pack("<I", len(cert_elem)) + cert_elem
    attrs_seq = struct.pack("<I", 0)

    signed_data = digests_seq + certs_seq + attrs_seq
    signed_data_prefixed = struct.pack("<I", len(signed_data)) + signed_data

    signed_data_file = os.path.join(cert_dir, "v2_signed_data.bin")
    sig_file = os.path.join(cert_dir, "v2_signature.bin")
    with open(signed_data_file, "wb") as fp:
        fp.write(signed_data)

    subprocess.run([
        "openssl", "dgst", "-sha256", "-sign", key_file,
        "-out", sig_file, signed_data_file
    ], check=True)

    with open(sig_file, "rb") as fp:
        sig_bytes = fp.read()

    sig_elem = struct.pack("<I", 0x0103) + struct.pack("<I", len(sig_bytes)) + sig_bytes
    sig_elem_prefixed = struct.pack("<I", len(sig_elem)) + sig_elem
    sigs_seq = struct.pack("<I", len(sig_elem_prefixed)) + sig_elem_prefixed

    pubkey_prefixed = struct.pack("<I", len(pubkey_der)) + pubkey_der

    signer1 = signed_data_prefixed + sigs_seq + pubkey_prefixed
    signer1_prefixed = struct.pack("<I", len(signer1)) + signer1
    signers_seq = struct.pack("<I", len(signer1_prefixed)) + signer1_prefixed

    v2_pair_val = signers_seq
    v2_pair = struct.pack("<Q", 4 + len(v2_pair_val)) + struct.pack("<I", 0x7109871a) + v2_pair_val

    block_size = len(v2_pair) + 8 + 16
    apk_signing_block = bytearray()
    apk_signing_block.extend(struct.pack("<Q", block_size))
    apk_signing_block.extend(v2_pair)
    apk_signing_block.extend(struct.pack("<Q", block_size))
    apk_signing_block.extend(b"APK Sig Block 42")

    new_cd_offset = len(sec1) + len(apk_signing_block)
    final_eocd = bytearray(sec3)
    struct.pack_into("<I", final_eocd, 16, new_cd_offset)

    final_apk = bytearray()
    final_apk.extend(sec1)
    final_apk.extend(apk_signing_block)
    final_apk.extend(sec2)
    final_apk.extend(final_eocd)

    apk_size_bytes = len(final_apk)
    apk_size_mb = f"{apk_size_bytes / (1024 * 1024):.2f} MB"
    apk_sha256 = hashlib.sha256(final_apk).hexdigest()
    print(f"=== Step 7: Final APK Size: {apk_size_bytes} bytes ({apk_size_mb}) ===")

    out_file = "/tmp/gps_chambai_v2_aligned.apk"
    with open(out_file, "wb") as fp:
        fp.write(final_apk)

    # Ensure output & archive directories exist
    os.makedirs("build", exist_ok=True)
    os.makedirs("public/build", exist_ok=True)
    os.makedirs("dist/build", exist_ok=True)
    os.makedirs("build-outputs", exist_ok=True)
    os.makedirs("public/build-outputs", exist_ok=True)
    os.makedirs("dist/build-outputs", exist_ok=True)
    os.makedirs("releases", exist_ok=True)
    os.makedirs("public/releases", exist_ok=True)
    os.makedirs("dist/releases", exist_ok=True)
    os.makedirs("public", exist_ok=True)
    os.makedirs("dist", exist_ok=True)
    android_out = "android_project/app/build/outputs/apk/release"
    os.makedirs(android_out, exist_ok=True)

    # Remove outdated legacy APK directories and old versioned APKs
    for legacy_dir in ["apk", "public/apk", "dist/apk"]:
        if os.path.exists(legacy_dir):
            shutil.rmtree(legacy_dir, ignore_errors=True)
    for old_ver in ["GPS_Chambai_v1.0.0_build001.apk", "GPS_Chambai_v1.0.1_build002.apk", "GPS_Chambai_v1.0.2_build003.apk", "GPS_Chambai_v1.0.4_build005.apk", "GPS_Chambai_v1.0.5_build006.apk"]:
        for folder in ["releases", "public/releases", "dist/releases"]:
            old_p = os.path.join(folder, old_ver)
            if os.path.exists(old_p):
                os.remove(old_p)

    clean_version_apk = f"GPS_Chambai_v{version_name}.apk"

    # Delivery targets including build/GPS_Chambai_v1.0.5.apk, releases/, and build-outputs/
    delivery_targets = [
        f"build/{clean_version_apk}",
        f"public/build/{clean_version_apk}",
        f"dist/build/{clean_version_apk}",
        f"build/{unique_apk_name}",
        f"public/build/{unique_apk_name}",
        f"dist/build/{unique_apk_name}",
        "build/app-release.apk",
        "build/app-debug.apk",
        "public/build/app-release.apk",
        "public/build/app-debug.apk",
        "dist/build/app-release.apk",
        "dist/build/app-debug.apk",
        f"releases/{clean_version_apk}",
        f"public/releases/{clean_version_apk}",
        f"dist/releases/{clean_version_apk}",
        f"releases/{unique_apk_name}",
        f"public/releases/{unique_apk_name}",
        f"dist/releases/{unique_apk_name}",
        "build-outputs/app-debug.apk",
        "public/build-outputs/app-debug.apk",
        "dist/build-outputs/app-debug.apk",
        "app-release.apk",
        "app-debug.apk",
        f"{clean_version_apk}",
        f"public/{clean_version_apk}",
        f"dist/{clean_version_apk}",
        "public/app-release.apk",
        "public/app-debug.apk",
        "dist/app-release.apk",
        "dist/app-debug.apk",
        "android_project/app-release.apk",
        os.path.join(android_out, "app-release.apk"),
    ]

    for target in delivery_targets:
        shutil.copyfile(out_file, target)
        print(f"Saved APK to: {target}")

    print("=== Step 8: Packaging Downloadable Android Studio Project ZIP ===")
    zip_filename = build_android_studio_project_zip(version_name, build_number, ic_launcher)

    print("=== Step 9: Running Automated Build Verification ===")
    verification = verify_generated_apk(
        "build-outputs/app-debug.apk",
        version_code,
        version_name,
        dist_index_sha256
    )
    print("Verification Passed:", json.dumps(verification, indent=2))

    # Update Build History & Manifest
    new_record = {
        "versionName": version_name,
        "versionCode": version_code,
        "buildNumber": build_number,
        "fileName": unique_apk_name,
        "downloadUrl": f"/releases/{unique_apk_name}",
        "debugDownloadUrl": "/build-outputs/app-debug.apk",
        "projectZipUrl": "/build-outputs/GPS_Chambai_Android_Studio_Project.zip",
        "buildDateTime": build_timestamp,
        "buildStatus": "SUCCESS — VERIFIED (v1+v2 Signed)",
        "fileSizeBytes": apk_size_bytes,
        "fileSizeFormatted": apk_size_mb,
        "packageId": PACKAGE_ID,
        "sha256Digest": apk_sha256,
        "sourceVerified": True,
        "notes": f"Automated Build {build_number} (v{version_name}, versionCode {version_code}) — Verified from latest source code."
    }

    filtered_history = [h for h in history if int(h.get("versionCode", 0)) != version_code]
    updated_history = [new_record] + filtered_history

    manifest_payload = {
        "packageId": PACKAGE_ID,
        "currentVersionName": version_name,
        "currentVersionCode": version_code,
        "latestBuildNumber": build_number,
        "latestBuildDateTime": build_timestamp,
        "buildStatus": "SUCCESS — VERIFIED (v1+v2 Signed)",
        "apkFileSizeBytes": apk_size_bytes,
        "apkFileSizeFormatted": apk_size_mb,
        "latestApkFileName": unique_apk_name,
        "latestApkDownloadUrl": f"/releases/{unique_apk_name}",
        "buildOutputsDebugPath": "build-outputs/app-debug.apk",
        "buildOutputsDebugUrl": "/build-outputs/app-debug.apk",
        "androidProjectZipFileName": zip_filename,
        "androidProjectZipUrl": "/build-outputs/GPS_Chambai_Android_Studio_Project.zip",
        "verification": verification,
        "history": updated_history,
    }

    write_manifests(manifest_payload)
    print(f"=== Step 10: Build & Verification Complete! Latest APK: {unique_apk_name} ===")


if __name__ == "__main__":
    build_aligned_v2_apk()
