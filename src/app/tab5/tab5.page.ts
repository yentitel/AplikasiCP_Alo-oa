import { Component } from '@angular/core';
import { PythonService } from '../services/python.service';
import { AhcService } from '../services/ahc.service';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: false
})
export class Tab5Page {

  history: any[] = [];
  detailHistory: any[] = [];
  distanceMatrix: any[] = [];
  namaSiswa: string[] = [];
  dendrogramUrl =
'http://127.0.0.1:5000/static/dendrogram.png';
showDetail = false;

 constructor(
  private pythonService: PythonService,
  private ahcService: AhcService
) {}

  ionViewWillEnter() {
    this.loadHistory();
    this.distanceMatrix = this.ahcService.getDistanceMatrix();
  }

  loadHistory() {

    this.pythonService.getHistory().subscribe({

      next: (res: any) => {

        console.log(res);

        this.history = res;
        this.showDetail = false;

      },

      error: (err) => {

        console.log(err);

      }

    });

  }


 lihatDetail(id: number) {

  console.log("ID =", id);

  this.pythonService.getHistoryDetail(id).subscribe({

    next: (res: any) => {

      console.log("DATA HISTORY =", res);

      this.detailHistory = res.detail;

      this.distanceMatrix = JSON.parse(res.euclidean_matrix);

      this.namaSiswa = JSON.parse(res.nama_siswa);

      this.dendrogramUrl =
        "http://127.0.0.1:5000/static/" + res.dendrogram;

      this.showDetail = true;

      console.log("JUMLAH DETAIL =", this.detailHistory.length);
      console.log("MATRIX =", this.distanceMatrix);
      console.log("NAMA =", this.namaSiswa);

    },

    error: (err) => {

      console.log(err);

    }

  });

}

hapusHistory(id: number) {
console.log("Tombol Hapus ditekan");
console.log("ID =", id);
  if (!confirm('Yakin ingin menghapus riwayat ini?')) {
    return;
  }

  this.pythonService.deleteHistory(id).subscribe({

    next: () => {

      alert("Riwayat berhasil dihapus");

      this.loadHistory();

      this.detailHistory = [];

    },

    error: (err) => {

      console.log(err);

      alert("Gagal menghapus riwayat");

    }

  });

}
async logout() {

  const yakin = confirm(
    'Apakah Anda yakin ingin keluar dari aplikasi?'
  );

  if (!yakin) {
    return;
  }

  // Hapus status login
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');

  // Tutup aplikasi Android
  await App.exitApp();
}
}