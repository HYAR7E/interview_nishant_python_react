import { useRef, useState, type FormEvent } from 'react'

interface FileUploaderProps {
  setFilename: React.Dispatch<React.SetStateAction<string>>
}
const FileUploader: React.FC<FileUploaderProps> = ({ setFilename }) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const saveFile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !fileRef.current ||
      !fileRef.current.files ||
      fileRef.current.files.length == 0
    )
      return

    const formData = new FormData()
    formData.append('carrier_report', fileRef.current.files[0])

    setIsLoading(true)
    fetch('http://127.0.0.1:5000/mobile_carrier/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) =>
        response.json().then((data) => {
          localStorage.setItem('file_id', data.file_id)
          setFilename(data.file_id)
        })
      )
      .finally(() => setIsLoading(false))
  }

  return (
    <form onSubmit={saveFile}>
      Upload Carrier Report file:
      {isLoading && <span className="text-yellow-500 ml-2">Loading...</span>}
      <br />
      <div className="flex flex-row py-2">
        <input type="file" accept=".csv" ref={fileRef} className="ring-1" />
        <button type="submit" className="px-2 ring-1 bg-slate-200">
          Upload
        </button>
      </div>
    </form>
  )
}

export default FileUploader
