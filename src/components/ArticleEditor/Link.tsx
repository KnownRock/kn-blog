import { ContentState } from 'draft-js'

export default function Link({
  contentState, entityKey, children,
}: {
  contentState: ContentState,
  entityKey: string,
  children: React.ReactNode,
}) {
  const { url } = contentState.getEntity(entityKey).getData()
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}
