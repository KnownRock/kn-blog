import { Box } from '@mui/material'

export default function FullContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box style={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
    >
      {children}
    </Box>
  )
}
