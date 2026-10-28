# CP-INSIGHT

## 1. Tentang Aplikasi

CP-INSIGHT merupakan aplikasi berbasis web yang dikembangkan untuk menerapkan metode *Agglomerative Hierarchical Clustering* (AHC) dalam pengelompokan Capaian Pembelajaran (CP) pada Kurikulum Merdeka di SD Alo'oa.

Aplikasi ini digunakan untuk membantu proses pengelompokan capaian pembelajaran siswa kelas V berdasarkan kemiripan nilai mata pelajaran yang digunakan dalam penelitian.

## 2. Tujuan

Aplikasi ini bertujuan untuk menerapkan metode AHC dalam mengelompokkan capaian pembelajaran siswa, menampilkan hasil pengelompokan, serta membantu pengguna memahami kelompok capaian pembelajaran berdasarkan data nilai siswa.

## 3. Metode Penelitian

Metode yang diterapkan dalam aplikasi ini meliputi:

- **Algoritma:** Agglomerative Hierarchical Clustering (AHC).
- **Pengukuran jarak:** Euclidean Distance.
- **Metode penggabungan cluster:** Ward Linkage.
- **Evaluasi hasil clustering:** Silhouette Score, Davies-Bouldin Index (DBI), dan Calinski-Harabasz Index (CHI).

## 4. Teknologi yang Digunakan

- **Frontend:** Ionic dan Angular.
- **Backend:** Python dan Flask.
- **Database:** MySQL.
- **Pengolahan data:** SciPy dan scikit-learn.

## 5. Struktur Proyek

- `src/` — kode sumber antarmuka aplikasi.
- `src/app/login/` — halaman login.
- `src/app/reset-password/` — halaman pengaturan ulang kata sandi.
- `src/app/services/` — layanan komunikasi frontend dengan backend.
- `backend/` — kode backend, proses clustering, dan koneksi database.
- `backend/requirements.txt` — daftar dependensi Python.
- `package.json` — konfigurasi dependensi frontend.
- `.gitignore` — daftar file dan folder yang tidak disertakan dalam repository Git.

## 6. Persiapan

Sebelum menjalankan aplikasi, siapkan perangkat lunak berikut:

1. Node.js dan npm.
2. Ionic CLI.
3. Python.
4. MySQL dan phpMyAdmin atau perangkat pengelolaan MySQL lainnya.
5. Git, jika ingin mengambil kode melalui repository.

## 7. Konfigurasi Database

1. Jalankan layanan MySQL.
2. Siapkan database sesuai konfigurasi yang digunakan oleh backend.
3. Periksa pengaturan koneksi database pada `backend/database.py`.
4. Pastikan nama database, alamat server, username, dan password database sesuai dengan konfigurasi lokal.

Jangan mengunggah password database atau informasi rahasia lainnya ke repository publik.

## 8. Menjalankan Backend

Buka terminal dan masuk ke folder backend:

```bash
cd backend
```

Buat dan aktifkan virtual environment jika belum tersedia:

```bash
python -m venv venv
```

Pada Windows Command Prompt, aktifkan dengan:

```cmd
venv\Scripts\activate
```

Pasang dependensi Python:

```bash
pip install -r requirements.txt
```

Setelah konfigurasi database selesai, jalankan backend:

```bash
python app.py
```

Backend berjalan sesuai alamat dan port yang ditetapkan dalam konfigurasi aplikasi. Secara lokal, aplikasi ini menggunakan port `5000`.

## 9. Menjalankan Frontend

Buka terminal CMD baru, kemudian masuk ke folder utama proyek:

```cmd
cd C:\Users\LENOVO\CP-Insight
```

Pasang dependensi frontend jika belum tersedia:

```cmd
npm install
```

Jalankan aplikasi Ionic:

```cmd
ionic serve --host=0.0.0.0 --port=8101
```

Buka alamat lokal yang ditampilkan oleh terminal pada browser. Untuk mengakses aplikasi dari perangkat lain dalam jaringan Wi-Fi yang sama, gunakan alamat IP laptop dan port frontend yang sedang aktif, serta pastikan konfigurasi jaringan dan firewall mengizinkannya.

Sesuaikan alamat backend pada konfigurasi frontend dengan alamat komputer tempat Flask berjalan.

## 10. Petunjuk Penggunaan Aplikasi

### 10.1 Login

1. Buka aplikasi melalui browser.
2. Masukkan username dan kata sandi akun yang sudah terdaftar.
3. Tekan tombol login.
4. Setelah berhasil, pengguna masuk ke halaman utama aplikasi.

### 10.2 Mengelola Data Siswa

1. Buka menu data siswa.
2. Tambahkan data siswa melalui formulir yang tersedia atau fitur impor Excel jika diperlukan.
3. Periksa nama, kelas, dan nilai mata pelajaran yang dimasukkan.
4. Pastikan data sudah benar sebelum menjalankan proses clustering.

### 10.3 Menjalankan Clustering

1. Buka menu proses clustering.
2. Pastikan data siswa yang akan dianalisis sudah tersedia.
3. Jalankan proses Agglomerative Hierarchical Clustering.
4. Sistem mengolah kemiripan data menggunakan Euclidean Distance dan Ward Linkage.
5. Sistem menghitung nilai evaluasi cluster sesuai implementasi aplikasi.

### 10.4 Melihat Hasil Clustering

1. Buka menu hasil clustering.
2. Periksa hasil pengelompokan siswa.
3. Amati jumlah anggota setiap cluster dan informasi pendukung yang ditampilkan.
4. Gunakan dendrogram dan nilai evaluasi yang tersedia untuk membantu memahami hasil pengelompokan.

### 10.5 Reset Kata Sandi

1. Buka halaman login.
2. Pilih menu lupa kata sandi.
3. Masukkan alamat email yang terdaftar jika diminta.
4. Buka email pemulihan dan ikuti tautan yang diberikan.
5. Masukkan kata sandi baru dan konfirmasikan sesuai petunjuk pada halaman reset password.

Fitur pemulihan kata sandi memerlukan konfigurasi email pada backend. Jangan membagikan token pemulihan atau kredensial email.

## 11. Catatan Keamanan

- Jangan mengunggah file `.env`, kata sandi, token, atau kredensial pribadi ke GitHub.
- Jangan mengunggah database yang berisi data pribadi siswa tanpa izin dan perlindungan yang sesuai.
- Gunakan akun yang sudah dikonfigurasi untuk pengujian aplikasi.
- Alamat IP lokal dapat berubah sesuai jaringan yang digunakan. Sesuaikan konfigurasi apabila alamat IP berubah.

## 12. Penutup

CP-INSIGHT dikembangkan sebagai bagian dari penelitian skripsi mengenai penerapan metode Agglomerative Hierarchical Clustering untuk pengelompokan capaian pembelajaran siswa kelas V pada Kurikulum Merdeka di SD Alo'oa.
