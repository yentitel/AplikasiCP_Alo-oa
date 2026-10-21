import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AhcService } from '../services/ahc.service';
import { PythonService } from '../services/python.service';
@Component({
selector: 'app-tab3',
templateUrl: './tab3.page.html',
styleUrls: ['./tab3.page.scss'],
standalone: false
})
export class Tab3Page {

// ==========================================
// DATA
// ==========================================

dataSiswa: any[] = [];
distanceMatrix: number[][] = [];
silhouetteDetail: any[] = [];
dbiDetail: any[] = [];
chiDetail:any[] = [];
totalBSS = 0;
totalWSS = 0;
clusters: any[] = [];
hasilCluster: any[] = [];
logProses: any[] = []; 
centroidClusters: any[] = [];
distanceCentroid: any[] = [];
mergeHistory: any [] = [];
expandedCluster: any = {};
jumlahData = 0;
jumlahCluster = 3;
linkage = 'Ward Linkage';
prosesSelesai = false;
showDistanceMatrix = false;

clusterTerbuka: number | null = null;

toggleHasilCluster(index: number) {

  if (this.clusterTerbuka === index) {

    this.clusterTerbuka = null;

  } else {

    this.clusterTerbuka = index;

  }

}

// ==========================================
// PROSES TAMPILAN
// ==========================================

mulaiProses = false;

progress = 0;
totalStep = 0;
currentStep = 0;

status1 = 'Menunggu';

status2 = 'Menunggu';

status3 = 'Menunggu';

status4 = 'Menunggu';

status5 = 'Menunggu';

// ==========================================
// EVALUASI
// ==========================================

silhouetteScore: any = '-';

dbi: any = '-';

chi: any = '-';

constructor(

private alertController: AlertController,  
private ahcService: AhcService,  
private pythonService: PythonService

) { }

// ==========================================
// LOAD DATA
// ==========================================

ionViewWillEnter() {

this.loadData();

}

loadData() {

this.dataSiswa = this.ahcService.getData(); 
this.jumlahData = this.dataSiswa.length; 
this.logProses = this.ahcService.getProcessLog();
this.distanceMatrix = this.ahcService.getDistanceMatrix();
this.showDistanceMatrix = false;
const matrix = this.ahcService.getDistanceMatrix(); 
console.log(this.dataSiswa);

}

// ==========================================
// PROSES CLUSTERING
// ==========================================

async prosesAHC() {
  console.log("===MULAI PROSES AHC===");

this.loadData();  
console.log("Jumlah Data =",this.jumlahData);
if (this.jumlahData === 0) { 
console.log("DATA MASIH KOSONG"); 

  const alert = await this.alertController.create({  

    header: 'Peringatan',  
    message: 'Belum ada data siswa. Silakan import data pada Tab 2.',  
    buttons: ['OK']  

  });  

  await alert.present();  

  return;  

}  
// ==========================  
// INISIALISASI PROGRESS 
// ========================== 
this.progress = 0;
this.currentStep =0;
this.totalStep = this.jumlahData - 
this.jumlahCluster;
this.mulaiProses = true;  
this.prosesSelesai = false;  
this.progress = 0; 
this.clusters = [];
this.hasilCluster = [];
this.logProses = [];
this.centroidClusters = [];
this.distanceCentroid = [];
this.silhouetteScore = '-';
this.dbi = '-';
this.chi = '-';

// ==========================  
// Tahap 1  
// ==========================  

this.status1 = 'Diproses...';  
this.progress = 20;  
console.log("progress 20%");
console.log("Tidak Pakai delay");
await this.delay(800);  
console.log("Sesudah delay");

this.status1 = '✅ Selesai'; 
this.status2 = '⏳ Diproses...';

// ==========================  
// Tahap 2  
// ==========================  

this.status2 = 'Diproses...';  
this.progress = 40;  
console.log("Masuk Tahap 2");

await this.delay(800);  

this.status2 = '✅ Selesai'; 
this.status3 = '⏳ Diproses...'; 

// ==========================  
// Tahap 3  
// ==========================  

this.status3 = 'Diproses...';  
this.progress = 60;  

await this.delay(800);    
this.ahcService.setTargetCluster(this.jumlahCluster);
try {

  console.log("SEBELUM prosesAHC");

  this.clusters = this.ahcService.processAHC(this.jumlahCluster);
  this.mergeHistory = this  .ahcService .getMergeHistory();
  console.log("========== RIWAYAT MERGE WARD ==========");
  console.table(this.ahcService.getMergeHistory());
  console.log("Sesudah processAHC");

} catch(e) {

  console.log("ERROR AHC =", e);

}
// DEBUG
console.log("========== HASIL CLUSTER ==========");
console.log(this.clusters);
console.log("JUMLAH CLUSTER =", this.clusters.length);

this.hasilCluster = this.clusters.map(cluster => ({
  ...cluster,
  showAnggota: false,
  showRekomendasi: false
}));
this.logProses = [...this.ahcService.getProcessLog()];
this.distanceMatrix = this.ahcService.getDistanceMatrix();
this.showDistanceMatrix = true;
this.centroidClusters = this.ahcService.getCentroidClusters();
console.log("=== CENTROID SETIAP CLUSTER ===");
console.log(this.centroidClusters);
this.distanceCentroid = this.ahcService.getDistanceToAllCentroids();
console.table(this.distanceCentroid);
console.log("=== JARAK SISWA KE CENTROID ===");
console.log(this.distanceCentroid);

const matrix = this.ahcService.getDistanceMatrix();  

console.log(matrix);  

this.status3 = '✅ Selesai'; 
this.status4 = '⏳ Diproses...'; 
// ==========================
// TAHAP 4 - EVALUASI
// ==========================

this.status4 = 'Diproses...';
this.progress = 80;

await this.delay(800);

console.log("========== MULAI EVALUASI ==========");

try {

  // ----------------------------------
  // SILHOUETTE SCORE
  // ----------------------------------

  console.log("Menghitung Silhouette...");

  this.silhouetteScore =
    this.ahcService.getSilhouette();

  console.log(
    "Silhouette Score =",
    this.silhouetteScore
  );


  // ----------------------------------
  // DAVIES-BOULDIN INDEX
  // ----------------------------------

  console.log("Menghitung DBI...");

  this.dbi =
    this.ahcService.getDBI();

  console.log(
    "Davies-Bouldin Index =",
    this.dbi
  );


  // ----------------------------------
  // CALINSKI-HARABASZ INDEX
  // ----------------------------------

  console.log("Menghitung CHI...");

  this.chi =
    this.ahcService.getCHI();

  console.log(
    "Calinski-Harabasz Index =",
    this.chi
  );


  // ----------------------------------
  // DETAIL EVALUASI
  // ----------------------------------

  console.log("Mengambil detail Silhouette...");

  this.silhouetteDetail =
    this.ahcService.getSilhouetteDetail();


  console.log("Mengambil detail DBI...");

  this.dbiDetail =
    this.ahcService.getDBIDetail();


  console.log("Mengambil detail CHI...");

  this.chiDetail =
    this.ahcService.getCHIDetail();


  // ----------------------------------
  // BSS DAN WSS
  // ----------------------------------

  console.log("Mengambil Total BSS...");

  this.totalBSS =
    this.ahcService.getTotalBSS();


  console.log(
    "Total BSS =",
    this.totalBSS
  );


  console.log("Mengambil Total WSS...");

  this.totalWSS =
    this.ahcService.getTotalWSS();


  console.log(
    "Total WSS =",
    this.totalWSS
  );


  // ----------------------------------
  // HASIL EVALUASI
  // ----------------------------------

  console.log("========== HASIL EVALUASI ==========");

  console.log(
    "Silhouette =",
    this.silhouetteScore
  );

  console.log(
    "DBI =",
    this.dbi
  );

  console.log(
    "CHI =",
    this.chi
  );

  console.log(
    "BSS =",
    this.totalBSS
  );

  console.log(
    "WSS =",
    this.totalWSS
  );


  // ----------------------------------
  // EVALUASI SELESAI
  // ----------------------------------

  this.status4 = '✅ Selesai';

  console.log(
    "Evaluasi Hasil = SELESAI"
  );

} catch (error) {

  console.error(
    "❌ ERROR PADA TAHAP EVALUASI:",
    error
  );

  // Tetap ubah status supaya tidak
  // berhenti di "Diproses..."
  this.status4 = '⚠️ Gagal';

}


// ==========================
// TAHAP 5
// ==========================

this.status5 = '⏳ Diproses...';

this.status5 = 'Diproses...';

this.progress = 100;

await this.delay(800);

// ==========================  
// Tahap 5  
// ==========================  

this.status5 = 'Diproses...';  
this.progress = 100;  

await this.delay(800);  

this.ahcService.setClusters(this.clusters);  

this.ahcService.setEvaluation(  
  this.silhouetteScore,  
  this.dbi,  
  this.chi  
); 
console.log("DATA YANG DIKIRIM KE FLASK");
console.log(this.dataSiswa);
console.log("Jumlah =", this.dataSiswa.length);
console.log("Cluster =", this.jumlahCluster);
// ===============================
// GENERATE DENDROGRAM
// ===============================

const matrixJson = JSON.stringify(matrix);

const namaSiswaJson = JSON.stringify(
  this.dataSiswa.map(s => s.nama)
);

// ==========================================
// SIMPAN HISTORY
// ==========================================

this.pythonService.saveHistory({

  tahun_ajaran: "2025/2026",
  semester: "Genap",
  kelas: "V",
  jumlah_cluster: this.jumlahCluster,
  linkage: this.linkage,
  silhouette: this.silhouetteScore,
  dbi: this.dbi,
  chi: this.chi,
  dendrogram: "",
  euclidean_matrix: matrixJson,
  nama_siswa: namaSiswaJson

}).subscribe({

  next: (res: any) => {

    console.log(
      "History berhasil disimpan",
      res
    );

    const historyId = res.history_id;
    const filename =
      "dendrogram_" + historyId + ".png";


    // ==========================================
    // GENERATE DENDROGRAM
    // ==========================================

    this.pythonService.generateDendrogram(
      this.dataSiswa,
      this.jumlahCluster,
      filename

    ).subscribe({

      next: (res: any) => {

        console.log(
          "Dendrogram berhasil dibuat"
        );

        console.log(
          "HASIL DENDROGRAM:",
          res
        );


        // ==========================================
        // SIMPAN URL DENDROGRAM
        // ==========================================

        const dendrogramUrl =
          res.image +
          '?t=' +
          new Date().getTime();

        this.ahcService.setDendrogramImage(
          dendrogramUrl
        );

        console.log(
          "URL DENDROGRAM DISIMPAN:",
          dendrogramUrl
        );


        // ==========================================
        // UPDATE HISTORY
        // ==========================================

        this.pythonService.updateDendrogram({

          history_id: historyId,
          dendrogram: filename

        }).subscribe({

          next: () => {

            console.log(
              "Nama dendrogram berhasil diupdate"
            );

          },

          error: (err) => {

            console.log(
              "Gagal update nama dendrogram:",
              err
            );

          }

        });


        // ==========================================
        // SIMPAN DETAIL CLUSTER
        // ==========================================

        let detail: any[] = [];

        this.hasilCluster.forEach(
          (cluster, index) => {

            cluster.anggota.forEach(
              (i: number) => {

                const siswa =
                  this.dataSiswa[i];

                detail.push({

                  history_id: historyId,
                  nama: siswa.nama,
                  kelas: siswa.kelas,
                  cluster:
                    "Cluster " + (index + 1)

                });

              }
            );

          }
        );


        console.log(
          "DETAIL CLUSTER:",
          detail
        );


        this.pythonService.saveDetail(
          detail

        ).subscribe({

          next: () => {

            console.log(
              "Detail berhasil disimpan"
            );


            // ==========================================
            // SEMUA PROSES BENAR-BENAR SELESAI
            // ==========================================

            this.status5 = '✅ Selesai';

            this.progress = 100;

            this.prosesSelesai = true;

            console.log(
              "=== SELURUH PROSES AHC SELESAI ==="
            );

          },

          error: (err) => {

            console.log(
              "Gagal menyimpan detail:",
              err
            );

          }

        });

      },

      error: (err) => {

        console.log(
          "Gagal generate dendrogram:",
          err
        );

      }

    });

  },

  error: (err: any) => {

    console.log(
      "History gagal:",
      err
    );

  }

});
}

// ==========================================
// DELAY
// ==========================================

delay(ms: number) {

  console.log("Delay dipanggil");

  return new Promise(resolve => {

    setTimeout(() => {

      console.log("Delay selesai");

      resolve(true);

    }, ms);

  });

}

// ==========================================
// RESET
// ==========================================

resetProses() {

this.mulaiProses = false;  

this.prosesSelesai = false;  

this.progress = 0;  

this.clusters = [];  

this.hasilCluster = []; 
this.logProses = []; 

this.silhouetteScore = '-';  

this.dbi = '-';  

this.chi = '-';

}

// ==========================================
// JUMLAH ANGGOTA
// ==========================================

getJumlahAnggota(cluster: any): number {

return cluster.anggota.length;

}

// ==========================================
// DATA ANGGOTA CLUSTER
// ==========================================

getAnggotaCluster(cluster: any) {

return cluster.anggota.map((index: number) => {  

  return this.dataSiswa[index];  

});

}

// ==========================================
// NAMA SISWA
// ==========================================

getNamaSiswa(index: number) {

return this.dataSiswa[index].nama;

}
// ==========================================
// TAMPILKAN / SEMBUNYIKAN ANGGOTA CLUSTER
// PADA TABEL ITERASI
// ==========================================

toggleClusterDetail(
  item: any,
  tipe: 'cluster1' | 'cluster2' | 'baru'
) {

  // Buat ID unik berdasarkan langkah dan tipe cluster
  const key =
    item.langkah + '-' + tipe;

  // Jika sudah terbuka → tutup
  if (this.expandedCluster[key]) {

    this.expandedCluster[key] = false;

  }

  // Jika belum terbuka → buka
  else {

    this.expandedCluster[key] = true;

  }

}
// ==========================================
// CEK DETAIL CLUSTER TERBUKA
// ==========================================

isClusterDetailOpen(
  item: any,
  tipe: 'cluster1' | 'cluster2' | 'baru'
): boolean {

  const key =
    item.langkah + '-' + tipe;

  return !!this.expandedCluster[key];

}

// ==========================================
// KELAS SISWA
// ==========================================

getKelasSiswa(index: number) {

return this.dataSiswa[index].kelas;

}

// ==========================================
// RATA-RATA SISWA
// ==========================================

getRataSiswa(index: number) {

return this.dataSiswa[index].rata;

}
// ==========================================
// INTERPRETASI SILHOUETTE
// ==========================================

getSilhouetteInterpretation(): string {

  const nilai = Number(this.silhouetteScore);

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
// ==========================================
// INTERPRETASI DBI
// ==========================================

getDBIInterpretation(): string {

  const nilai = Number(this.dbi);

  if (nilai < 1) {
    return 'Kualitas cluster sangat baik.';
  }

  if (nilai < 2) {
    return 'Kualitas cluster baik.';
  }

  return 'Kualitas cluster kurang baik.';
}
// ==========================================
// INTERPRETASI CHI
// ==========================================

getCHIInterpretation(): string {

  const nilai = Number(this.chi);

  if (nilai >= 100) {
    return 'Pemisahan cluster sangat baik.';
  }

  if (nilai >= 50) {
    return 'Pemisahan cluster cukup baik.';
  }

  return 'Pemisahan cluster masih rendah.';
}
}

