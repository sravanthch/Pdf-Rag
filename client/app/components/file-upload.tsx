'use client'
import * as React from 'react'
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

const FileUploadComponent: React.FC = () => {
  const [isUploading, setIsUploading] = React.useState(false)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setFileName(file.name)
    setStatus('idle')

    const formData = new FormData()
    formData.append('pdf', file)

    try {
      const response = await fetch('http://127.0.0.1:8000/upload/pdf', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setStatus('success')
        console.log('File Uploaded successfully')
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setStatus('error')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className='w-full'>
      <label className={cn(
        "relative group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
        status === 'success' ? "border-emerald-500/50 bg-emerald-500/5" : "border-[#27272a] hover:border-indigo-500/50 bg-[#18181b] hover:bg-indigo-500/5"
      )}>
        <input
          type='file'
          className='hidden'
          accept='application/pdf'
          onChange={handleFileUpload}
          disabled={isUploading}
        />

        <div className='flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center'>
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
              <p className="text-sm font-medium text-indigo-400">Processing Document...</p>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
              <p className="text-sm font-bold text-emerald-400">Upload Complete!</p>
              <p className="text-xs text-[#71717a] mt-1 truncate max-w-full">{fileName}</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-[#a1a1aa] group-hover:text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Click to upload PDF</h3>
              <p className="text-xs text-[#71717a] mt-1 font-medium">Max size: 10MB</p>
            </>
          )}
        </div>
      </label>
    </div>
  )
}

export default FileUploadComponent
