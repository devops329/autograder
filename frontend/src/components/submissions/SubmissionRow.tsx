import { useState } from 'react';
import { Submission } from '../../model/domain/Submission';
import './SubmissionRow.css';
import { Button, Modal, Table } from 'react-bootstrap';

interface Props {
  submission: Submission;
}

export function SubmissionRow(props: Props) {
  const [showRubric, setShowRubric] = useState(false);
  const [dateFormat, setDateFormat] = useState<'short' | 'long'>('short');
  function formatDate(date: string) {
    const dateObject = new Date(date);
    return dateFormat === 'short' ? dateObject.toLocaleDateString() : dateObject.toString();
  }
  function toggleDateFormat() {
    setDateFormat(dateFormat === 'short' ? 'long' : 'short');
  }
  function toggleRubricVisibility() {
    setShowRubric(!showRubric);
  }
  return (
    <>
      <tr key={props.submission.date}>
        <td onClick={toggleDateFormat}>{formatDate(props.submission.date)}</td>
        <td>{props.submission.phase}</td>
        <td>{props.submission.score}</td>
        <td>{props.submission.rubric ? <Button onClick={toggleRubricVisibility}>Click to view</Button> : 'N/A'}</td>
      </tr>
      {props.submission.rubric && (
        <Modal show={showRubric} onHide={toggleRubricVisibility}>
          <Modal.Header closeButton>
            <Modal.Title>Rubric Points</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(props.submission.rubric).map(([category, points]) => (
                  <tr key={category}>
                    <td>{category}</td>
                    <td>{points}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={toggleRubricVisibility}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}
