'use client'
import * as React from 'react'
import { Upload } from 'lucide-react'

const FileUploadComponent: React.FC = () => {
  return (
    <div className='bg-slate-900 text-white shadow-2xl flex justify-center items-center p-4 rounded-lg border-white border-2'>
      <div className='flex justify-center items-center flex-col'>
        <h3>Upload your PDF File</h3>
        <Upload/>
      </div>
    </div>
  )
}

export default FileUploadComponent
