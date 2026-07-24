# Panduan Lengkap Pengoperasian SSI Measure (Untuk Pemula)

Selamat datang! Panduan ini disusun menggunakan bahasa yang sangat sederhana agar siapa saja, bahkan yang belum pernah belajar IT atau pemrograman sama sekali, dapat mengoperasikan sistem **SSI Measure** dari awal sampai berhasil.

---

## 💡 Istilah Sederhana (Agar Mudah Dipahami)

Sebelum mulai, mari kita kenali beberapa istilah dengan analogi sehari-hari:

1. **Aplikasi Desktop (SSI Measure)**: Layar utama tempat operator bekerja, melihat hasil timbangan, dan memasukkan data (seperti program di komputer pada umumnya).
2. **Node.js**: "Mesin Penggerak" di dalam komputer agar aplikasi ini bisa berjalan.
3. **XAMPP (MySQL)**: "Buku Catatan Digital" tempat menyimpan data hasil penimbangan atau pengukuran secara otomatis.
4. **Port/Koneksi Alat**: Jalur kabel tempat alat (sensor/ESP32) terhubung dengan komputer.

---

## 🔌 BAGIAN 1: Mengunduh Program Pendukung (Wajib)

Agar SSI Measure bisa berjalan lancar, komputer memerlukan 2 program pendukung sederhana:

### 1. Install Node.js (Mesin Penggerak Program)
1. Buka browser (Google Chrome/Edge) dan ketik alamat: **[nodejs.org](https://nodejs.org)**
2. Klik tombol hijau yang bertuliskan **LTS (Recommended For Most Users)**.
3. Setelah terdownload, buka file tersebut (misal `node-v...-x64.msi`).
4. Klik **Next** terus-menerus sampai selesai, lalu klik **Finish**.

### 2. Install XAMPP (Buku Catatan Digital / Database)
1. Buka browser dan ketik alamat: **[apachefriends.org](https://www.apachefriends.org)**
2. Download **XAMPP for Windows**.
3. Buka file installer yang sudah didownload, klik **Next** sampai selesai, lalu klik **Finish**.

---

## 🗄️ BAGIAN 2: Menyiapkan Tempat Penyimpanan Data (Database)

Tahap ini hanya perlu dilakukan sekali saat pemasangan awal:

1. Buka aplikasi **XAMPP Control Panel** dari menu Start Windows Anda.
2. Di baris **Apache** dan **MySQL**, klik tombol **Start** pada keduanya hingga warna indikator berubah menjadi hijau.
3. Buka browser Chrome, lalu ketik alamat ini di bagian atas: `http://localhost/phpmyadmin`
4. Di sebelah kiri, klik menu **New** (Baru).
5. Pada kotak *Database name*, ketik persis: `ssi_measure`
6. Klik tombol **Create** (Buat).
7. Klik database `ssi_measure` yang baru dibuat di menu sebelah kiri.
8. Klik tab **Import** di bagian atas layar.
9. Klik tombol **Choose File** (Pilih File), lalu cari file bernama `schema.sql` yang berada di dalam folder proyek Anda di lokasi: `SSI Measure\backend\schema.sql`.
10. Scroll ke bawah dan klik tombol **Import** / **Go**. Data tabel berhasil dibuat!

---

## 🚀 BAGIAN 3: Membuka Aplikasi SSI Measure

Kabar baik! Sekarang SSI Measure sudah berupa Aplikasi Desktop, jadi Anda tidak perlu membuka terminal atau mengetik kode rumit.

1. Pastikan **XAMPP Control Panel** sudah menyala (Apache dan MySQL warna hijau).
2. Buka folder **SSI Measure** tempat Anda menyimpan semua file program ini.
3. Cari file bernama **`Buka-SSI-Measure.vbs`** (atau `SSI-Measure.bat`).
4. **Klik dua kali (Double-click)** file tersebut.
5. Tunggu beberapa detik, layar aplikasi SSI Measure akan langsung terbuka di depan Anda!

---

## 📋 BAGIAN 4: Cara Mengoperasikan Aplikasi SSI Measure

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
3. Data secara otomatis sudah tersimpan aman di dalam buku catatan digital Anda (Database MySQL).

---

## ❓ Solusi Masalah Umum (Troubleshooting)

- **Masalah**: Aplikasi ditekan klik dua kali tapi tidak terbuka.
  - **Solusi**: Pastikan Anda sudah menginstal Node.js. Coba restart komputer Anda, lalu klik dua kali lagi file `Buka-SSI-Measure.vbs` atau `SSI-Measure.bat`.
- **Masalah**: Data tidak tersimpan / Muncul tulisan Error Database di aplikasi.
  - **Solusi**: Pastikan Anda sudah menekan tombol **Start** pada aplikasi XAMPP (Apache dan MySQL) sebelum membuka aplikasi SSI Measure.
- **Masalah**: Angka timbangan diam saja / tidak bergerak.
  - **Solusi**: Pastikan kabel USB alat terhubung dengan kencang ke laptop/komputer. Pastikan juga Anda memilih **Port** (COM) yang benar di pengaturan bagian atas aplikasi.

---
*Panduan ini dibuat agar memudahkan pengoperasian sistem SSI Measure secara mandiri bagi semua kalangan.*
