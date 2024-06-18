import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { User } from '../../model/domain/User';
import { UserInfo } from '../userInfo/UserInfo';
import { AdminPresenter, AdminView } from '../../presenter/AdminPresenter';
import { Submission } from '../../model/domain/Submission';
import { Submissions } from '../submissions/Submissions';
import './Admin.css';

interface Props {
  setUser: (user: User) => void;
}

export function Admin(props: Props) {
  const [netId, setNetId] = useState<string>('');
  const [student, setStudent] = useState<User | null>();
  const [submissions, setSubmissions] = useState<Submission[] | null>();

  const listener: AdminView = {
    setStudent,
    setSubmissions,
  };

  const [presenter] = useState(() => new AdminPresenter(listener));

  const handleNetIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNetId(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    presenter.getStudentInfo(netId);
  };

  return (
    <div className="admin">
      <Form className="form" onSubmit={handleSubmit}>
        <Form.Group className="text-center" controlId="netId">
          <Form.Label>Net ID</Form.Label>
          <Form.Control type="text" placeholder="Enter student net ID" value={netId} onChange={handleNetIdChange} />
        </Form.Group>
        <div className="text-center">
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </div>
      </Form>
      {student && <UserInfo user={student} isAdminPage={true} setUser={props.setUser} />}
      {submissions && <Submissions submissions={submissions} isAdminPage={true} />}
    </div>
  );
}
