export class Submission {
  private _date: string;
  private _phase: number;
  private _score: number;
  private _rubric: string;
  private _lateDaysUsed: number;

  constructor(date: string, phase: number, score: number, rubric: string, lateDaysUsed: number) {
    this._date = date;
    this._phase = phase;
    this._score = score;
    this._rubric = rubric;
    this._lateDaysUsed = lateDaysUsed;
  }

  get date(): string {
    return this._date;
  }

  get phase(): number {
    return this._phase;
  }

  get score(): number {
    return this._score;
  }

  get rubric(): string {
    return this._rubric;
  }

  get lateDaysUsed(): number {
    return this._lateDaysUsed;
  }

  static fromJson(json: JSON): Submission {
    interface SubmissionJson {
      _date: string;
      _phase: number;
      _score: number;
      _rubric: string;
      _lateDaysUsed: number;
    }
    const jsonObject: SubmissionJson = json as unknown as SubmissionJson;

    return new Submission(jsonObject._date, jsonObject._phase, jsonObject._score, jsonObject._rubric, jsonObject._lateDaysUsed);
  }
}
