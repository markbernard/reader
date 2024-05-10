import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AsyncSubject, Observable } from 'rxjs';
import { ReaderUser } from '../types/reader-user';
import { ClientResult } from '../types/client-result';
import { Subscription } from '../types/subscription';
import { CookieService } from './cookie.service';
import { SubscriptionEntry } from '../types/subscription-entry';
import { UserSubscriptionEntry } from '../types/user-subscription-entry';

@Injectable({
  providedIn: 'root'
})
export class ReaderService {
  constructor(private http: HttpClient, private cookieService: CookieService) { }

  register(readerUser: ReaderUser): Observable<boolean> {
    const options: any = {
      responseType: "text"
    }
    const asyncSubject: AsyncSubject<boolean> = new AsyncSubject<boolean>();

    this.http.post("/readerws/register", readerUser, options).subscribe({
      next: (result: any) => {
        const clientResult: ClientResult = JSON.parse(result, (key: string, value: any) => {
          if (key == "data") {
            const readerUser: ReaderUser = new ReaderUser();
            readerUser.name = (value == null) ? "" : value.name;
            readerUser.email = (value == null) ? "" : value.email;

            return readerUser;
          }

          return value;
        });

        asyncSubject.next(clientResult.success);
        asyncSubject.complete();
      }
    });

    return asyncSubject.asObservable();
  }

  login(readerUser: ReaderUser): Observable<ClientResult> {
    const options: any = {
      responseType: "text"
    }
    const asyncSubject: AsyncSubject<ClientResult> = new AsyncSubject<ClientResult>();

    this.http.post("/readerws/login", readerUser, options).subscribe({
      next: (result: any) => {
        const clientResult: ClientResult = JSON.parse(result, (key: string, value: any) => {
          if (key == "tokenExpiry") {
            return new Date(value);
          } else if (key == "data") {
            const readerUser: ReaderUser = new ReaderUser();
            readerUser.name = (value == null) ? "" : value.name;
            readerUser.email = (value == null) ? "" : value.email;
            readerUser.token = (value == null) ? null : value.token;
            readerUser.tokenExpiry = (value == null) ? null : value.tokenExpiry;

            return readerUser;
          }

          return value;
        });

        asyncSubject.next(clientResult);
        asyncSubject.complete();
      }
    });

    return asyncSubject.asObservable();
  }

  loginWithToken(token: string): Observable<ClientResult> {
    const body = {
      token: token
    };
    const options: any = {
      responseType: "text"
    }
    const asyncSubject: AsyncSubject<ClientResult> = new AsyncSubject<ClientResult>();

    this.http.post("/readerws/loginWithToken", body, options).subscribe({
      next: (result: any) => {
        const clientResult: ClientResult = JSON.parse(result, (key: string, value: any) => {
          if (key == "tokenExpiry") {
            return new Date(value);
          } else if (key == "data") {
            const readerUser: ReaderUser = new ReaderUser();
            readerUser.name = (value == null) ? "" : value.name;
            readerUser.email = (value == null) ? "" : value.email;
            readerUser.token = (value == null) ? null : value.token;
            readerUser.tokenExpiry = (value == null) ? null : value.tokenExpiry;

            return readerUser;
          }

          return value;
        });

        asyncSubject.next(clientResult);
        asyncSubject.complete();
      }
    });

    return asyncSubject.asObservable();
  }

  subscribe(feedUrl: string): Observable<ClientResult> {
    const body = {
      feedUrl: feedUrl,
      token: this.cookieService.getToken()
    };
    const options: any = {
      responseType: "text"
    }
    const asyncSubject: AsyncSubject<ClientResult> = new AsyncSubject<ClientResult>();

    this.http.post("/readerws/subscribe", body, options).subscribe({
      next: (result: any) => {
        const clientResult: ClientResult = JSON.parse(result, (key: string, value: any) => {
          if (key == "data" && value != null) {
            const subscription: Subscription = new Subscription(value.id, value.title, value.feed, value.link, value.description, value.favicon, value.faviconVerified);

            return subscription;
          }

          return value;
        });

        asyncSubject.next(clientResult);
        asyncSubject.complete();
      }
    });

    return asyncSubject.asObservable();
  }

