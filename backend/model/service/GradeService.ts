import { Grader } from '../../grading/graders/Grader';
import { Canvas } from '../dao/canvas/Canvas';
import { DB } from '../dao/mysql/Database';
import { Submission } from '../domain/Submission';
import { User } from '../domain/User';
import logger from '../../logger';
import { v4 as uuidv4 } from 'uuid';
import { GradeFactory } from '../../grading/GradeFactory';

export class GradeService {
  private dao: DB;
  private canvas: Canvas;
  private gradeFactory: GradeFactory;

  constructor(dao: DB, canvas: Canvas, gradeFactory: GradeFactory) {
    this.dao = dao;
    this.canvas = canvas;
    this.gradeFactory = gradeFactory;
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
        grader = this.gradeFactory.deliverableOne;
        assignmentId = assignmentIds['1'];
        break;
      case 2:
        grader = this.gradeFactory.deliverableTwo;
        assignmentId = assignmentIds['2'];
        break;
      case 3:
        grader = this.gradeFactory.deliverableThree;
        assignmentId = assignmentIds['3'];
        break;
      case 4:
        grader = this.gradeFactory.deliverableFour;
        assignmentId = assignmentIds['4'];
        break;
      case 5:
        grader = this.gradeFactory.deliverableFive;
        assignmentId = assignmentIds['5'];
        break;
      case 6:
        grader = this.gradeFactory.deliverableSix;
        assignmentId = assignmentIds['6'];
        break;
      case 7:
        grader = this.gradeFactory.deliverableSeven;
        assignmentId = assignmentIds['7'];
        break;
      case 11:
        grader = this.gradeFactory.deliverableElevenPartOne;
        const message = (await grader.grade(user!, gradeAttemptId))[0];
        submissions = await this.getSubmissions(netid);
        return [message, submissions];
      case 12:
        grader = this.gradeFactory.deliverableTwelve;
        const partner = (await grader.grade(user!, gradeAttemptId))[0];
        submissions = await this.getSubmissions(netid);
        return [partner, submissions];
      default:
        return ['Invalid assignment phase', submissions];
    }
    const result = await grader.grade(user!, gradeAttemptId);
    score = result[0] as number;
    const rubric = result[1] as object;

    const submitScoreErrorMessage = await this.submitScoreToCanvas(assignmentId, netid, score, gradeAttemptId);
    if (submitScoreErrorMessage) {
      submissions = await this.getSubmissions(netid);
      return [submitScoreErrorMessage, submissions, rubric];
    }
    submissions = await this.putSubmissionIntoDB(assignmentPhase, netid, score, rubric);
    return [`Score: ${score}`, submissions, rubric];
  }

  private async submitScoreToCanvas(assignmentId: number, netid: string, score: number, gradeAttemptId: string): Promise<string | void> {
    try {
      const studentId = await this.canvas.getStudentId(netid);
      const submitScoreErrorMessage = await this.canvas.updateGrade(netid, assignmentId, studentId, score, gradeAttemptId);
      return submitScoreErrorMessage;
    } catch (e) {
      logger.log('error', { type: 'grade' }, `Failed to update student grade for ${netid}`);
      return 'Failed to update grade';
    }
  }

  async gradeDeliverableEleven(user: User) {
    const assignmentIds = await this.getAssignmentIds();
    const gradeAttemptId = uuidv4();
    const grader = this.gradeFactory.deliverableElevenPartTwo;
    const score = (await grader.grade(user, gradeAttemptId))[0] as number;
    const rubric = {};
    const submitScoreErrorMessage = await this.submitScoreToCanvas(assignmentIds['11'], user.netId, score, gradeAttemptId);
    if (!submitScoreErrorMessage) {
      await this.putSubmissionIntoDB(11, user.netId, score, rubric);
    }
  }

  private async putSubmissionIntoDB(assignmentPhase: number, netId: string, score: number, rubric: object) {
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const submission = new Submission(date, assignmentPhase, score, JSON.stringify(rubric));
    await this.dao.putSubmission(submission, netId);
    return this.dao.getSubmissions(netId);
  }

  async getSubmissions(netId: string) {
    return this.dao.getSubmissions(netId);
  }

  async getAssignmentIds() {
    return await this.canvas.getAssignmentIds();
  }
}
