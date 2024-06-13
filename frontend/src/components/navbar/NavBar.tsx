import { useState } from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import {
	AuthenticatePresenter,
	AuthenticateView,
} from '../../presenter/AuthenticatePresenter';
import { User } from '../../model/domain/User';
import { Submission } from '../../model/domain/Submission';

interface Props {
	setLoggedInUser: (user: User) => void;
	setSubmissions: (submissions: Submission[]) => void;
	loggedInUser: User | null;
}

export function NavBar(props: Props) {
	const listener: AuthenticateView = {
		setLoggedInUser: props.setLoggedInUser,
		setSubmissions: props.setSubmissions,
	};
	const [presenter] = useState(new AuthenticatePresenter(listener));
	return (
		<Navbar expand="lg" className="bg-body-tertiary" fixed="top">
			<Container>
				<Navbar.Brand href="/grader">CS329 Autograder</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto">
						<Nav.Link href="/grader">Autograder</Nav.Link>
						<Nav.Link href="/info">My Info</Nav.Link>
						<Nav.Link href="/submissions">
							Submission History
						</Nav.Link>
						{props.loggedInUser?.isAdmin && (
							<Nav.Link href="/admin">Admin</Nav.Link>
						)}
					</Nav>
					{props.loggedInUser ? (
						<Button
							variant="outline-danger"
							onClick={() => presenter.logout()}>
							Logout
						</Button>
					) : (
						<Button onClick={() => presenter.login()}>Login</Button>
					)}
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}
