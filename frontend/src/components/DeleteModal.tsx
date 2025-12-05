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
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: 24,
        width: 400,
      }}>
        <div className="space-y-2 p-2">
          <div className="p-4 space-y-2 text-center">
            <h2 className="text-xl font-bold tracking-tight">
              {title}
            </h2>

            <p className="text-gray-500">
              {description}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div aria-hidden="true" className="border-t dark:border-gray-700 px-2"></div>

          <div className="px-6 py-2">
            <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
              <button onClick={onCancel}
                className="inline-flex items-center justify-center py-1 gap-1 font-medium rounded-lg border transition-colors outline-none focus:ring-offset-2 focus:ring-2 focus:ring-inset dark:focus:ring-offset-0 min-h-[2.25rem] px-4 text-sm text-gray-800 bg-white border-gray-300 hover:bg-gray-50 focus:ring-primary-600 focus:text-primary-600 focus:bg-primary-50 focus:border-primary-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200 dark:focus:text-primary-400 dark:focus:border-primary-400 dark:focus:bg-gray-800">
                <span className="flex items-center gap-1">
                  <span className="">
                    {cancelButtonText}
                  </span>
                </span>
              </button>

              <button onClick={onConfirm}
                className="inline-flex items-center justify-center py-1 gap-1 font-medium rounded-lg border transition-colors outline-none focus:ring-offset-2 focus:ring-2 focus:ring-inset dark:focus:ring-offset-0 min-h-[2.25rem] px-4 text-sm text-white shadow focus:ring-white border-transparent bg-red-600 hover:bg-red-500 focus:bg-red-700 focus:ring-offset-red-700">

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