import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { AdminPresenter } from '../../presenter/AdminPresenter';

export function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const presenter = new AdminPresenter();

  return (
    <>
      <div className="text-center">
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
          <Form.Control
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
            placeholder="Username"
            aria-label="Username"
            aria-describedby="basic-addon1"
          />
        </InputGroup>

        <InputGroup className="mb-3">
          <Form.Control
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            type="password"
            placeholder="Password"
            aria-label="Password"
            aria-describedby="basic-addon2"
          />
        </InputGroup>

        <Button variant="primary" type="submit" onClick={() => presenter.login(username, password)}>
          Login
        </Button>
      </div>
    </>
  );
}
