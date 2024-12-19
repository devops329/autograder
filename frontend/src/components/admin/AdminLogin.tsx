import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { AdminLoginPresenter } from '../../presenter/AdminLoginPresenter';

interface Props {
  setErrorMessage: (errorMessage: string | null) => void;
}

export function AdminLogin(props: Props) {
  const [netId, setNetId] = useState('');
  const [password, setPassword] = useState('');

  const presenter = new AdminLoginPresenter({
    setErrorMessage: props.setErrorMessage,
    setNetId: setNetId,
    setPassword: setPassword,
  });

  return (
    <>
      <div className="text-center">
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
          <Form.Control
            value={netId}
            onChange={(event) => {
              setNetId(event.target.value);
            }}
            placeholder="netId"
            aria-label="netId"
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

        <Button variant="primary" type="submit" onClick={() => presenter.login(netId, password)}>
          Login
        </Button>
      </div>
    </>
  );
}
