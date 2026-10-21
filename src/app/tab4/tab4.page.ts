import { Component } from '@angular/core';
import { PythonService } from '../services/python.service';
import { AhcService } from '../services/ahc.service';
import { environment } from 'src/environments/environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false
})
export class Tab4Page {

  // =====================================================
  // DATA
  // =====================================================

  dataSiswa: any[] = [];

  distanceMatrix: number[][] = [];

  hasilCluster: any[] = [];

  capaianCluster: any[] = [];

  mergeHistory: any[] = [];

  silhouetteDetail: any[] = [];

  dbiDetail: any[] = [];

  chiDetail: any[] = [];

  svgLines: any[] = [];

  dendrogramData: any[] = [];

  // =====================================================
  // HASIL DENDROGRAM
  // =====================================================

  dendrogramImage: string = '';

  // =====================================================
  // JUMLAH DATA
  // =====================================================

  jumlahData: number = 0;

  jumlahCluster: number = 0;

  // =====================================================
  // EVALUASI
  // =====================================================

  silhouetteScore: any = '-';

  dbi: any = '-';

  chi: any = '-';

  totalBSS: number = 0;

  totalWSS: number = 0;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private ahcService: AhcService,
    private pythonService: PythonService,
    private alertController: AlertController
  ) { }


  // =====================================================
  // LOAD DATA SAAT TAB 4 DIBUKA
  // =====================================================

  ionViewWillEnter() {

    console.log('================================');
    console.log('TAB 4 DIBUKA');
    console.log('================================');


    // =====================================================
    // DATA SISWA
    // =====================================================

    this.dataSiswa =
      this.ahcService.getData() || [];

    this.jumlahData =
      this.dataSiswa.length;


    // =====================================================
    // DISTANCE MATRIX
    // =====================================================

    this.distanceMatrix =
      this.ahcService.getDistanceMatrix() || [];


    // =====================================================
    // HASIL CLUSTER
    // =====================================================

    this.hasilCluster =
      this.ahcService.getClusters() || [];


    // =====================================================
    // CAPAIAN CLUSTER
    // =====================================================

    this.capaianCluster =
      this.ahcService.getCapaianCluster() || [];


    // =====================================================
    // TARGET JUMLAH CLUSTER
    // =====================================================

    this.jumlahCluster =
      this.ahcService.getTargetCluster() ||
      this.hasilCluster.length;


    // =====================================================
    // MERGE HISTORY
    // =====================================================

    this.mergeHistory =
      this.ahcService.getMergeHistory() || [];


    // =====================================================
    // EVALUASI
    // =====================================================

    this.silhouetteScore =
      this.ahcService.getSilhouette();

    this.dbi =
      this.ahcService.getDBI();

    this.chi =
      this.ahcService.getCHI();


    // =====================================================
    // DETAIL EVALUASI
    // =====================================================

    this.silhouetteDetail =
      this.ahcService.getSilhouetteDetail() || [];

    this.dbiDetail =
      this.ahcService.getDBIDetail() || [];

    this.chiDetail =
      this.ahcService.getCHIDetail() || [];


    // =====================================================
    // BSS & WSS
    // =====================================================

    this.totalBSS =
      this.ahcService.getTotalBSS() || 0;

    this.totalWSS =
      this.ahcService.getTotalWSS() || 0;


    // =====================================================
    // DENDROGRAM
    // =====================================================

    this.dendrogramImage =
      this.ahcService.getDendrogramImage() || '';


    // =====================================================
    // BENTUK DATA DENDROGRAM
    // =====================================================

    this.createDendrogram();


    // =====================================================
    // DEBUG
    // =====================================================

    console.log('========== TAB 4 ==========');

    console.log(
      'Jumlah Data:',
      this.jumlahData
    );

    console.log(
      'Jumlah Cluster:',
      this.jumlahCluster
    );

    console.log(
      'Hasil Cluster:',
      this.hasilCluster
    );

    console.log(
      'Capaian Cluster:',
      this.capaianCluster
    );

    console.log(
      'Dendrogram:',
      this.dendrogramImage
    );

    console.log(
      'Silhouette:',
      this.silhouetteScore
    );

    console.log(
      'DBI:',
      this.dbi
    );

    console.log(
      'CHI:',
      this.chi
    );

    console.log('============================');


    // =====================================================
    // CEK JIKA DENDROGRAM BELUM TERSEDIA
    // =====================================================

    if (!this.dendrogramImage) {

      setTimeout(() => {

        this.dendrogramImage =
          this.ahcService.getDendrogramImage() || '';

        console.log(
          'Dendrogram setelah pengecekan:',
          this.dendrogramImage
        );

      }, 500);

    }

  }


  // =====================================================
  // MENGAMBIL ANGGOTA CLUSTER
  // =====================================================

  getAnggotaCluster(cluster: any): any[] {

    if (!cluster) {
      return [];
    }

    if (!cluster.anggota) {
      return [];
    }

    return cluster.anggota
      .map((index: number) => {

        return this.dataSiswa[index];

      })
      .filter(
        (siswa: any) => siswa != null
      );

  }


  // =====================================================
  // JUMLAH ANGGOTA
  // =====================================================

  getJumlahAnggota(cluster: any): number {

    if (
      !cluster ||
      !cluster.anggota
    ) {
      return 0;
    }

    return cluster.anggota.length;

  }


  // =====================================================
  // MENGAMBIL JUMLAH ANGGOTA TERBANYAK
  // =====================================================

  getMaxAnggota(): number {

    if (
      !this.hasilCluster ||
      this.hasilCluster.length === 0
    ) {
      return 0;
    }

    return Math.max(
      ...this.hasilCluster.map(
        (cluster: any) =>
          cluster.anggota.length
      )
    );

  }


  // =====================================================
  // MEMBUAT BARIS KOSONG
  // AGAR SEMUA TABEL SEJAJAR
  // =====================================================

  getBarisKosong(cluster: any): number[] {

    const jumlahSekarang =
      cluster.anggota.length;

    const jumlahMaksimal =
      this.getMaxAnggota();

    const jumlahKosong =
      jumlahMaksimal -
      jumlahSekarang;

    return Array.from(
      {
        length: jumlahKosong
      },
      (_, index) => index
    );

  }


  // =====================================================
  // MEMBENTUK DENDROGRAM
  // =====================================================

  createDendrogram() {

    this.svgLines = [];

    if (!this.mergeHistory) {
      return;
    }

    this.mergeHistory.forEach(
      (merge: any, index: number) => {

        this.svgLines.push({

          x: 180,

          y1:
            40 +
            (index * 40),

          y2:
            80 +
            (index * 40),

          label1:
            merge.label1,

          label2:
            merge.label2,

          distance:
            merge.distance

        });

      }
    );

  }


  // =====================================================
  // POSISI GARIS DENDROGRAM
  // =====================================================

  getY(index: number): number {

    return 40 +
      (index * 60);

  }


  // =====================================================
  // MATA PELAJARAN DOMINAN
  // =====================================================

  getDominan(cluster: any): string {

    if (
      !cluster ||
      !cluster.anggota ||
      cluster.anggota.length === 0
    ) {

      return '-';

    }


    const mapel = [

      {
        key: 'agama',
        nama: 'Pendidikan Agama'
      },

      {
        key: 'ppkn',
        nama: 'Pendidikan Pancasila'
      },

      {
        key: 'indonesia',
        nama: 'Bahasa Indonesia'
      },

      {
        key: 'matematika',
        nama: 'Matematika'
      },

      {
        key: 'pjok',
        nama: 'PJOK'
      },

      {
        key: 'seni',
        nama: 'Seni Budaya'
      },

      {
        key: 'mulok',
        nama: 'Muatan Lokal'
      },

      {
        key: 'ipas',
        nama: 'IPAS'
      },

      {
        key: 'inggris',
        nama: 'Bahasa Inggris'
      }

    ];


    const total =
      new Array(
        mapel.length
      ).fill(0);


    cluster.anggota.forEach(
      (index: number) => {

        const siswa =
          this.dataSiswa[index];

        if (!siswa) {
          return;
        }


        mapel.forEach(
          (m, i) => {

            total[i] +=
              Number(
                siswa[m.key]
              ) || 0;

          }
        );

      }
    );


    let terbesar = 0;

    let indexTerbesar = 0;


    total.forEach(
      (nilai, i) => {

        if (nilai > terbesar) {

          terbesar = nilai;

          indexTerbesar = i;

        }

      }
    );


    return mapel[
      indexTerbesar
    ].nama;

  }


  // =====================================================
  // RATA-RATA MAPEL DOMINAN
  // =====================================================

  getRataDominan(cluster: any): string {

    if (
      !cluster ||
      !cluster.anggota ||
      cluster.anggota.length === 0
    ) {

      return '0.00';

    }


    const mapel = [

      'agama',
      'ppkn',
      'indonesia',
      'matematika',
      'pjok',
      'seni',
      'mulok',
      'ipas',
      'inggris'

    ];


    const total =
      new Array(
        mapel.length
      ).fill(0);


    cluster.anggota.forEach(
      (index: number) => {

        const siswa =
          this.dataSiswa[index];

        if (!siswa) {
          return;
        }


        mapel.forEach(
          (m, i) => {

            total[i] +=
              Number(
                siswa[m]
              ) || 0;

          }
        );

      }
    );


    let terbesar = 0;


    total.forEach(
      (nilai: number) => {

        if (nilai > terbesar) {

          terbesar = nilai;

        }

      }
    );


    return (
      terbesar /
      cluster.anggota.length
    ).toFixed(2);

  }


  // =====================================================
  // REKOMENDASI CLUSTER
  // =====================================================

  getRekomendasi(
    cluster: any
  ): string {

    if (!cluster) {
      return '-';
    }

    return this.ahcService
      .getRecommendation(cluster);

  }


  // =====================================================
  // INTERPRETASI SILHOUETTE
  // =====================================================

  getSilhouetteInterpretation(): string {

    const nilai =
      Number(
        this.silhouetteScore
      );


    if (isNaN(nilai)) {

      return 'Nilai belum tersedia.';

    }


    if (nilai >= 0.71) {

      return 'Struktur cluster sangat kuat.';

    }


    if (nilai >= 0.51) {

      return 'Struktur cluster baik.';

    }


    if (nilai >= 0.26) {

      return 'Struktur cluster cukup.';

    }


    return 'Struktur cluster lemah.';

  }


  // =====================================================
  // INTERPRETASI DBI
  // =====================================================

  getDBIInterpretation(): string {

    const nilai =
      Number(this.dbi);


    if (isNaN(nilai)) {

      return 'Nilai belum tersedia.';

    }


    if (nilai < 1) {

      return 'Kualitas cluster sangat baik.';

    }


    if (nilai < 2) {

      return 'Kualitas cluster baik.';

    }


    return 'Kualitas cluster kurang baik.';

  }


  // =====================================================
  // INTERPRETASI CHI
  // =====================================================

  getCHIInterpretation(): string {

    const nilai =
      Number(this.chi);


    if (isNaN(nilai)) {

      return 'Nilai belum tersedia.';

    }


    if (nilai >= 100) {

      return 'Pemisahan cluster sangat baik.';

    }


    if (nilai >= 50) {

      return 'Pemisahan cluster cukup baik.';

    }


    return 'Pemisahan cluster masih rendah.';

  }


  // =====================================================
  // EXPORT PDF LENGKAP
  // =====================================================

  exportPDF() {

    console.log('================================');
    console.log('MULAI EXPORT PDF');
    console.log('================================');


    // =====================================================
    // PASTIKAN DATA TERBARU
    // =====================================================

    this.dataSiswa =
      this.ahcService.getData() || [];

    this.hasilCluster =
      this.ahcService.getClusters() || [];

    this.capaianCluster =
      this.ahcService.getCapaianCluster() || [];

    this.dendrogramImage =
      this.ahcService.getDendrogramImage() || '';

    this.jumlahData =
      this.dataSiswa.length;

    this.jumlahCluster =
      this.hasilCluster.length;

    this.silhouetteScore =
      this.ahcService.getSilhouette();

    this.dbi =
      this.ahcService.getDBI();

    this.chi =
      this.ahcService.getCHI();

    this.totalBSS =
      this.ahcService.getTotalBSS() || 0;

    this.totalWSS =
      this.ahcService.getTotalWSS() || 0;


    // =====================================================
    // BUAT DOKUMEN A4
    // =====================================================

    const doc =
      new jsPDF({

        orientation: 'portrait',

        unit: 'mm',

        format: 'a4'

      });


    // =====================================================
    // TANGGAL
    // =====================================================

    const tanggal =
      new Date().toLocaleDateString(
        'id-ID',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }
      );


    const margin = 14;

    const lebar = 182;


    // =====================================================
    // HEADER LAPORAN
    // =====================================================

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(15);


    doc.text(
      'LAPORAN HASIL PENGELOMPOKAN',
      105,
      16,
      {
        align: 'center'
      }
    );


    doc.text(
      'CAPAIAN PEMBELAJARAN SISWA',
      105,
      23,
      {
        align: 'center'
      }
    );


    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setFontSize(10);


    doc.text(
      'Metode Agglomerative Hierarchical Clustering',
      105,
      30,
      {
        align: 'center'
      }
    );


    doc.line(
      margin,
      34,
      196,
      34
    );


    // =====================================================
    // IDENTITAS PENELITIAN
    // =====================================================

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(11);


    doc.text(
      'INFORMASI HASIL CLUSTERING',
      margin,
      44
    );


    const informasi = [

      [
        'Sekolah',
        "SD Negeri Alo'oa"
      ],

      [
        'Metode',
        'Agglomerative Hierarchical Clustering'
      ],

      [
        'Linkage',
        'Ward Linkage'
      ],

      [
        'Jumlah Data',
        `${this.jumlahData} siswa`
      ],

      [
        'Jumlah Cluster',
        `${this.jumlahCluster} cluster`
      ],

      [
        'Tanggal Cetak',
        tanggal
      ]

    ];


    autoTable(
      doc,
      {

        startY: 48,

        body: informasi,

        theme: 'grid',

        styles: {

          fontSize: 9,

          cellPadding: 3

        },

        columnStyles: {

          0: {

            fontStyle: 'bold',

            cellWidth: 45

          },

          1: {

            cellWidth: 137

          }

        }

      }
    );


    // =====================================================
    // HASIL EVALUASI
    // =====================================================

    let y =
      (doc as any)
        .lastAutoTable.finalY + 10;


    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(11);


    doc.text(
      'HASIL EVALUASI CLUSTER',
      margin,
      y
    );


    const evaluasi = [

      [
        'Silhouette Score',

        Number(
          this.silhouetteScore
        ).toFixed(4),

        this.getSilhouetteInterpretation()

      ],

      [
        'Davies-Bouldin Index',

        Number(
          this.dbi
        ).toFixed(4),

        this.getDBIInterpretation()

      ],

      [
        'Calinski-Harabasz Index',

        Number(
          this.chi
        ).toFixed(4),

        this.getCHIInterpretation()

      ],

      [
        'Total BSS',

        Number(
          this.totalBSS
        ).toFixed(4),

        'Between Cluster Sum of Squares'

      ],

      [
        'Total WSS',

        Number(
          this.totalWSS
        ).toFixed(4),

        'Within Cluster Sum of Squares'

      ]

    ];


    autoTable(
      doc,
      {

        startY:
          y + 4,

        head: [

          [
            'Indikator',
            'Nilai',
            'Interpretasi'
          ]

        ],

        body:
          evaluasi,

        theme:
          'grid',

        styles: {

          fontSize: 8.5,

          cellPadding: 3,

          valign: 'middle'

        },

        headStyles: {

          fontStyle:
            'bold'

        },

        columnStyles: {

          0: {

            cellWidth: 45

          },

          1: {

            cellWidth: 30,

            halign:
              'center'

          },

          2: {

            cellWidth: 107

          }

        }

      }
    );


    // =====================================================
    // HASIL SETIAP CLUSTER
    // =====================================================

    y =
      (doc as any)
        .lastAutoTable.finalY + 12;


    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(11);


    doc.text(
      'HASIL PENGELOMPOKAN SETIAP CLUSTER',
      margin,
      y
    );


    const dataCluster: any[] = [];


    this.hasilCluster.forEach(
      (
        cluster: any,
        index: number
      ) => {

        const anggota =
          this.getAnggotaCluster(
            cluster
          );


        const jumlah =
          anggota.length;


        const dominan =
          this.getDominan(
            cluster
          );


        const rataDominan =
          this.getRataDominan(
            cluster
          );


        const rekomendasi =
          this.getRekomendasi(
            cluster
          );


        dataCluster.push([

          `Cluster ${index + 1}`,

          jumlah.toString(),

          dominan,

          rataDominan,

          rekomendasi

        ]);

      }
    );


    autoTable(
      doc,
      {

        startY:
          y + 4,

        head: [

          [
            'Cluster',
            'Jumlah Siswa',
            'Mapel Dominan',
            'Rata-rata',
            'Rekomendasi'
          ]

        ],

        body:
          dataCluster,

        theme:
          'grid',

        styles: {

          fontSize: 8,

          cellPadding: 2.5,

          valign:
            'middle'

        },

        headStyles: {

          fontStyle:
            'bold'

        },

        columnStyles: {

          0: {

            cellWidth: 25

          },

          1: {

            cellWidth: 25,

            halign:
              'center'

          },

          2: {

            cellWidth: 38

          },

          3: {

            cellWidth: 22,

            halign:
              'center'

          },

          4: {

            cellWidth: 72

          }

        }

      }
    );


    // =====================================================
