import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PythonService {

  private api = 'http://192.168.1.25:5000';

  constructor(private http: HttpClient) {}

  // ==========================================
  // LOGIN
  // ==========================================
  login(data: any) {
    return this.http.post(
      `${this.api}/login`,
      data
    );
  }

  // ==========================================
  // AMBIL SEMUA DATA SISWA
  // ==========================================
  getSiswa() {
    return this.http.get(`${this.api}/siswa`);
  }

  // ==========================================
  // TAMBAH DATA SISWA
  // ==========================================
  tambahSiswa(data: any) {
    return this.http.post(
      `${this.api}/siswa`,
      data
    );
  }

  // ==========================================
  // HAPUS DATA SISWA
  // ==========================================
  hapusSiswa(id: number) {
    return this.http.delete(
      `${this.api}/siswa/${id}`
    );
  }

  // ==========================================
  // IMPORT EXCEL
  // ==========================================
  importExcel(data: any[]) {
    console.log('kirim ke flask', data);

    return this.http.post(
      `${this.api}/import-excel`,
      data
    );
  }

  // ==========================================
  // GENERATE DENDROGRAM
  // ==========================================
  generateDendrogram(
    data: any,
    cluster: number,
    filename: string
  ) {
    return this.http.post(
      `${this.api}/generate-dendrogram`,
      {
        siswa: data,
        cluster: cluster,
        filename: filename
      }
    );
  }

  // ==========================================
  // SAVE HISTORY
  // ==========================================
  saveHistory(data: any) {
    return this.http.post(
      `${this.api}/save-history`,
      data
    );
  }

  // ==========================================
  // GET HISTORY
  // ==========================================
  getHistory() {
    return this.http.get<any[]>(
      `${this.api}/history`
    );
  }

  // ==========================================
  // SAVE DETAIL CLUSTER
  // ==========================================
  saveDetail(data: any) {
    return this.http.post(
      `${this.api}/save-detail`,
      data
    );
  }

  // ==========================================
  // SAVE HISTORY DETAIL
  // ==========================================
  saveHistoryDetail(data: any[]) {
    return this.http.post(
      `${this.api}/save-detail`,
      data
    );
  }

  // ==========================================
  // GET HISTORY DETAIL
  // ==========================================
  getHistoryDetail(id: number) {
    return this.http.get<any[]>(
      `${this.api}/history/${id}`
    );
  }

  // ==========================================
  // DELETE HISTORY
  // ==========================================
  deleteHistory(id: number) {
    return this.http.delete(
      `${this.api}/history/${id}`
    );
  }

  // ==========================================
  // UPDATE DENDROGRAM
  // ==========================================
  updateDendrogram(data: any) {
    return this.http.post(
      `${this.api}/update-dendrogram`,
      data
    );
  }

}