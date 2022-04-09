import { useEffect, useRef, useState } from 'react'

// TODO: refact this to a component
export default function Debounce({
  loading, error,
  loadingChildren, errorChildren,
  timeout,

  children,
}: {
  loading?: boolean;
  error?: boolean;
  loadingChildren?: JSX.Element;
  errorChildren?: JSX.Element;
  timeout?: number;

  children: JSX.Element;
}) : JSX.Element {
  const [isShowing, setIsShowing] = useState(false)
  const timer = useRef<number>()

  useEffect(() => {
    setIsShowing(false)
    clearTimeout(timer.current)
    if (loading) {
      timer.current = +setTimeout(() => {
        setIsShowing(true)
      }, timeout)
    }
  }, [loading, timeout])

  if (loading && isShowing) {
    if (loadingChildren) {
      return loadingChildren
    }
  }
  if (error && isShowing) {
    if (errorChildren) {
      return (
        errorChildren
      )
    }
  }

  return children
}

Debounce.defaultProps = {
  timeout: 200,
  loading: false,
  error: false,

  loadingChildren: null,
  errorChildren: null,
}