  getEntries(suscriptionId: number, includeRead: boolean, newestFirst: boolean, pageSize: number, page: number): Observable<ClientResult> {
    const body = {
      suscriptionId: suscriptionId,
      includeRead: includeRead,
      pageSize: pageSize,
      page: page,
      newestFirst: newestFirst,
      token: this.cookieService.getToken()
    };
    const options: any = {
      responseType: "text"
    }
    const asyncSubject: AsyncSubject<ClientResult> = new AsyncSubject<ClientResult>();

    this.http.post("/readerws/getEntries", body, options).subscribe({
      next: (result: any) => {
        const clientResult: ClientResult = JSON.parse(result, (key: string, value: any) => {
          if (key == "pubDate") {
            return new Date(value);
          } else if (key == "subscriptionEntry") {
            return new SubscriptionEntry(value.id,value.subscriptionId, value.title, value.author, value.description,
              value.link, value.comments, value.content, value.pubDate);
          } else if (!isNaN(parseInt(key))) {
            return new UserSubscriptionEntry(value.userid, value.subscriptionEntry, value.read);
          }

          return value;
        });

        asyncSubject.next(clientResult);
        asyncSubject.complete();
      }
    });

    return asyncSubject.asObservable();
  }

  getSubscriptions(): Observable<ClientResult> {
    const body = {
      token: this.cookieService.getToken()
    };
    const options: any = {
      responseType: "text"
    }
    const asyncSubject: AsyncSubject<ClientResult> = new AsyncSubject<ClientResult>();

    this.http.post("/readerws/getSubscriptions", body, options).subscribe({
      next: (result: any) => {
        const clientResult: ClientResult = JSON.parse(result, (key: string, value: any) => {
          if (!isNaN(parseInt(key))) {
            return new Subscription(value.id, value.title, value.feed, value.link, value.description, value.favicon, value.faviconVerified);
          }

          return value;
        });

        asyncSubject.next(clientResult);
        asyncSubject.complete();
      }
    });

    return asyncSubject.asObservable();
  }

  getCounts(): Observable<ClientResult> {
    const body = {
      token: this.cookieService.getToken()
    };
    const options: any = {
      responseType: "text"
    }
    const asyncSubject: AsyncSubject<ClientResult> = new AsyncSubject<ClientResult>();

    this.http.post("/readerws/getCounts", body, options).subscribe({
      next: (result: any) => {
        const clientResult: ClientResult = JSON.parse(result, (key: any, value: any) => {
          if (key == "data") {
            const map: Map<string, number> = new Map();
            for (const property in value) {
              map.set(property, value[property]);
            }

            return map;
          } else {
            return value
          }
        });
        
        asyncSubject.next(clientResult);
        asyncSubject.complete();
      }
    });

    return asyncSubject.asObservable();
  }

  markRead(subscriptionEntryId: number, read: boolean): Observable<ClientResult> {
    const body = {
      token: this.cookieService.getToken(),
      subscriptionEntryId: subscriptionEntryId,
      read: read
    };
    const options: any = {
      responseType: "text"
    }
    const asyncSubject: AsyncSubject<ClientResult> = new AsyncSubject<ClientResult>();

    this.http.post("/readerws/markRead", body, options).subscribe({
      next: (result: any) => {
        const clientResult: ClientResult = JSON.parse(result, (key: any, value: any) => {
          if (key == "data") {
            const map: Map<string, number> = new Map();
            for (const property in value) {
              map.set(property, value[property]);
            }

            return map;
          } else {
            return value
          }
        });
        
        asyncSubject.next(clientResult);
        asyncSubject.complete();
      }
    });

    return asyncSubject.asObservable();
  }

  markAllRead(subscriptionId: number): Observable<ClientResult> {
    const body = {
      token: this.cookieService.getToken(),
      subscriptionId: subscriptionId
    };
    const options: any = {
      responseType: "text"
    }
    const asyncSubject: AsyncSubject<ClientResult> = new AsyncSubject<ClientResult>();

    this.http.post("/readerws/markAllRead", body, options).subscribe({
      next: (result: any) => {
        const clientResult: ClientResult = JSON.parse(result);
        
        asyncSubject.next(clientResult);
        asyncSubject.complete();
      }
    });

    return asyncSubject.asObservable();
  }
}
