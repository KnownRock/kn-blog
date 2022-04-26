import { useParams } from 'react-router-dom'

const host = import.meta.env.VITE_APP_S3_ENDPOINT
const protocol = import.meta.env.VITE_APP_S3_USE_SSL === 'true' ? 'https' : 'http'
const url = `${protocol}://${host}:${import.meta.env.VITE_APP_S3_PORT}`

export default function Apps() {
  const { '*': path, id } = useParams()

  const regularPath = path ?? ''

  return (
    <div style={{
      border: '0',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
    }}
    >
      <div>{`${id}${path}`}</div>
      <iframe
        style={{
          border: '0',
          height: '100vh',
          width: '100%',
        }}
        src={`${url}/apps/${id}/${regularPath}index.html`}
        title={id}
      />
    </div>

  )
}
