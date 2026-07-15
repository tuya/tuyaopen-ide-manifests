---
id: peripheral-sd
name: SD Card Storage
description: >-
  TDL + filesystem API for Micro SD card over SPI.
  用 tkl_fs_mount() + tkl_fopen/fwrite/fread 读写 SD 卡。
installPayload:
  - src/**/*.c
  - src/**/*.h
command: null
surfaces: [embedded]
---

# SD Card Storage (Micro SD / SPI)

Accessing SD cards via the TuyaOpen filesystem abstraction layer.
The SD card is typically driven over **SPI interface** and mounted as a filesystem device.

## Hardware Prerequisites

- **SD card interface**: SPI (Master mode)
- **Kconfig enable flag**: Board-dependent (e.g., `ENABLE_DNESP32S3_SDCARD` for ESP32-S3)
## Hardware Prerequisites

- **SD card interface**: SPI or SDIO (platform-dependent)
  - **SPI mode** (ESP32-S3): Master mode, pins configurable per board
  - **SDIO mode** (T5AI, etc.): 4-line data mode, fixed pins per platform
- **Kconfig enable flag**: Board-dependent (e.g., `ENABLE_DNESP32S3_SDCARD`)
- **Mount path**: conventional path `/sdcard` or user-defined
- **Device class**: `DEV_SDCARD` (used in `tkl_fs_mount()`)
- **Board registration**: `board_register_hardware()` handles pinmux configuration
  - Power management (power domain enable, if needed) is handled separately by board code
  - Application code does **NOT** need to manage power; only mount and use the filesystem

---

## Initialization Flow

### 1. Mount the SD card device

```c
#include "tal_api.h"
#include "tkl_fs.h"

static const char *SDCARD_MOUNT_PATH = "/sdcard";

// Mount the SD card filesystem at startup (typically in a separate task)
OPERATE_RET rt = tkl_fs_mount(SDCARD_MOUNT_PATH, DEV_SDCARD);
if (rt != OPRT_OK) {
    PR_ERR("SD card mount failed: %d", rt);
    // Retry or handle gracefully
    return;
}
PR_NOTICE("SD card mounted at %s", SDCARD_MOUNT_PATH);
```

**Notes:**
- `DEV_SDCARD` is the device class identifier for SD cards
- If mounting fails, typically due to card not inserted or filesystem corruption
- Consider retrying with backoff (e.g., `tal_system_sleep(3 * 1000)`) for robustness
- **Do NOT call this from interrupt handlers** — run in a separate thread/task

### 2. Open, read, write files

Use standard POSIX-like file operations:

```c
#include "tkl_fs.h"

// Write example
const char *file_path = "/sdcard/data.txt";
const char *content = "Hello SD Card";

TUYA_FILE file_hdl = tkl_fopen(file_path, "w");
if (NULL == file_hdl) {
    PR_ERR("Failed to open %s for writing", file_path);
    return;
}

uint32_t write_len = strlen(content);
uint32_t written = tkl_fwrite(content, write_len, file_hdl);
if (written != write_len) {
    PR_ERR("Write mismatch: requested %d, wrote %d", write_len, written);
}

tkl_fclose(file_hdl);

// Read example
file_hdl = tkl_fopen(file_path, "r");
if (NULL == file_hdl) {
    PR_ERR("Failed to open %s for reading", file_path);
    return;
}

char read_buf[256] = {0};
uint32_t read_len = tkl_fread(read_buf, sizeof(read_buf), file_hdl);
if (read_len > 0) {
    PR_NOTICE("Read %d bytes: %.*s", read_len, read_len, read_buf);
} else {
    PR_ERR("Read failed");
}

tkl_fclose(file_hdl);
```

**Key APIs:**
- `tkl_fopen(path, mode)` — open file; modes: `"r"` (read), `"w"` (write), `"a"` (append)
- `tkl_fwrite(buf, len, file_hdl)` — write `len` bytes; returns bytes actually written
- `tkl_fread(buf, max_len, file_hdl)` — read up to `max_len` bytes; returns bytes read (0 at EOF)
- `tkl_fclose(file_hdl)` — close file and flush

## Common Patterns

### Pattern 1: Log to file with rotation

```c
#define LOG_FILE "/sdcard/app.log"
#define MAX_LOG_SIZE (100 * 1024)  // 100 KB

static void append_log(const char *msg)
{
    // Check file size
    struct stat st;
    if (tkl_stat(LOG_FILE, &st) == 0 && st.st_size > MAX_LOG_SIZE) {
        tkl_remove(LOG_FILE);  // Truncate (simple rotation)
    }

    TUYA_FILE file = tkl_fopen(LOG_FILE, "a");
    if (!file) return;

    tkl_fwrite(msg, strlen(msg), file);
    tkl_fwrite("\n", 1, file);
    tkl_fclose(file);
}
```

### Pattern 2: Save binary data (e.g., camera JPEG)

```c
#define IMG_DIR "/sdcard/images"

static void save_jpeg_image(const uint8_t *data, uint32_t len)
{
    // Ensure directory exists (platform-dependent; mkdir may not be available)
    // On TuyaOpen, directories are typically created via the bootloader or pre-made

    static uint32_t img_counter = 0;
    char filepath[64];
    snprintf(filepath, sizeof(filepath), "%s/IMG_%06d.jpg", IMG_DIR, img_counter++);

    TUYA_FILE file = tkl_fopen(filepath, "w");
    if (!file) {
        PR_ERR("Failed to open %s", filepath);
        return;
    }

    uint32_t written = tkl_fwrite(data, len, file);
    tkl_fclose(file);

    if (written == len) {
        PR_NOTICE("Saved %s (%d bytes)", filepath, len);
    } else {
        PR_ERR("Write truncated: %d/%d bytes", written, len);
    }
}
```

