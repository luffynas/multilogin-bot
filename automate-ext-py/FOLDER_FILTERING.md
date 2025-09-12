# Folder Filtering Feature

## Overview
Fitur folder filtering memungkinkan user untuk memilih folder tertentu saat menjalankan multiple bots, dengan default "all" untuk menjalankan semua profile dari semua folder.

## How It Works

### 1. Folder Selection Process
- Sistem mengambil daftar folder yang tersedia dari workspace
- Menampilkan daftar folder dengan informasi:
  - Nama folder
  - ID folder (disingkat)
  - Jumlah profile dalam folder
- User dapat memilih folder tertentu atau "all" untuk semua folder

### 2. Profile Filtering
- Jika user memilih "all": mengambil semua profile dari semua folder
- Jika user memilih folder tertentu: hanya mengambil profile dari folder yang dipilih
- Profile yang difilter kemudian digunakan untuk menjalankan multiple bots

### 3. User Interface
```
📁 Folder Selection:
Available folders:
  1. Default folder (ID: 598e7825..., Profiles: 73)
  2. Marketing (ID: a1b2c3d4..., Profiles: 15)
  3. Testing (ID: e5f6g7h8..., Profiles: 8)

Select folder (enter number or 'all' for all folders) [all]: 
```

## Methods Added

### `get_available_folders()`
- Mengambil daftar folder dari workspace
- Mengembalikan list folder dengan informasi lengkap
- Handle error jika gagal mengambil folder

### Enhanced `get_all_profiles(folder_id=None)`
- Sekarang mendukung parameter `folder_id` untuk filtering
- Jika `folder_id` adalah `None`: mengambil semua profile
- Jika `folder_id` diisi: hanya mengambil profile dari folder tertentu

## Usage Flow

1. **User Input**: User memilih folder atau "all"
2. **Folder Retrieval**: Sistem mengambil daftar folder yang tersedia
3. **Profile Filtering**: Profile difilter berdasarkan folder yang dipilih
4. **Bot Execution**: Multiple bots dijalankan dengan profile yang sudah difilter

## Benefits

1. **Organized Execution**: User dapat menjalankan bot untuk folder tertentu
2. **Flexible Selection**: Default "all" untuk kemudahan, atau pilih folder spesifik
3. **Clear Information**: Menampilkan jumlah profile per folder untuk referensi
4. **Error Handling**: Graceful handling jika tidak ada folder atau profile

## Example Usage

### Scenario 1: Run All Profiles
```
Select folder (enter number or 'all' for all folders) [all]: all
📁 Selected: All folders
📋 Found 96 profiles
```

### Scenario 2: Run Specific Folder
```
Select folder (enter number or 'all' for all folders) [all]: 1
📁 Selected: Default folder
📋 Found 73 profiles
```

## Integration

Fitur ini terintegrasi dengan:
- **Token Validation**: Tetap validasi token sebelum menjalankan
- **Proxy Validation**: Tetap validasi proxy per profile
- **Auto Proxy Update**: Tetap ada auto-update jika proxy gagal
- **Concurrent Execution**: Tetap mendukung concurrent bot execution

## Testing

Gunakan `test_validation.py` untuk menguji fitur ini:
```bash
python test_validation.py
```

Test akan memverifikasi:
- Pengambilan daftar folder
- Filtering profile berdasarkan folder
- Integrasi dengan fitur validasi lainnya
