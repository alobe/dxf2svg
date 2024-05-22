'use client';
import { Input } from '@/components/ui/input'
import { useState, useRef } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'

export default function SvgEditorPage() {
  const [svgStr, setSvgStr] = useState('')
  const [r] = useAutoAnimate()
  const ref = useRef<HTMLDivElement>(null)

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        const data = e.target?.result
        if (data) {
          setSvgStr(data)
        }
      }
      reader.readAsText(file)
    }
  }
  return (
    <div className="w-screen h-screen flex items-center justify-center" ref={r}>
      {svgStr ? (
        <div className="" dangerouslySetInnerHTML={{ __html: svgStr }} ref={ref}/>
      ) : (
        <Input className='w-[200px] flex-none cursor-pointer' type="file" onChange={handleFileInputChange} accept=".svg"/>
      )}
    </div>
  )
};