// DAFTAR SELURUH SISWA
// =====================================================

doc.addPage();

y = 18;

doc.setFont(
  'helvetica',
  'bold'
);

doc.setFontSize(12);

doc.text(
  'DAFTAR ANGGOTA SETIAP CLUSTER',
  margin,
  y
);

y += 7;


// =====================================================
// DATA ANGGOTA
// NO, NAMA, KELAS, CLUSTER
// =====================================================

const anggotaPDF: any[] = [];

let nomor = 1;


this.hasilCluster.forEach(
  (
    cluster: any,
    index: number
  ) => {

    const anggota =
      this.getAnggotaCluster(
        cluster
      );


    anggota.forEach(
      (siswa: any) => {

        anggotaPDF.push([

          nomor,

          siswa.nama || '-',

          siswa.kelas || '-',

          `Cluster ${index + 1}`

        ]);

        nomor++;

      }
    );

  }
);


// =====================================================
// TABEL DAFTAR SISWA
// =====================================================

autoTable(
  doc,
  {

    startY: y,

    head: [

      [
        'No',
        'Nama Siswa',
        'Kelas',
        'Cluster'
      ]

    ],

    body:
      anggotaPDF,

    theme:
      'grid',

    styles: {

      fontSize: 9,

      cellPadding: 3,

      valign:
        'middle'

    },

    headStyles: {

      fontStyle:
        'bold',

      halign:
        'center'

    },

    columnStyles: {

      // NO
      0: {

        cellWidth: 15,

        halign:
          'center'

      },

      // NAMA SISWA
      1: {

        cellWidth: 95,

        halign:
          'left'

      },

      // KELAS
      2: {

        cellWidth: 30,

        halign:
          'center'

      },

      // CLUSTER
      3: {

        cellWidth: 42,

        halign:
          'center'

      }

    }

  }
);

