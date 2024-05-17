'use client';
import DxfParser, { IDxf } from 'dxf-parser'
import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { D3Svg } from '@/components/d3Svg'
import { Bg } from '@/components/Bg'
import { useAutoAnimate } from '@formkit/auto-animate/react'

export default function D3() {
  const p = new DxfParser()
  const [dxf, setDxf] = useState<IDxf>()
  const [fName, setFName] = useState('');
  const [ref] = useAutoAnimate()

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        const data = e.target?.result
        if (data) {
          const dxf = p.parseSync(data)
          if (dxf) {
            setDxf(dxf)
            setFName(file.name)
          }
        }
      }
      reader.readAsText(file)
    }
  }
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center pb-7" ref={ref}>
      <Bg/>
      <div className="h-[60px] w-[60px] fixed top-3 left-3 overflow-hidden flex items-center justify-center rounded-full">
        <img src="/logo.webp" className="h-[60px] scale-[1.2] object-cover" alt="logo" />
      </div>
      <Input className='w-[200px] flex-none cursor-pointer mt-6' type="file" onChange={handleFileInputChange} accept=".dxf"/>
      {dxf && <D3Svg key={fName} dxf={dxf} />}
    </div>
  )
}