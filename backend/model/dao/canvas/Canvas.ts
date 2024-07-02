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
    const data = {
      submission: {
        posted_grade: score,
      },
    };
    logger.log('info', 'update_grade', { studentId, score });
    await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.canvas.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => {
      if (!response.ok) {
        console.error('Failed to update grade');
      }
    });
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
    const assignmentIds: { [key: number]: number } = {};
    data.forEach((assignment: any) => {
      const name = assignment.name;
      const regex = /Deliverable (\d+)/;
      const match = name.match(regex);
      if (match) {
        const deliverableNumber = parseInt(match[1]);
        assignmentIds[deliverableNumber] = assignment.id;
      }
    });
    return assignmentIds;
  }
}
