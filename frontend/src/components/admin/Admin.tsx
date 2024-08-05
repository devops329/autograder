import { Button, Form, InputGroup } from 'react-bootstrap';

export function Admin() {
  return (
    <>
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
        <Form.Control placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" />
      </InputGroup>

      <InputGroup className="mb-3">
        <Form.Control type="password" placeholder="Password" aria-label="Password" aria-describedby="basic-addon2" />
      </InputGroup>

      <Button variant="primary" type="submit">
        Login
      </Button>
    </>
  );
}
