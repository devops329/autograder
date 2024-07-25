import { Grader } from '../../grading/graders/Grader';
import { DefaultGrader } from '../../grading/graders/Default';
import { DeliverableOne } from '../../grading/graders/DeliverableOne';
import { Canvas } from '../dao/canvas/Canvas';
import { DB } from '../dao/mysql/Database';
import { Submission } from '../domain/Submission';
import { DeliverableTwo } from '../../grading/graders/DeliverableTwo';
import { DeliverableThree } from '../../grading/graders/DeliverableThree';
import { DeliverableFour } from '../../grading/graders/DeliverableFour';
import { DeliverableFive } from '../../grading/graders/DeliverableFive';
import { DeliverableSix } from '../../grading/graders/DeliverableSix';
import { DeliverableTen } from '../../grading/graders/DeliverableTen';
import { DeliverableEleven } from '../../grading/graders/DeliverableEleven';
import { DeliverableTenPartTwo } from '../../grading/graders/DeliverableTenPartTwo';
import { User } from '../domain/User';
import { DeliverableSeven } from '../../grading/graders/DeliverableSeven';
import logger from '../../logger';
import { v4 as uuidv4 } from 'uuid';

export class GradeService {
  private dao: DB;
  private canvas: Canvas;

  constructor(dao: DB, canvas: Canvas) {
    this.dao = dao;
    this.canvas = canvas;
  }

  async grade(assignmentPhase: number, netid: string): Promise<[number | string, Submission[], object?]> {
    let score = 0;
    let grader: Grader;
    let assignmentId = 0;
    const assignmentIds = await this.getAssignmentIds();
    const user = await this.dao.getUser(netid);

    const gradeAttemptId = uuidv4();

    let submissions: Submission[] = [];

    switch (assignmentPhase) {
      case 1:
        grader = new DeliverableOne();
        assignmentId = assignmentIds['1'];
        break;
      case 2:
        grader = new DeliverableTwo();
        assignmentId = assignmentIds['2'];
        break;
      case 3:
        grader = new DeliverableThree();
        assignmentId = assignmentIds['3'];
        break;
      case 4:
        grader = new DeliverableFour();
        assignmentId = assignmentIds['4'];
        break;
      case 5:
        grader = new DeliverableFive();
        assignmentId = assignmentIds['5'];
        break;
      case 6:
        grader = new DeliverableSix();
        assignmentId = assignmentIds['6'];
        break;
      case 7:
        grader = new DeliverableSeven();
        assignmentId = assignmentIds['7'];
        break;
      case 10:
        grader = new DeliverableTen();
        const message = (await grader.grade(user!, gradeAttemptId))[0];
        submissions = await this.getSubmissions(netid);
        return [message, submissions];
      case 11:
        grader = new DeliverableEleven();
        const partner = (await grader.grade(user!, gradeAttemptId))[0];
        submissions = await this.getSubmissions(netid);
        return [partner, submissions];
      default:
        grader = new DefaultGrader();
        break;
    }
    const result = await grader.grade(user!, gradeAttemptId);
    score = result[0] as number;
    const rubric = result[1] as object;

    const submitScoreSuccess = await this.submitScoreToCanvas(assignmentId, netid, score);
    if (!submitScoreSuccess) {
      return ['Failed to submit score to Canvas', submissions, rubric];
    }
    await this.putSubmissionIntoDB(assignmentPhase, netid, score, rubric);

    submissions = await this.getSubmissions(netid);
    return [score, submissions, rubric];
  }

  async submitScoreToCanvas(assignmentId: number, netid: string, score: number) {
    let studentId = 135540;
    try {
      studentId = await this.canvas.getStudentId(netid);
      await this.canvas.updateGrade(assignmentId, studentId, score);
    } catch (e) {
      logger.log('error', [{ type: 'grade' }], `Failed to update student grade for ${netid}`);
      return false;
    }
    return true;
  }

  async gradeDeliverableTen(user: User) {
    const gradeAttemptId = uuidv4();
    const grader = new DeliverableTenPartTwo();
    const score = (await grader.grade(user, gradeAttemptId))[0];
    const rubric = {};
    const submitScoreSuccess = await this.submitScoreToCanvas(940837, user.netId, score);
    if (submitScoreSuccess) {
      await this.putSubmissionIntoDB(10, user.netId, score, rubric);
    }
  }

  async putSubmissionIntoDB(assignmentPhase: number, netId: string, score: number, rubric: object) {
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const submission = new Submission(date, `Phase ${assignmentPhase}`, score, JSON.stringify(rubric));
    await this.dao.putSubmission(submission, netId);
  }

  async getSubmissions(netId: string) {
    return this.dao.getSubmissions(netId);
  }

  async getAssignmentIds() {
    return await this.canvas.getAssignmentIds();
  }
}
