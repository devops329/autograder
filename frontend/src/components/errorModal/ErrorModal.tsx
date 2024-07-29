import { Button, Modal } from 'react-bootstrap';

interface Props {
  errorMessage: string | null;
  handleClose: () => void;
}
export function ErrorModal(props: Props) {
  return (
    <Modal show={!!props.errorMessage} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.errorMessage}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