// =====================================================
// DENDROGRAM
// =====================================================

doc.addPage();

doc.setFont(
  'helvetica',
  'bold'
);

doc.setFontSize(13);

doc.text(
  'DENDROGRAM',
  105,
  18,
  {
    align: 'center'
  }
);

doc.setFont(
  'helvetica',
  'normal'
);

doc.setFontSize(9);

doc.text(
  'Visualisasi proses penggabungan cluster menggunakan Ward Linkage',
  105,
  25,
  {
    align: 'center'
  }
);


// =====================================================
// CEK DENDROGRAM
// =====================================================

if (!this.dendrogramImage) {

  doc.text(
    'Dendrogram belum tersedia.',
    105,
    45,
    {
      align: 'center'
    }
  );

  this.tampilkanKesimpulanPDF(
    doc,
    60
  );

  return;
}


// =====================================================
// LOAD DENDROGRAM
// =====================================================

const img = new Image();

img.crossOrigin = 'Anonymous';

img.onload = () => {

  console.log(
    'Dendrogram berhasil dimuat untuk PDF'
  );


  // ===================================================
  // UKURAN MAKSIMAL DENDROGRAM
  // ===================================================

  const maxWidth = 180;
  const maxHeight = 210;

  let width = img.width;
  let height = img.height;


  // ===================================================
  // PERTAHANKAN RASIO GAMBAR
  // ===================================================

  const rasio = Math.min(
    maxWidth / width,
    maxHeight / height
  );

  width =
    width * rasio;

  height =
    height * rasio;


  // ===================================================
  // POSISI TENGAH
  // ===================================================

  const x =
    (210 - width) / 2;

  const yDendrogram =
    35;


  // ===================================================
  // TAMBAHKAN DENDROGRAM KE PDF
  // ===================================================

  doc.addImage(
    img,
    'PNG',
    x,
    yDendrogram,
    width,
    height
  );


  // ===================================================
  // KESIMPULAN SETELAH DENDROGRAM
  // ===================================================

  const ySetelahDendrogram =
    yDendrogram +
    height +
    12;


  this.tampilkanKesimpulanPDF(
    doc,
    ySetelahDendrogram
  );

};


