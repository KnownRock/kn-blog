import { Box, Container } from '@mui/material'
import ArticleCard from '../../components/ArticleCard'
import TopBar from '../../components/TopBar'

function Home() {
  return (
    <Box sx={{ paddingBottom: 3 }}>
      <TopBar />
      <Container maxWidth="xl">
        <Box sx={{ paddingTop: 3 }}>
          <ArticleCard />
        </Box>
        <Box sx={{ paddingTop: 3 }}>
          <ArticleCard />
        </Box>
      </Container>
    </Box>
  )
}

export default Home
