export class ReaderUser {
  constructor(public name: string = "", public email: string = "", public password: string = "", public token: string | null = null, 
    public tokenExpiry: Date | null = null) {}
}