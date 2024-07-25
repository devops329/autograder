import Button from 'react-bootstrap/Button';
import { Dropdown, DropdownButton, Spinner, Table } from 'react-bootstrap';
import { useState } from 'react';
import { GradePresenter, GradeView } from '../../presenter/GradePresenter';
import { Submission } from '../../model/domain/Submission';
import { User } from '../../model/domain/User';

interface Props {
  user: User;
  setSubmissions: (submissions: Submission[]) => void;
  impersonating: boolean;
}

export function Grader(props: Props) {
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [grading, setGrading] = useState<boolean>(false);
  const [gradeMessage, setGradeMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rubric, setRubric] = useState<object | null>(null);

  const listener: GradeView = {
    setGradeMessage,
    setError,
    setSubmissions: props.setSubmissions,
    impersonating: props.impersonating,
    rubric,
    setRubric,
  };
  const [presenter] = useState(new GradePresenter(listener));

  async function doGrade(assignment: number) {
    setGrading(true);
    await presenter.doGrade(props.user.netId, assignment);
    setGrading(false);
  }

  function clearDisplay() {
    setGradeMessage(null);
    setError(null);
    setRubric(null);
  }

  function gradingMessage(assignment: number) {
    switch (assignment) {
      case 1:
      case 10:
      case 11:
        return '';
      default:
        return 'Triggering workflow. This may take several minutes to complete.';
    }
  }

  // Replace with getAssignments() from the backend
  const assignmentPhases: number[] = presenter.assignmentPhases;
  return (
    <>
      <DropdownButton id="dropdown-basic-button" variant="secondary" title={selectedAssignment ? `Deliverable ${selectedAssignment}` : 'Select Assignment'}>
        {assignmentPhases.map((assigmentPhase) => (
          <Dropdown.Item
            key={assigmentPhase}
            as="button"
            onClick={() => {
              clearDisplay();
              setSelectedAssignment(assigmentPhase);
            }}>
            {`Deliverable ${assigmentPhase}`}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      {selectedAssignment && (
        <Button
          onClick={() => {
            clearDisplay();
            doGrade(selectedAssignment);
          }}>
          {selectedAssignment === 10 ? "I'm ready for some chaos!" : selectedAssignment === 11 ? 'Find me a partner' : 'Grade'}
        </Button>
      )}
      {grading && (
        <>
          <p>{gradingMessage(selectedAssignment!)}</p>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </>
      )}
      {gradeMessage && <h3>{gradeMessage}</h3>}
      {rubric && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Category</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(rubric).map(([category, points]) => (
              <tr key={category}>
                <td>{category}</td>
                <td>{points}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {error && <p>Error: {error}</p>}
    </>
  );
}
