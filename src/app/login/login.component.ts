import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReaderUser } from '../types/reader-user';
import { ReaderService } from '../services/reader.service';
import { ClientResult } from '../types/client-result';
import { Router } from '@angular/router';
import { CookieService } from '../services/cookie.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild("background") backgroundElement?: ElementRef;
  @ViewChild("topPad") topPadElement?: ElementRef;
  @ViewChild("loginDialog") loginDialogElement?: ElementRef;
  @ViewChild("registerDialog") registerDialogElement?: ElementRef;

  loginView: boolean = true;
  readerUser: ReaderUser = new ReaderUser();
  transientMessage: string = "";
  transientColor: string = " bg-success";
  showPassword: boolean = false;
  showPasswordIcon: string = "far fa-eye";

  constructor(private readerService: ReaderService, private router: Router, private cookieService: CookieService) {}

  ngOnInit(): void {
    const token: string | null = this.cookieService.getToken();
    if (token != null) {
      this.readerService.loginWithToken(token).subscribe({
        next: (result: ClientResult) => {
          if (result.success) {
            this.router.navigateByUrl("/read");
          } else {
            this.cookieService.clearCookie("token");
          }
        }
      });
    }
    window.addEventListener("resize", () => {
      this.setSizes();
    });
  }

  ngAfterViewInit(): void {
    this.setSizes();
  }

  setSizes(): void {
    if (this.backgroundElement) {
      const divContainer: HTMLDivElement = this.backgroundElement.nativeElement;
      const topPadDiv: HTMLDivElement = this.topPadElement?.nativeElement;
      const loginDialogDiv: HTMLDivElement = this.loginDialogElement?.nativeElement;
      const registerDialogDiv: HTMLDivElement = this.registerDialogElement?.nativeElement;
      let height: number = window.innerHeight;
      divContainer.style.maxHeight = height + "px";
      divContainer.style.height = height + "px";
      if (this.loginView) {
        height -= loginDialogDiv.offsetHeight;
        height /= 2;
      } else {
        height -= registerDialogDiv.offsetHeight;
        height /= 2;
      }
      topPadDiv.style.height = height + "px";
      topPadDiv.style.maxHeight = height + "px";
    }
  }

  login(): void {
    this.readerService.login(this.readerUser).subscribe({
      next: (result: ClientResult) => {
        if (result.success) {
          const readerUser: ReaderUser = result.data;
          this.cookieService.setToken(readerUser.token!, readerUser.tokenExpiry);
          this.router.navigateByUrl("/read");
        } else {
          this.transientColor = " border border-danger border-5"
          this.transientMessage = "Email and password not matched."
        }

        setTimeout(() => {
          this.transientMessage = "";
        }, 5000);
      }
    });
  }

  toRegisterView(): void {
    this.loginView = false;
    (this.loginDialogElement?.nativeElement as HTMLDivElement).classList.add("d-none");
    (this.registerDialogElement?.nativeElement as HTMLDivElement).classList.remove("d-none");
    setTimeout(() => {
      this.setSizes();
    }, 1)
  }

  register(): void {
    this.readerService.register(this.readerUser).subscribe({
      next: (result: boolean) => {
        if (result) {
          this.transientColor = " border border-success border-5"
          this.transientMessage = "Registration successful. You may now login."
          this.toLoginView();
        } else {
          this.transientColor = " border border-danger border-5"
          this.transientMessage = "Registration failed."
        }

        setTimeout(() => {
          this.transientMessage = "";
        }, 5000);
      }
    });
  }

  toLoginView(): void {
    this.loginView = true;
    (this.loginDialogElement?.nativeElement as HTMLDivElement).classList.remove("d-none");
    (this.registerDialogElement?.nativeElement as HTMLDivElement).classList.add("d-none");
    setTimeout(() => {
      this.setSizes();
    }, 1)
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
    if (this.showPassword) {
      this.showPasswordIcon = "far fa-eye-slash";
    } else {
      this.showPasswordIcon = "far fa-eye";
    }
  }

  getFormattedDate(date: Date): string {
    const month: string = "0" + date.getMonth();
    const dayOfMonth: string = "0" + date.getDate();
    const hours: string = "0" + date.getHours();
    const minutes: string = "0" + date.getMinutes();
    const seconds: string = "0" + date.getSeconds();

    return date.getFullYear() + "-"
      + month.substring(month.length - 2, month.length) + "-"
      + dayOfMonth.substring(dayOfMonth.length - 2, dayOfMonth.length) + " "
      + hours.substring(hours.length - 2, hours.length) + ":"
      + minutes.substring(minutes.length - 2, minutes.length) + ":"
      + seconds.substring(seconds.length - 2, seconds.length);
  }
}