### Pattern 3: JSON configuration read/write

```c
#include "cJSON.h"

#define CONFIG_FILE "/sdcard/config.json"

static OPERATE_RET save_config(const char *key, const char *value)
{
    // Read existing config
    cJSON *config = cJSON_CreateObject();
    TUYA_FILE file = tkl_fopen(CONFIG_FILE, "r");
    if (file) {
        // ... read and parse (implementation depends on cJSON)
        tkl_fclose(file);
    }

    // Update
    cJSON_AddStringToObject(config, key, value);

    // Write back
    char *json_str = cJSON_Print(config);
    file = tkl_fopen(CONFIG_FILE, "w");
    if (!file) {
        PR_ERR("Failed to write config");
        cJSON_Delete(config);
        free(json_str);
        return OPRT_COM_ERROR;
    }

    tkl_fwrite(json_str, strlen(json_str), file);
    tkl_fclose(file);

    cJSON_Delete(config);
    free(json_str);

    return OPRT_OK;
}
```

## Recommended Task Structure

```c
#define SD_TASK_PRIORITY THREAD_PRIO_2
#define SD_TASK_STACK    4096

static THREAD_HANDLE g_sd_task_hdl;

static void sd_worker_task(void *arg)
{
    // Mount SD card once at task start
    OPERATE_RET rt = tkl_fs_mount("/sdcard", DEV_SDCARD);
    if (rt != OPRT_OK) {
        PR_ERR("Mount failed, retrying...");
        // Retry logic or fail gracefully
        tal_thread_delete(g_sd_task_hdl);
        return;
    }

    // Main loop: handle file I/O
    while (1) {
        // Perform read/write operations
        // ...

        tal_system_sleep(1000);  // Yield to prevent watchdog
    }
}

// In user_main() or app initialization:
THREAD_CFG_T thrd_cfg = {0};
thrd_cfg.stackDepth = SD_TASK_STACK;
thrd_cfg.priority = SD_TASK_PRIORITY;
thrd_cfg.thrdname = "sd_worker";

tal_thread_create_and_start(&g_sd_task_hdl, NULL, NULL, sd_worker_task, NULL, &thrd_cfg);
```

## Error Handling

Common error codes from `tkl_fs_*` functions:

| Return Value | Meaning |
|---|---|
| `OPRT_OK` (0) | Success |
| `OPRT_COM_ERROR` | General filesystem error |
| `OPRT_INVALID_PARM` | Invalid parameter (e.g., bad path) |
| File open returns `NULL` | Cannot open (file not found, permissions, etc.) |
| `tkl_fwrite()` returns 0 | Write failed or disk full |
| `tkl_fread()` returns 0 | EOF or read error |

Always check return values and handle failures explicitly:

```c
if (tkl_fwrite(data, len, file) != len) {
    PR_ERR("Partial write; may indicate disk full");
    // Close file, potentially try recovery
}
```

## Platform-Specific Notes

### ESP32-S3 (DNESP32S3, DNESP32S3-BOX, Bread Compact)
- **Interface**: SPI (Master mode)
- **Kconfig flag**: `ENABLE_DNESP32S3_SDCARD`
- **SPI port**: TUYA_SPI1 (GPIO12 sck, GPIO11 mosi, GPIO13 miso, GPIO2 cs)
- **Mounting**: May take a few seconds; retry with backoff if first attempt fails
- **Notes**: SPI interface may be shared with LCD on some boards (check hardware context for conflicts)

### T5AI (TUYA_T5AI_BOARD, TUYA_T5AI_POCKET, TUYA_T5AI_EINK_NFC)
- **Interface**: SDIO (4-line mode)
- **Kconfig flag**: typically none (SDIO enabled by default on T5AI platform)
- **SDIO pins** (fixed):
  - CLK=GPIO14, CMD=GPIO15
  - DATA0=GPIO16, DATA1=GPIO17, DATA2=GPIO18, DATA3=GPIO19
- **Mounting**: Typically reliable; pinmux handled by board registration
- **Notes**: SDIO is generally more reliable than SPI for SD cards

### Other platforms
- Refer to `platform/<chip>/` and `boards/<chip>/<board>/` documentation for SD card interface type (SPI vs SDIO) and pin assignments

## Best Practices

1. **Mount early, once** — Perform `tkl_fs_mount()` once during initialization, not per file operation
2. **Check return values** — SD operations can fail (ejected card, corruption, disk full)
3. **Run in a task** — Never call file operations from ISRs or critical sections
4. **Batch operations** — Group multiple file accesses into single file open/close cycles
5. **Validate paths** — Sanitize filenames to prevent path traversal or invalid characters
6. **Use relative paths** — Paths are relative to mount point; always prefix with `/sdcard` or mount path
7. **Watchdog awareness** — Call `tal_system_sleep()` periodically in long operations to avoid watchdog reset

## Testing Checklist

- ✅ SD card mounts successfully at startup
- ✅ Can write files and verify content on card
- ✅ Can read files back and compare
- ✅ Handles missing card gracefully (retry/error message)
- ✅ Handles disk full condition (write returns partial length)
- ✅ Multiple files can coexist in `/sdcard` directory
- ✅ File operations don't block other tasks (use separate thread)
