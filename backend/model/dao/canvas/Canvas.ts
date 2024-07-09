import { config } from '../../../config';
import logger from '../../../logger';

export class Canvas {
  async getStudentId(netid: string): Promise<number> {
    const data = await this.getStudentInfo(netid);
    const id = data.id;
    return id;
  }

  async getStudentInfo(netId: string): Promise<any> {
    const url = config.canvas.base_url + '/users?search_term=' + netId;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.canvas.token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.length === 0) {
      logger.log('error', 'student_not_found', { netId });
    }
    return data[0];
  }

  async updateGrade(assignmentId: number, studentId: number, score: number): Promise<void> {
    const url = config.canvas.base_url + '/assignments/' + assignmentId + '/submissions/' + studentId;
    const data = {
      submission: {
        posted_grade: score,
      },
    };
    logger.log('info', 'update_grade', { studentId, score });
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.canvas.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const message = await response.json();
      logger.log('error', 'update_grade_failed', { message: message });
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
      logger.log('error', 'missing_assignments', { assignmentIds });
    }
    return assignmentIds;
  }
}
