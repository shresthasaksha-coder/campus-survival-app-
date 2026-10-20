
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function CampusDialog({
  title,
  children,
  onClose,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="campus-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if(event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="dialog-head">
        <h2 id="campus-dialog-title">{title}</h2>

        <button
          type="button"
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <div className="dialog-content">
        {children}
      </div>
    </dialog>
  );
}
