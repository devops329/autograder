import { Grader } from '../../grading/graders/Grader';
import { DefaultGrader } from '../../grading/graders/Default';
import { DeliverableOneGrader } from '../../grading/graders/DeliverableOne';
import { Canvas } from '../dao/canvas/Canvas';
import { DB } from '../dao/mysql/Database';
import { Submission } from '../domain/Submission';
import { DeliverableTwoGrader } from '../../grading/graders/DeliverableTwo';
import { DeliverableThree } from '../../grading/graders/DeliverableThree';
import { DeliverableFour } from '../../grading/graders/DeliverableFour';
import { DeliverableFive } from '../../grading/graders/DeliverableFive';
import { DeliverableSix } from '../../grading/graders/DeliverableSix';
import { DeliverableTen } from '../../grading/graders/DeliverableTen';
import { DeliverableEleven } from '../../grading/graders/DeliverableEleven';

export class GradeService {
  private dao: DB;
  private canvas: Canvas;

  constructor(dao: DB, canvas: Canvas) {
    this.dao = dao;
    this.canvas = canvas;
  }

  async grade(assignmentPhase: number, netid: string) {
    let score = 0;
    let grader: Grader;
    let assignmentId = 940837;
    const user = await this.dao.getUser(netid);

    switch (assignmentPhase) {
      case 1:
        grader = new DeliverableOneGrader();
        break;
      case 2:
        grader = new DeliverableTwoGrader();
        assignmentId = 945388;
        break;
      case 3:
        grader = new DeliverableThree();
        break;
      case 4:
        grader = new DeliverableFour();
        break;
      case 5:
        grader = new DeliverableFive();
        break;
      case 6:
        grader = new DeliverableSix();
        break;
      case 10:
        grader = new DeliverableTen();
        break;
      case 11:
        grader = new DeliverableEleven();
        const partner = await grader.grade(user!);
        const submissions = await this.getSubmissions(netid);
        return [partner, submissions];
      default:
        grader = new DefaultGrader();
        break;
    }
    score = (await grader.grade(user!)) as number;
    // FIXME: remove hardcoded assignmentId
    let studentId = 135540;
    try {
      studentId = await this.canvas.getStudentId(netid);
    } catch (e) {
      console.error(e);
    }
    await this.canvas.updateGrade(assignmentId, studentId, score);

    await this.putSubmissionIntoDB(assignmentPhase, netid, score);
    const submissions = await this.getSubmissions(netid);
    return [score, submissions];
  }

  async putSubmissionIntoDB(assignmentPhase: number, netId: string, score: number) {
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const submission = new Submission(date, `Phase ${assignmentPhase}`, score);
    await this.dao.putSubmission(submission, netId);
  }

  async getSubmissions(netId: string) {
    return this.dao.getSubmissions(netId);
  }
}
