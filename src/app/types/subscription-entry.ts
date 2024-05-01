export class SubscriptionEntry {
  constructor(public id: number = 0, public subscriptionId: number = 0, public title: string = "", public author: string = "", public description: string = "",
    public link: string = "", public comments: string = "", public content: string = "", public pubDate: Date = new Date()) {}
}
