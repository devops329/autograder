import { config } from '../../../config';

export class Canvas {
  async getStudentId(netid: string): Promise<number> {
    const url = config.canvas.base_url + '/users?search_term=' + netid;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.canvas.token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.length === 0) {
      throw new Error('Student not found');
    }
    const id = data[0].id;
    return id;
  }

  async updateGrade(assignmentId: number, studentId: number, score: number): Promise<void> {
    const url = config.canvas.base_url + '/assignments/' + assignmentId + '/submissions/' + studentId;
    const data = {
      submission: {
        posted_grade: score,
      },
    };
    console.log('Updating grade for student', studentId, 'to', score);
    await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.canvas.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to update grade');
      }
    });
  }
}
