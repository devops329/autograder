export class User {
  private _id: number;
  private _name: string;
  private _netId: string;
  private _apiKey: string;
  private _website: string;
  private _github: string;
  private _isAdmin: boolean;

  constructor(id: number, name: string, netId: string, apiKey: string, website: string, github: string, isAdmin: boolean = false) {
    this._id = id;
    this._netId = netId;
    this._name = name;
    this._apiKey = apiKey;
    this._website = website;
    this._github = github;
    this._isAdmin = isAdmin;
  }

  get id(): number {
    return this._id;
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

  static fromJson(json: JSON): User {
    interface UserJson {
      _id: number;
      _name: string;
      _netId: string;
      _apiKey: string;
      _website: string;
      _github: string;
      _isAdmin?: boolean;
    }
    const jsonObject: UserJson = json as unknown as UserJson;

    return new User(jsonObject._id, jsonObject._name, jsonObject._netId, jsonObject._apiKey, jsonObject._website, jsonObject._github, jsonObject._isAdmin);
  }
}
