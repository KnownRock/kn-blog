/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react'
import Breadcrumbs from '@mui/material/Breadcrumbs'

import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import FilesContextRe from '../../contexts/FilesContext'

// function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
//   event.preventDefault()
//   console.info('You clicked a breadcrumb.')
// }

export default function CollapsedBreadcrumbs({ path }: { path: string }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { onNavigate } = React.useContext(FilesContextRe)

  function getHandleClick(p:string) {
    // console.log(p)
    // console.log(path.split('/'))
    return () => {
      onNavigate(p)
    }
  }

  const paths = path.split('/')
  const restPaths = paths.filter((p) => p !== '')

  // TODO: move to a tool ts
  const breadcrumbs = [t('root')].concat(restPaths)

  // TODO: convert button to a link which has removed the default click event
  return (
    <div role="presentation">
      <Breadcrumbs maxItems={4} aria-label="breadcrumb">
        {
          breadcrumbs.map((item, index) => {
            if (index === 0) {
              return (
                <Button
                  key={item}
                  color="inherit"
                  onClick={getHandleClick('')}
                >
                  {item}
                </Button>
              )
            }

            return (
              <Button
                key={item}
                color="inherit"
                onClick={getHandleClick(path.split('/').slice(0, index).concat('').join('/'))}
              >
                {item}
              </Button>
            )
          })
        }
      </Breadcrumbs>
    </div>
  )
}
