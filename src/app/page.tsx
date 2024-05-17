'use client';
import DxfParser, { IDxf } from 'dxf-parser'
import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { D3Svg } from '@/components/d3Svg'
import { Bg } from '@/components/Bg'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { TrashCan } from '@/components/icons';

export default function D3() {
  const p = new DxfParser()
  const [dxf, setDxf] = useState<IDxf>()
  const [fName, setFName] = useState('');
  const ri = useRef<HTMLInputElement>(null)
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
      <div className="flex mt-6 flex-row items-center justify-center">
        <Input ref={ri} className='w-[200px] flex-none cursor-pointer' type="file" onChange={handleFileInputChange} accept=".dxf"/>
         {!!dxf && <TrashCan className='text-[40px] text-red-500 ml-3 hover:bg-red-400 hover:text-white bg-red-100 p-2 rounded cursor-pointer' onClick={() => (ri.current!.value = '', setDxf(undefined))} />}
      </div>
      {dxf ? <D3Svg key={fName} dxf={dxf} /> : (
        <div className="text-white text-center mt-6 text-[20px] font-bold max-w-[50%] min-w-[300px]">
          dxf2svg is a tool that helps you convert DXF file into SVG file. It also supports previewing the converted SVG file (such as zooming in and out, and dragging to move) and offers some basic editing features (such as adjusting line thickness and color, modifying the SVG viewBox setting, and controlling the visibility of certain elements from the DXF file).
        </div>
      )} 
    </div>
  )
}