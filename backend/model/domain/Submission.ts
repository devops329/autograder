export class Submission {
  private _date: string;
  private _phase: string;
  private _score: number;
  private _rubric: string;

  constructor(date: string, phase: string, score: number, rubric: string) {
    this._date = date;
    this._phase = phase;
    this._score = score;
    this._rubric = rubric;
  }

  get date(): string {
    return this._date;
  }

  get phase(): string {
    return this._phase;
  }

  get score(): number {
    return this._score;
  }

  get rubric(): string {
    return this._rubric;
  }

  static fromJson(json: string): Submission {
    interface SubmissionJson {
      _date: string;
      _phase: string;
      _score: number;
      _rubric: string;
    }

    const jsonObject: SubmissionJson = JSON.parse(json);

    return new Submission(jsonObject._date, jsonObject._phase, jsonObject._score, jsonObject._rubric);
  }
}
