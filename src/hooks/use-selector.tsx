import { useContext, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'react-i18next'
import pathUtils from 'path'
import mime from 'mime'
import MonacoEditor from '@monaco-editor/react'
import { getFileAsDataUrl } from '../utils/fs'
import InfoContext from '../contexts/InfoContext'
import FolderSelector from '../views/Files/FolderSelector'
import { uploadFileAsDataUrl, uploadFileAsDataUrlWithFileName } from '../utils/file-tools'

async function handleDataUrlWithFileNameFromClipboard(
  acceptType?:string,
) : Promise<DataUrlWithFileName> {
  // read from clipboard
  // debugger
  const items = await navigator.clipboard.read()
  const item = items[0]

  const isValidType = (acceptType === 'image')
    ? (type:string) => type.startsWith('image/')
    : () => true

  const fileType = item.types.find(isValidType)
  if (!fileType) throw new Error('No image found in clipboard')

  const file = await item.getType(fileType)
  if (!file) throw new Error('No image found in clipboard')

  const fileName = (`untitled.${mime.getExtension(fileType)}`)

  // eslint-disable-next-line consistent-return
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        fileName,
        dataUrl: reader.result as string,
      })
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsDataURL(file)

    setTimeout(() => reject(), 5000)
  })
}

export function useSelectImg() {
  const { info } = useContext(InfoContext)
  const { t } = useTranslation()

  let newName = ''
  let type = 'clipboard'

  const options = useMemo(
    () => (
      <>
        <FormControlLabel value="upload" control={<Radio />} label={t('Upload') as string} />
        <FormControlLabel value="file" control={<Radio />} label={t('File') as string} />
        <FormControlLabel value="clipboard" control={<Radio />} label={t('Clipboard') as string} />
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
              type = e.target.value as 'upload' | 'url' | 'clipboard'
            }}
          >
            {options}
          </RadioGroup>
        ),
      }).then(() => {
        if (type === 'clipboard') {
          handleDataUrlWithFileNameFromClipboard('image')
            .then(({ dataUrl }) => resolve(dataUrl))
            .catch((err) => reject(err))
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
  let type = 'clipboard'
  const options = useMemo(
    () => (
      <>
        <FormControlLabel value="upload" control={<Radio />} label={t('Upload') as string} />
        <FormControlLabel value="file" control={<Radio />} label={t('File') as string} />
        <FormControlLabel value="clipboard" control={<Radio />} label={t('Clipboard') as string} />
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
              type = e.target.value as 'upload' | 'url' | 'clipboard'
            }}
          >
            {options}
          </RadioGroup>
        ),
      }).then(() => {
        if (type === 'clipboard') {
          handleDataUrlWithFileNameFromClipboard().then(({ dataUrl, fileName }) => {
            resolve({
              fileName,
              dataUrl,
            })
          }).catch((err) => reject(err))
        } else if (type === 'upload') {
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
  'abap',
  'aes',
  'apex',
  'azcli',
  'bat',
  'bicep',
  'c',
  'cameligo',
  'clojure',
  'coffeescript',
  'cpp',
  'csharp',
  'csp',
  'css',
  'dart',
  'dockerfile',
  'ecl',
  'elixir',
  'flow9',
  'freemarker2',
  'freemarker2.tag-angle.interpolation-bracket',
  'freemarker2.tag-angle.interpolation-dollar',
  'freemarker2.tag-auto.interpolation-bracket',
  'freemarker2.tag-auto.interpolation-dollar',
  'freemarker2.tag-bracket.interpolation-bracket',
  'freemarker2.tag-bracket.interpolation-dollar',
  'fsharp',
  'go',
  'graphql',
  'handlebars',
  'hcl',
  'html',
  'ini',
  'java',
  'javascript',
  'json',
  'julia',
  'kotlin',
  'less',
  'lexon',
  'liquid',
  'lua',
  'm3',
  'markdown',
  'mips',
  'msdax',
  'mysql',
  'objective-c',
  'pascal',
  'pascaligo',
  'perl',
  'pgsql',
  'php',
  'pla',
  'plaintext',
  'postiats',
  'powerquery',
  'powershell',
  'proto',
  'pug',
  'python',
  'qsharp',
  'r',
  'razor',
  'redis',
  'redshift',
  'restructuredtext',
  'ruby',
  'rust',
  'sb',
  'scala',
  'scheme',
  'scss',
  'shell',
  'sol',
  'sparql',
  'sql',
  'st',
  'swift',
  'systemverilog',
  'tcl',
  'twig',
  'typescript',
  'vb',
  'verilog',
  'xml',
  'yaml',
]

function CodeSetting({
  parLanguage, parCode, type, onChange,
}:{
  parLanguage: string,
  parCode: string,
  type: 'code' | 'md-block',
  onChange: ({ language, code }:{
    language: string,
    code: string,
  }) => void,
}) {
  const [language, setLanguage] = useState(parLanguage)
  const [code, setCode] = useState(parCode)
  const { t } = useTranslation()

  return (
    <Box>
      {(type === 'code') && (
      <FormControl sx={{ m: 1, width: '100%' }}>
        <InputLabel id="demo-multiple-name-label">{t('Programming language')}</InputLabel>
        <Select
          fullWidth
          variant="standard"
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value as string)
            onChange({
              language: e.target.value as string,
              code,
            })
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
      )}
      <MonacoEditor
        height={400}
        language={language}
        value={code}
        onChange={
        (newCode) => {
          setCode(newCode ?? '')
          onChange({
            language,
            code: newCode ?? '',
          })
        }
      }
      />
    </Box>
  )
}

export function useSettingCodeLanguage() {
  const { info } = useContext(InfoContext)
  const { t } = useTranslation()

  async function settingCodeLanguage({
    language,
    code,
    type,
  }:{
    language:string,
    code:string,
    type: 'code' | 'md-block',
  }): Promise<{
      language:string,
      code:string,
    }> {
    let newLanguage = language
    let newCode = code

    return info({
      title: t('Setting code'),
      component: (
        <CodeSetting
          parLanguage={newLanguage}
          parCode={newCode}
          type={type}
          onChange={({ language: argLanguage, code: argCode }) => {
            newLanguage = argLanguage
            newCode = argCode
          }}
        />
      ),
    }).then(() => ({
      language: newLanguage,
      code: newCode,
    }))
  }

  return { settingCodeLanguage }
}

export function useSettingLinkUrl() {
  const { info } = useContext(InfoContext)
  const { t } = useTranslation()

  async function settingLinkUrl({
    url,
  }:{ url:string }): Promise<{
      url:string,
    }> {
    let newUrl = url

    return info({
      title: t('Setting link url'),
      component: (
        <Box>
          <TextField
            fullWidth
            variant="standard"
            label={t('Link url') as string}
            defaultValue={newUrl}
            onChange={(e) => {
              newUrl = e.target.value
            }}
          />
        </Box>
      ),
    }).then(() => ({
      url: newUrl,
    }))
  }

  return { settingLinkUrl }
}
