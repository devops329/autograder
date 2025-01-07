import { Submission } from '../model/domain/Submission';
import { User } from '../model/domain/User';
import { GradeService } from '../model/service/GradeService';

export interface GradeView {
  setGradeMessage(grade: string): void;
  setError(error: string): void;
  setSubmissions(submissions: Submission[]): void;
  impersonating: boolean;
  rubric: object | null;
  setRubric(rubric: object): void;
  setUser(user: User): void;
}

export class GradePresenter {
  private view: GradeView;
  private gradeService: GradeService;
  constructor(view: GradeView) {
    this.view = view;
    this.gradeService = new GradeService();
  }
  async doGrade(netId: string, assignmentPhase: number) {
    let message = '';
    let submissions: Submission[] = [];
    let rubric: object = {};
    let user: User | null = null;
    try {
      [message, submissions, rubric, user] = await this.gradeService.grade(netId, assignmentPhase);
    } catch (e) {
      this.view.setError((e as Error).message);
    }
    this.view.setSubmissions(submissions);
    localStorage.setItem(this.view.impersonating ? 'impersonatedSubmissions' : 'submissions', JSON.stringify(submissions));
    this.view.setGradeMessage(message);
    this.view.setRubric(rubric);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  get assignmentPhases(): number[] {
    return this.gradeService.assignmentPhases;
  }
}
