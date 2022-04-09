import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import CloudCircleIcon from '@mui/icons-material/CloudCircle'
import ArticleIcon from '@mui/icons-material/Article'

export default function FileIcon({ type, name }:{ type: string, name:string }) {
  if (name && name.endsWith('.knb')) {
    return <ArticleIcon fontSize="large" />
  }

  switch (type) {
    case 'folder':
      return <FolderIcon fontSize="large" />
    case 'file':
      return <InsertDriveFileIcon fontSize="large" />
    case 'cloud':
      return <CloudCircleIcon fontSize="large" />
    case 'remote-folder':
      return <CloudCircleIcon fontSize="large" />
    default:
      return <InsertDriveFileIcon fontSize="large" />
  }
}
