import { Grader } from '../../grading/graders/Grader';
import { Canvas } from '../dao/canvas/Canvas';
import { DB } from '../dao/mysql/Database';
import { Submission } from '../domain/Submission';
import logger from '../../logger';
import { v4 as uuidv4 } from 'uuid';
import { GradeFactory } from '../../grading/GradeFactory';
import { ChaosService } from './ChaosService';

export class GradeService {
  private db: DB;
  private canvas: Canvas;
  private gradeFactory: GradeFactory;
  private chaosService: ChaosService;

  constructor(db: DB, canvas: Canvas, gradeFactory: GradeFactory, chaosService: ChaosService) {
    this.db = db;
    this.canvas = canvas;
    this.gradeFactory = gradeFactory;
    this.chaosService = chaosService;
  }

  async grade(assignmentPhase: number, netid: string): Promise<[number | string, Submission[], object?]> {
    let score = 0;
    let grader: Grader;
    let assignmentId = 0;
    const assignmentIds = await this.getAssignmentIds();
    const user = await this.db.getUser(netid);

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
        const message = (await grader.grade(user!))[0];
        submissions = await this.getSubmissions(netid);
        return [message, submissions];
      case 12:
        grader = this.gradeFactory.deliverableTwelve;
        const partner = (await grader.grade(user!))[0];
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
      if (!studentId) {
        logger.log('error', { type: 'get_student_id_failed', service: 'grade_service' }, { netid, message: 'Student not found' });
        return 'Failed to update grade';
      }
      const submitScoreErrorMessage = await this.canvas.updateGrade(netid, assignmentId, studentId, score, gradeAttemptId);
      return submitScoreErrorMessage;
    } catch (e) {
      logger.log('error', { type: 'grade', service: 'grade_service' }, { netid, error: e });
      return 'Failed to update grade';
    }
  }

  async gradeDeliverableEleven(apiKey: string, fixCode: string) {
    const user = await this.chaosService.resolveChaos(apiKey, fixCode);
    if (user) {
      const assignmentIds = await this.getAssignmentIds();
      const gradeAttemptId = uuidv4();
      const grader = this.gradeFactory.deliverableElevenPartTwo;
      const result = await grader.grade(user);
      const score = result[0] as number;
      const rubric = result[1] as object;
      const submitScoreErrorMessage = await this.submitScoreToCanvas(assignmentIds['11'], user.netId, score, gradeAttemptId);
      if (!submitScoreErrorMessage) {
        await this.putSubmissionIntoDB(11, user.netId, score, rubric);
      }
      // remove chaos from db
      this.chaosService.removeScheduledChaos(user.netId);
      // Make user eligible for pentest
      this.db.putPentest(user.netId);
      return true;
    } else {
      return false;
    }
  }

  private async putSubmissionIntoDB(assignmentPhase: number, netId: string, score: number, rubric: object) {
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const submission = new Submission(date, assignmentPhase, score, JSON.stringify(rubric));
    await this.db.putSubmission(submission, netId);
    return this.db.getSubmissions(netId);
  }

  async getSubmissions(netId: string) {
    return this.db.getSubmissions(netId);
  }

  async getAssignmentIds() {
    return await this.canvas.getAssignmentIds();
  }

  async getStats() {
    return await this.db.getSubmissionCountAllPhases();
  }
}
