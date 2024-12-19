import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { AdminPresenter, AdminView } from '../../presenter/AdminPresenter';

export function Admin() {
  const [semesterOver, setSemesterOver] = useState<boolean>(false);
  const listener: AdminView = {
    setSemesterOver: setSemesterOver,
  };
  const [navBarPresenter] = useState(new AdminPresenter(listener));
  return (
    <>
      <h1>Admin</h1>
      <div>
        <Button variant={semesterOver ? 'success' : 'danger'} onClick={() => navBarPresenter.toggleSemesterOver()}>
          {semesterOver ? 'Enable Submissions' : 'Disable Submissions'}
        </Button>
      </div>
    </>
  );
}
