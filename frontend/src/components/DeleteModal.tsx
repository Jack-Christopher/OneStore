import { Box } from "@mui/material";

import { Modal } from "@mui/material";

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  cancelButtonText: string;
  confirmButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ open, onClose, title, description, cancelButtonText, confirmButtonText, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box sx={{
        backgroundColor: 'var(--card)',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: 24,
        width: 400,
        color: 'var(--card-foreground)',
      }}>
        <div className="space-y-2 p-2">
          <div className="p-4 space-y-2 text-center">
            <h2 className="text-xl font-bold tracking-tight text-card-foreground">
              {title}
            </h2>

            <p className="text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div aria-hidden="true" className="border-t border-border px-2"></div>

          <div className="px-6 py-2">
            <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
              <button onClick={onCancel}
                className="inline-flex items-center justify-center py-1 gap-1 font-medium rounded-lg border transition-colors outline-none focus:ring-offset-2 focus:ring-2 focus:ring-inset min-h-[2.25rem] px-4 text-sm text-card-foreground bg-card border-border hover:bg-muted focus:ring-primary focus:text-primary-foreground focus:bg-primary focus:border-primary">
                <span className="flex items-center gap-1">
                  <span className="">
                    {cancelButtonText}
                  </span>
                </span>
              </button>

              <button onClick={onConfirm}
                className="inline-flex items-center justify-center py-1 gap-1 font-medium rounded-lg border transition-colors outline-none focus:ring-offset-2 focus:ring-2 focus:ring-inset min-h-[2.25rem] px-4 text-sm text-accent-foreground shadow focus:ring-accent border-transparent bg-accent hover:opacity-90 focus:bg-accent focus:ring-offset-accent">

                <span className="flex items-center gap-1">
                  <span className="">
                    {confirmButtonText}
                  </span>
                </span>

              </button>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  )
}