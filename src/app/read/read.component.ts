import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReaderUser } from '../types/reader-user';
import { CookieService } from '../services/cookie.service';
import { Router } from '@angular/router';
import { ReaderService } from '../services/reader.service';
import { ClientResult } from '../types/client-result';
import { Subscription } from '../types/subscription';
import { UserSubscriptionEntry } from '../types/user-subscription-entry';

@Component({
  selector: 'app-read',
  templateUrl: './read.component.html',
  styleUrl: './read.component.css'
})
export class ReadComponent implements OnInit, AfterViewInit {
  @ViewChild("banner") bannerElement?: ElementRef;
  @ViewChild("subscriptions") subscriptionsElement?: ElementRef;
  @ViewChild("content") contentElement?: ElementRef;
  @ViewChild("addSubscriptionDialog") addSubscriptionDialogElement?: ElementRef;
  @ViewChild("controls") controlsElement?: ElementRef;
  @ViewChild("entries") entriesElement?: ElementRef;

  private readonly months: Array<string> = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  private readonly PAGE_SIZE: number = 15;

  readerUser: ReaderUser = new ReaderUser("Mark Bernard");
  feedUrl: string = "";
  subscriptionList: Array<Subscription> = [];
  selectedSubscription: Subscription | null = null;
  sortAscending: boolean = true;
  newPosts: boolean = true;
  userSubscriptionEntries: Array<UserSubscriptionEntry> = [];
  currentPage: number = 0;
  position: number = 0;
  lastScrollPosition: number = 0;

  constructor(private readerService: ReaderService, private router: Router, private cookieService: CookieService) {}

  ngOnInit(): void {
    const token: string | null = this.cookieService.getToken();
    if (token != null) {
      this.readerService.loginWithToken(token).subscribe({
        next: (result: ClientResult) => {
          if (!result.success) {
            this.cookieService.clearCookie("token");
            this.router.navigateByUrl("/login");
          } else {
            this.readerService.getSubscriptions().subscribe({
              next: (result: ClientResult) => {
                if (result.success) {
                  this.subscriptionList = result.data;
                  this.readerService.getCounts().subscribe({
                    next: (result: ClientResult) => {
                      result.data.forEach((value: number, key: string) => {
                        this.subscriptionList.forEach((subscription: Subscription) => {
                          if (subscription.feed == key) {
                            subscription.count = value;
                          }
                        });
                      });
                    }
                  });
                }
              }
            });
          }
        }
      });
    } else {
      this.router.navigateByUrl("/login");
    }
    window.addEventListener("resize", () => {
      this.setSizes();
    });
  }

  ngAfterViewInit(): void {
    this.setSizes();
  }

  setSizes(): void {
    const bannerDiv: HTMLDivElement = this.bannerElement?.nativeElement;
    const subscriptionsDiv: HTMLDivElement = this.subscriptionsElement?.nativeElement;
    const contentDiv: HTMLDivElement = this.contentElement?.nativeElement;

    let margin: number = (subscriptionsDiv.offsetTop - bannerDiv.offsetTop) - bannerDiv.offsetHeight;
    let height: number = window.innerHeight;
    let width: number = window.innerWidth;
    width -= subscriptionsDiv.offsetWidth;
    height -= (subscriptionsDiv.offsetTop - bannerDiv.offsetTop);
    subscriptionsDiv.style.maxHeight = height + "px";
    subscriptionsDiv.style.height = height + "px";
    contentDiv.style.maxHeight = height + "px";
    contentDiv.style.height = height + "px";
    if (margin > 0) {
      contentDiv.style.width = (width - (margin) * 2) + "px";
      contentDiv.style.maxWidth = (width - (margin) * 2) + "px";
      contentDiv.style.marginLeft = margin + "px";
    }

    if (this.controlsElement != undefined) {
      const controlsDiv: HTMLDivElement = this.controlsElement?.nativeElement;
      const entriesDiv: HTMLDivElement = this.entriesElement?.nativeElement;

      height -= controlsDiv.offsetHeight;
      height -= 11;
      entriesDiv.style.maxHeight = height + "px";
      entriesDiv.style.height = height + "px";
    }
  }

  logout(): void {
    console.log("Logout");
  }

  addSubscription(): void {
    (this.addSubscriptionDialogElement?.nativeElement as HTMLDialogElement).showModal();
  }

  subscribe(): void {
    if (this.feedUrl.trim().length > 0) {
      try {
        new URL(this.feedUrl);
        this.readerService.subscribe(this.feedUrl).subscribe({
          next: (result: ClientResult) => {
            if (result.success) {
              //Need to add one to index to return truthy value.
              const index: number = this.subscriptionList.findIndex((element: Subscription, index: number) => {
                if (element.feed == result.data.feed) {
                  return index + 1;
                }

                return false;
              });
              if (index == -1) {
                this.feedUrl = "";
                this.subscriptionList.push(result.data);
              }
            }
          }
        });
      } catch (error) {
        //TODO inform user of error
      }
    }
    (this.addSubscriptionDialogElement?.nativeElement as HTMLDialogElement).close();
  }

  select(event: Event, subscription: Subscription): void {
    document.querySelector(".selected")?.classList.remove("selected");
    (event.target as HTMLElement).classList.add("selected");
    this.selectedSubscription = subscription;
    this.currentPage = 0;
    this.userSubscriptionEntries = [];
    this.loadEntries();
  }

