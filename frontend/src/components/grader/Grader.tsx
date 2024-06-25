import Button from 'react-bootstrap/Button';
import { Dropdown, DropdownButton, Spinner } from 'react-bootstrap';
import { useState } from 'react';
import { GradePresenter, GradeView } from '../../presenter/GradePresenter';
import { Submission } from '../../model/domain/Submission';
import { User } from '../../model/domain/User';

interface Props {
  user: User;
  setSubmissions: (submissions: Submission[]) => void;
}

export function Grader(props: Props) {
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [grading, setGrading] = useState<boolean>(false);
  const [grade, setGrade] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const listener: GradeView = {
    setGrade,
    setError,
    setSubmissions: props.setSubmissions,
  };
  const [presenter] = useState(new GradePresenter(listener));

  async function doGrade(assignment: number) {
    setGrading(true);
    await presenter.doGrade(props.user.netId, assignment);
    setGrading(false);
  }

  function clearDisplay() {
    setGrade(null);
    setError(null);
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
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
      {grade && (
        <p>
          {selectedAssignment! >= 10 ? '' : 'Score: '} {grade}
        </p>
      )}
      {error && <p>Error: {error}</p>}
    </>
  );
}
