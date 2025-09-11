Projeck Name: Automate Ext py

Penjelasan
Projek ini digunakan untuk mengautomasi Multilogin browser berdasarkan sample Postman Collection ini Multilogin X API.postman_collection.json


Fitur-fitur yang akan dikerjakan
1. membangun code-based yang komprehensif, modular dan clean
2. login dan simpan token di file
3. implementasi dari folder Launcher
3.1 Start Browser Profile
3.2 Stop Browser Profile
3.3 Stop All Profiles
3.4 Get Profile Status
3.5 Get All Profiles Status
3.6 Delete Browser Core
3.7 Validate Proxy
4. implementasi dari folder Profile Access Management
4.1 User Sign In
4.2 User Refresh Token (Switch Workspace)
4.3 User Workspaces
4.4 Workspace Folders
5. implementasi dari folder Profile Management
5.1 Profile Create
5.2 Profile Remove
5.3 Profile Partial Update
6. implementasi dari folder Proxy
6.1 Generate Proxy
6.2 Fetch Proxy Data
7. implementasikan dari folder Pre-made Cookies
7.1 Target Website List
7.2 Create Cookies Metadata
7.3 Cookies List
7.4 Update Cookies Metadata
8. implementasikan dari folder Object Storage
8.1 Upload Object
8.2 Create Extension
8.3 Enable Extension
8.4 Disable Extension
8.5 List of Objects per profile

Gambaran Flow:
1. Sistem mulai
2. Login ke multilogin
3. Tampilkan menu utama
3.1 Cek all profile
3.2 Update Proxy ke profile
3.3 Upload Extension
3.4 Update Cookies
4. Start Bot
- aturan start bot ini bisa single maupun multi dengan concurent .
- batasan setiap profile hanya akan berjalan selama maksimal 30 menit.
- jika sudah mencapai 30 menit maka profile akan otomatis Stop by API.
- Jika ada browser yang gagal di start, aggap saja selesai.
- setiap 1 - 5 menit secara random, browser yang ada di dalam queque akan di Start.
- jika semua profile selesai dijalankan maka exit projek.