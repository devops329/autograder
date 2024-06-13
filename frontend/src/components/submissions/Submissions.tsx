import { Submission } from '../../model/domain/Submission';
import './Submissions.css';

interface Props {
  submissions: Submission[];
  isAdminPage?: boolean;
}
export function Submissions(props: Props) {
  return (
    <>
      {!props.isAdminPage && <h1>Submission History</h1>}
      <ul>
        {props.submissions.map((submission, index) => {
          return (
            <li key={index}>
              Date: {new Date(submission.date).toDateString()} | Phase: {submission.phase} | Score: {submission.score}
            </li>
          );
        })}
      </ul>
    </>
  );
}
