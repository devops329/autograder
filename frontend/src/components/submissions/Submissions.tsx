import { Table } from 'react-bootstrap';
import { Submission } from '../../model/domain/Submission';
import './Submissions.css';

interface Props {
  submissions: Submission[];
  isAdminPage?: boolean;
}
export function Submissions(props: Props) {
  function formatDate(date: string) {
    return new Date(date).toString();
  }
  return (
    <>
      {!props.isAdminPage && <h1>Submission History</h1>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Deliverable</th>
            <th>Score</th>
            <th>Rubric</th>
          </tr>
        </thead>
        <tbody>
          {props.submissions.map((submission) => (
            <tr key={submission.date}>
              <td>{formatDate(submission.date)}</td>
              <td>{submission.phase}</td>
              <td>{submission.score}</td>
              <td>{submission.rubric}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
