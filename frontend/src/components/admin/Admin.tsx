import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { AdminPresenter, AdminView } from '../../presenter/AdminPresenter';

export function Admin() {
  const [submissionsEnabled, setSubmissionsEnabled] = useState<boolean>(true);
  const listener: AdminView = {
    setSubmissionsEnabled,
  };
  const [navBarPresenter] = useState(new AdminPresenter(listener));
  return (
    <>
      <h1>Admin</h1>
      <div>
        <Button variant={submissionsEnabled ? 'danger' : 'success'} onClick={() => navBarPresenter.toggleSemesterOver()}>
          {submissionsEnabled ? 'Disable Submissions' : 'Enable Submissions'}
        </Button>
      </div>
    </>
  );
}
