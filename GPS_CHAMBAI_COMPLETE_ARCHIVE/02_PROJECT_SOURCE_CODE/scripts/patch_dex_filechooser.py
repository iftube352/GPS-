"""
Patches classes.dex to implement:
1. MainActivity.filePathCallback : Landroid/webkit/ValueCallback;
2. MainActivity$2.onShowFileChooser(WebView, ValueCallback<Uri[]>, WebChromeClient.FileChooserParams) -> boolean
3. MainActivity.onActivityResult(int, int, Intent) -> void

Ensures Android WebView file selection (<input type="file" accept="image/*">) works on
Samsung Galaxy S25 (Android 16/17 / One UI 8.5/9) and all Android versions.
"""

import struct
import hashlib
import zlib


def read_uleb128(buf: bytes, pos: int):
    result = 0
    shift = 0
    while True:
        b = buf[pos]
        pos += 1
        result |= (b & 0x7F) << shift
        if (b & 0x80) == 0:
            break
        shift += 7
    return result, pos


def write_uleb128(val: int) -> bytes:
    out = bytearray()
    while True:
        byte = val & 0x7F
        val >>= 7
        if val != 0:
            byte |= 0x80
        out.append(byte)
        if val == 0:
            break
    return bytes(out)


def write_sleb128(val: int) -> bytes:
    out = bytearray()
    more = True
    while more:
        byte = val & 0x7F
        val >>= 7
        if (val == 0 and (byte & 0x40) == 0) or (val == -1 and (byte & 0x40) != 0):
            more = False
        else:
            byte |= 0x80
        out.append(byte)
    return bytes(out)


