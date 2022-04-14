import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'

export default function FilePreviewModal({
  currentFile,
  setCurrentFile,
}:{
  currentFile: string,
  setCurrentFile: (file: string) => void,
}) {
  const handleClose = () => {
    setCurrentFile('')
  }

  const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: {
      xs: '100%',
      sm: '100%',
      md: '80%',
      lg: '60%',
    },
    height: {
      xs: '100%',
      sm: '100%',
      md: '80%',
      lg: '60%',
    },
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  }
  return (
    <Modal
      open={!!currentFile}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        width: '100wh',
        height: '100vh',
      }}
    >
      <Box sx={style}>

        <iframe
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          src={`/pic?file=${currentFile}`}
          title="file"
        />
      </Box>

    </Modal>
  )
}
