\# CP-Insight



CP-Insight adalah aplikasi berbasis web yang dikembangkan untuk menerapkan metode Agglomerative Hierarchical Clustering (AHC) dalam pengelompokan Capaian Pembelajaran (CP) pada Kurikulum Merdeka di SD Alo'oa.



\## Tujuan



Aplikasi ini membantu proses pengelompokan capaian pembelajaran siswa kelas V berdasarkan kemiripan nilai pada mata pelajaran yang digunakan dalam penelitian.



\## Metode



\- Algoritma: Agglomerative Hierarchical Clustering (AHC)

\- Pengukuran jarak: Euclidean Distance

\- Metode penggabungan cluster: Ward Linkage

\- Evaluasi cluster: Silhouette Score, Davies-Bouldin Index (DBI), dan Calinski-Harabasz Index (CHI)



\## Teknologi



\- Frontend: Ionic dan Angular

\- Backend: Python dan Flask

\- Database: MySQL

\- Pengolahan data: SciPy dan scikit-learn



\## Struktur Proyek



\- `src/` — kode sumber antarmuka aplikasi.

\- `backend/` — kode backend, pengolahan clustering, dan koneksi database.

\- `package.json` — konfigurasi dependensi frontend.

\- `backend/requirements.txt` — daftar dependensi Python.



\## Catatan



Aplikasi ini dikembangkan sebagai bagian dari penelitian skripsi mengenai penerapan metode AHC untuk pengelompokan capaian pembelajaran siswa.

