import { useContext, useMemo } from 'react'
import { FormControlLabel, Radio, RadioGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { getFileAsDataUrl } from '../utils/fs'
import InfoContext from '../contexts/InfoContext'
import FolderSelector from '../views/Files/FolderSelector'
import { uploadFileAsDataUrl } from './file-tools'

// FIXME: img load flash
export function useSelectImg() {
  const { info } = useContext(InfoContext)
  const { t } = useTranslation()

  let newName = ''
  let type = 'upload'
  const options = useMemo(
    () => (
      <>
        <FormControlLabel value="upload" control={<Radio />} label={t('Upload') as string} />
        <FormControlLabel value="file" control={<Radio />} label={t('File') as string} />
      </>
    ),
    [t],
  )
  function getImgAsDataUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      info({
        title: t('Select upload type'),
        component: (
          <RadioGroup
            sx={{
              width: '100%',
              display: 'flex',
              // flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            defaultValue={type}
            onChange={(e) => {
              // TODO: Add a url option
              type = e.target.value as 'upload' | 'url' | 'clear'
            }}
          >
            {options}
          </RadioGroup>
        ),
      }).then(() => {
        if (type === 'clear') {
          resolve('')
        } else if (type === 'upload') {
          uploadFileAsDataUrl()
            .then((dUrl) => {
              resolve(dUrl)
            })
        } else {
          info({
            title: t('Select file'),
            component: (
              <FolderSelector type="file" onSelect={(fp) => { newName = fp }} nowPath={newName} />
            ),
            noBlur: true,

            isOk: async () => true,
          }).then(() => {
            // setImgPath(newName)
            getFileAsDataUrl(newName).then((parDataUrl) => {
              resolve(parDataUrl)
            }).catch((e) => {
              reject(e)
            })
          })
        }
      })
    })
  }

  return { getImgAsDataUrl }
}

export function useSelectFile() {
  throw new Error('Not implemented')
}
