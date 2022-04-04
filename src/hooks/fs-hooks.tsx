import { useEffect, useState } from 'react'
import Minio from 'minio'
import { dir, getFile } from '../utils/fs'

export function useDir(fsPath: string) {
  const [objects, setObjects] = useState<Awaited<ReturnType<typeof dir>>>([])
  const [loading, setLoading] = useState(true)
  const [random, setRandom] = useState(Math.random())
  const [error, setError] = useState(false)

  const refetch = () => {
    setLoading(true)
    setRandom(Math.random())
  }

  useEffect(() => {
    dir(fsPath)
      .then(setObjects)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [fsPath, random])

  return {
    objects, loading, error, refetch,
  }
}

export function useGetFile(fsPath: string) {
  const [object, setObject] = useState(null as Blob | null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [random, setRandom] = useState(Math.random())

  const refetch = () => {
    setLoading(true)
    setRandom(Math.random())
  }

  useEffect(() => {
    getFile(fsPath)
      .then(setObject)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [fsPath, random])

  return {
    object, loading, error, refetch,
  }
}
