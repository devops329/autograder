import { Submission } from '../model/domain/Submission';
import { GradeService } from '../model/service/GradeService';

export interface GradeView {
  setGrade(grade: string): void;
  setError(error: string): void;
  setSubmissions(submissions: Submission[]): void;
}

export class GradePresenter {
  private view: GradeView;
  private gradeService: GradeService;
  constructor(view: GradeView) {
    this.view = view;
    this.gradeService = new GradeService();
  }
  async doGrade(netId: string, assignmentPhase: number) {
    let score = '';
    let submissions: Submission[] = [];
    try {
      [score, submissions] = await this.gradeService.grade(netId, assignmentPhase);
    } catch (e) {
      this.view.setError((e as Error).message);
    }
    this.view.setSubmissions(submissions);
    localStorage.setItem('submissions', JSON.stringify(submissions));
    this.view.setGrade(score);
  }

  get assignmentPhases(): number[] {
    return this.gradeService.assignmentPhases;
  }
}
