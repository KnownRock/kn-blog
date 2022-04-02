/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { useNavigate } from 'react-router-dom'
import { Button, SxProps, Theme } from '@mui/material'

// function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
//   event.preventDefault()
//   console.info('You clicked a breadcrumb.')
// }

export default function CollapsedBreadcrumbs({ path }: { path: string }) {
  const navigate = useNavigate()

  function getHandleClick(p:string) {
    return () => {
      navigate(p)
    }
  }

  const paths = path.split('/')
  const restPaths = paths.filter((p) => p !== '')
  const breadcrumbs = ['root'].concat(restPaths)

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
                onClick={getHandleClick(path.split('/').slice(0, index + 1).join('/'))}
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
