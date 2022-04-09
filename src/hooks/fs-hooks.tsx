import {
  useEffect, useMemo, useState,
} from 'react'
import { dir, getFile } from '../utils/fs'

// export function useAsync<Result>(
//   // FIXME: https://github.com/microsoft/TypeScript/pull/24897
//   asyncFunc : (...funcArgs:unknown[]) => Promise<Result>,
//   args: unknown[],
//   initialValue:Result,
//   clearOnRefetch = false,
// ) {
//   const [objects, setObjects] = useState<Result>(initialValue)
//   const [loading, setLoading] = useState(true)
//   const [random, setRandom] = useState(Math.random())
//   const [error, setError] = useState(false)

//   console.log(initialValue === last)
//   last = initialValue

//   const refetch = () => {
//     if (clearOnRefetch) {
//       setObjects(initialValue)
//     }
//     setLoading(true)
//     setError(false)
//     setRandom(Math.random())
//   }

//   useEffect(() => {
//     setError(false)
//     setLoading(true)

//     asyncFunc(...args)
//       .then(setObjects)
//       .catch(() => {
//         setError(true)
//         setObjects(initialValue)
//       })
//       .finally(() => setLoading(false))
//   }, [asyncFunc, args, random, initialValue])

//   return {
//     objects, loading, error, refetch,
//   }
// }

export function useDir(fsPath: string) {
  const [objects, setObjects] = useState<Awaited<ReturnType<typeof dir>>>([])
  const [loading, setLoading] = useState(true)
  const [random, setRandom] = useState(Math.random())
  const [error, setError] = useState(false)

  const refetch = () => {
    setLoading(true)
    setError(false)
    setRandom(Math.random())
  }

  useEffect(() => {
    setError(false)
    setLoading(true)

    dir(fsPath)
      .then(setObjects)
      .catch(() => {
        setError(true)
        setObjects([])
      })
      .finally(() => setLoading(false))
  }, [fsPath, random])

  return {
    objects, loading, error, refetch,
  }
}

export function useGetFile(fsPath: string) {
  const [object, setObject] = useState(null as Blob | null)
  const [loading, setLoading] = useState(true)
  const [random, setRandom] = useState(Math.random())
  const [error, setError] = useState(false)

  const refetch = () => {
    setLoading(true)
    setError(false)
    setRandom(Math.random())
  }

  useEffect(() => {
    setError(false)
    setLoading(true)
    getFile(fsPath)
      .then(setObject)
      .catch((e) => {
        setError(true)
        setObject(null)
      })
      .finally(() => setLoading(false))
  }, [fsPath, random])

  return {
    object, loading, error, refetch,
  }
}

export function useFileText(path:string) {
  const [text, setText] = useState('')
  const { object, loading, error } = useGetFile(path || '')

  const [readLoading, settReadLoading] = useState(true)
  const [readError, setReadError] = useState(false)

  useEffect(() => {
    if (object && !loading) {
      const reader = new FileReader()
      reader.onload = () => {
        setText(reader.result as string)
        settReadLoading(false)
      }
      reader.onerror = () => {
        setReadError(true)
        settReadLoading(false)
      }

      reader.readAsText(object)
    }
  }, [object, loading])

  return { text, loading: (readLoading || loading) && !error, error: error || readError }
}

export function useDataUrl(path: string) {
  const { object, loading, error } = useGetFile(path)
  const [readLoaing, setReadLoading] = useState(true)
  const [readError, setReadError] = useState(false)
  const [dataUrl, setDataUrl] = useState('')
  useEffect(() => {
    if (!loading && object) {
      const reader = new FileReader()
      reader.onload = () => {
        setDataUrl(reader.result as string)
        setReadLoading(false)
      }
      reader.onerror = () => {
        setReadError(true)
        setReadLoading(false)
      }
      reader.readAsDataURL(object)
    }
  }, [loading, object])

  return {
    dataUrl,
    loading: readLoaing && loading,
    error: readError || error,
  }
}
