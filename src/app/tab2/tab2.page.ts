import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { PythonService } from '../services/python.service';
import * as XLSX from 'xlsx';
import { AhcService } from '../services/ahc.service';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: false
})
export class Tab2Page {

  siswa = {

    nama: '',
    kelas: '',
   
    agama: 0,
    ppkn: 0,
    indonesia: 0,
    matematika: 0,
    pjok: 0,
    seni: 0,
    mulok: 0,
    ipas: 0,
    inggris: 0

  };

  daftarSiswa: any[] = [];
  dataExcel: any[] = [];

  isEdit = false;
  editIndex = -1;

  constructor(
  private alertController: AlertController,
  private ahcService: AhcService,
  private pythonService: PythonService
) {}
//====================================
// DI PANGGIL SAAT TAB 2 DI BUKA
//====================================
ionViewWillEnter() {
  this.dataExcel = [];
  this.daftarSiswa = [];
  this.resetForm();
  this.ahcService.clearData();

}

//====================================
// LOAD DATA DARI MYSQL
//====================================

loadData() {

  this.pythonService.getSiswa().subscribe({

    next: (res: any) => {

      this.dataExcel = res;

      this.daftarSiswa = [...res];

      this.ahcService.setData(this.dataExcel);

      console.log("Data berhasil dimuat dari MySQL");

    },

    error: (err) => {

      console.log(err);

    }

  });

}
  //====================================
  // RESET FORM
  //====================================

  resetForm() {

    this.siswa = {

      nama: '',
      kelas: '',
   

      agama: 0,
      ppkn: 0,
      indonesia: 0,
      matematika: 0,
      pjok: 0,
      seni: 0,
      mulok: 0,
      ipas: 0,
      inggris: 0

    };

  }

  //====================================
  // SIMPAN IMPORT EXCEL
  //====================================

  async simpanData() {

    if (

      this.siswa.nama == '' ||
      this.siswa.kelas == '' 
   

    ) {

      const alert = await this.alertController.create({

        header: 'Peringatan',
        message: 'Semua data harus diisi.',
        buttons: ['OK']

      });

      await alert.present();
      return;

    }

    const jumlah =

      Number(this.siswa.agama) +
      Number(this.siswa.ppkn) +
      Number(this.siswa.indonesia) +
      Number(this.siswa.matematika) +
      Number(this.siswa.pjok) +
      Number(this.siswa.seni) +
      Number(this.siswa.mulok) +
      Number(this.siswa.ipas) +
      Number(this.siswa.inggris);

    const rata = (jumlah / 9).toFixed(2);

    const dataBaru = {

      nama: this.siswa.nama,
      kelas: this.siswa.kelas,
   

      agama: this.siswa.agama,
      ppkn: this.siswa.ppkn,
      indonesia: this.siswa.indonesia,
      matematika: this.siswa.matematika,
      pjok: this.siswa.pjok,
      seni: this.siswa.seni,
      mulok: this.siswa.mulok,
      ipas: this.siswa.ipas,
      inggris: this.siswa.inggris,

    
    };

    this.daftarSiswa.push(dataBaru);
    this.dataExcel.push(dataBaru);
    console.log("Jumlah Data Excel :", this.dataExcel.length);
    console.log(this.dataExcel);
    this.ahcService.setData(this.dataExcel);
    this.pythonService.tambahSiswa(dataBaru).subscribe({

  next: (res: any) => {

    console.log('Data berhasil disimpan ke MySQL', res);

  },

  error: (err: any) => {

    console.error('Gagal menyimpan ke MySQL', err);

  }

});
    const alert = await this.alertController.create({

      header: 'Berhasil',
      message: 'Data berhasil disimpan.',
      buttons: ['OK']

    });

    await alert.present();

    this.resetForm();

  }
  //====================================
  // EDIT DATA
  //====================================

  editData(index: number) {

    this.siswa = {

      nama: this.dataExcel[index].nama,
      kelas: this.dataExcel[index].kelas,


      agama: this.dataExcel[index].agama,
      ppkn: this.dataExcel[index].ppkn,
      indonesia: this.dataExcel[index].indonesia,
      matematika: this.dataExcel[index].matematika,
      pjok: this.dataExcel[index].pjok,
      seni: this.dataExcel[index].seni,
      mulok: this.dataExcel[index].mulok,
      ipas: this.dataExcel[index].ipas,
      inggris: this.dataExcel[index].inggris

    };

    this.editIndex = index;
    this.isEdit = true;

  }

  //====================================
  // UPDATE DATA
  //====================================

