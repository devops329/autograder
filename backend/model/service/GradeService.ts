import { Grader } from '../../grading/graders/Grader';
import { Assignment, Canvas } from '../dao/canvas/Canvas';
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

  private _submissionsEnabled = true;

  constructor(db: DB, canvas: Canvas, gradeFactory: GradeFactory, chaosService: ChaosService) {
    this.db = db;
    this.canvas = canvas;
    this.gradeFactory = gradeFactory;
    this.chaosService = chaosService;
  }

  get submissionsEnabled() {
    return this._submissionsEnabled;
  }

  toggleSubmissions() {
    this._submissionsEnabled = !this._submissionsEnabled;
    return this._submissionsEnabled;
  }

  async grade(assignmentPhase: number, netid: string): Promise<[number | string, Submission[], object?]> {
    let score = 0;
    let grader: Grader;
    let assignmentId = 0;
    const assignments = await this.getAssignmentIdsAndDueDates();
    const user = await this.db.getUser(netid);

    const gradeAttemptId = uuidv4();

    let submissions: Submission[] = [];

    switch (assignmentPhase) {
      case 1:
        grader = this.gradeFactory.deliverableOne;
        assignmentId = assignments['1'].id;
        break;
      case 2:
        grader = this.gradeFactory.deliverableTwo;
        assignmentId = assignments['2'].id;
        break;
      case 3:
        grader = this.gradeFactory.deliverableThree;
        assignmentId = assignments['3'].id;
        break;
      case 4:
        grader = this.gradeFactory.deliverableFour;
        assignmentId = assignments['4'].id;
        break;
      case 5:
        grader = this.gradeFactory.deliverableFive;
        assignmentId = assignments['5'].id;
        break;
      case 6:
        grader = this.gradeFactory.deliverableSix;
        assignmentId = assignments['6'].id;
        break;
      case 7:
        grader = this.gradeFactory.deliverableSeven;
        assignmentId = assignments['7'].id;
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
    const lateCalculation = await this.calculateScoreAfterLateDays(netid, assignments[assignmentPhase], score);
    const scoreAfterLateCalculation = lateCalculation.score;
    const lateDaysUsed = lateCalculation.lateDaysUsed;
    const rubric = { ...result[1], lateDaysUsed };

    // Attempt to submit score to Canvas
    const submitScoreErrorMessage = await this.submitScoreToCanvas(assignmentId, netid, scoreAfterLateCalculation, gradeAttemptId);
    // If submission fails, return error message
    if (submitScoreErrorMessage) {
      submissions = await this.getSubmissions(netid);
      return [submitScoreErrorMessage, submissions, rubric];
    }
    // If submission is successful, put submission into DB and return score, rubric, and submissions
    submissions = await this.putSubmissionIntoDB(assignmentPhase, netid, scoreAfterLateCalculation, rubric, lateDaysUsed);
    return [`Score: ${scoreAfterLateCalculation}`, submissions, rubric];
  }

  private async submitScoreToCanvas(assignmentId: number, netid: string, score: number, gradeAttemptId: string): Promise<string | void> {
    try {
      const studentId = await this.canvas.getStudentId(netid);
      if (!studentId) {
        logger.log('error', { type: 'get_student_id_failed', service: 'grade_service' }, { netid, message: 'Student not found' });
        return 'Failed to update grade';
      }
      // Canvas only returns an error message if the submission fails, else void
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
      try {
        const assignments = await this.getAssignmentIdsAndDueDates();
        const gradeAttemptId = uuidv4();
        const grader = this.gradeFactory.deliverableElevenPartTwo;
        const result = await grader.grade(user);
        const score = result[0] as number;
        // Calculate score after late days
        const lateCalculation = await this.calculateScoreAfterLateDays(user.netId, assignments[11], score);
        const scoreAfterLateCalculation = lateCalculation.score;
        const lateDaysUsed = lateCalculation.lateDaysUsed;
        logger.log('info', { type: 'grade', service: 'grade_service', deliverable: '11' }, { netid: user.netId, scoreAfterLateCalculation });
        const rubric = { ...result[1], lateDaysUsed };
        const submitScoreErrorMessage = await this.submitScoreToCanvas(assignments['11'].id, user.netId, scoreAfterLateCalculation, gradeAttemptId);
        if (!submitScoreErrorMessage) {
          await this.putSubmissionIntoDB(11, user.netId, scoreAfterLateCalculation, rubric, lateDaysUsed);
        }
        // remove chaos from db
        this.chaosService.removeScheduledChaos(user.netId);
        // Make user eligible for pentest
        this.db.putPentest(user.netId);
      } catch (e) {
        logger.log('error', { type: 'grade', service: 'grade_service' }, { netid: user.netId, error: e });
        return false;
      }
      return true;
    } else {
      return false;
    }
  }

  private async putSubmissionIntoDB(assignmentPhase: number, netId: string, score: number, rubric: object, lateDaysUsed: number) {
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const submission = new Submission(date, assignmentPhase, score, JSON.stringify(rubric), lateDaysUsed);
    await this.db.putSubmission(submission, netId);
    return this.db.getSubmissions(netId);
  }

  async getSubmissions(netId: string) {
    return this.db.getSubmissions(netId);
  }

  async getAssignmentIdsAndDueDates() {
    return await this.canvas.getAssignmentIdsAndDueDates();
  }

  async calculateScoreAfterLateDays(netId: string, assignment: Assignment, score: number): Promise<{ score: number; lateDaysUsed: number }> {
    if (!this.submissionsEnabled) {
      return { score: 0, lateDaysUsed: 0 };
    }
    // Get today's date and due date, calculate days past due date
    const today = new Date();
    const dueDate = new Date(assignment.due_at);
    const timeDiff = today.getTime() - dueDate.getTime();
    const daysPastDueDate = Math.floor(timeDiff / (1000 * 3600 * 24));

    // Get late days remaining
    const lateDaysRemaining = await this.db.getLateDays(netId);
    // If the student has already used some late days for this assignment, and are resubmitting,
    // we need to account for those late days in the calculation
    const mostRecentSubmission = await this.db.getMostRecentSubmissionForDeliverable(netId, assignment.id);
    const lateDaysUsedForDeliverable = mostRecentSubmission ? mostRecentSubmission.lateDaysUsed : 0;
    const lateDaysAvailable = lateDaysRemaining + lateDaysUsedForDeliverable;

    // If days late exceeds remaining late days, return 0
    if (daysPastDueDate > lateDaysAvailable) {
      return { score: 0, lateDaysUsed: 0 };
    }
    // If days late is positive, subtract from late days
    let updatedLateDays = lateDaysAvailable;
    let lateDaysUsed = 0;

    if (daysPastDueDate > 0) {
      updatedLateDays -= daysPastDueDate;
      lateDaysUsed = daysPastDueDate;
      await this.db.updateLateDays(netId, updatedLateDays);
    }
    // Must be 100% to get extra credit for early submission
    // Deliverable 11 max score for autograded portion is 80
    if (daysPastDueDate < 0 && (score == 100 || (assignment.phase == 11 && score == 80))) {
      const daysEarly = Math.min(3, Math.abs(daysPastDueDate));
      await this.db.updateLateDays(netId, lateDaysAvailable + daysEarly);
    }
    return { score, lateDaysUsed };
  }
}
