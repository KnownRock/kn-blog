import { useContext, useMemo } from 'react'
import {
  Box,
  FormControl,
  FormControlLabel, InputLabel, MenuItem, OutlinedInput, Radio, RadioGroup, Select, TextField,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import pathUtils from 'path'
import { getFileAsDataUrl } from '../utils/fs'
import InfoContext from '../contexts/InfoContext'
import FolderSelector from '../views/Files/FolderSelector'
import { uploadFileAsDataUrl, uploadFileAsDataUrlWithFileName } from '../utils/file-tools'

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
  function getFileAsDataUrlWithFileName(): Promise<{
    fileName: string,
    dataUrl: string,
  }> {
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
        if (type === 'upload') {
          resolve(uploadFileAsDataUrlWithFileName())
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
              resolve({
                fileName: pathUtils.basename(newName),
                dataUrl: parDataUrl,
              })
            }).catch((e) => {
              reject(e)
            })
          })
        }
      })
    })
  }

  return { getFileAsDataUrlWithFileName }
}

type FileNameAndType = {
  fileName: string,
  fileType: 'image' | 'file',
  displayName?: string,
}

export function useSettingFileTypeAndName() {
  const { info } = useContext(InfoContext)
  const { t } = useTranslation()

  async function settingFileTypeAndName({
    fileName,
    fileType,
    displayName,
  }:FileNameAndType): Promise<FileNameAndType> {
    let newFileName = fileName
    let newFileType = fileType
    let newDisplayName = displayName || fileName

    return info({
      title: t('Setting file type and name'),
      component: (
        <Box>
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
            defaultValue={newFileType}
            onChange={(e) => {
              newFileType = e.target.value as 'image' | 'file'
            }}
          >
            <FormControlLabel value="image" control={<Radio />} label={t('image') as string} />
            <FormControlLabel value="file" control={<Radio />} label={t('file') as string} />
          </RadioGroup>
          <TextField
            fullWidth
            variant="standard"
            label={t('File name') as string}
            defaultValue={newFileName}
            onChange={(e) => {
              newFileName = e.target.value
            }}
          />
          <TextField
            fullWidth
            variant="standard"
            label={t('Display file name') as string}
            defaultValue={newDisplayName}
            onChange={(e) => {
              newDisplayName = e.target.value
            }}
          />
        </Box>
      ),
    }).then(() => ({
      fileName: newFileName,
      fileType: newFileType,
      displayName: newDisplayName,
    }))
  }

  return { settingFileTypeAndName }
}
const languages = [
  'javascript',
  'typescript',
  'css',
  'html',
  'json',
  'markdown',
  'yaml',
  'xml',
  'bash',
  'python',
  'ruby',
  'php',
  'go',
  'rust',
  'java',
  'c',
  'c++',
  'c#',
  'scala',
]
export function useSettingCodeLanguage() {
  const { info } = useContext(InfoContext)
  const { t } = useTranslation()

  async function settingCodeLanguage({
    language,
  }:{ language:string }): Promise<{
      language:string,
    }> {
    let newLanguage = language

    return info({
      title: t('Setting code language'),
      component: (
        <Box>
          <FormControl sx={{ m: 1, width: '100%' }}>
            <InputLabel id="demo-multiple-name-label">{t('Programming language')}</InputLabel>
            <Select
              fullWidth
              variant="standard"
              labelId="demo-multiple-name-label"
              id="demo-multiple-name"
              defaultValue={newLanguage}
              onChange={(e) => {
                newLanguage = e.target.value as string
              }}
            >
              {languages.map((lang) => (
                <MenuItem
                  key={lang}
                  value={lang}
                >
                  {lang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      ),
    }).then(() => ({
      language: newLanguage,
    }))
  }

  return { settingCodeLanguage }
}
