import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn = false;
  private username = '';

  login(username: string) {
    this.loggedIn = true;
    this.username = username;
  }

  logout() {
    this.loggedIn = false;
    this.username = '';
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getUsername(): string {
    return this.username;
  }
}