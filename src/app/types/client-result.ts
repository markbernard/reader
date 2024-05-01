export class ClientResult {
  constructor(public success: boolean = false, public message: string = "An unknown error occurredng serve.", public revokeToken: boolean = false, public data: any = null) {}
}