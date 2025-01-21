import { Grader } from '../../grading/graders/Grader';
import { Assignment, Canvas } from '../dao/canvas/Canvas';
import { DB } from '../dao/mysql/Database';
import { Submission } from '../domain/Submission';
import logger from '../../logger';
import { v4 as uuidv4 } from 'uuid';
import { GradeFactory } from '../../grading/GradeFactory';
import { ChaosService } from './ChaosService';
import { DateTime } from 'luxon';

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
    if (!user) {
      return ['User not found', []];
    }

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
    let rubric = result[1] as object;
    // Will return any adjustments to grace days
    const lateCalculation = await this.calculateScoreAfterGraceDays(netid, assignments[assignmentPhase], score, rubric);
    const scoreAfterLateCalculation = lateCalculation.score;
    const graceDaysUsed = lateCalculation.graceDaysUsed;
    rubric = lateCalculation.rubric;
    // Attempt to submit score to Canvas
    const submitScoreErrorMessage = await this.submitScoreToCanvas(assignmentId, netid, scoreAfterLateCalculation, gradeAttemptId);
    // If submission fails, return error message
    if (submitScoreErrorMessage) {
      submissions = await this.getSubmissions(netid);
      return [submitScoreErrorMessage, submissions, rubric];
    }
    // If submission is successful, put submission into DB
    try {
      submissions = await this.putSubmissionIntoDB(assignmentPhase, netid, scoreAfterLateCalculation, rubric, graceDaysUsed);
    } catch (e: any) {
      logger.log('error', { type: 'grade', service: 'grade_service' }, { netid, error: e.message });
      return ['Failed to save submission', submissions, rubric];
    }
    // If submission is successful, update grace days in DB
    try {
      // update grace days
      await this.db.updateGraceDays(netid, lateCalculation.graceDayAdjustment);
    } catch (e: any) {
      logger.log('error', { type: 'update_grace_days', service: 'grade_service' }, { netid, error: e.message });
      return ['Failed to update grace days', submissions, rubric];
    }

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
        let rubric = result[1] as object;
        // Calculate score after late days
        const lateCalculation = await this.calculateScoreAfterGraceDays(user.netId, assignments[11], score, rubric);
        const scoreAfterLateCalculation = lateCalculation.score;
        const graceDaysUsed = lateCalculation.graceDaysUsed;
        rubric = lateCalculation.rubric;
        logger.log('info', { type: 'grade', service: 'grade_service', deliverable: '11' }, { netid: user.netId, scoreAfterLateCalculation });
        const submitScoreErrorMessage = await this.submitScoreToCanvas(assignments['11'].id, user.netId, scoreAfterLateCalculation, gradeAttemptId);
        if (!submitScoreErrorMessage) {
          await this.putSubmissionIntoDB(11, user.netId, scoreAfterLateCalculation, rubric, graceDaysUsed);
          await this.db.updateGraceDays(user.netId, lateCalculation.graceDayAdjustment);
        }
        // remove chaos from db
        this.chaosService.removeScheduledChaos(user.netId);
      } catch (e) {
        logger.log('error', { type: 'grade', service: 'grade_service' }, { netid: user.netId, error: e });
        return false;
      }
      return true;
    } else {
      return false;
    }
  }

  private async putSubmissionIntoDB(assignmentPhase: number, netId: string, score: number, rubric: object, graceDaysUsed: number) {
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const submission = new Submission(date, assignmentPhase, score, JSON.stringify(rubric), graceDaysUsed);
    await this.db.putSubmission(submission, netId);
    return this.db.getSubmissions(netId);
  }

  async getSubmissions(netId: string) {
    return this.db.getSubmissions(netId);
  }

  async getAssignmentIdsAndDueDates() {
    return await this.canvas.getAssignmentIdsAndDueDates();
  }

  async calculateScoreAfterGraceDays(
    netId: string,
    assignment: Assignment,
    score: number,
    rubric: object
  ): Promise<{ score: number; graceDaysUsed: number; graceDayAdjustment: number; rubric: object }> {
    let graceDayAdjustment = 0;
    if (!this.submissionsEnabled) {
      return { score: 0, graceDaysUsed: 0, graceDayAdjustment, rubric: { comments: 'Submissions are disabled' } };
    }

    // Get today's date and due date, calculate days past due date
    const today = DateTime.now().setZone('America/Denver').startOf('day');
    const dueDate = DateTime.fromISO(assignment.due_at, { zone: 'America/Denver' }).startOf('day');
    let daysPastDueDate = 0;

    // If submission and due date are the same day, no need to calculate
    if (today.toISODate() === dueDate.toISODate()) {
      daysPastDueDate = 0;
    } else {
      let currentDate = dueDate;

      if (today > dueDate) {
        // Calculate late days
        while (currentDate < today) {
          currentDate = currentDate.plus({ days: 1 });
          if (currentDate.weekday !== 7) {
            // Exclude Sundays
            daysPastDueDate++;
          }
        }
      } else {
        // Calculate early days
        while (currentDate > today) {
          currentDate = currentDate.minus({ days: 1 });
          if (currentDate.weekday !== 7) {
            // Exclude Sundays
            daysPastDueDate--;
          }
        }
      }
    }
    // Get grace days remaining
    const graceDaysRemaining = await this.db.getGraceDays(netId);

    // Handle prior grace days for resubmissions
    const mostRecentSubmission = await this.db.getMostRecentSubmissionForDeliverable(netId, assignment.phase);
    const graceDaysUsedForDeliverable = mostRecentSubmission ? mostRecentSubmission.graceDaysUsed : 0;
    const graceDaysAvailable = graceDaysRemaining + graceDaysUsedForDeliverable;

    // If days late exceeds remaining grace days, return 0 score
    if (daysPastDueDate > graceDaysAvailable) {
      rubric = { ...rubric, comments: 'Late submission, insufficient grace days remaining' };
      return { score: 0, graceDaysUsed: 0, graceDayAdjustment, rubric };
    }

    let graceDaysUsed = 0;

    // Handle late submissions
    if (daysPastDueDate > 0) {
      graceDaysUsed = daysPastDueDate;
      graceDayAdjustment = graceDaysAvailable - daysPastDueDate;
      rubric = { ...rubric, comments: `${(rubric as { comments: string }).comments} Late submission, ${graceDaysUsed} grace days used` };
    }

    // Handle early submissions (extra credit)
    else if (daysPastDueDate < 0 && (score === 100 || (assignment.phase === 11 && score === 80))) {
      if (mostRecentSubmission && (mostRecentSubmission.score === 100 || (assignment.phase === 11 && mostRecentSubmission.score === 80))) {
        rubric = { ...rubric, comments: 'Early submission, no grace days added.' };
        return { score, graceDaysUsed, graceDayAdjustment, rubric };
      }
      const daysEarly = Math.min(2, Math.abs(daysPastDueDate)); // Cap early bonus to 2 days
      graceDayAdjustment = graceDaysAvailable + daysEarly;
      rubric = { ...rubric, comments: `Early submission, ${daysEarly} grace days added` };
    }

    // Attach grace days used to rubric
    rubric = { ...rubric, graceDaysUsed };

    return { score, graceDaysUsed, graceDayAdjustment, rubric };
  }
}
