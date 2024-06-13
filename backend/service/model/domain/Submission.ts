export class Submission {
	private _date: string;
	private _phase: string;
	private _score: number;

	constructor(date: string, phase: string, score: number) {
		this._date = date;
		this._phase = phase;
		this._score = score;
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

	static fromJson(json: string): Submission {
		interface SubmissionJson {
			_date: string;
			_phase: string;
			_score: number;
		}

		const jsonObject: SubmissionJson = JSON.parse(json);

		return new Submission(
			jsonObject._date,
			jsonObject._phase,
			jsonObject._score
		);
	}
}
