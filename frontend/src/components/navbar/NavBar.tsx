import { useState } from 'react';
import { Button, Container, Form, InputGroup, Nav, Navbar } from 'react-bootstrap';
import { AuthenticatePresenter, AuthenticateView } from '../../presenter/AuthenticatePresenter';
import { User } from '../../model/domain/User';
import { Submission } from '../../model/domain/Submission';

interface Props {
  setUser: (user: User) => void;
  setSubmissions: (submissions: Submission[]) => void;
  user: User | null;
  impersonating: boolean;
  setImpersonating: (impersonating: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  setErrorMessage: (errorMessage: string | null) => void;
}

export function NavBar(props: Props) {
  const [impersonateSearchString, setImpersonateSearchString] = useState(props.impersonating ? props.user?.name : '');
  const listener: AuthenticateView = {
    setUser: props.setUser,
    setSubmissions: props.setSubmissions,
    setErrorMessage: props.setErrorMessage,
    setImpersonateSearchString: setImpersonateSearchString,
  };
  const [presenter] = useState(new AuthenticatePresenter(listener));
  return (
    <Navbar data-bs-theme="dark" expand="lg" className="bg-body-tertiary  align-items-center" fixed="top">
      <Container>
        <Navbar.Brand href="/grader">CS329 AutoGrader</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/grader">AutoGrader</Nav.Link>
            <Nav.Link href="/profile">My Info</Nav.Link>
            <Nav.Link href="/submissions">Submission History</Nav.Link>
            {props.isAdmin && <Nav.Link href="/stats">Stats</Nav.Link>}
          </Nav>
          {props.user ? (
            <>
              {props.isAdmin && (
                <InputGroup style={{ width: '12rem', margin: '1rem 1rem 1rem 0' }}>
                  <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
                  <Form.Control
                    value={impersonateSearchString}
                    onChange={(event) => {
                      setImpersonateSearchString(event.target.value);
                    }}
                    placeholder="student"
                    aria-label="Student"
                    aria-describedby="basic-addon1"
                  />
                  {props.impersonating ? (
                    <Button variant="success" className="m-0" onClick={() => presenter.stopImpersonating()}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-person-check-fill"
                        viewBox="0 0 16 16">
                        <path
                          fillRule="evenodd"
                          d="M15.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L12.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"
                        />
                        <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                      </svg>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline-primary" className="m-0" onClick={() => presenter.impersonate(impersonateSearchString!)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-person"
                          viewBox="0 0 16 16">
                          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                        </svg>
                      </Button>
                    </>
                  )}
                </InputGroup>
              )}
              <Button variant="outline-danger" onClick={() => presenter.logOut()}>
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => presenter.logIn()}>Login</Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
