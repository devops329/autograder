import { config } from '../../../config';
import logger from '../../../logger';

export class Canvas {
  async getStudentId(netid: string): Promise<number> {
    const data = await this.getStudentInfo(netid);
    if (!data) {
      throw new Error('Student not found');
    }
    const id = data.id;
    return id;
  }

  async getStudentInfo(netId: string): Promise<any> {
    const url = config.canvas.base_url + '/users?search_term=' + netId;
    logger.log('info', { type: 'get_student_info' }, { url });
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.canvas.token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!data[0]?.id) {
      throw new Error('Student not found');
    }
    return data[0];
  }

  async updateGrade(netId: string, assignmentId: number, studentId: number, score: number, gradeAttemptId: string): Promise<string | void> {
    const url = config.canvas.base_url + '/assignments/' + assignmentId + '/submissions/' + studentId;

    // Fetch the current grade
    const currentGradeResponse = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.canvas.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!currentGradeResponse.ok) {
      const message = await currentGradeResponse.json();
      logger.log('error', { type: 'fetch_grade_failed', service: 'canvas', gradeAttemptId: gradeAttemptId }, { message });
      return 'Failed to update grade';
    }

    const currentGradeData = await currentGradeResponse.json();
    const currentScore = currentGradeData.score;

    // Compare the current grade with the new grade
    if (score > currentScore) {
      const data = {
        submission: {
          posted_grade: score,
        },
      };
      logger.log('info', { type: 'update_grade', service: 'canvas', gradeAttemptId: gradeAttemptId }, { studentId, score, netId, assignmentId });

      const updateResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${config.canvas.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!updateResponse.ok) {
        const message = await updateResponse.json();
        logger.log('error', { type: 'update_grade_failed', service: 'canvas' }, { message });
        return 'Failed to update grade';
      }
    } else {
      return 'Did not update grade, score is not higher than current grade.';
    }
  }

  async getAssignmentIds(): Promise<{ [key: number]: number }> {
    let nextPageUrl: string | null = config.canvas.base_url + '/assignments';
    const assignmentIds: { [key: number]: number } = {};

    while (nextPageUrl) {
      const response: Response = await fetch(nextPageUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.canvas.token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      // Process assignments
      data.forEach((assignment: any) => {
        const name = assignment.name;
        const regex = /Deliverable (\d+)/;
        const match = name.match(regex);
        if (match) {
          const deliverableNumber = parseInt(match[1]);
          assignmentIds[deliverableNumber] = assignment.id;
        }
      });

      // Parse Link header for next page URL
      const linkHeader = response.headers.get('Link');
      nextPageUrl = null; // Reset nextPageUrl
      if (linkHeader) {
        const links = linkHeader.split(',');
        const nextLink = links.find((link) => link.includes('rel="next"'));
        if (nextLink) {
          const match = nextLink.match(/<([^>]+)>;/);
          if (match) {
            nextPageUrl = match[1];
          }
        }
      }
    }
    if (Object.keys(assignmentIds).length < 12) {
      logger.log('error', { type: 'missing_assignments', service: 'canvas' }, { assignmentIds });
    }
    return assignmentIds;
  }
}
