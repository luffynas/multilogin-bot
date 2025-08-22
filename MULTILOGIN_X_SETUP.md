# Multilogin X Setup Guide

## ✅ MENGGUNAKAN MULTILOGIN X DENGAN AUTOMATIC SIGN-IN

### 🎯 PENJELASAN YANG AKURAT:
- **Multilogin X menyediakan Cloud API** dengan automatic sign-in
- **Tidak perlu manual API key generation** - sistem otomatis sign in
- **Menggunakan email dan password** untuk authentication
- **Berdasarkan dokumentasi resmi**: https://multilogin.com/help/en_US/custom-api-scripts-with-python/log-in-automatically

## ✅ CARA SETUP MULTILOGIN X:

### 1. ✅ KONFIGURASI CREDENTIALS

**Update `config/config.yaml`:**
```yaml
multilogin:
  # ✅ MULTILOGIN X CLOUD API (OFFICIAL DOCUMENTATION)
  base_url: "https://api.multilogin.com"
  launcher_url: "https://launcher.mlx.yt:45001/api/v1"
  
  # ✅ ACCOUNT CREDENTIALS (for automatic sign in)
  username: "YOUR_MULTILOGIN_X_EMAIL"  # ⚠️ Ganti dengan email Anda
  password: "YOUR_MULTILOGIN_X_PASSWORD"  # ⚠️ Ganti dengan password Anda
  
  # ⚠️ NO API KEY NEEDED - System will auto-generate bearer token
  api_key: "AUTO_GENERATED"  # Will be generated automatically after sign in
```

### 2. ✅ IMPLEMENTASI AUTOMATIC SIGN-IN

**Berdasarkan dokumentasi resmi:**
```python
def _sign_in(self):
    """Sign in to Multilogin X and get bearer token"""
    sign_url = f"{self.base_url}/user/signin"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    
    # ✅ MD5 ENCRYPTION FOR PASSWORD (as per documentation)
    payload = {
        "email": self.username,
        "password": str(hashlib.md5(self.password.encode()).hexdigest()),
    }
    
    # POST request to sign in
    resp = requests.post(sign_url, json=payload, headers=headers)
    resp_json = resp.json()
    
    # Get bearer token
    self.token = resp_json["data"]["token"]
```

### 3. ✅ TEST KONEKSI

**Jalankan test script:**
```bash
python test_multilogin_connection.py
```

## 🎯 API ENDPOINTS SESUAI DOKUMENTASI:

### ✅ SEMUA ENDPOINT SUDAH IMPLEMENTASI:

#### **1. ✅ CREATE PROFILE**
```python
POST /api/v2/profile
{
    "name": "Profile Name",
    "platform": "chrome",
    "proxy": {...},
    "userAgent": "...",
    "os": "win",
    "navigator": {...}
}
```

#### **2. ✅ START PROFILE**
```python
POST /api/v2/profile/{profile_id}/start
```

#### **3. ✅ STOP PROFILE**
```python
POST /api/v2/profile/{profile_id}/stop
```

#### **4. ✅ NAVIGATE**
```python
POST /api/v2/profile/{profile_id}/navigate
{
    "url": "https://example.com"
}
```

#### **5. ✅ EXECUTE SCRIPT**
```python
POST /api/v2/profile/{profile_id}/execute
{
    "script": "console.log('Hello World');"
}
```

#### **6. ✅ GET PROFILE INFO**
```python
GET /api/v2/profile/{profile_id}
```

#### **7. ✅ DELETE PROFILE**
```python
DELETE /api/v2/profile/{profile_id}
```

#### **8. ✅ GET ALL PROFILES**
```python
GET /api/v2/profile
```

#### **9. ✅ UPDATE PROFILE**
```python
PUT /api/v2/profile/{profile_id}
```

## 🚀 KEUNTUNGAN MULTILOGIN X:

### ✅ AUTOMATIC SIGN-IN ADVANTAGES:
- **✅ No manual API key generation**: Otomatis sign in
- **✅ Automatic token refresh**: Token diperbarui otomatis
- **✅ Secure authentication**: MD5 encryption untuk password
- **✅ Cloud-based**: Tidak perlu desktop app
- **✅ Professional infrastructure**: Data center profesional

### ✅ STEALTH FEATURES:
- **✅ Professional IPs**: IP dari data center
- **✅ Advanced fingerprinting**: Realistic fingerprints
- **✅ Human behavior simulation**: Realistic patterns
- **✅ Multi-provider proxy**: Multiple proxy sources

## ⚠️ REQUIREMENTS:

### ✅ YANG DIPERLUKAN:
1. **✅ Multilogin X Account**: Email dan password
2. **✅ Internet Connection**: Untuk akses cloud API
3. **✅ Valid Subscription**: Account aktif
4. **✅ Python Libraries**: requests, hashlib

### ❌ YANG TIDAK DIPERLUKAN:
1. **❌ Desktop App**: Tidak perlu install
2. **❌ Manual API Key**: Tidak perlu generate manual
3. **❌ Local Setup**: Tidak perlu setup lokal

## 🔧 TROUBLESHOOTING:

### ❌ ERROR: "Failed to sign in to Multilogin X"
**SOLUSI:**
1. Check email dan password di config/config.yaml
2. Pastikan account subscription aktif
3. Check internet connection

### ❌ ERROR: "Cannot connect to Multilogin X API"
**SOLUSI:**
1. Check internet connection
2. Check base_url: "https://api.multilogin.com"
3. Check credentials validity

### ❌ ERROR: "Unauthorized - Token may be invalid"
**SOLUSI:**
1. Check credentials format
2. Check account subscription
3. Restart application untuk refresh token

## 🎯 IMPLEMENTASI BERDASARKAN DOKUMENTASI RESMI:

### ✅ REFERENSI DOKUMENTASI:
- **URL**: https://multilogin.com/help/en_US/custom-api-scripts-with-python/log-in-automatically
- **Method**: Automatic sign-in dengan email/password
- **Encryption**: MD5 untuk password
- **Token**: Bearer token otomatis generated

### ✅ SCRIPT CONTOH DARI DOKUMENTASI:
```python
# signinmlx.py dari dokumentasi resmi
import requests
from hashlib import md5

USERNAME = "your_email"
PASSWORD = "your_password"

def sign_in(username, password):
    sign_url = "https://api.multilogin.com/user/signin"
    payload = {
        "email": username,
        "password": str(md5(password.encode()).hexdigest()),
    }
    resp = requests.post(sign_url, json=payload, headers=HEADERS)
    resp_json = resp.json()
    token = resp_json["data"]["token"]
    return token
```

## 🎯 KESIMPULAN:

**✅ PROYEK INI MENGGUNAKAN MULTILOGIN X DENGAN AUTOMATIC SIGN-IN!**

**✅ SETUP YANG BENAR:**
1. Update config/config.yaml dengan email dan password
2. Sistem otomatis sign in dan generate bearer token
3. Test koneksi dengan test script
4. Tidak perlu manual API key generation

**✅ SEMUA ENDPOINT SESUAI DOKUMENTASI RESMI!**

**✅ AUTOMATIC SIGN-IN - TIDAK PERLU MANUAL API KEY!**

**✅ BERDASARKAN DOKUMENTASI RESMI MULTILOGIN!**
