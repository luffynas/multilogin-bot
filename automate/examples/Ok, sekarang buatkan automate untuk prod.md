Ok, sekarang buatkan automate untuk production dengan spesifikasi berikut ini:
1. baca data profile yang existing di @profile.json 
2. tentukan minimal dan maksimal profile yang akan dijalankan secara concurent
3. sebelum menjalankan profile diwajibkan untuk mengupdate proxy lebih dulu agar up to date proxynya.
4. setiap profile yang berhasil di jalankan harus menggunakan selenium_automation beserta behaviour dan adsense yang sudah dibuatkan demo sebelumnya.
5. setelah semua proses selesai, profile harus di tutup.
6. setelah profile tertutup maka iterasi dari nomor 1 sampai semua profile sukses dijalankan.
7. selesai.

referensi file yang sudah dibuat:
@comprehensive_automation_demo.py @get_profile_location_data.py 