import { SubscriptionEntry } from "./subscription-entry";

export class UserSubscriptionEntry {
  constructor(public userId: number = 0, public subscriptionEntry: SubscriptionEntry = new SubscriptionEntry(), public read: boolean = false, 
    public markedRead: boolean = false) {}
}