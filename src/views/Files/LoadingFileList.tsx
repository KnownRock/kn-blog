import FileList from './FileList'

export default function LoadingFileList({
  loading, error, objects,
}: {
  loading: boolean;
  error: boolean;
  objects: Array<FileInfo>;
}) {
  // TODO: make better transition
  if (loading && !objects.length) {
    return <div>Loading...</div>
  }
  // debugger
  if (error) {
    return <div>Error</div>
  }

  return <FileList objects={objects} />
}