// =====================================================
// JIKA DENDROGRAM GAGAL DIMUAT
// =====================================================

img.onerror = () => {

  console.log(
    'Gagal memuat dendrogram'
  );

  doc.setFont(
    'helvetica',
    'normal'
  );

  doc.setFontSize(10);

  doc.text(
    'Dendrogram tidak dapat dimuat.',
    105,
    50,
    {
      align: 'center'
    }
  );


  this.tampilkanKesimpulanPDF(
    doc,
    70
  );

};


// =====================================================
// URL DENDROGRAM
// =====================================================

img.src =
  this.dendrogramImage;
}
// =====================================================
// KESIMPULAN / PEMAHAMAN UNTUK ORANG TUA
// =====================================================

private tampilkanKesimpulanPDF(
  doc: jsPDF,
  y: number
) {

  // =====================================================
  // BUAT HALAMAN KHUSUS UNTUK ORANG TUA
  // =====================================================

  doc.addPage();

  y = 20;

  const margin = 14;
  const lebar = 182;


  // =====================================================
  // JUDUL
  // =====================================================

  doc.setFont(
    'helvetica',
    'bold'
  );

  doc.setFontSize(14);

  doc.text(
    'LAPORAN HASIL CAPAIAN PEMBELAJARAN SISWA',
    105,
    y,
    {
      align: 'center'
    }
  );

  y += 7;


  doc.setFont(
    'helvetica',
    'normal'
  );

  doc.setFontSize(9);

  doc.text(
    "SD Negeri Alo'oa",
    105,
    y,
    {
      align: 'center'
    }
  );

  y += 12;


  // =====================================================
  // RINGKASAN HASIL
  // =====================================================

  doc.setFont(
    'helvetica',
    'bold'
  );

  doc.setFontSize(11);

  doc.text(
    'RINGKASAN HASIL',
    margin,
    y
  );

  y += 6;


  doc.setFont(
    'helvetica',
    'normal'
  );

  doc.setFontSize(9.5);


  const ringkasan =
    'Hasil pengelompokan capaian pembelajaran menunjukkan bahwa data siswa terbagi menjadi ' +
    this.jumlahCluster +
    ' kelompok berdasarkan kemiripan capaian pembelajaran. ' +
    'Pengelompokan ini digunakan untuk membantu guru memahami karakteristik capaian siswa dan memberikan pendampingan pembelajaran yang lebih sesuai.';


  const textRingkasan =
    doc.splitTextToSize(
      ringkasan,
      lebar
    );


  doc.text(
    textRingkasan,
    margin,
    y,
    {
      maxWidth: lebar,
      lineHeightFactor: 1.5
    }
  );


  y +=
    (textRingkasan.length * 5) + 8;


  // =====================================================
  // HASIL KELOMPOK CAPAIAN
  // =====================================================

  doc.setFont(
    'helvetica',
    'bold'
  );

  doc.setFontSize(11);

  doc.text(
    'HASIL KELOMPOK CAPAIAN SISWA',
    margin,
    y
  );

  y += 6;


  // =====================================================
  // TABEL RINGKASAN CLUSTER
  // =====================================================

  const ringkasanCluster: any[] = [];


  this.hasilCluster.forEach(
    (
      cluster: any,
      index: number
    ) => {

      const anggota =
        this.getAnggotaCluster(
          cluster
        );


      const dominan =
        this.getDominan(
          cluster
        );


      const capaian =
        this.capaianCluster[index]?.capaian || '-';


      const rataRata =
        this.capaianCluster[index]?.rataRata || '-';


      ringkasanCluster.push([

        `Cluster ${index + 1}`,

        `${anggota.length} siswa`,

        capaian,

        rataRata,

        dominan

      ]);

    }
  );


  autoTable(
    doc,
    {

      startY: y,

      head: [[

        'Cluster',
        'Jumlah',
        'Capaian',
        'Rata-rata',
        'Mapel Dominan'

      ]],

      body:
        ringkasanCluster,

      theme:
        'grid',

      styles: {

        fontSize: 8.5,

        cellPadding: 3,

        valign:
          'middle'

      },

      headStyles: {

        fontStyle:
          'bold',

        halign:
          'center'

      },

      columnStyles: {

        0: {
          cellWidth: 28,
          halign: 'center'
        },

        1: {
          cellWidth: 25,
          halign: 'center'
        },

        2: {
          cellWidth: 30,
          halign: 'center'
        },

        3: {
          cellWidth: 30,
          halign: 'center'
        },

        4: {
          cellWidth: 69
        }

      }

    }
  );


  y =
    (doc as any)
      .lastAutoTable.finalY + 10;


  // =====================================================
  // PEMAHAMAN UNTUK ORANG TUA / WALI
  // =====================================================

  doc.setFont(
    'helvetica',
    'bold'
  );

  doc.setFontSize(11);

  doc.text(
    'PEMAHAMAN UNTUK ORANG TUA / WALI',
    margin,
    y
  );

  y += 6;


  doc.setFont(
    'helvetica',
    'normal'
  );

  doc.setFontSize(9.5);


  const pemahaman =
    'Hasil pengelompokan ini dapat menjadi bahan informasi bagi orang tua atau wali dalam memahami perkembangan capaian pembelajaran anak. ' +
    'Setiap siswa memiliki karakteristik kemampuan yang berbeda. Oleh karena itu, hasil cluster tidak dimaksudkan untuk membandingkan atau memberi label kepada siswa, tetapi untuk membantu guru dan orang tua memberikan perhatian serta pendampingan yang sesuai dengan kebutuhan belajar anak.';


  const textPemahaman =
    doc.splitTextToSize(
      pemahaman,
      lebar
    );


  doc.text(
    textPemahaman,
    margin,
    y,
    {
      maxWidth: lebar,
      lineHeightFactor: 1.5
    }
  );


  y +=
    (textPemahaman.length * 5) + 8;


  // =====================================================
  // SARAN PENDAMPINGAN DI RUMAH
  // =====================================================

  doc.setFont(
    'helvetica',
    'bold'
  );

  doc.setFontSize(11);

  doc.text(
    'SARAN PENDAMPINGAN DI RUMAH',
    margin,
    y
  );

  y += 6;


  doc.setFont(
    'helvetica',
    'normal'
  );

  doc.setFontSize(9.5);


  const saran =
    'Orang tua atau wali diharapkan dapat memberikan pendampingan belajar secara rutin, memberikan kesempatan kepada anak untuk mengulang materi yang masih membutuhkan penguatan, serta memberikan apresiasi terhadap setiap perkembangan yang dicapai. ' +
    'Pendampingan dapat dilakukan melalui membaca, latihan soal, kegiatan praktik, diskusi sederhana, maupun kegiatan belajar lain yang sesuai dengan kebutuhan anak.';


  const textSaran =
    doc.splitTextToSize(
      saran,
      lebar
    );


  doc.text(
    textSaran,
    margin,
    y,
    {
      maxWidth: lebar,
      lineHeightFactor: 1.5
    }
  );


  y +=
    (textSaran.length * 5) + 12;


  // =====================================================
  // PESAN PENUTUP
  // =====================================================

  doc.setFont(
    'helvetica',
    'bold'
  );

  doc.setFontSize(10);


  const pesan =
    'Kerja sama antara sekolah dan orang tua sangat penting dalam mendukung perkembangan belajar siswa.';


  const textPesan =
    doc.splitTextToSize(
      pesan,
      lebar
    );


  doc.text(
    textPesan,
    105,
    y,
    {
      align: 'center',
      maxWidth: lebar
    }
  );


  y += 18;


  // =====================================================
  // TEMPAT DAN TANDA TANGAN
  // =====================================================

  const tanggal =
    new Date().toLocaleDateString(
      'id-ID',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    );


  doc.setFont(
    'helvetica',
    'normal'
  );

  doc.setFontSize(9);


  doc.text(
    `Alo'oa, ${tanggal}`,
    150,
    y,
    {
      align: 'center'
    }
  );


  y += 5;


  doc.text(
    'Guru / Wali Kelas',
    150,
    y,
    {
      align: 'center'
    }
  );


  y += 25;


  doc.setFont(
    'helvetica',
    'bold'
  );


  doc.text(
    '(........................................)',
    150,
    y,
    {
      align: 'center'
    }
  );


  // =====================================================
  // NOMOR HALAMAN
  // =====================================================

  this.tambahkanNomorHalaman(
    doc
  );


  // =====================================================
  // SIMPAN PDF
  // =====================================================

  doc.save(
    'Laporan_Hasil_Clustering_SD_Alooa.pdf'
  );


  console.log(
    '================================'
  );

  console.log(
    'PDF BERHASIL DIBUAT'
  );

  console.log(
    '================================'
  );

}


// =====================================================
// NOMOR HALAMAN
// =====================================================

private tambahkanNomorHalaman(
  doc: jsPDF
) {

  const jumlahHalaman =
    doc.getNumberOfPages();


  for (
    let i = 1;
    i <= jumlahHalaman;
    i++
  ) {

    doc.setPage(i);


    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setFontSize(8);


    doc.text(
      `Halaman ${i} dari ${jumlahHalaman}`,
      105,
      290,
      {
        align: 'center'
      }
    );

  }

}

}
