import { Table } from 'react-bootstrap';
import { Submission } from '../../model/domain/Submission';
import './Submissions.css';
import { SubmissionRow } from './SubmissionRow';

interface Props {
  submissions: Submission[];
}
export function Submissions(props: Props) {
  return (
    <>
      {<h1>Submission History</h1>}
      <div className="submissions">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Deliverable</th>
              <th>Score</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {props.submissions.map((submission) => (
              <SubmissionRow key={submission.date} submission={submission} />
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
