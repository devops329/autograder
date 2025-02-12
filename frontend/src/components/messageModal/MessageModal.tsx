import { Button, Modal } from 'react-bootstrap';

interface Props {
  message: string | null;
  title: string | null;
  handleClose: () => void;
}
export function MessageModal(props: Props) {
  return (
    <Modal show={!!props.message} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{props.title ?? 'Error'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