  async updateData() {

    const jumlah =

      Number(this.siswa.agama) +
      Number(this.siswa.ppkn) +
      Number(this.siswa.indonesia) +
      Number(this.siswa.matematika) +
      Number(this.siswa.pjok) +
      Number(this.siswa.seni) +
      Number(this.siswa.mulok) +
      Number(this.siswa.ipas) +
      Number(this.siswa.inggris);

    const rata = (jumlah / 9).toFixed(2);

    this.dataExcel[this.editIndex] = {

      nama: this.siswa.nama,
      kelas: this.siswa.kelas,
     
      agama: this.siswa.agama,
      ppkn: this.siswa.ppkn,
      indonesia: this.siswa.indonesia,
      matematika: this.siswa.matematika,
      pjok: this.siswa.pjok,
      seni: this.siswa.seni,
      mulok: this.siswa.mulok,
      ipas: this.siswa.ipas,
      inggris: this.siswa.inggris,

    
    };

this.daftarSiswa = [...this.dataExcel];
this.ahcService.setData(this.dataExcel);
this.pythonService.importExcel(this.dataExcel).subscribe({

  next: (res: any) => {
    console.log("Import berhasil", res);
    this.loadData();
  },
  error: (err: any) => {
    console.log("Import gagal", err);
  }

});


// ==========================
// SIMPAN DATA
// ==========================


    const alert = await this.alertController.create({

      header: 'Berhasil',
      message: 'Data berhasil diperbarui.',
      buttons: ['OK']

    });

    await alert.present();
    this.resetForm();
    this.isEdit = false;
    this.editIndex = -1;

  }

 //====================================
// HAPUS DATA
//====================================

hapusData(index: number) {

  const siswa = this.dataExcel[index];

  // Jika belum tersimpan di database
  if (!siswa.id) {

    this.dataExcel.splice(index, 1);

    this.daftarSiswa = [...this.dataExcel];

    this.ahcService.setData(this.dataExcel);

    console.log("Data dihapus dari preview");

    return;

  }

  this.pythonService.hapusSiswa(siswa.id).subscribe({

    next: () => {

      this.dataExcel.splice(index, 1);

      this.daftarSiswa = [...this.dataExcel];

      this.ahcService.setData(this.dataExcel);

      console.log("Data berhasil dihapus dari database");

    },

    error: (err) => {

      console.log(err);

    }

  });

}

  //====================================
  // IMPORT EXCEL
  //====================================

  importExcel(event: any) {

    const target: DataTransfer = event.target;

    if (target.files.length !== 1) {

      alert('Pilih satu file Excel');

      return;

    }

    const reader = new FileReader();

    reader.onload = (e: any) => {

      const workbook = XLSX.read(e.target.result, {
        type: 'binary'
      });

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const excelData: any[] = XLSX.utils.sheet_to_json(worksheet);

      this.dataExcel = [];

      excelData.forEach((row: any) => {

        this.dataExcel.push({

          nama: row['NAMA SISWA'] || '',
          kelas: row['KELAS'] || '',
         

          agama: Number(row['AGAMA']) || 0,
          ppkn: Number(row['PEND. PANCASILA']) || 0,
          indonesia: Number(row['BAH. INDONESIA']) || 0,
          matematika: Number(row['MATEMATIKA']) || 0,
          pjok: Number(row['PJOK']) || 0,
          seni: Number(row['SENI BUDAYA']) || 0,
          mulok: Number(row['MULOK']) || 0,
          ipas: Number(row['IPAS']) || 0,
          inggris: Number(row['BAH. INGGRIS']) || 0,

       

        });

      });

      this.daftarSiswa = [...this.dataExcel];

      this.ahcService.setData(this.dataExcel);

};

reader.readAsBinaryString(target.files[0]);

}
//====================================
// SIMPAN DATA
//====================================

async simpanExcelKeDatabase() {
  console.log("Tombol Simpan Database ditekan");

  if (this.dataExcel.length === 0) {

    const alert = await this.alertController.create({
      header: 'Peringatan',
      message: 'Belum ada data Excel.',
      buttons: ['OK']
    });

    await alert.present();
    return;
  }

  this.pythonService.importExcel(this.dataExcel).subscribe({

    next: async (res: any) => {

      const alert = await this.alertController.create({
        header: 'Berhasil',
        message: this.dataExcel.length + ' data berhasil disimpan.',
        buttons: ['OK']
      });

      await alert.present();
      this.loadData();
      console.log(res);

    },

    error: async (err: any) => {

  console.log("Gagal import:", err);

  const alert = await this.alertController.create({
    header: 'Gagal',
    message: 'Data gagal disimpan ke database.',
    buttons: ['OK']
  });

  await alert.present();

}

  });

}
  //====================================
  // DOWNLOAD TEMPLATE
  //====================================

  downloadTemplate() {

    alert('Template Excel akan dibuat pada tahap berikutnya.');

  }

}