# Auto Proxy Update Feature

## Overview
Fitur auto-update proxy memungkinkan sistem untuk secara otomatis memperbarui konfigurasi proxy jika proxy saat ini gagal tervalidasi.

## How It Works

### 1. Proxy Validation Process
- Sistem memvalidasi proxy yang ada untuk setiap profile
- Jika proxy gagal tervalidasi, sistem akan mencoba mendapatkan proxy baru
- Maksimal 3 percobaan dengan proxy yang berbeda

### 2. Auto-Update Flow
```
Proxy Validation Failed
    ↓
Get New Proxy Connection URL
    ↓
Parse New Proxy Configuration
    ↓
Update Profile with New Proxy
    ↓
Retry Validation with New Proxy
    ↓
Success or Continue to Next Attempt
```

### 3. New Proxy Generation
- Menggunakan `get_connection_url` API untuk mendapatkan proxy baru
- Default country: US (sesuai dengan memory)
- Default protocol: socks5 atau http (berdasarkan tipe proxy saat ini)
- Default connection type: residential

### 4. Profile Update
- Mengambil metadata profile saat ini
- Mengupdate konfigurasi proxy dalam parameter profile
- Menyimpan perubahan menggunakan `partial_update_profile` API

## Methods Added

### `_get_new_proxy_connection(proxy_config)`
- Mendapatkan koneksi proxy baru dari API
- Memparse connection URL menjadi konfigurasi proxy
- Mengembalikan konfigurasi proxy baru atau None jika gagal

### `_update_profile_proxy(profile, new_proxy_config)`
- Mengupdate profile dengan konfigurasi proxy baru
- Mengambil metadata profile saat ini
- Menyimpan perubahan ke server

### Enhanced `validate_profile_proxy(profile)`
- Sekarang mendukung auto-update proxy
- Mencoba mendapatkan proxy baru jika validasi gagal
- Mengupdate profile dengan proxy baru sebelum retry

## Benefits

1. **Automatic Recovery**: Tidak perlu intervensi manual ketika proxy gagal
2. **Improved Success Rate**: Lebih banyak profile yang berhasil dijalankan
3. **Seamless Operation**: Proses berjalan otomatis tanpa gangguan
4. **Fallback Mechanism**: Multiple attempts dengan proxy yang berbeda

## Usage

Fitur ini otomatis aktif ketika:
- Menjalankan profile tunggal (`start_profile_bot`)
- Menjalankan multiple profiles (`run_concurrent_bots`)

**Optimization Note**: Validasi proxy dilakukan secara individual untuk setiap profile saat akan dijalankan, bukan secara batch. Ini menghindari beban berlebih saat menjalankan banyak profile secara bersamaan.

Tidak ada konfigurasi tambahan yang diperlukan - fitur berjalan secara otomatis.

## Testing

Gunakan `test_validation.py` untuk menguji fitur ini:
```bash
python test_validation.py
```

Test akan memverifikasi:
- Ekstraksi konfigurasi proxy dari profile
- Generasi proxy baru
- Update profile dengan proxy baru
- Validasi proxy dengan auto-update
