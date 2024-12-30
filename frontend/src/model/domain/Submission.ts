export class Submission {
  private _date: string;
  private _phase: number;
  private _score: number;
  private _rubric: string;
  private _graceDaysUsed: number;

  constructor(date: string, phase: number, score: number, rubric: string, graceDaysUsed: number) {
    this._date = date;
    this._phase = phase;
    this._score = score;
    this._rubric = rubric;
    this._graceDaysUsed = graceDaysUsed;
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

  get graceDaysUsed(): number {
    return this._graceDaysUsed;
  }

  static fromJson(json: JSON): Submission {
    interface SubmissionJson {
      _date: string;
      _phase: number;
      _score: number;
      _rubric: string;
      _graceDaysUsed: number;
    }
    const jsonObject: SubmissionJson = json as unknown as SubmissionJson;

    return new Submission(jsonObject._date, jsonObject._phase, jsonObject._score, jsonObject._rubric, jsonObject._graceDaysUsed);
  }
}