def patch_classes_dex(dex: bytes) -> bytes:
    import os
    # Always start from clean base_classes.dex if available so all patches apply cleanly
    base_dex_path = os.path.join(os.path.dirname(__file__), "base_classes.dex")
    if os.path.exists(base_dex_path):
        with open(base_dex_path, "rb") as fp:
            dex = fp.read()
    elif b"onShowFileChooser" in dex and b"android.intent.action.VIEW" in dex:
        print("classes.dex already contains onShowFileChooser + ACTION_VIEW external URL handler.")
        return dex

    string_ids_size, string_ids_off = struct.unpack_from("<II", dex, 56)
    type_ids_size, type_ids_off = struct.unpack_from("<II", dex, 64)
    proto_ids_size, proto_ids_off = struct.unpack_from("<II", dex, 72)
    field_ids_size, field_ids_off = struct.unpack_from("<II", dex, 80)
    method_ids_size, method_ids_off = struct.unpack_from("<II", dex, 88)
    class_defs_size, class_defs_off = struct.unpack_from("<II", dex, 96)

    # 1. Read original strings (preserve raw MUTF-8 bytes + utf16_len)
    orig_strings = []
    for i in range(string_ids_size):
        off = struct.unpack_from("<I", dex, string_ids_off + i * 4)[0]
        u_len, p = read_uleb128(dex, off)
        end = dex.index(0, p)
        s_bytes = dex[p:end]
        s_str = s_bytes.decode("utf-8", errors="surrogateescape")
        orig_strings.append((s_str, u_len, s_bytes))

    string_map_bytes = {s_str: (u_len, s_bytes) for (s_str, u_len, s_bytes) in orig_strings}

    def ensure_string(s: str):
        if s not in string_map_bytes:
            b = s.encode("utf-8")
            string_map_bytes[s] = (len(s), b)

    # 2. Read original types
    orig_types = [
        orig_strings[struct.unpack_from("<I", dex, type_ids_off + i * 4)[0]][0]
        for i in range(type_ids_size)
    ]

    # 3. Read original protos: (shorty_str, ret_type_str, tuple(param_type_strs))
    orig_protos = []
    for i in range(proto_ids_size):
        sh_idx, ret_idx, params_off = struct.unpack_from("<III", dex, proto_ids_off + i * 12)
        params = []
        if params_off != 0:
            sz = struct.unpack_from("<I", dex, params_off)[0]
            for j in range(sz):
                t_idx = struct.unpack_from("<H", dex, params_off + 4 + j * 2)[0]
                params.append(orig_types[t_idx])
        orig_protos.append((orig_strings[sh_idx][0], orig_types[ret_idx], tuple(params)))

    # 4. Read original fields: (class_type_str, field_type_str, name_str)
    orig_fields = []
    for i in range(field_ids_size):
        c_idx, t_idx, n_idx = struct.unpack_from("<HHI", dex, field_ids_off + i * 8)
        orig_fields.append((orig_types[c_idx], orig_types[t_idx], orig_strings[n_idx][0]))

    # 5. Read original methods: (class_type_str, proto_tuple, name_str)
    orig_methods = []
    for i in range(method_ids_size):
        c_idx, p_idx, n_idx = struct.unpack_from("<HHI", dex, method_ids_off + i * 8)
        orig_methods.append((orig_types[c_idx], orig_protos[p_idx], orig_strings[n_idx][0]))

    # 6. Read original classes and their methods/fields
    orig_classes = []
    for i in range(class_defs_size):
        c_idx, flags, super_idx, iface_off, src_idx, ann_off, data_off_c, static_off = (
            struct.unpack_from("<IIIIIIII", dex, class_defs_off + i * 32)
        )
        c_type = orig_types[c_idx]
        super_type = orig_types[super_idx]
        src_str = orig_strings[src_idx][0] if src_idx != 0xFFFFFFFF else None

        p = data_off_c
        sf_size, p = read_uleb128(dex, p)
        if_size, p = read_uleb128(dex, p)
        dm_size, p = read_uleb128(dex, p)
        vm_size, p = read_uleb128(dex, p)

        sfields = []
        f_idx = 0
        for _ in range(sf_size):
            d, p = read_uleb128(dex, p)
            f_idx += d
            fl, p = read_uleb128(dex, p)
            sfields.append((orig_fields[f_idx], fl))

        ifields = []
        f_idx = 0
        for _ in range(if_size):
            d, p = read_uleb128(dex, p)
            f_idx += d
            fl, p = read_uleb128(dex, p)
            ifields.append((orig_fields[f_idx], fl))

        dmethods = []
        m_idx = 0
        for _ in range(dm_size):
            d, p = read_uleb128(dex, p)
            m_idx += d
            fl, p = read_uleb128(dex, p)
            co, p = read_uleb128(dex, p)
            dmethods.append((orig_methods[m_idx], fl, co))

        vmethods = []
        m_idx = 0
        for _ in range(vm_size):
            d, p = read_uleb128(dex, p)
            m_idx += d
            fl, p = read_uleb128(dex, p)
            co, p = read_uleb128(dex, p)
            vmethods.append((orig_methods[m_idx], fl, co))

        orig_classes.append({
            "class_type": c_type,
            "flags": flags,
            "super_type": super_type,
            "src_str": src_str,
            "sfields": sfields,
            "ifields": ifields,
            "dmethods": dmethods,
            "vmethods": vmethods,
        })

    # 7. Add new strings, types, protos, fields, and methods
    new_strings_to_add = [
        "Landroid/content/Intent;",
        "Landroid/webkit/ValueCallback;",
        "Landroid/webkit/WebChromeClient$FileChooserParams;",
        "[Landroid/net/Uri;",
        "VII",
        "VIIL",
        "VLI",
        "VLL",
        "ZLLL",
        "LI",
        "LIL",
        "addCategory",
        "android.intent.action.GET_CONTENT",
        "android.intent.action.VIEW",
        "android.intent.category.OPENABLE",
        "filePathCallback",
        "image/*",
        "onActivityResult",
        "onReceiveValue",
        "onShowFileChooser",
        "parseResult",
        "setType",
        "startActivity",
        "startActivityForResult",
    ]
    for s in new_strings_to_add:
        ensure_string(s)

    new_types_set = set(orig_types) | {
        "Landroid/content/Intent;",
        "Landroid/webkit/ValueCallback;",
        "Landroid/webkit/WebChromeClient$FileChooserParams;",
        "[Landroid/net/Uri;",
    }

    # New protos
    proto_intent_init = ("VL", "V", ("Landroid/content/Intent;",))
    proto_intent_view_init = ("VLL", "V", ("Ljava/lang/String;", "Landroid/net/Uri;"))
    proto_string_void = ("VL", "V", ("Ljava/lang/String;",))
    proto_string_intent = ("LL", "Landroid/content/Intent;", ("Ljava/lang/String;",))
    proto_obj_void = ("VL", "V", ("Ljava/lang/Object;",))
    proto_parse_result = (
        "LIL",
        "[Landroid/net/Uri;",
        ("I", "Landroid/content/Intent;"),
    )
    proto_on_activity_result = (
        "VIIL",
        "V",
        ("I", "I", "Landroid/content/Intent;"),
    )
    proto_start_act_res = (
        "VLI",
        "V",
        ("Landroid/content/Intent;", "I"),
    )
    proto_on_show_file_chooser = (
        "ZLLL",
        "Z",
        (
            "Landroid/webkit/WebView;",
            "Landroid/webkit/ValueCallback;",
            "Landroid/webkit/WebChromeClient$FileChooserParams;",
        ),
    )

    new_protos_set = set(orig_protos) | {
        proto_intent_init,
        proto_intent_view_init,
        proto_string_void,
        proto_string_intent,
        proto_obj_void,
        proto_parse_result,
        proto_on_activity_result,
        proto_start_act_res,
        proto_on_show_file_chooser,
    }

    field_file_path_cb = (
        "Lpk/edu/gpschambai/schoolapp/MainActivity;",
        "Landroid/webkit/ValueCallback;",
        "filePathCallback",
    )
    new_fields_set = set(orig_fields) | {field_file_path_cb}

    m_intent_init = ("Landroid/content/Intent;", proto_string_void, "<init>")
    m_intent_view_init = ("Landroid/content/Intent;", proto_intent_view_init, "<init>")
    m_intent_add_cat = ("Landroid/content/Intent;", proto_string_intent, "addCategory")
    m_intent_set_type = ("Landroid/content/Intent;", proto_string_intent, "setType")
    m_val_cb_receive = ("Landroid/webkit/ValueCallback;", proto_obj_void, "onReceiveValue")
    m_parse_result = (
        "Landroid/webkit/WebChromeClient$FileChooserParams;",
        proto_parse_result,
        "parseResult",
    )
    m_super_on_act_res = (
        "Landroid/app/Activity;",
        proto_on_activity_result,
        "onActivityResult",
    )
    m_start_act = (
        "Lpk/edu/gpschambai/schoolapp/MainActivity;",
        proto_intent_init,
        "startActivity",
    )
    m_start_act_res = (
        "Lpk/edu/gpschambai/schoolapp/MainActivity;",
        proto_start_act_res,
        "startActivityForResult",
    )
    m_main_on_act_res = (
        "Lpk/edu/gpschambai/schoolapp/MainActivity;",
        proto_on_activity_result,
        "onActivityResult",
    )
    m_chrome_on_show_fc = (
        "Lpk/edu/gpschambai/schoolapp/MainActivity$2;",
        proto_on_show_file_chooser,
        "onShowFileChooser",
    )

    new_methods_set = set(orig_methods) | {
        m_intent_init,
        m_intent_view_init,
        m_intent_add_cat,
        m_intent_set_type,
        m_val_cb_receive,
        m_parse_result,
        m_super_on_act_res,
        m_start_act,
        m_start_act_res,
        m_main_on_act_res,
        m_chrome_on_show_fc,
    }

    # 8. Sort all tables according to DEX specification
    sorted_strings = sorted(string_map_bytes.keys())
    str_to_idx = {s: i for i, s in enumerate(sorted_strings)}

    sorted_types = sorted(new_types_set, key=lambda t: str_to_idx[t])
    type_to_idx = {t: i for i, t in enumerate(sorted_types)}

    def proto_sort_key(p):
        sh, ret, params = p
        return (type_to_idx[ret], tuple(type_to_idx[x] for x in params))

    sorted_protos = sorted(new_protos_set, key=proto_sort_key)
    proto_to_idx = {p: i for i, p in enumerate(sorted_protos)}

    def field_sort_key(f):
        c, t, n = f
        return (type_to_idx[c], str_to_idx[n], type_to_idx[t])

    sorted_fields = sorted(new_fields_set, key=field_sort_key)
    field_to_idx = {f: i for i, f in enumerate(sorted_fields)}

    def method_sort_key(m):
        c, p, n = m
        return (type_to_idx[c], str_to_idx[n], proto_to_idx[p])

    sorted_methods = sorted(new_methods_set, key=method_sort_key)
    method_to_idx = {m: i for i, m in enumerate(sorted_methods)}

    # Helper to remap an existing code_item's instruction stream
    def remap_existing_code_item(co: int) -> bytes:
        regs, ins, outs, tries, _dbg, insns_sz = struct.unpack_from("<HHHHII", dex, co)
        insns = bytearray(dex[co + 16 : co + 16 + insns_sz * 2])
        pos = 0
        while pos < len(insns):
            op = insns[pos]
            if op in (0x00, 0x0A, 0x0C, 0x0D, 0x0E, 0x0F, 0x11, 0x12, 0x28):
                pos += 2
            elif op in (0x13, 0x38, 0x39):
                pos += 4
            elif op == 0x1A:  # const-string vAA, string@BBBB
                old_idx = struct.unpack_from("<H", insns, pos + 2)[0]
                new_idx = str_to_idx[orig_strings[old_idx][0]]
                struct.pack_into("<H", insns, pos + 2, new_idx)
                pos += 4
            elif op == 0x22:  # new-instance vAA, type@BBBB
                old_idx = struct.unpack_from("<H", insns, pos + 2)[0]
                new_idx = type_to_idx[orig_types[old_idx]]
                struct.pack_into("<H", insns, pos + 2, new_idx)
                pos += 4
            elif op in (0x54, 0x5B):  # iget-object / iput-object
                old_idx = struct.unpack_from("<H", insns, pos + 2)[0]
                new_idx = field_to_idx[orig_fields[old_idx]]
                struct.pack_into("<H", insns, pos + 2, new_idx)
                pos += 4
            elif op == 0x24:  # filled-new-array
                old_idx = struct.unpack_from("<H", insns, pos + 2)[0]
                new_idx = type_to_idx[orig_types[old_idx]]
                struct.pack_into("<H", insns, pos + 2, new_idx)
                pos += 6
            elif op in (0x6E, 0x6F, 0x70, 0x71, 0x72):  # invoke-*
                old_idx = struct.unpack_from("<H", insns, pos + 2)[0]
                new_idx = method_to_idx[orig_methods[old_idx]]
                struct.pack_into("<H", insns, pos + 2, new_idx)
                pos += 6
            else:
                raise RuntimeError(f"Unexpected opcode 0x{op:02x} at {pos}")

        header = struct.pack("<HHHHII", regs, ins, outs, tries, 0, insns_sz)
        if tries == 0:
            return header + bytes(insns)

        # Remap catch handler type_idx for shouldInterceptRequest (tries=2)
        pad = b"\x00\x00" if (insns_sz % 2 == 1) else b""
        t_off = co + 16 + insns_sz * 2 + len(pad)
        try_bytes = dex[t_off : t_off + tries * 8]
        exc_type_idx = type_to_idx["Ljava/lang/Exception;"]
        # Reconstruct the 2 catch handlers (offsets 0x63 and 0x78)
        h_list = bytearray()
        h_list.extend(write_uleb128(2))
        h1_off = len(h_list)
        h_list.extend(write_sleb128(1))
        h_list.extend(write_uleb128(exc_type_idx))
        h_list.extend(write_uleb128(0x63))
        h2_off = len(h_list)
        h_list.extend(write_sleb128(1))
        h_list.extend(write_uleb128(exc_type_idx))
        h_list.extend(write_uleb128(0x78))

        s0, c0, _ = struct.unpack_from("<IHH", try_bytes, 0)
        s1, c1, _ = struct.unpack_from("<IHH", try_bytes, 8)
        new_try_bytes = struct.pack("<IHH", s0, c0, h1_off) + struct.pack("<IHH", s1, c1, h2_off)
        return header + bytes(insns) + pad + new_try_bytes + bytes(h_list)

    # 9. Build code_item for MainActivity$2.onShowFileChooser
    f_this0_idx = field_to_idx[
        (
            "Lpk/edu/gpschambai/schoolapp/MainActivity$2;",
            "Lpk/edu/gpschambai/schoolapp/MainActivity;",
            "this$0",
        )
    ]
    f_cb_idx = field_to_idx[field_file_path_cb]
    m_recv_idx = method_to_idx[m_val_cb_receive]
    t_intent_idx = type_to_idx["Landroid/content/Intent;"]
    s_get_content_idx = str_to_idx["android.intent.action.GET_CONTENT"]
    s_openable_idx = str_to_idx["android.intent.category.OPENABLE"]
    s_image_star_idx = str_to_idx["image/*"]
    m_intent_init_idx = method_to_idx[m_intent_init]
    m_add_cat_idx = method_to_idx[m_intent_add_cat]
    m_set_type_idx = method_to_idx[m_intent_set_type]
    m_start_act_idx = method_to_idx[m_start_act_res]
    t_exc_idx = type_to_idx["Ljava/lang/Exception;"]

    fc_insns = bytearray()
    # 0000: iget-object v0, v3, MainActivity$2->this$0
    fc_insns += struct.pack("<BBH", 0x54, 0x30, f_this0_idx)
    # 0002: iget-object v1, v0, MainActivity->filePathCallback
    fc_insns += struct.pack("<BBH", 0x54, 0x01, f_cb_idx)
    # 0004: if-eqz v1, +8 (to 000c)
    fc_insns += struct.pack("<BBh", 0x38, 0x01, 8)
    # 0006: const/4 v2, 0
    fc_insns += bytes([0x12, 0x02])
    # 0007: invoke-interface {v1, v2}, ValueCallback->onReceiveValue(Object)V
    fc_insns += struct.pack("<BBHH", 0x72, 0x20, m_recv_idx, 0x0021)
    # 000a: iput-object v2, v0, MainActivity->filePathCallback
    fc_insns += struct.pack("<BBH", 0x5B, 0x02, f_cb_idx)
    # 000c: iput-object v5, v0, MainActivity->filePathCallback
    fc_insns += struct.pack("<BBH", 0x5B, 0x05, f_cb_idx)
    # 000e [try_start]: new-instance v1, Landroid/content/Intent;
    fc_insns += struct.pack("<BBH", 0x22, 0x01, t_intent_idx)
    # 0010: const-string v2, "android.intent.action.GET_CONTENT"
    fc_insns += struct.pack("<BBH", 0x1A, 0x02, s_get_content_idx)
    # 0012: invoke-direct {v1, v2}, Intent-><init>(String)V
    fc_insns += struct.pack("<BBHH", 0x70, 0x20, m_intent_init_idx, 0x0021)
    # 0015: const-string v2, "android.intent.category.OPENABLE"
    fc_insns += struct.pack("<BBH", 0x1A, 0x02, s_openable_idx)
    # 0017: invoke-virtual {v1, v2}, Intent->addCategory(String)Intent
    fc_insns += struct.pack("<BBHH", 0x6E, 0x20, m_add_cat_idx, 0x0021)
    # 001a: const-string v2, "image/*"
    fc_insns += struct.pack("<BBH", 0x1A, 0x02, s_image_star_idx)
    # 001c: invoke-virtual {v1, v2}, Intent->setType(String)Intent
    fc_insns += struct.pack("<BBHH", 0x6E, 0x20, m_set_type_idx, 0x0021)
    # 001f: const/16 v2, 1001
    fc_insns += struct.pack("<BBh", 0x13, 0x02, 1001)
    # 0021: invoke-virtual {v0, v1, v2}, MainActivity->startActivityForResult(Intent, I)V
    fc_insns += struct.pack("<BBHH", 0x6E, 0x30, m_start_act_idx, 0x0210)
    # 0024 [try_end]: const/4 v2, 1
    fc_insns += bytes([0x12, 0x12])
    # 0025: return v2
    fc_insns += bytes([0x0F, 0x02])
    # 0026 [catch Exception]: move-exception v1
    fc_insns += bytes([0x0D, 0x01])
    # 0027: const/4 v2, 0
    fc_insns += bytes([0x12, 0x02])
    # 0028: iput-object v2, v0, MainActivity->filePathCallback
    fc_insns += struct.pack("<BBH", 0x5B, 0x02, f_cb_idx)
    # 002a: invoke-interface {v5, v2}, ValueCallback->onReceiveValue(Object)V
    fc_insns += struct.pack("<BBHH", 0x72, 0x20, m_recv_idx, 0x0025)
    # 002d: return v2
    fc_insns += bytes([0x0F, 0x02])

    fc_insns_sz = len(fc_insns) // 2
    assert fc_insns_sz == 46, f"Expected 46 code units, got {fc_insns_sz}"

    fc_handlers = bytearray()
    fc_handlers.extend(write_uleb128(1))
    fc_handler_off = len(fc_handlers)
    fc_handlers.extend(write_sleb128(1))
    fc_handlers.extend(write_uleb128(t_exc_idx))
    fc_handlers.extend(write_uleb128(0x26))

    fc_try_item = struct.pack("<IHH", 0x0E, 0x24 - 0x0E, fc_handler_off)
    fc_code_item = (
        struct.pack("<HHHHII", 7, 4, 3, 1, 0, fc_insns_sz)
        + bytes(fc_insns)
        + fc_try_item
        + bytes(fc_handlers)
    )

    # 10. Build code_item for MainActivity.onActivityResult(I, I, Intent)V
    m_super_ar_idx = method_to_idx[m_super_on_act_res]
    m_parse_idx = method_to_idx[m_parse_result]

    ar_insns = bytearray()
    # 0000: invoke-super {v3, v4, v5, v6}, Activity->onActivityResult(I, I, Intent)V
    ar_insns += struct.pack("<BBHH", 0x6F, 0x40, m_super_ar_idx, 0x6543)
    # 0003: const/16 v1, 1001
    ar_insns += struct.pack("<BBh", 0x13, 0x01, 1001)
    # 0005: if-ne v4, v1, +16 (to 0015)
    ar_insns += struct.pack("<BBh", 0x33, 0x14, 16)
    # 0007: iget-object v0, v3, MainActivity->filePathCallback
    ar_insns += struct.pack("<BBH", 0x54, 0x30, f_cb_idx)
    # 0009: if-eqz v0, +12 (to 0015)
    ar_insns += struct.pack("<BBh", 0x38, 0x00, 12)
    # 000b: const/4 v1, 0
    ar_insns += bytes([0x12, 0x01])
    # 000c: iput-object v1, v3, MainActivity->filePathCallback
    ar_insns += struct.pack("<BBH", 0x5B, 0x31, f_cb_idx)
    # 000e: invoke-static {v5, v6}, FileChooserParams->parseResult(I, Intent)Uri[]
    ar_insns += struct.pack("<BBHH", 0x71, 0x20, m_parse_idx, 0x0065)
    # 0011: move-result-object v1
    ar_insns += bytes([0x0C, 0x01])
    # 0012: invoke-interface {v0, v1}, ValueCallback->onReceiveValue(Object)V
    ar_insns += struct.pack("<BBHH", 0x72, 0x20, m_recv_idx, 0x0010)
    # 0015: return-void
    ar_insns += bytes([0x0E, 0x00])

    ar_insns_sz = len(ar_insns) // 2
    assert ar_insns_sz == 22, f"Expected 22 code units, got {ar_insns_sz}"
    ar_code_item = struct.pack("<HHHHII", 7, 4, 4, 0, 0, ar_insns_sz) + bytes(ar_insns)

    # 10b. Build code_item for MainActivity$1.shouldOverrideUrlLoading(WebView, WebResourceRequest)Z
    f_this0_1_idx = field_to_idx[
        (
            "Lpk/edu/gpschambai/schoolapp/MainActivity$1;",
            "Lpk/edu/gpschambai/schoolapp/MainActivity;",
            "this$0",
        )
    ]
    m_get_url_idx = method_to_idx[
        (
            "Landroid/webkit/WebResourceRequest;",
            ("L", "Landroid/net/Uri;", ()),
            "getUrl",
        )
    ]
    m_get_host_idx = method_to_idx[
        (
            "Landroid/net/Uri;",
            ("L", "Ljava/lang/String;", ()),
            "getHost",
        )
    ]
    m_eq_ic_idx = method_to_idx[
        (
            "Ljava/lang/String;",
            ("ZL", "Z", ("Ljava/lang/String;",)),
            "equalsIgnoreCase",
        )
    ]
    s_appassets_idx = str_to_idx["appassets.androidplatform.net"]
    s_action_view_idx = str_to_idx["android.intent.action.VIEW"]
    m_intent_view_init_idx = method_to_idx[m_intent_view_init]
    m_start_act_only_idx = method_to_idx[m_start_act]

    ov_insns = bytearray()
    # 0000: invoke-interface {v5}, WebResourceRequest->getUrl()Landroid/net/Uri;
    ov_insns += struct.pack("<BBHH", 0x72, 0x10, m_get_url_idx, 0x0005)
    # 0003: move-result-object v0
    ov_insns += bytes([0x0C, 0x00])
    # 0004: if-eqz v0, +31 (to 0023)
    ov_insns += struct.pack("<BBh", 0x38, 0x00, 31)
    # 0006: invoke-virtual {v0}, Uri->getHost()Ljava/lang/String;
    ov_insns += struct.pack("<BBHH", 0x6E, 0x10, m_get_host_idx, 0x0000)
    # 0009: move-result-object v1
    ov_insns += bytes([0x0C, 0x01])
    # 000a: const-string v2, "appassets.androidplatform.net"
    ov_insns += struct.pack("<BBH", 0x1A, 0x02, s_appassets_idx)
    # 000c: invoke-virtual {v2, v1}, String->equalsIgnoreCase(Ljava/lang/String;)Z
    ov_insns += struct.pack("<BBHH", 0x6E, 0x20, m_eq_ic_idx, 0x0012)
    # 000f: move-result v1
    ov_insns += bytes([0x0A, 0x01])
    # 0010: if-nez v1, +19 (to 0023)
    ov_insns += struct.pack("<BBh", 0x39, 0x01, 19)
    # 0012 [try_start]: new-instance v1, Landroid/content/Intent;
    ov_insns += struct.pack("<BBH", 0x22, 0x01, t_intent_idx)
    # 0014: const-string v2, "android.intent.action.VIEW"
    ov_insns += struct.pack("<BBH", 0x1A, 0x02, s_action_view_idx)
    # 0016: invoke-direct {v1, v2, v0}, Intent-><init>(Ljava/lang/String;Landroid/net/Uri;)V
    ov_insns += struct.pack("<BBHH", 0x70, 0x30, m_intent_view_init_idx, 0x0021)
    # 0019: iget-object v0, v3, MainActivity$1->this$0
    ov_insns += struct.pack("<BBH", 0x54, 0x30, f_this0_1_idx)
    # 001b: invoke-virtual {v0, v1}, MainActivity->startActivity(Landroid/content/Intent;)V
    ov_insns += struct.pack("<BBHH", 0x6E, 0x20, m_start_act_only_idx, 0x0010)
    # 001e [try_end]: const/4 v0, 1
    ov_insns += bytes([0x12, 0x10])
    # 001f: return v0
    ov_insns += bytes([0x0F, 0x00])
    # 0020 [catch Exception]: move-exception v0
    ov_insns += bytes([0x0D, 0x00])
    # 0021: const/4 v0, 1
    ov_insns += bytes([0x12, 0x10])
    # 0022: return v0
    ov_insns += bytes([0x0F, 0x00])
    # 0023 [:return_false]: const/4 v0, 0
    ov_insns += bytes([0x12, 0x00])
    # 0024: return v0
    ov_insns += bytes([0x0F, 0x00])

    ov_insns_sz = len(ov_insns) // 2
    assert ov_insns_sz == 37, f"Expected 37 code units, got {ov_insns_sz}"

    ov_pad = b"\x00\x00"  # 37 is odd, pad to 4-byte boundary before try_item
    ov_handlers = bytearray()
    ov_handlers.extend(write_uleb128(1))
    ov_handler_off = len(ov_handlers)
    ov_handlers.extend(write_sleb128(1))
    ov_handlers.extend(write_uleb128(t_exc_idx))
    ov_handlers.extend(write_uleb128(0x20))

    ov_try_item = struct.pack("<IHH", 0x12, 0x1E - 0x12, ov_handler_off)
    ov_code_item = (
        struct.pack("<HHHHII", 6, 3, 3, 1, 0, ov_insns_sz)
        + bytes(ov_insns)
        + ov_pad
        + ov_try_item
        + bytes(ov_handlers)
    )

    # 11. Assemble all code_items and update classes
    code_items_list = []  # list of bytes

    for cls in orig_classes:
        new_dm = []
        for m_tup, fl, co in cls["dmethods"]:
            ci_bytes = remap_existing_code_item(co)
            new_dm.append((method_to_idx[m_tup], fl, ci_bytes))
        new_vm = []
        for m_tup, fl, co in cls["vmethods"]:
            if (
                cls["class_type"] == "Lpk/edu/gpschambai/schoolapp/MainActivity$1;"
                and m_tup[2] == "shouldOverrideUrlLoading"
            ):
                new_vm.append((method_to_idx[m_tup], fl, ov_code_item))
            else:
                ci_bytes = remap_existing_code_item(co)
                new_vm.append((method_to_idx[m_tup], fl, ci_bytes))

        if cls["class_type"] == "Lpk/edu/gpschambai/schoolapp/MainActivity$2;":
            new_vm.append((method_to_idx[m_chrome_on_show_fc], 0x0001, fc_code_item))
        elif cls["class_type"] == "Lpk/edu/gpschambai/schoolapp/MainActivity;":
            cls["ifields"].append((field_file_path_cb, 0x0001))
            new_vm.append((method_to_idx[m_main_on_act_res], 0x0004, ar_code_item))

        cls["sfields_sorted"] = sorted(
            [(field_to_idx[f], fl) for f, fl in cls["sfields"]], key=lambda x: x[0]
        )
        cls["ifields_sorted"] = sorted(
            [(field_to_idx[f], fl) for f, fl in cls["ifields"]], key=lambda x: x[0]
        )
        cls["dmethods_sorted"] = sorted(new_dm, key=lambda x: x[0])
        cls["vmethods_sorted"] = sorted(new_vm, key=lambda x: x[0])

    # 12. Layout the entire DEX binary cleanly
    n_strings = len(sorted_strings)
    n_types = len(sorted_types)
    n_protos = len(sorted_protos)
    n_fields = len(sorted_fields)
    n_methods = len(sorted_methods)
    n_classes = len(orig_classes)

    off_header = 0
    off_string_ids = 112
    off_type_ids = off_string_ids + n_strings * 4
    off_proto_ids = off_type_ids + n_types * 4
    off_field_ids = off_proto_ids + n_protos * 12
    off_method_ids = off_field_ids + n_fields * 8
    off_class_defs = off_method_ids + n_methods * 8
    off_data_start = off_class_defs + n_classes * 32

    out = bytearray(off_data_start)

    def align4():
        while len(out) % 4 != 0:
            out.append(0)

    # A. Write code_items (4-byte aligned)
    align4()
    off_code_items = len(out)
    n_code_items = 0
    for cls in orig_classes:
        for m_list in (cls["dmethods_sorted"], cls["vmethods_sorted"]):
            for i in range(len(m_list)):
                align4()
                m_idx, fl, ci_bytes = m_list[i]
                co_off = len(out)
                out.extend(ci_bytes)
                m_list[i] = (m_idx, fl, co_off)
                n_code_items += 1

    # B. Write type_list items for protos (4-byte aligned)
    align4()
    off_type_lists = len(out)
    proto_param_offs = []
    unique_param_tuples = {}
    for sh, ret, params in sorted_protos:
        if not params:
            proto_param_offs.append(0)
        else:
            if params not in unique_param_tuples:
                align4()
                tl_off = len(out)
                out.extend(struct.pack("<I", len(params)))
                for p_t in params:
                    out.extend(struct.pack("<H", type_to_idx[p_t]))
                unique_param_tuples[params] = tl_off
            proto_param_offs.append(unique_param_tuples[params])
    n_type_lists = len(unique_param_tuples)

    # C. Write string_data_items
    off_string_data = len(out)
    string_data_offs = []
    for s in sorted_strings:
        u_len, s_bytes = string_map_bytes[s]
        string_data_offs.append(len(out))
        out.extend(write_uleb128(u_len))
        out.extend(s_bytes)
        out.append(0)

    # D. Write class_data_items
    off_class_data = len(out)
    class_data_offs = []
    for cls in orig_classes:
        cd_off = len(out)
        class_data_offs.append(cd_off)
        sf = cls["sfields_sorted"]
        iflds = cls["ifields_sorted"]
        dm = cls["dmethods_sorted"]
        vm = cls["vmethods_sorted"]
        out.extend(write_uleb128(len(sf)))
        out.extend(write_uleb128(len(iflds)))
        out.extend(write_uleb128(len(dm)))
        out.extend(write_uleb128(len(vm)))

        prev = 0
        for f_idx, fl in sf:
            out.extend(write_uleb128(f_idx - prev))
            out.extend(write_uleb128(fl))
            prev = f_idx

        prev = 0
        for f_idx, fl in iflds:
            out.extend(write_uleb128(f_idx - prev))
            out.extend(write_uleb128(fl))
            prev = f_idx

        prev = 0
        for m_idx, fl, co_off in dm:
            out.extend(write_uleb128(m_idx - prev))
            out.extend(write_uleb128(fl))
            out.extend(write_uleb128(co_off))
            prev = m_idx

        prev = 0
        for m_idx, fl, co_off in vm:
            out.extend(write_uleb128(m_idx - prev))
            out.extend(write_uleb128(fl))
            out.extend(write_uleb128(co_off))
            prev = m_idx

    # E. Write map_list (4-byte aligned)
    align4()
    off_map_list = len(out)
    map_entries = [
        (0x0000, 1, off_header),
        (0x0001, n_strings, off_string_ids),
        (0x0002, n_types, off_type_ids),
        (0x0003, n_protos, off_proto_ids),
        (0x0004, n_fields, off_field_ids),
        (0x0005, n_methods, off_method_ids),
        (0x0006, n_classes, off_class_defs),
        (0x2001, n_code_items, off_code_items),
        (0x1001, n_type_lists, off_type_lists),
        (0x2002, n_strings, off_string_data),
        (0x2000, n_classes, off_class_data),
        (0x1000, 1, off_map_list),
    ]
    out.extend(struct.pack("<I", len(map_entries)))
    for m_type, m_cnt, m_off in map_entries:
        out.extend(struct.pack("<HHII", m_type, 0, m_cnt, m_off))

    align4()
    total_file_size = len(out)
    data_size = total_file_size - off_data_start

    # Populate index tables
    for i, s_off in enumerate(string_data_offs):
        struct.pack_into("<I", out, off_string_ids + i * 4, s_off)

    for i, t_str in enumerate(sorted_types):
        struct.pack_into("<I", out, off_type_ids + i * 4, str_to_idx[t_str])

    for i, (sh, ret, _params) in enumerate(sorted_protos):
        struct.pack_into(
            "<III",
            out,
            off_proto_ids + i * 12,
            str_to_idx[sh],
            type_to_idx[ret],
            proto_param_offs[i],
        )

    for i, (c_str, t_str, n_str) in enumerate(sorted_fields):
        struct.pack_into(
            "<HHI",
            out,
            off_field_ids + i * 8,
            type_to_idx[c_str],
            type_to_idx[t_str],
            str_to_idx[n_str],
        )

    for i, (c_str, p_tup, n_str) in enumerate(sorted_methods):
        struct.pack_into(
            "<HHI",
            out,
            off_method_ids + i * 8,
            type_to_idx[c_str],
            proto_to_idx[p_tup],
            str_to_idx[n_str],
        )

    for i, cls in enumerate(orig_classes):
        src_idx = str_to_idx[cls["src_str"]] if cls["src_str"] else 0xFFFFFFFF
        struct.pack_into(
            "<IIIIIIII",
            out,
            off_class_defs + i * 32,
            type_to_idx[cls["class_type"]],
            cls["flags"],
            type_to_idx[cls["super_type"]],
            0,
            src_idx,
            0,
            class_data_offs[i],
            0,
        )

    # Write DEX header
    out[0:8] = b"dex\n035\x00"
    struct.pack_into("<III", out, 32, total_file_size, 112, 0x12345678)
    struct.pack_into("<III", out, 44, 0, 0, off_map_list)
    struct.pack_into("<II", out, 56, n_strings, off_string_ids)
    struct.pack_into("<II", out, 64, n_types, off_type_ids)
    struct.pack_into("<II", out, 72, n_protos, off_proto_ids)
    struct.pack_into("<II", out, 80, n_fields, off_field_ids)
    struct.pack_into("<II", out, 88, n_methods, off_method_ids)
    struct.pack_into("<II", out, 96, n_classes, off_class_defs)
    struct.pack_into("<II", out, 104, data_size, off_data_start)

    # Compute SHA-1 signature (bytes 32..end) and Adler32 checksum (bytes 12..end)
    sha1_digest = hashlib.sha1(out[32:]).digest()
    out[12:32] = sha1_digest
    adler = zlib.adler32(out[12:]) & 0xFFFFFFFF
    struct.pack_into("<I", out, 8, adler)

    print(
        f"Patched classes.dex successfully: {len(out)} bytes "
        f"(strings={n_strings}, types={n_types}, methods={n_methods}, code_items={n_code_items})"
    )
    return bytes(out)


if __name__ == "__main__":
    import zipfile

    with zipfile.ZipFile("app-release.apk", "r") as zf:
        orig = zf.read("classes.dex")
    patched = patch_classes_dex(orig)
    with open("/tmp/patched_classes.dex", "wb") as fp:
        fp.write(patched)
