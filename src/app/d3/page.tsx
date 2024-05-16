'use client';
import DxfParser, { IDxf } from 'dxf-parser'
import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { D3Svg } from '@/components/d3Svg'

export default function D3() {
  const p = new DxfParser()
  const [dxf, setDxf] = useState<IDxf>()

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        const data = e.target?.result
        if (data) {
          const dxf = p.parseSync(data)
          if (dxf) setDxf(dxf)
        }
      }
      reader.readAsText(file)
    }
  }
  
  return (
    <div className="h-screen w-screen flex flex-col items-center">
      <Input className='w-[200px] cursor-pointer mt-6' type="file" onChange={handleFileInputChange} accept=".dxf"/>
      {dxf && <D3Svg dxf={dxf} />}
    </div>
  )
}