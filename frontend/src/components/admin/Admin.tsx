import { useEffect, useState } from 'react';
import { Button, Form, InputGroup, Table } from 'react-bootstrap';
import { AdminPresenter, AdminView } from '../../presenter/AdminPresenter';
import { User } from '../../model/domain/User';
import { ConfirmPopoverButton } from './ConfirmPopoverButton';

export function Admin() {
  const [submissionsEnabled, setSubmissionsEnabled] = useState<boolean>(
    localStorage.getItem('submissionsEnabled') ? localStorage.getItem('submissionsEnabled') === 'true' : false
  );
  const [admins, setAdmins] = useState<User[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminToAdd, setAdminToAdd] = useState('');
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
      <Button variant={admins.length ? 'secondary' : 'primary'} onClick={() => presenter.toggleAdminList(admins)}>
        {admins.length ? 'Hide List' : 'List Admins'}
      </Button>
      {admins.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>NetId</th>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.netId}>
                <td>{admin.netId}</td>
                <td>{admin.name}</td>
                <td>
                  <Button className="m-0 btn-sm" variant="danger" onClick={() => presenter.removeAdmin(admin.netId)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Button variant="primary" onClick={() => setShowAddAdmin(true)}>
        Add Admin
      </Button>
      {showAddAdmin && (
        <InputGroup className="mb-3" style={{ width: '12rem', margin: '1rem 1rem 1rem 0' }}>
          <Form.Control
            value={adminToAdd}
            onChange={(event) => {
              setAdminToAdd(event.target.value);
            }}
            placeholder="NetID"
          />
          <Button
            variant="primary"
            className="m-0"
            onClick={() => {
              presenter.addAdmin(adminToAdd);
              setAdminToAdd('');
              setShowAddAdmin(false);
            }}>
            Add
          </Button>
        </InputGroup>
      )}
      <ConfirmPopoverButton label="Drop Student Data" onConfirm={presenter.dropStudentData.bind(presenter)} />
      <ConfirmPopoverButton label="Restore Data From Backup" variant="primary" onConfirm={presenter.restoreStudentData.bind(presenter)} />
    </>
  );
}
