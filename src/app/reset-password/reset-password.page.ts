import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false
})
export class ResetPasswordPage {
  token = '';
  password = '';
  konfirmasiPassword = '';
  sedangMemproses = false;

 private apiUrl = 'http://192.168.1.27:5000';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  async resetPassword() {
    if (!this.token) {
      await this.tampilkanPesan(
        'Tautan Tidak Valid',
        'Token reset tidak ditemukan. Silakan minta tautan baru.'
      );
      return;
    }

    if (this.password.length < 8) {
      await this.tampilkanPesan(
        'Password Tidak Valid',
        'Password baru minimal 8 karakter.'
      );
      return;
    }

    if (this.password !== this.konfirmasiPassword) {
      await this.tampilkanPesan(
        'Password Tidak Cocok',
        'Konfirmasi password harus sama dengan password baru.'
      );
      return;
    }

    this.sedangMemproses = true;

    this.http.post<any>(`${this.apiUrl}/reset-password`, {
      token: this.token,
      password: this.password
    }).subscribe({
      next: async (res) => {
        this.sedangMemproses = false;
        await this.tampilkanPesan(
          'Berhasil',
          res.message || 'Password berhasil diubah.'
        );
        await this.router.navigateByUrl('/login');
      },
      error: async (err) => {
        this.sedangMemproses = false;
        await this.tampilkanPesan(
          'Gagal',
          err.error?.message ||
          'Reset password gagal. Silakan minta tautan baru.'
        );
      }
    });
  }

  private async tampilkanPesan(judul: string, pesan: string) {
    const alert = await this.alertController.create({
      header: judul,
      message: pesan,
      buttons: ['OK']
    });

    await alert.present();
  }
}