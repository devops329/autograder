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
      console.error('Student not found');
    }
    return data[0];
  }

  async updateGrade(assignmentId: number, studentId: number, score: number): Promise<void> {
    const url = config.canvas.base_url + '/assignments/' + assignmentId + '/submissions/' + studentId;
    console.log(url);
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

  async getAssignmentIds(): Promise<{
    [key: number]: number;
  }> {
    const url = config.canvas.base_url + '/assignments';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.canvas.token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log(data.length);
    const assignmentIds: { [key: number]: number } = {};
    data.forEach((assignment: any) => {
      const name = assignment.name;
      console.log(name);
      const regex = /Deliverable (\d+)/;
      const match = name.match(regex);
      if (match) {
        const deliverableNumber = parseInt(match[1]);
        console.log(deliverableNumber);
        assignmentIds[deliverableNumber] = assignment.id;
      }
    });
    console.log(assignmentIds);
    return assignmentIds;
  }
}
