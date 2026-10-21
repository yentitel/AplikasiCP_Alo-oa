import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { PythonService } from '../services/python.service';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  username: string = '';
  password: string = '';

  loading: boolean = false;
  errorMessage: string = '';

  // Samakan IP ini dengan IP laptop dan port backend Flask.
  private apiUrl = 'http://192.168.1.27:5000';

  constructor(
    private pythonService: PythonService,
    private router: Router,
    private alertController: AlertController,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  login() {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Username dan password wajib diisi.';
      this.tampilkanAlert('Peringatan', this.errorMessage);
      return;
    }

    this.loading = true;

    const data = {
      username: this.username.trim(),
      password: this.password
    };

    this.pythonService.login(data).subscribe({
      next: async (res: any) => {
        this.loading = false;

        if (res && res.status === 'success') {
          const usernameLogin =
            res.user && res.user.username
              ? res.user.username
              : this.username;

          this.authService.login(usernameLogin);

          const alert = await this.alertController.create({
            header: 'Login Berhasil',
            message:
              'Selamat datang di CP-INSIGHT, ' +
              (res.user?.username || this.username) + '!',
            backdropDismiss: false,
            buttons: [{
              text: 'OK',
              handler: () => {
                this.router.navigate(['/tabs/tab1']);
              }
            }]
          });

          await alert.present();
        } else {
          this.errorMessage =
            res?.message || 'Username atau password salah.';

          await this.tampilkanAlert(
            'Login Gagal',
            this.errorMessage
          );
        }
      },

      error: async (err: any) => {
        console.error('ERROR LOGIN:', err);
        this.loading = false;

        this.errorMessage =
          err.error?.message ||
          (err.status === 0
            ? 'Server Flask tidak dapat dihubungi.'
            : 'Login gagal. Silakan coba lagi.');

        await this.tampilkanAlert(
          'Login Gagal',
          this.errorMessage
        );
      }
    });
  }

  async lupaPassword() {
    const alert = await this.alertController.create({
      header: 'Lupa Password',
      message:
        'Masukkan alamat email yang terdaftar pada akun CP-INSIGHT. Tautan reset akan dikirim ke email tersebut.',
      inputs: [{
        name: 'email',
        type: 'email',
        placeholder: 'Masukkan email terdaftar',
        attributes: {
          autocapitalize: 'off',
          required: true
        }
      }],
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Kirim Tautan',
          handler: (data) => {
            const email = (data.email || '').trim();

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              this.tampilkanAlert(
                'Email Tidak Valid',
                'Masukkan alamat email yang benar.'
              );
              return false;
            }

            this.kirimTautanReset(email);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private kirimTautanReset(email: string) {
    this.http.post<any>(
      `${this.apiUrl}/forgot-password`,
      { email }
    ).subscribe({
      next: async (res) => {
        await this.tampilkanAlert(
          'Permintaan Diproses',
          res?.message ||
            'Jika email terdaftar, tautan reset password akan dikirim ke email tersebut.'
        );
      },
      error: async (err) => {
        console.error('ERROR LUPA PASSWORD:', err);

        await this.tampilkanAlert(
          'Gagal Mengirim Tautan',
          err.status === 0
            ? 'Server tidak dapat dihubungi. Pastikan Flask berjalan dan alamat IP laptop benar.'
            : (err.error?.message ||
              'Tautan reset gagal dikirim. Silakan coba lagi.')
        );
      }
    });
  }

  async tampilkanAlert(
    header: string,
    message: string
  ) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
    return alert;
  }
}