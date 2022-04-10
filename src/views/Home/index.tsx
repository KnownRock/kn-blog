import { Box, Container } from '@mui/material'
import ArticleCard from '../../components/ArticleCard'
import TopBar from '../../components/TopBar'
import useLoading from '../../contexts/LoadingContext'
import { useDir } from '../../hooks/fs-hooks'

function Home() {
  const { loading, error, objects = [] } = useDir('/blogs/home')
  console.log(objects)
  useLoading(loading)

  return (
    <Box sx={{ }}>
      <TopBar />
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
        {objects.sort((a, b) => a.name.localeCompare(a.name)).map((object) => (
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
