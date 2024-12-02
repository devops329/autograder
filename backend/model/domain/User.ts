export class User {
  private _name: string;
  private _netId: string;
  private _apiKey: string;
  private _website: string;
  private _github: string;
  private _isAdmin: boolean;
  private _email: string;
  private _lateDays: number;

  constructor(
    name: string,
    netId: string,
    apiKey: string,
    website: string,
    github: string,
    email: string,
    lateDays: number = 0,
    isAdmin: boolean = false
  ) {
    this._netId = netId;
    this._name = name;
    this._apiKey = apiKey;
    this._website = website;
    this._github = github;
    this._email = email;
    this._lateDays = lateDays;
    this._isAdmin = isAdmin;
  }

  get name(): string {
    return this._name;
  }

  get netId(): string {
    return this._netId;
  }

  get apiKey(): string {
    return this._apiKey;
  }

  get isAdmin(): boolean {
    return this._isAdmin;
  }

  get website(): string {
    return this._website;
  }

  get github(): string {
    return this._github;
  }

  get email(): string {
    return this._email;
  }

  get lateDays(): number {
    return this._lateDays;
  }

  static fromJson(json: JSON): User {
    interface UserJson {
      _name: string;
      _netId: string;
      _apiKey: string;
      _website: string;
      _github: string;
      _email: string;
      _lateDays: number;
      _isAdmin?: boolean;
    }
    const jsonObject: UserJson = json as unknown as UserJson;
    return new User(
      jsonObject._name,
      jsonObject._netId,
      jsonObject._apiKey,
      jsonObject._website,
      jsonObject._github,
      jsonObject._email,
      jsonObject._lateDays,
      jsonObject._isAdmin
    );
  }
}
