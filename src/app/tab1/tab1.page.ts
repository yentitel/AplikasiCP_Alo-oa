import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: false
})
export class Tab1Page {

  jumlahSiswa: number = 53;
  jumlahCluster: number = 3;
  status: string = 'Belum Diproses';

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {}

  // Menuju Tab 2 (Data Siswa)
  inputData() {
    this.router.navigate(['/tabs/tab2']);
  }

  // Menuju Tab 3 (Input Capaian Pembelajaran)
  inputNilai() {
    this.router.navigate(['/tabs/tab3']);
  }

  // Proses Clustering
  async prosesClustering() {

    this.status = 'Sedang Diproses';

    const alert = await this.alertController.create({
      header: 'Proses Clustering',
      message: 'Fitur Agglomerative Hierarchical Clustering akan dijalankan setelah data siswa dan capaian pembelajaran selesai diinput.',
      buttons: ['OK']
    });

    await alert.present();

    // Status sementara
    this.status = 'Siap Diproses';
  }

  // Menuju Tab 4 (Hasil)
  lihatHasil() {
    this.router.navigate(['/tabs/tab4']);
  }

}