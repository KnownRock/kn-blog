import {
  Box, FormControl, FormGroup, FormHelperText, Input, InputLabel, Switch, TextField,
} from '@mui/material'

import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useContext, useEffect, useReducer, useState,
} from 'react'
import TopBar from '../../components/TopBar'

import Files from './Files'
import InfoContext from '../../contexts/InfoContext'

function CustomFormControl({ children }:{ children: React.ReactNode }) {
  return (
    <FormControl sx={{
      marginTop: 2,
    }}
    >
      {children}
    </FormControl>
  )
}

function Form<T extends object>({
  onChange, onErrorChange, formValue, formProps,
}:{
  formValue:T,
  onChange: (value:T) => void,
  onErrorChange: (error:boolean) => void,
  formProps: Array<{
    name: keyof typeof formValue & string,
    displayName: string,
    valid:RegExp,
    type?:string,
  }>

  ,
}) {
  const { t } = useTranslation()

  const [form, setForm] = useState(formValue)

  // const initialErrorDict:{
  //   [k in keyof typeof formValue]: boolean
  // } = Object.keys(formValue).reduce((acc, key) => {
  //   acc[key] = false
  //   return acc
  // }, {})

  const initialErrorDict:{
    [k in keyof typeof formValue]: boolean
  } = Object.keys(formValue).reduce((acc, key) => {
    acc[key as keyof typeof formValue] = false
    return acc
  }, {} as { [k in keyof typeof formValue]: boolean })

  const [errorDict, setErrorDict] = useState(initialErrorDict)

  useEffect(() => {
    onErrorChange(Object.values(errorDict).some((element) => element))
  }, [errorDict, onErrorChange])

  useEffect(() => {
    onChange(form)
  }, [form, onChange])

  return (
    <FormGroup>
      {formProps.map((el) => (
        <CustomFormControl key={el.name}>
          <TextField
            type={el.type ?? 'text'}
            error={errorDict[el.name]}
            id="outlined-error"
            label={el.displayName ?? el.name}
            value={form[el.name]}
            variant="standard"
            onChange={(e) => {
              setForm({
                ...form,
                [el.name]: e.target.value,
              })
              if (e.target.value.match(el.valid)) {
                setErrorDict({
                  ...errorDict,
                  [el.name]: false,
                })
              } else {
                setErrorDict({
                  ...errorDict,
                  [el.name]: true,
                })
              }
            }}
          />
        </CustomFormControl>
      ))}
    </FormGroup>
  )
}

export default function FilesPage() {
  const { '*': path = '' } = useParams()
  const { t } = useTranslation()
  const currentFolderName = path.match(/([^/]*)\/$/)?.[1] ?? t('root')

  const { info } = useContext(InfoContext)

  const config = localStorage.getItem('.root')
  if (!config) {
    // https://github.com/facebook/react/issues/18178
    setTimeout(() => {
      const form = {
        url: '',
        backet: '',
        accessKey: '',
        secretKey: '',
      }

      const formProps:Array<{
        name: keyof typeof form,
        displayName: string,
        valid:RegExp,
        type?:string,
      }> = [{
        name: 'url',
        displayName: t('login.s3.url'),
        valid: /^https?:\/\/.+$/,
      }, {
        name: 'backet',
        displayName: t('login.s3.backet'),
        valid: /^.+$/,
      }, {
        name: 'accessKey',
        displayName: t('login.s3.accessKey'),
        valid: /^.+$/,
      }, {
        name: 'secretKey',
        displayName: t('login.s3.secretKey'),
        valid: /^.+$/,
        type: 'password',
      }]

      // https://stackoverflow.com/questions/54155412/error-map-in-missing-props-reactjs-proptypes
      // props.map

      info({
        title: t('Login'),
        noClose: true,
        // content: 'No config file found',
        component: (
          <Box>
            <Form
              formValue={form}
              formProps={formProps}
              onChange={console.log}
              onErrorChange={console.log}
            />
          </Box>
        ),
      })

      // FingerprintJS.load().then((fp) => fp.get()).then((result) => {
      //   console.log(result)
      // })
    })

    return <Box />
  }

  // TODO: use real parent's path to back
  const pathLength = path.split('/').length
  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      overflow: 'hidden',
      flexDirection: 'column',
    }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TopBar withBack={pathLength > 1} title={(currentFolderName)} />
        <Files path={path} />
      </Box>
    </Box>
  )
}
