/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { useNavigate } from 'react-router-dom'
import { Button, SxProps, Theme } from '@mui/material'
import { useTranslation } from 'react-i18next'

// function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
//   event.preventDefault()
//   console.info('You clicked a breadcrumb.')
// }

export default function CollapsedBreadcrumbs({ path }: { path: string }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  function getHandleClick(p:string) {
    // console.log(p)
    // console.log(path.split('/'))
    return () => {
      navigate(p)
    }
  }

  const paths = path.split('/')
  const restPaths = paths.filter((p) => p !== '')
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
                  onClick={getHandleClick('/files/')}
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
