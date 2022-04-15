import { ContentBlock } from 'draft-js'
import MediaComponent from './CustomBlockComponent'

export default function customBlockRenderer(contentBlock: ContentBlock) {
  const type = contentBlock.getType()
  if (type === 'atomic') {
    return {
      component: MediaComponent,
      editable: false,
      props: {
        p: '1',
      },
    }
  }
  return undefined
}
