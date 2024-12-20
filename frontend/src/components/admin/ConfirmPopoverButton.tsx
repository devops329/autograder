import { useState } from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

interface Props {
  onConfirm: () => Promise<void> | void;
  label: string;
  variant?: string;
}

export function ConfirmPopoverButton(props: Props) {
  const [showPopover, setShowPopover] = useState(false);
  const [actionPerformed, setActionPerformed] = useState(false);

  const handleConfirm = async () => {
    await props.onConfirm();
    setShowPopover(false);
    setActionPerformed(true);

    // Reset the button text after 3 seconds
    setTimeout(() => {
      setActionPerformed(false);
    }, 3000);
  };

  const handleCancel = () => {
    setShowPopover(false);
  };

  const popover = (
    <Popover id="popover-basic">
      <Popover.Body>
        <p style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1rem' }}>Are you sure?</p>
        <Button variant="danger" onClick={handleConfirm}>
          Yes
        </Button>{' '}
        <Button variant="secondary" onClick={handleCancel}>
          No
        </Button>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger trigger="click" placement="right" show={showPopover} onToggle={() => setShowPopover((prev) => !prev)} overlay={popover} rootClose>
      <Button variant={props.variant ?? 'danger'} onClick={() => !actionPerformed && setShowPopover(true)} disabled={actionPerformed}>
        {actionPerformed ? 'Done!' : props.label}
      </Button>
    </OverlayTrigger>
  );
}
