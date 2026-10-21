import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AhcService {

  // ==========================================
  // DATA SISWA
  // ==========================================

  private dataSiswa: any[] = [];

  private distanceMatrix: number[][] = [];

  private clusters: any[] = [];

  private mergeHistory: any[] = [];

  private dendrogramTree: any[] = [];

  private processLog: any[] = [];

  // ==========================================
  // EVALUASI
  // ==========================================

  private silhouette: number | null = null;

  private dbi: number | null = null;

  private chi: number | null = null;

  private silhouetteDetail: any[] = [];

  private dbiDetail: any[] = [];

  private dbiRDetail: any[] = [];

  private chiDetail: any[] = [];

  private totalBSS = 0;

  private totalWSS = 0;

  // ==========================================
  // KONFIGURASI
  // ==========================================

  private targetCluster = 0;

  private dendrogramImage = '';

  // Metode yang digunakan
  private linkageMethod = 'Ward';

  constructor() {}


  // ==========================================
  // DATA SISWA
  // ==========================================

  setData(data: any[]) {

    this.dataSiswa = data || [];

  }

  getData() {

    return this.dataSiswa;

  }

  clearData() {

    this.dataSiswa = [];

    this.distanceMatrix = [];

    this.clusters = [];

    this.mergeHistory = [];

    this.dendrogramTree = [];

    this.processLog = [];

    this.silhouette = null;

    this.dbi = null;

    this.chi = null;

    this.silhouetteDetail = [];

    this.dbiDetail = [];

    this.dbiRDetail = [];

    this.chiDetail = [];

    this.totalBSS = 0;

    this.totalWSS = 0;

  }


  // ==========================================
  // HASIL CLUSTER
  // ==========================================

  setClusters(clusters: any[]) {

    this.clusters = clusters;

  }

  getClusters() {

    return this.clusters;

  }


  // ==========================================
  // RIWAYAT MERGE
  // ==========================================

  getMergeHistory() {

    return this.mergeHistory;

  }

  getdendrogramTree() {

    return this.dendrogramTree;

  }


  // ==========================================
  // LOG PROSES
  // ==========================================

  getProcessLog() {

    return this.processLog;

  }

  clearProcessLog() {

    this.processLog = [];

  }


  // ==========================================
  // EVALUASI
  // ==========================================

  setEvaluation(
    silhouette: number,
    dbi: number,
    chi: number
  ) {

    this.silhouette = silhouette;

    this.dbi = dbi;

    this.chi = chi;

  }


  setTargetCluster(cluster: number) {

    this.targetCluster = cluster;

  }


  getTargetCluster(): number {

    return this.targetCluster;

  }


  setDendrogramImage(image: string) {

    this.dendrogramImage = image;

  }


  getDendrogramImage() {

    return this.dendrogramImage;

  }


  getSilhouette() {

    return this.silhouette;

  }


  getSilhouetteDetail() {

    return this.silhouetteDetail;

  }


  getDBIDetail() {

    return this.dbiDetail;

  }


  getDBIRDetail() {

    return this.dbiRDetail;

  }


  getDBI() {

    return this.dbi;

  }


  getCHI() {

    return this.chi;

  }


  getCHIDetail() {

    return this.chiDetail;

  }


  getTotalBSS() {

    return this.totalBSS;

  }


  getTotalWSS() {

    return this.totalWSS;

  }


  // ==========================================
  // MENGAMBIL 9 NILAI MATA PELAJARAN
  // ==========================================

  private getNilaiSiswa(siswa: any): number[] {

    return [

      Number(siswa.agama) || 0,

      Number(siswa.ppkn) || 0,

      Number(siswa.indonesia) || 0,

      Number(siswa.matematika) || 0,

      Number(siswa.pjok) || 0,

      Number(siswa.seni) || 0,

      Number(siswa.mulok) || 0,

      Number(siswa.ipas) || 0,

      Number(siswa.inggris) || 0

    ];

  }


  // ==========================================
  // EUCLIDEAN DISTANCE
  // ==========================================

  euclidean(a: any, b: any): number {

    const nilaiA = this.getNilaiSiswa(a);

    const nilaiB = this.getNilaiSiswa(b);

    let jumlah = 0;

    for (let i = 0; i < nilaiA.length; i++) {

      jumlah += Math.pow(
        nilaiA[i] - nilaiB[i],
        2
      );

    }

    return Math.sqrt(jumlah);

  }


  // ==========================================
  // MEMBUAT MATRIKS EUCLIDEAN
  // ==========================================

  createDistanceMatrix() {

    this.distanceMatrix = [];

    for (
      let i = 0;
      i < this.dataSiswa.length;
      i++
    ) {

      this.distanceMatrix[i] = [];

      for (
        let j = 0;
        j < this.dataSiswa.length;
        j++
      ) {

        this.distanceMatrix[i][j] = Number(

          this.euclidean(
            this.dataSiswa[i],
            this.dataSiswa[j]
          ).toFixed(4)

        );

      }

    }

    return this.distanceMatrix;

  }


  // ==========================================
  // AMBIL MATRIKS EUCLIDEAN
  // ==========================================

  getDistanceMatrix() {

    return this.distanceMatrix;

  }


  // ==========================================
  // MENCARI JARAK TERKECIL
  // ==========================================

  findMinimumDistance(matrix: number[][]) {

    let min = Number.MAX_VALUE;

    let row = -1;

    let col = -1;

    for (
      let i = 0;
      i < matrix.length;
      i++
    ) {

      for (
        let j = i + 1;
        j < matrix.length;
        j++
      ) {

        if (matrix[i][j] < min) {

          min = matrix[i][j];

          row = i;

          col = j;

        }

      }

    }

    return {

      row,

      col,

      distance: min

    };

  }


  // ==========================================
  // MEMBUAT CLUSTER AWAL
  // ==========================================

  createInitialClusters() {

    const clusters: any[] = [];

    for (
      let i = 0;
      i < this.dataSiswa.length;
      i++
    ) {

      clusters.push({

        id: i,

        anggota: [i]

      });

    }

    return clusters;

  }


  // ==========================================
  // CENTROID CLUSTER
  // ==========================================

  private calculateCentroid(
    cluster: any
  ): number[] {

    const centroid =
      new Array(9).fill(0);

    cluster.anggota.forEach(
      (index: number) => {

        const nilai =
          this.getNilaiSiswa(
            this.dataSiswa[index]
          );

        for (
          let i = 0;
          i < 9;
          i++
        ) {

          centroid[i] += nilai[i];

        }

      }
    );

    if (
      cluster.anggota.length > 0
    ) {

      for (
        let i = 0;
        i < 9;
        i++
      ) {

        centroid[i] =
          centroid[i] /
          cluster.anggota.length;

      }

    }

    return centroid;

  }


  // ==========================================
  // JARAK DUA VEKTOR
  // ==========================================

  private centroidDistance(
    a: number[],
    b: number[]
  ): number {

    let total = 0;

    for (
      let i = 0;
      i < a.length;
      i++
    ) {

      total += Math.pow(
        a[i] - b[i],
        2
      );

    }

    return Math.sqrt(total);

  }


  // ==========================================
  // WARD LINKAGE
  //
  // Ward memilih pasangan cluster
  // dengan kenaikan SSE/WSS paling kecil.
  //
  // ΔSSE =
  // (nA*nB)/(nA+nB) *
  // ||centroidA-centroidB||²
  // ==========================================

  wardDistance(
    clusterA: any,
    clusterB: any
  ): number {

    const centroidA =
      this.calculateCentroid(clusterA);

    const centroidB =
      this.calculateCentroid(clusterB);

    const nA =
      clusterA.anggota.length;

    const nB =
      clusterB.anggota.length;

    const jarakCentroid =
      this.centroidDistance(
        centroidA,
        centroidB
      );

    const deltaSSE =
      (
        (nA * nB) /
        (nA + nB)
      ) *
      Math.pow(
        jarakCentroid,
        2
      );

    return deltaSSE;

  }


  // ==========================================
  // MENGGABUNGKAN DUA CLUSTER
  // ==========================================

  mergeClusters(
    clusters: any[],
    indexA: number,
    indexB: number
  ) {

    const anggotaBaru = [

      ...clusters[indexA].anggota,

      ...clusters[indexB].anggota

    ];

    const clusterBaru = {

      id: Date.now() +
        Math.random(),

      anggota: anggotaBaru

    };

    const hasil =
      clusters.filter(
        (_, index) => {

          return (
            index !== indexA &&
            index !== indexB
          );

        }
      );

    hasil.push(clusterBaru);

    return hasil;

  }


  // ==========================================
  // PROSES AHC WARD
  // ==========================================

  processAHC(
    targetCluster: number = 3
  ): any[] {

    // ------------------------------------------
    // RESET
    // ------------------------------------------

    this.targetCluster =
      targetCluster;

    this.mergeHistory = [];

    this.processLog = [];

    this.silhouetteDetail = [];

    this.dbiDetail = [];

    this.dbiRDetail = [];

    this.chiDetail = [];

    this.silhouette = null;

    this.dbi = null;

    this.chi = null;

    this.totalBSS = 0;

    this.totalWSS = 0;


    // ------------------------------------------
    // VALIDASI
    // ------------------------------------------

    if (
      this.dataSiswa.length === 0
    ) {

      this.clusters = [];

      return [];

    }


    if (
      targetCluster < 1
    ) {

      targetCluster = 1;

    }


    if (
      targetCluster >=
      this.dataSiswa.length
    ) {

      targetCluster =
        this.dataSiswa.length;

    }


    // ------------------------------------------
    // TAHAP 1
    // MATRIKS EUCLIDEAN
    // ------------------------------------------

    this.createDistanceMatrix();

    this.processLog.push({

      tahap: 1,

      proses:
        'Membuat Matriks Euclidean',

      hasil:
        'Matriks jarak Euclidean berhasil dibuat untuk ' +
        this.dataSiswa.length +
        ' siswa'

    });


    // ------------------------------------------
    // TAHAP 2
    // CLUSTER AWAL
    // ------------------------------------------

    let clusters =
      this.createInitialClusters();

    this.processLog.push({

      tahap: 2,

      proses:
        'Membentuk Cluster Awal',

      hasil:
        clusters.length +
        ' cluster awal berhasil dibentuk'

    });


    // ------------------------------------------
    // TAHAP 3
    // AGGLOMERATIVE HIERARCHICAL
    // WARD
    // ------------------------------------------

    let langkah = 1;

    while (
      clusters.length >
      targetCluster
    ) {

      let min =
        Number.MAX_VALUE;

      let indexA = 0;

      let indexB = 1;


      // ----------------------------------------
      // CARI ΔSSE TERKECIL
      // ----------------------------------------

      for (
        let i = 0;
        i < clusters.length;
        i++
      ) {

        for (
          let j = i + 1;
          j < clusters.length;
          j++
        ) {

          const deltaSSE =
            this.wardDistance(
              clusters[i],
              clusters[j]
            );

          if (
            deltaSSE < min
          ) {

            min = deltaSSE;

            indexA = i;

            indexB = j;

          }

        }

      }


      // ----------------------------------------
      // INFORMASI CLUSTER
      // ----------------------------------------

      const anggotaA =
        clusters[indexA].anggota;

      const anggotaB =
        clusters[indexB].anggota;


      const namaClusterA =
        anggotaA.length === 1

          ? this.dataSiswa[
              anggotaA[0]
            ].nama

          : 'Cluster (' +
            anggotaA.length +
            ' siswa)';


      const namaClusterB =
        anggotaB.length === 1

          ? this.dataSiswa[
              anggotaB[0]
            ].nama

          : 'Cluster (' +
            anggotaB.length +
            ' siswa)';


      const centroidA =
        this.calculateCentroid(
          clusters[indexA]
        );

      const centroidB =
        this.calculateCentroid(
          clusters[indexB]
        );


      const jarakCentroid =
        this.centroidDistance(
          centroidA,
          centroidB
        );


      // ----------------------------------------
      // LOG PROSES WARD
      // ----------------------------------------

      this.processLog.push({

        tahap:
          this.processLog.length + 1,

        proses:
          'Menggabungkan Dua Cluster Terdekat (Ward)',

        hasil:

          namaClusterA +
          ' + ' +
          namaClusterB +

          '\nWard Criterion = ' +
          min.toFixed(4) +

          '\nJarak Centroid = ' +
          jarakCentroid.toFixed(4)

      });


      // ----------------------------------------
// SIMPAN MERGE HISTORY
// ----------------------------------------

this.mergeHistory.push({

  langkah: langkah,

  cluster1:
    clusters[indexA].id,

  cluster2:
    clusters[indexB].id,

  distance:
    Number(
      min.toFixed(4)
    ),

  wardCriterion:
    Number(
      min.toFixed(4)
    ),

  centroidDistance:
    Number(
      jarakCentroid.toFixed(4)
    ),

  // ==========================================
  // INDEX ANGGOTA
  // ==========================================

  anggota1:
    [...anggotaA],

  anggota2:
    [...anggotaB],

  clusterBaru:
    [
      ...anggotaA,
      ...anggotaB
    ],

  // ==========================================
  // NAMA ANGGOTA
  // ==========================================

  namaAnggota1:
    anggotaA.map(
      (index: number) =>
        this.dataSiswa[index]?.nama
    ),

  namaAnggota2:
    anggotaB.map(
      (index: number) =>
        this.dataSiswa[index]?.nama
    ),

  namaClusterBaru:
    [
      ...anggotaA,
      ...anggotaB
    ].map(
      (index: number) =>
        this.dataSiswa[index]?.nama
    ),

  label1:
    namaClusterA,

  label2:
    namaClusterB

});
      // ----------------------------------------
      // MERGE
      // ----------------------------------------

      clusters =
        this.mergeClusters(
          clusters,
          indexA,
          indexB
        );


      // ----------------------------------------
      // LOG JUMLAH CLUSTER
      // ----------------------------------------

      this.processLog.push({

        tahap:
          this.processLog.length + 1,

        proses:
          'Hasil Penggabungan Cluster (Ward)',

        hasil:
          'Jumlah cluster menjadi ' +
          clusters.length

      });


      langkah++;

    }


    // ------------------------------------------
    // SIMPAN HASIL AKHIR
    // ------------------------------------------

    this.clusters =
      clusters;


    // ------------------------------------------
    // HITUNG EVALUASI
    // ------------------------------------------

    this.calculateSilhouette();

    this.calculateDBI();

    this.calculateCHI();


    // ------------------------------------------
    // LOG SELESAI
    // ------------------------------------------

    this.processLog.push({

      tahap:
        this.processLog.length + 1,

      proses:
        'Proses Clustering Ward Selesai',

      hasil:
        'Terbentuk ' +
        targetCluster +
        ' cluster'

    });


    return clusters;

  }


  // ==========================================
  // MATA PELAJARAN DOMINAN
  // ==========================================

  getDominantSubject(
    cluster: any
  ) {

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


    const total: any = {};


    mapel.forEach(
      m => total[m] = 0
    );


    cluster.anggota.forEach(
      (index: number) => {

        const siswa =
          this.dataSiswa[index];

        mapel.forEach(
          m => {

            total[m] +=
              Number(
                siswa[m]
              ) || 0;

          }
        );

      }
    );


    const rata: any = {};


    mapel.forEach(
      m => {

        rata[m] =
          Number(

            (
              total[m] /
              cluster.anggota.length

            ).toFixed(2)

          );

      }
    );


    let tertinggi =
      mapel[0];


    mapel.forEach(
      m => {

        if (
          rata[m] >
          rata[tertinggi]
        ) {

          tertinggi = m;

        }

      }
    );


    return {

      mapel:
        this.getNamaMapel(
          tertinggi
        ),

      rata:
        rata[tertinggi],

      semuaRata:
        rata

    };

  }


  // ==========================================
  // RINGKASAN CLUSTER
  // ==========================================

  getClusterSummary() {

    const hasil: any[] = [];


    this.clusters.forEach(
      (cluster, index) => {

        const dominan =
          this.getDominantSubject(
            cluster
          );


        hasil.push({

          cluster:
            index + 1,

          jumlah:
            cluster.anggota.length,

          dominan:
            dominan.mapel,

          rata:
            dominan.rata,

          detail:
            dominan.semuaRata

        });

      }
    );


    return hasil;

  }


  // ==========================================
  // RATA-RATA NILAI CLUSTER
  // ==========================================

  getRataRataCluster(
    cluster: any
  ): number {

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


    let total = 0;

    let jumlahNilai = 0;


    cluster.anggota.forEach(
      (index: number) => {

        const siswa =
          this.dataSiswa[index];


        mapel.forEach(
          (m: string) => {

            total +=
              Number(
                siswa[m]
              ) || 0;

            jumlahNilai++;

          }
        );

      }
    );


    if (
      jumlahNilai === 0
    ) {

      return 0;

    }


    return Number(

      (
        total /
        jumlahNilai

      ).toFixed(2)

    );

  }


  // ==========================================
  // KATEGORI CAPAIAN
  // ==========================================

  getClusterCapaian(
    cluster: any
  ): string {

    const rataRata =
      this.getRataRataCluster(
        cluster
      );


    if (
      rataRata >= 85
    ) {

      return 'Tinggi';

    }


    if (
      rataRata >= 75
    ) {

      return 'Sedang';

    }


    return 'Rendah';

  }


  // ==========================================
  // HASIL CAPAIAN SEMUA CLUSTER
  // ==========================================

  getCapaianCluster() {

    return this.clusters.map(
      (cluster, index) => {

        const rata =
          this.getRataRataCluster(
            cluster
          );


        return {

          cluster:
            index + 1,

          jumlah:
            cluster.anggota.length,

          rataRata:
            rata,

          capaian:
            this.getClusterCapaian(
              cluster
            ),

          dominan:
            this.getDominantSubject(
              cluster
            )

        };

      }
    );

  }


  // ==========================================
  // NAMA MATA PELAJARAN
  // ==========================================

  getNamaMapel(
    kode: string
  ): string {

    switch (kode) {

      case 'agama':
        return 'Pendidikan Agama';

      case 'ppkn':
        return 'Pendidikan Pancasila';

      case 'indonesia':
        return 'Bahasa Indonesia';

      case 'matematika':
        return 'Matematika';

      case 'pjok':
        return 'PJOK';

      case 'seni':
        return 'Seni Budaya';

      case 'mulok':
        return 'Muatan Lokal';

      case 'ipas':
        return 'IPAS';

      case 'inggris':
        return 'Bahasa Inggris';

      default:
        return kode;

    }

  }


  // ==========================================
  // REKOMENDASI
  // ==========================================

  getRecommendation(
    cluster: any
  ): string {

    const hasilDominan =
      this.getDominantSubject(
        cluster
      );


    const dominan =
      hasilDominan.mapel;


    const rataRataCluster =
      this.getRataRataCluster(
        cluster
      );


    if (
      rataRataCluster >= 85
    ) {

      return `Capaian pembelajaran pada cluster ini tergolong sangat baik. Mata pelajaran ${dominan} dapat terus dikembangkan melalui kegiatan pengayaan, proyek, dan latihan yang lebih menantang.`;

    }


    if (
      rataRataCluster >= 75
    ) {

      return `Capaian pembelajaran pada cluster ini tergolong baik. Guru dapat mempertahankan capaian pada mata pelajaran ${dominan} serta memberikan latihan dan pendampingan pada mata pelajaran yang masih perlu ditingkatkan.`;

    }


    if (
      rataRataCluster >= 65
    ) {

      return `Capaian pembelajaran pada cluster ini tergolong cukup. Guru dapat memberikan penguatan materi, latihan tambahan, dan pembelajaran yang disesuaikan dengan kebutuhan siswa, termasuk pada mata pelajaran ${dominan}.`;

    }


    return `Capaian pembelajaran pada cluster ini masih perlu ditingkatkan. Guru dapat memberikan pendampingan secara bertahap, latihan tambahan, serta perhatian khusus sesuai kebutuhan belajar siswa.`;

  }


  // ==========================================
  // MENCARI CLUSTER BERDASARKAN INDEX SISWA
  // ==========================================

  private getClusterByStudent(
    studentIndex: number
  ): number {

    for (
      let i = 0;
      i < this.clusters.length;
      i++
    ) {

      if (
        this.clusters[i]
          .anggota
          .includes(studentIndex)
      ) {

        return i;

      }

    }


    return -1;

  }


  // ==========================================
  // NILAI a(i)
  // ==========================================

  private calculateA(
    studentIndex: number
  ): number {

    const clusterIndex =
      this.getClusterByStudent(
        studentIndex
      );


    if (
      clusterIndex === -1
    ) {

      return 0;

    }


    const anggota =
      this.clusters[
        clusterIndex
      ].anggota;


    if (
      anggota.length <= 1
    ) {

      return 0;

    }


    let total = 0;


    anggota.forEach(
      (index: number) => {

        if (
          index !== studentIndex
        ) {

          total +=
            this.euclidean(

              this.dataSiswa[
                studentIndex
              ],

              this.dataSiswa[
                index
              ]

            );

        }

      }
    );


    return (
      total /
      (anggota.length - 1)
    );

  }


  // ==========================================
  // NILAI b(i)
  // ==========================================

  private calculateB(
    studentIndex: number
  ): number {

    const clusterSekarang =
      this.getClusterByStudent(
        studentIndex
      );


    if (
      clusterSekarang === -1 ||
      this.clusters.length <= 1
    ) {

      return 0;

    }


    let minimum =
      Number.MAX_VALUE;


    this.clusters.forEach(
      (
        cluster,
        indexCluster
      ) => {

        if (
          indexCluster !==
          clusterSekarang
        ) {

          let total = 0;


          cluster.anggota.forEach(
            (index: number) => {

              total +=
                this.euclidean(

                  this.dataSiswa[
                    studentIndex
                  ],

                  this.dataSiswa[
                    index
                  ]

                );

            }
          );


          const rata =
            total /
            cluster.anggota.length;


          if (
            rata < minimum
          ) {

            minimum = rata;

          }

        }

      }
    );


    return minimum;

  }


  // ==========================================
  // HITUNG SILHOUETTE
  // ==========================================

  private calculateSilhouette(): number {

    if (
      this.clusters.length <= 1 ||
      this.dataSiswa.length <= 1
    ) {

      this.silhouette = 0;

      this.silhouetteDetail = [];

      return 0;

    }


    this.silhouetteDetail = [];


    let totalSilhouette = 0;


    for (
      let i = 0;
      i < this.dataSiswa.length;
      i++
    ) {

      const a =
        this.calculateA(i);


      const b =
        this.calculateB(i);


      let s = 0;


      if (
        Math.max(a, b) !== 0
      ) {

        s =
          (b - a) /
          Math.max(a, b);

      }


      this.silhouetteDetail.push({

        nama:
          this.dataSiswa[i].nama,

        cluster:
          this.getClusterByStudent(i) + 1,

        a:
          Number(
            a.toFixed(4)
          ),

        b:
          Number(
            b.toFixed(4)
          ),

        s:
          Number(
            s.toFixed(4)
          )

      });


      totalSilhouette += s;

    }


    this.silhouette =
      Number(

        (
          totalSilhouette /
          this.dataSiswa.length

        ).toFixed(4)

      );


    return this.silhouette;

  }


  // ==========================================
  // CENTROID SETIAP CLUSTER
  // ==========================================

  getCentroidClusters(): any[] {

    const hasil: any[] = [];


    this.clusters.forEach(
      (cluster, index) => {

        const centroid =
          this.calculateCentroid(
            cluster
          );


        hasil.push({

          cluster:
            index + 1,

          jumlahSiswa:
            cluster.anggota.length,

          centroid:
            centroid.map(
              nilai =>
                Number(
                  nilai.toFixed(4)
                )
            )

        });

      }
    );


    return hasil;

  }


  // ==========================================
  // JARAK SISWA KE CENTROID
  // ==========================================

  private distanceToCentroid(
    student: any,
    centroid: number[]
  ): number {

    const nilai =
      this.getNilaiSiswa(
        student
      );


    let total = 0;


    for (
      let i = 0;
      i < nilai.length;
      i++
    ) {

      total +=
        Math.pow(
          nilai[i] -
          centroid[i],
          2
        );

    }


    return Math.sqrt(total);

  }


  // ==========================================
  // JARAK SETIAP SISWA
  // KE SEMUA CENTROID
  // ==========================================

  getDistanceToAllCentroids(): any[] {

    const hasil: any[] = [];


    const centroidClusters =
      this.clusters.map(
        cluster =>
          this.calculateCentroid(
            cluster
          )
      );


    this.dataSiswa.forEach(
      (siswa, index) => {

        const jarak: number[] = [];


        centroidClusters.forEach(
          centroid => {

            jarak.push(

              Number(

                this.distanceToCentroid(
                  siswa,
                  centroid
                ).toFixed(4)

              )

            );

          }
        );


        const jarakMinimum =
          Math.min(
            ...jarak
          );


        const indexTerdekat =
          jarak.indexOf(
            jarakMinimum
          );


        const clusterIndex =
          this.clusters.findIndex(
            cluster =>
              cluster.anggota
                .includes(index)
          );


        const clusterAHC =
          clusterIndex + 1;


        const dataSiswa: any = {

          nama:
            siswa.nama,

          kelas:
            siswa.kelas,

          distanceCentroid:
            jarak,

          clusterTerdekat:
            indexTerdekat + 1,

          clusterAHC:
            clusterAHC

        };


        jarak.forEach(
          (nilai, i) => {

            dataSiswa[
              `jarakCluster${i + 1}`
            ] = nilai;

          }
        );


        hasil.push(
          dataSiswa
        );

      }
    );


    return hasil;

  }


  // ==========================================
  // SCATTER CLUSTER
  // ==========================================

  private calculateScatter(
    cluster: any
  ): number {

    if (
      cluster.anggota.length === 0
    ) {

      return 0;

    }


    const centroid =
      this.calculateCentroid(
        cluster
      );


    let total = 0;


    cluster.anggota.forEach(
      (index: number) => {

        total +=
          this.distanceToCentroid(

            this.dataSiswa[
              index
            ],

            centroid

          );

      }
    );


    return (
      total /
      cluster.anggota.length
    );

  }


  // ==========================================
  // DAVIES-BOULDIN INDEX
  // ==========================================

  private calculateDBI(): void {

    this.dbiDetail = [];

    this.dbiRDetail = [];


    const k =
      this.clusters.length;


    if (
      k <= 1
    ) {

      this.dbi = 0;

      return;

    }


    const centroid: number[][] = [];

    const scatter: number[] = [];


    // ----------------------------------------
    // CENTROID + SCATTER
    // ----------------------------------------

    this.clusters.forEach(
      (
        cluster,
        index
      ) => {

        const c =
          this.calculateCentroid(
            cluster
          );


        centroid.push(c);


        const nilaiScatter =
          this.calculateScatter(
            cluster
          );


        scatter.push(
          nilaiScatter
        );


        this.dbiDetail.push({

          cluster:
            index + 1,

          scatter:
            Number(
              nilaiScatter.toFixed(4)
            )

        });

      }
    );


    let totalDBI = 0;


    // ----------------------------------------
    // R(i,j)
    // ----------------------------------------

    for (
      let i = 0;
      i < k;
      i++
    ) {

      let maxR = 0;


      for (
        let j = 0;
        j < k;
        j++
      ) {

        if (
          i === j
        ) {

          continue;

        }


        const jarak =
          this.centroidDistance(

            centroid[i],

            centroid[j]

          );


        // Hindari pembagian dengan nol
        if (
          jarak === 0
        ) {

          continue;

        }


        const R =
          (
            scatter[i] +
            scatter[j]
          ) /
          jarak;


        this.dbiRDetail.push({

          cluster1:
            i + 1,

          cluster2:
            j + 1,

          scatter1:
            Number(
              scatter[i].toFixed(4)
            ),

          scatter2:
            Number(
              scatter[j].toFixed(4)
            ),

          distance:
            Number(
              jarak.toFixed(4)
            ),

          r:
            Number(
              R.toFixed(4)
            )

        });


        if (
          R > maxR
        ) {

          maxR = R;

        }

      }


      totalDBI += maxR;

    }


    this.dbi =
      Number(

        (
          totalDBI /
          k

        ).toFixed(4)

      );

  }


  // ==========================================
  // GLOBAL CENTROID
  // ==========================================

  private calculateGlobalCentroid(): number[] {

    const centroid =
      new Array(9).fill(0);


    if (
      this.dataSiswa.length === 0
    ) {

      return centroid;

    }


    this.dataSiswa.forEach(
      siswa => {

        const nilai =
          this.getNilaiSiswa(
            siswa
          );


        for (
          let i = 0;
          i < 9;
          i++
        ) {

          centroid[i] +=
            nilai[i];

        }

      }
    );


    for (
      let i = 0;
      i < 9;
      i++
    ) {

      centroid[i] /=
        this.dataSiswa.length;

    }


    return centroid;

  }


  // ==========================================
  // CALINSKI-HARABASZ INDEX
  // ==========================================

  private calculateCHI(): void {

    this.chiDetail = [];


    const k =
      this.clusters.length;


    const n =
      this.dataSiswa.length;


    if (
      k <= 1 ||
      n <= k
    ) {

      this.chi = 0;

      this.totalBSS = 0;

      this.totalWSS = 0;

      return;

    }


    const globalCentroid =
      this.calculateGlobalCentroid();


    let BSS = 0;

    let WSS = 0;


    // ----------------------------------------
    // HITUNG BSS DAN WSS
    // ----------------------------------------

    this.clusters.forEach(
      (
        cluster,
        index
      ) => {

        const centroid =
          this.calculateCentroid(
            cluster
          );


        const jarakGlobal =
          this.centroidDistance(

            centroid,

            globalCentroid

          );


        const bssCluster =
          cluster.anggota.length *
          Math.pow(
            jarakGlobal,
            2
          );


        BSS +=
          bssCluster;


        let wssCluster = 0;


        cluster.anggota.forEach(
          (i: number) => {

            const jarak =
              this.distanceToCentroid(

                this.dataSiswa[i],

                centroid

              );


            wssCluster +=
              Math.pow(
                jarak,
                2
              );

          }
        );


        WSS +=
          wssCluster;


        this.chiDetail.push({

          cluster:
            index + 1,

          jumlah:
            cluster.anggota.length,

          centroidDistance:
            Number(
              jarakGlobal.toFixed(4)
            ),

          bss:
            Number(
              bssCluster.toFixed(4)
            ),

          wss:
            Number(
              wssCluster.toFixed(4)
            )

        });

      }
    );


    // ----------------------------------------
    // SIMPAN BSS / WSS
    // ----------------------------------------

    this.totalBSS =
      Number(
        BSS.toFixed(4)
      );


    this.totalWSS =
      Number(
        WSS.toFixed(4)
      );


    // ----------------------------------------
    // CALINSKI-HARABASZ
    // ----------------------------------------

    this.chi =
      Number(

        (
          (
            BSS /
            (k - 1)
          ) /

          (
            WSS /
            (n - k)
          )

        ).toFixed(4)

      );

  }

}

