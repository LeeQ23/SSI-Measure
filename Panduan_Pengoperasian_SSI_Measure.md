# Panduan Lengkap Pengoperasian SSI Measure (Untuk Pemula)

Selamat datang! Panduan ini disusun menggunakan bahasa yang sangat sederhana agar siapa saja, bahkan yang belum pernah belajar IT atau pemrograman sama sekali, dapat mengoperasikan sistem **SSI Measure** dari awal sampai berhasil.

---

## 💡 Istilah Sederhana (Agar Mudah Dipahami)

Sebelum mulai, mari kita kenali beberapa istilah dengan analogi sehari-hari:

1. **Aplikasi Desktop (SSI Measure)**: Layar utama tempat operator bekerja, melihat hasil timbangan, dan memasukkan data (seperti program di komputer pada umumnya).
2. **Database (Penyimpanan Internal)**: "Buku Catatan Digital" otomatis yang sudah tersembunyi di dalam aplikasi ini untuk menyimpan data hasil penimbangan atau pengukuran.
3. **Port/Koneksi Alat**: Jalur kabel tempat alat (sensor/ESP32) terhubung dengan komputer.

---

## 🔌 BAGIAN 1: Cara Memasang (Install) Aplikasi

Kabar baik! SSI Measure versi terbaru ini sudah dibuat menjadi **Satu Paket Otomatis (`setup.exe`)** lengkap dengan databasenya sendiri. Anda **TIDAK PERLU** lagi menginstal Node.js, XAMPP, atau pengaturan teknis lainnya.

### Langkah-langkah Instalasi:
1. Temukan file installer aplikasi yang bernama **`SSI Measure Setup.exe`** (berada di folder `dist`).
2. Klik dua kali (Double-click) pada file tersebut.
3. Tunggu beberapa detik, proses instalasi akan berjalan secara otomatis (layaknya menginstal aplikasi profesional pada umumnya).
4. Setelah selesai, aplikasi SSI Measure akan otomatis terbuka! Anda juga bisa membukanya kapan saja melalui ikon aplikasi (Shortcut) yang muncul di Desktop atau Start Menu komputer Anda.

---

## 📋 BAGIAN 2: Cara Mengoperasikan Aplikasi SSI Measure

Setelah aplikasi terbuka, berikut adalah cara menggunakannya:

### 1. Mengatur Koneksi Alat Fisik
- Di bagian atas layar, Anda akan melihat pengaturan **Koneksi Alat (Device Connection)**.
- Jika Anda menghubungkan alat timbangan fisik (ESP32/Sensor) via kabel USB ke komputer, pilih nomor **Port**-nya (contoh: `COM3` atau `COM4`) di aplikasi.
- Jika Anda **tidak punya alat fisik** atau sedang mencoba aplikasi, Anda bisa memilih mode **MOCK** (Simulasi) di menu drop-down.

### 2. Memulai Sesi Inspeksi Baru
1. Di halaman utama, isi formulir inspeksi:
   - **Nama Operator**: Masukkan nama Anda.
   - **NIM / ID Operator**: Masukkan nomor identitas.
   - **ID Produk**: Masukkan kode atau nama barang (contoh: `PRD-001`).
   - **Jenis Inspeksi**: Pilih **Weight** (Penimbangan Berat) atau **Dimension** (Pengukuran Dimensi).
   - **Kriteria**: Masukkan kriteria batas (contoh batas berat: `500`).
2. Klik tombol **Start Session** (Mulai Sesi).

### 3. Proses Pengukuran Barang
1. Layar akan otomatis beralih ke halaman **Inspeksi Aktif**.
2. Taruh barang di atas timbangan fisik. (Angka akan muncul di layar dengan ketelitian 3 angka di belakang koma).
3. Sistem akan langsung mendeteksi apakah barang tersebut **OK** (Sesuai Standar) atau **NG** (*Not Good* / Tidak Sesuai).
4. Angka akan otomatis tercatat, dan jumlah barang OK/NG akan terhitung di bagian atas layar.

### 4. Menyelesaikan Sesi Inspeksi
1. Jika semua barang sudah selesai diukur, klik tombol **Finish Session** (Selesai Sesi).
2. Ringkasan hasil inspeksi akan ditampilkan (Total Barang OK, Total Barang NG).
3. Data secara otomatis sudah tersimpan aman di dalam penyimpanan internal komputer Anda.

---

## ❓ Solusi Masalah Umum (Troubleshooting)

- **Masalah**: Aplikasi tidak terbuka setelah di-klik.
  - **Solusi**: Coba klik kanan ikon aplikasi di Desktop, lalu pilih "Run as administrator".
- **Masalah**: Angka timbangan diam saja / tidak bergerak.
  - **Solusi**: Pastikan kabel USB alat terhubung dengan kencang ke laptop/komputer. Pastikan juga Anda memilih **Port** (COM) yang benar di pengaturan bagian atas aplikasi.

---
*Panduan ini dibuat agar memudahkan pengoperasian sistem SSI Measure secara mandiri bagi semua kalangan.*
