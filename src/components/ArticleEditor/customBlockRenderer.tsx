import { ContentBlock } from 'draft-js'
import CustomBlockComponent from './CustomBlockComponent'

export default function customBlockRenderer(contentBlock: ContentBlock) {
  const type = contentBlock.getType()
  if (type === 'atomic') {
    return {
      component: CustomBlockComponent,
      editable: false,
    }
  }
  return undefined
}
