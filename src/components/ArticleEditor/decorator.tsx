import { CompositeDecorator, ContentBlock, ContentState } from 'draft-js'
import Link from './Link'

function findLinkEntities(
  block: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState,
) {
  block.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity()
      return (
        entityKey !== null
        && contentState.getEntity(entityKey).getType() === 'LINK'
      )
    },
    callback,
  )
}

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  },
])

export default decorator
