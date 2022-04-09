import Debounce from '../../components/Debounce'
import OperationsButton from './OperationsButton'

// TODO: refact this to a component
export default function LoadingFileList({
  loading, error, path,
}: {
  loading: boolean;
  error: boolean;
  path: string;
}) {
  return (
    <Debounce loading={loading} error={error}>
      <OperationsButton path={path} />
    </Debounce>
  )
}
