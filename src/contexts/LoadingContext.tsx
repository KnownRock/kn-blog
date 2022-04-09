import { useContext, useEffect } from 'react'
import InfoContext from './InfoContext'

export default function useLoading(loading:boolean) {
  const { setLoading } = useContext(InfoContext)
  useEffect(() => {
    setLoading(loading)
  }, [loading, setLoading])
}
