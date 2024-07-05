import { useState } from 'react';
import { Submission } from '../../model/domain/Submission';
import './SubmissionRow.css';
import { Button, Modal, Table } from 'react-bootstrap';

export function SubmissionRow(submission: Submission) {
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
      <tr key={submission.date}>
        <td onClick={toggleDateFormat}>{formatDate(submission.date)}</td>
        <td>{submission.phase}</td>
        <td>{submission.score}</td>
        <td>{submission.rubric ? <Button onClick={toggleRubricVisibility}>Click to view</Button> : 'N/A'}</td>
      </tr>
      {submission.rubric && (
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
                {Object.entries(submission.rubric).map(([category, points]) => (
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