  loadEntries(): void {
    if (this.userSubscriptionEntries.length == (this.PAGE_SIZE * this.currentPage)) {
      this.readerService.getEntries(this.selectedSubscription!.id, !this.newPosts, this.sortAscending, this.PAGE_SIZE, this.currentPage).subscribe({
        next: (result: ClientResult) => {
          if (result.success) {
            this.userSubscriptionEntries = this.userSubscriptionEntries.concat(result.data);
          }
        }
      });
      setTimeout(() => {
        this.setSizes();
      }, 1);
    }
  }

  cancel(): void {
    (this.addSubscriptionDialogElement?.nativeElement as HTMLDialogElement).close();
  }

  toggleSort(): void {
    this.sortAscending = !this.sortAscending;
    this.currentPage = 0;
    this.userSubscriptionEntries = [];
    this.loadEntries();
  }

  toggleUnread(): void {
    this.newPosts = !this.newPosts;
    this.currentPage = 0;
    this.userSubscriptionEntries = [];
    this.loadEntries();
  }

  markRead(event: Event | null, userSubscriptionEntry: UserSubscriptionEntry): void {
    if (!userSubscriptionEntry.read) {
      if (event != null && (event.target as HTMLElement).nodeName == "BUTTON") {
        event.stopImmediatePropagation();
        userSubscriptionEntry.read = true;
        userSubscriptionEntry.markedRead = true;
        this.readerService.markRead(userSubscriptionEntry.subscriptionEntry.id, true).subscribe({
          next: (result: ClientResult) => {
            if (result.success) {
              this.selectedSubscription!.count--;
            }
          } 
        });
      } else if (!userSubscriptionEntry.markedRead) {
        userSubscriptionEntry.read = true;
        userSubscriptionEntry.markedRead = true;
        this.readerService.markRead(userSubscriptionEntry.subscriptionEntry.id, true).subscribe({
          next: (result: ClientResult) => {
            if (result.success) {
              this.selectedSubscription!.count--;
            }
          } 
        });
      }
    }
  }

  markUnread(event: Event, userSubscriptionEntry: UserSubscriptionEntry): void {
    userSubscriptionEntry.read = false;
    userSubscriptionEntry.markedRead = true;
    event.stopImmediatePropagation();
    this.readerService.markRead(userSubscriptionEntry.subscriptionEntry.id, false).subscribe({
      next: (result: ClientResult) => {
        if (result.success) {
          this.selectedSubscription!.count++;
        }
      } 
    });
  }

  markAllRead(): void {
    this.readerService.markAllRead(this.selectedSubscription!.id).subscribe({
      next: (result: ClientResult) => {
        if (result.success) {
          this.userSubscriptionEntries = []
          this.selectedSubscription!.count = 0;
        }
      }
    });
  }

  fixLinkText(link: string): string {
    return link.replace(new RegExp("(http|https)://"), "");
  }

  formatDate(date: Date): string {
    let hours: number = date.getHours();
    let amPm = " AM";
    if (hours > 11) {
      amPm = " PM";
    }
    if (hours > 12) {
      hours -= 12;
    }
    if (hours == 0) {
      hours = 12;
    }
    return this.months[date.getMonth()] + " " + ("0" + date.getDate()).slice(-2) + " " + date.getFullYear() + " " + hours + ":" 
    + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2) + amPm;
  }

  checkScroll(): void {
    const divElement: HTMLDivElement | null = document.querySelector("div[data-position='" + this.position + "']");
    const scrollDivElement: HTMLDivElement = this.entriesElement?.nativeElement;
    const scrollPosition: number = scrollDivElement.scrollTop;
    const divPosition: number = scrollDivElement.offsetTop + scrollPosition;
    if (this.lastScrollPosition < scrollPosition) {
      if (divElement != null && divElement.offsetTop < divPosition) {
        if (!this.userSubscriptionEntries[this.position].markedRead) {
          this.markRead(null, this.userSubscriptionEntries[this.position]);
        }
        this.position++;
        if (this.userSubscriptionEntries.length - this.position <= 5) {
          this.currentPage++;
          this.loadEntries();
        }
      }
    } else {
      if (divElement != null && divElement.offsetTop > divPosition) {
        this.position--;
      }
    }
    this.lastScrollPosition = scrollPosition;
  }

  next(): void {
    if (this.position < this.userSubscriptionEntries.length) {
      if (!this.userSubscriptionEntries[this.position].markedRead) {
        this.userSubscriptionEntries[this.position].read = true;
        this.userSubscriptionEntries[this.position].markedRead = true;
      }
      this.position++;
      const divElement: HTMLDivElement | null = document.querySelector("div[data-position='" + this.position + "']");
      const scrollDivElement: HTMLDivElement = this.entriesElement?.nativeElement;
      scrollDivElement.scroll({top: (divElement!.offsetTop - scrollDivElement.offsetTop)})
      if (this.userSubscriptionEntries.length - this.position <= 5) {
        this.currentPage++;
        this.loadEntries();
      }
    }
  }

  previous(): void {
    if (this.position > 0) {
      this.position--;
      const divElement: HTMLDivElement | null = document.querySelector("div[data-position='" + this.position + "']");
      const scrollDivElement: HTMLDivElement = this.entriesElement?.nativeElement;
      scrollDivElement.scroll({top: (divElement!.offsetTop - scrollDivElement.offsetTop)})
    }
  }
}
