import {
  FormControl, FormGroup, TextField, Box,
} from '@mui/material'
import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import CryptoJS from 'crypto-js'
import InfoContext from '../contexts/InfoContext'
import { testConfig, setConfig } from '../utils/fs'

async function getVisitId() {
  return FingerprintJS.load()
    .then((fp) => fp.get())
    .then((result) => (result.visitorId))
}

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

export function useShowLogin() {
  const { t } = useTranslation()
  const { info } = useContext(InfoContext)
  // const [random, setRandom] = useState(Math.random())
  const [show, setShow] = useState(false)

  const showLogin = async () => {
    setShow(true)
  }

  useEffect(() => {
    (async () => {
      if (show) {
        let form = {
          url: 'http://127.0.0.1:9000',
          backet: 'private',
          accessKey: 'minioadmin',
          secretKey: 'minioadmin',
        }
        let ok = false

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
        // props.map is not a function

        await info({
          title: t('Login'),
          noClose: true,
          async isOk() {
            if (!ok) {
              return false
            }

            const {
              url, backet, accessKey, secretKey,
            } = form
            const urlProp = new URL(url)

            function getPort(up:URL):number {
              const { port } = up
              if (port) {
                return +port
              }
              if (up.protocol === 'http:') {
                return 80
              }
              if (up.protocol === 'https:') {
                return 443
              }
              return 80
            }

            const inputConfig = {
              endPoint: urlProp.hostname,
              port: getPort(urlProp),
              useSSL: urlProp.protocol === 'https:',
              accessKey,
              secretKey,
              bucket: backet,
            }

            const haveBucket = await testConfig(inputConfig)

            const key = await getVisitId()

            const encryptedConfig = CryptoJS.AES
              .encrypt(JSON.stringify(inputConfig), key).toString()

            localStorage.setItem('.config', encryptedConfig)

            return haveBucket
          },
          // content: 'No config file found',
          component: (
            <Box>
              <Form
                formValue={form}
                formProps={formProps}
                onChange={(f) => { form = f }}
                onErrorChange={(isError) => { ok = !isError }}
              />
            </Box>
          ),
        })

        window.location.reload()
        // })

        return <Box />
      }
      return 'ok'
    })()
  }, [info, t, show])

  return { showLogin }
}

export function useAutoLogin() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)

  const [minioLoading, setMinioLoading] = useState(false)

  // useEffect(() => {
  //   // https://stackoverflow.com/questions/53396307/how-do-i-use-external-script-that-i-add-to-react-js
  //   const script = document.createElement('script')
  //   script.src = '/js/minio.js'
  //   script.async = true
  //   script.onload = () => setMinioLoading(false)

  //   document.body.appendChild(script)
  // }, [])

  useEffect(() => {
    if (minioLoading) return
    (async () => {
      try {
        const configText = localStorage.getItem('.config')
        if (configText) {
          const key = await getVisitId()

          const config = CryptoJS.AES.decrypt(configText, key).toString(CryptoJS.enc.Utf8)
          // console.log(JSON.parse(config))
          setConfig(JSON.parse(config))

          setSuccess(true)
        }
      } catch (e) {
        localStorage.setItem('.config', '')
        setError(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [minioLoading])

  // TODO: add a login info ?
  return { loading, error, success }
}

export function useLogout() {
  const { t } = useTranslation()
  const { info } = useContext(InfoContext)

  const [showing, setShowing] = useState(false)

  useEffect(() => {
    if (showing) {
      info({
        title: t('Logout'),
        content: t('Logout.content'),
      }).then(() => {
        localStorage.setItem('.config', '')
        window.location.reload()
      }).finally(() => {
        setShowing(false)
      })
    }
  }, [showing, info, t])

  return {
    logout: () => {
      setShowing(true)
    },
  }
}
