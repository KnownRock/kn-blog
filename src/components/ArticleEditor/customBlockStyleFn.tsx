import { ContentBlock } from 'draft-js'

const customBlockStyleFn = (contentBlock: ContentBlock):string => {
  const type = contentBlock.getType()
  if (type === 'blockquote') {
    return 'knBlogBlockquote'
  }
  if (type === 'unstyled') {
    return 'knBlogUnstyled'
  }
  if (type === 'code-block') {
    return 'knBlogCodeBlock'
  }
  return type
}

export default customBlockStyleFn
