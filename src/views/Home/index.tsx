import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { useEffect } from 'react'
import ArticleCard from '../../components/ArticleCard'
import TopBar from '../../components/TopBar'
import useLoading from '../../contexts/LoadingContext'
import { useDir } from '../../hooks/fs-hooks'
import { useAutoLogin } from '../../hooks/user-hooks'

function Home() {
  const { loading: loadingForLogin, env } = useAutoLogin()
  const { loading, error, objects = [] } = useDir('/blogs/home')
  useLoading(loading)

  // useEffect(() => {
  //   if (!loadingForLogin && env.title) {
  //     document.title = env.title
  //   } else {
  //     document.title = import.meta.env.VITE_APP_TITLE
  //   }
  // }, [env.title, loadingForLogin])

  useEffect(() => {
    document.title = ((!loadingForLogin
      ? env?.title
      : undefined)
      ?? import.meta.env.VITE_APP_TITLE)
      || document.title
  }, [loadingForLogin, env])

  return (
    <Box sx={{ }}>
      <TopBar title={!loadingForLogin ? env?.title : undefined} />
      <Container
        maxWidth="md"
        sx={{
          paddingLeft: {
            xs: 0,
            sm: 0,
            md: 0,
            lg: 0,
            xl: 0,
          },
          paddingRight: {
            xs: 0,
            sm: 0,
            md: 0,
            lg: 0,
            xl: 0,
          },
          paddingTop: 0,
        }}
      >
        {objects.sort((a, b) => -a.name.localeCompare(b.name)).map((object) => (
          <Box key={object.name} sx={{ paddingTop: 3 }}>
            <ArticleCard object={object} />
          </Box>
        ))}
      </Container>

      {/* <Container maxWidth="md">
        <Box sx={{ paddingTop: 3 }}>
          <ArticleCard />
        </Box>
        <Box sx={{ paddingTop: 3 }}>
          <ArticleCard />
        </Box>
      </Container> */}
    </Box>
  )
}

export default Home
