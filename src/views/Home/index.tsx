import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoLogin } from '../../hooks/user-hooks'

function Home() {
  const { loading: loadingForLogin, env } = useAutoLogin()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loadingForLogin) {
      if (env.home) {
        navigate(env.home)
      } else {
        // navigate('/text-viewer/.env')
      }
    }
  }, [loadingForLogin, env, navigate])

  return null

  // return (
  //   <div style={{
  //     width: '100wh',
  //     height: '100vh',
  //     overflow: 'hidden',
  //   }}
  //   >
  //     <iframe
  //       style={{
  //         width: '100%',
  //         height: '100%',
  //         border: 'none',
  //       }}
  //       src="/blog/public.s3/blogs/home"
  //       title="home"
  //     />
  //   </div>

  // )
}

export default Home
