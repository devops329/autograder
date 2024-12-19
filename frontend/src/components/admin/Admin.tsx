import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { AdminPresenter, AdminView } from '../../presenter/AdminPresenter';

export function Admin() {
  const [submissionsEnabled, setSubmissionsEnabled] = useState<boolean>(
    localStorage.getItem('submissionsEnabled') ? localStorage.getItem('submissionsEnabled') === 'true' : false
  );
  const listener: AdminView = {
    setSubmissionsEnabled,
  };
  const [presenter] = useState(new AdminPresenter(listener));
  useEffect(() => {
    presenter.getSubmissionsEnabled();
  }, []);
  return (
    <>
      <h1>Admin</h1>
      <div>
        <Button variant={submissionsEnabled ? 'danger' : 'success'} onClick={() => presenter.toggleSubmissionsEnabled()}>
          {submissionsEnabled ? 'Disable Submissions' : 'Enable Submissions'}
        </Button>
      </div>
    </>
  );
}
