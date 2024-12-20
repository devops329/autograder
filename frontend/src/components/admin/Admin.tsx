import { useEffect, useState } from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import { AdminPresenter, AdminView } from '../../presenter/AdminPresenter';
import { User } from '../../model/domain/User';

export function Admin() {
  const [submissionsEnabled, setSubmissionsEnabled] = useState<boolean>(
    localStorage.getItem('submissionsEnabled') ? localStorage.getItem('submissionsEnabled') === 'true' : false
  );
  const [admins, setAdmins] = useState<User[]>([]);
  const listener: AdminView = {
    setSubmissionsEnabled,
    setAdmins,
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
      <div>
        <Button variant={admins.length ? 'secondary' : 'primary'} onClick={() => presenter.toggleAdminList(admins)}>
          {admins.length ? 'Hide List' : 'List Admins'}
        </Button>
        {admins.length > 0 && (
          <ListGroup>
            {admins.map((admin) => (
              <ListGroup.Item key={admin.netId}>{admin.name}</ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>
    </>
  );
}
