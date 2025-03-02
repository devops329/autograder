import { useState } from 'react';
import { User } from '../../model/domain/User';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { UserInfoPresenter } from '../../presenter/UserInfoPresenter';
import './Profile.css';

interface Props {
  user: User;
  setUser: (user: User) => void;
  impersonating: boolean;
  isAdmin: boolean;
}

export function Profile(props: Props) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState(props.user.email);
  const [website, setWebsite] = useState(props.user.website);
  const [github, setGithub] = useState(props.user.github);
  const [graceDays, setGraceDays] = useState(props.user.graceDays);
  const [updated, setUpdated] = useState(false);

  const presenter = new UserInfoPresenter({ setUpdated, setUser: props.setUser, setWebsite });

  function copy() {
    navigator.clipboard.writeText(props.user.apiKey);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  }

  return (
    <>
      <h1>My Info</h1>
      <h3>Name: {props.user.name}</h3>
      <h3>NetID: {props.user.netId}</h3>
      <InputGroup className="m-2">
        <InputGroup.Text id="email">Email:</InputGroup.Text>
        <Form.Control
          value={email}
          onChange={(event) => {
            setUpdated(false);
            setEmail(event.target.value);
          }}
          placeholder={email === '' ? 'student@byu.edu' : email}
          aria-label="Email"
          aria-describedby="email"
        />
      </InputGroup>
      <InputGroup className="m-2">
        <InputGroup.Text id="website">Website:</InputGroup.Text>
        <InputGroup.Text>https://</InputGroup.Text>
        <Form.Control
          value={website}
          onChange={(event) => {
            setUpdated(false);
            setWebsite(event.target.value);
          }}
          placeholder={website === '' ? 'pizza.mysite.click' : website}
          aria-label="Website"
          aria-describedby="website"
        />
      </InputGroup>
      <InputGroup className="m-2">
        <InputGroup.Text id="basic-addon1">Github:</InputGroup.Text>
        <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
        <Form.Control
          value={github}
          onChange={(event) => {
            setUpdated(false);
            setGithub(event.target.value);
          }}
          placeholder={github === '' ? 'username' : github}
          aria-label="Username"
          aria-describedby="basic-addon1"
        />
      </InputGroup>
      <h3>
        API Key: {props.user.apiKey}{' '}
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-check2" viewBox="0 0 16 16">
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            className="bi bi-copy copy"
            viewBox="0 0 16 16"
            onClick={copy}>
            <path
              fillRule="evenodd"
              d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
            />
          </svg>
        )}
      </h3>
      <div className="d-flex align-items-center">
        <h3 className="me-3">Grace Days: {graceDays}</h3>
        {props.isAdmin && (
          <>
            <Button variant="primary" className="me-2" onClick={() => setGraceDays(graceDays + 1)}>
              +
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setGraceDays(Math.max(0, graceDays - 1));
              }}>
              -
            </Button>
          </>
        )}
      </div>
      <Button
        variant={updated ? 'success' : 'primary'}
        onClick={() => {
          presenter.updateUserInfo(props.user.netId, website, github, email, graceDays, props.impersonating);
        }}>
        {updated ? 'Updated!' : 'Update'}
      </Button>
    </>
  );
}
