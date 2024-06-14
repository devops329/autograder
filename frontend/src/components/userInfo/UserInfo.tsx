import { useState } from 'react';
import { User } from '../../model/domain/User';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { UserInfoPresenter } from '../../presenter/UserInfoPresenter';
import './UserInfo.css';

interface Props {
  user: User;
  setUser: (user: User) => void;
  isAdminPage?: boolean;
}

export function UserInfo(props: Props) {
  const [copied, setCopied] = useState(false);
  const [website, setWebsite] = useState(props.user.website);
  const [github, setGithub] = useState(props.user.github);
  const [updated, setUpdated] = useState(false);

  const presenter = new UserInfoPresenter({ setUpdated, setUser: props.setUser });

  function copy() {
    navigator.clipboard.writeText(props.user.apiKey);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  }

  return (
    <>
      {!props.isAdminPage && <h1>My Info</h1>}
      <h3>Name: {props.user.name}</h3>
      <h3>NetID: {props.user.netId}</h3>
      <InputGroup className="mb-3">
        <h3>Website:</h3> <InputGroup.Text id="basic-addon1">https://</InputGroup.Text>
        <Form.Control
          value={website}
          onChange={(event) => {
            setUpdated(false);
            setWebsite(event.target.value);
          }}
          placeholder={website === '' ? 'pizza.mysite.click' : website}
          aria-label="Website"
          aria-describedby="basic-addon1"
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <h3>Github Username: </h3>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-copy copy" viewBox="0 0 16 16" onClick={copy}>
            <path
              fillRule="evenodd"
              d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
            />
          </svg>
        )}
      </h3>
      <Button
        variant={updated ? 'success' : 'primary'}
        onClick={() => {
          presenter.updateUserInfo(website, github);
        }}>
        {updated ? 'Updated!' : 'Update'}
      </Button>
    </>
  );
}
