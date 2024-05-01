import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  constructor() { }
  
  getToken(): string | null {
    return this.getCookie("token");
  }

  setToken(token: string, expiryDate: Date | null = null): void {
    this.setCookie("token", token, expiryDate);
  }

  getCookie(name: string): string | null {
    const result: string | undefined = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];

    return (result == undefined ? null : result);
  }

  clearCookie(name: string): void {
    document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  setCookie(name: string, value: string, expiryDate: Date | null = null): void {
    let date: Date = expiryDate == null ? new Date() : expiryDate;
    if (expiryDate != null) {
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7, date.getHours(), date.getMinutes(), date.getSeconds());
    }
    document.cookie = name + "=" + value + "; path=/; expires=" + date.toUTCString() + ";";
  }
}
