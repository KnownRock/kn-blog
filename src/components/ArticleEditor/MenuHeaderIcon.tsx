import Typography from '@mui/material/Typography'

export default function MenuHeaderIcon({
  str,
}: {
  str: string;
}) {
  return (
    <Typography
      variant="h6"
      className="knBlogHeader"
    >
      {str}
    </Typography>
  )
}
