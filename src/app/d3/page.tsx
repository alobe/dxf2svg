'use client';
import { parseDxf } from '@/utils/dxf'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GravityUiFileArrowDown } from '@/components/icons/loading'
import { Bg } from '@/components/Bg'
import { PointForm } from '@/components/pointForm'

type Dxf = ReturnType<typeof parseDxf>

export default function Home() {
  const [dxf, setDxf] = useState<Dxf>()
  const [svgStr, setSvgStr] = useState('')

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        const data = e.target?.result
        if (data) {
          setDxf(parseDxf(data))
        }
      }
      reader.readAsText(file)
    }
  }

  const download = () => {
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dxf-${new Date().toLocaleString()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center pb-6">
      <Bg/>
      <img src="/logo.webp" className="h-[120px] rounded-[12px] mt-7" alt="logo" />
      <div className="mt-7 w-full px-16 flex flex-col items-center">
        <Input className='w-[200px] cursor-pointer' type="file" onChange={handleFileInputChange} accept=".dxf"/>
        {dxf ? (
          <div className="flex bg-white rounded p-2 flex-row mt-5">
            <pre className='rounded p-4 mr-3 max-h-[400px] overflow-y-auto'>{JSON.stringify(dxf.percentile, null, 2)}</pre>
            <PointForm onSubmit={(min, max) => setSvgStr(dxf.getSvg(min, max)) } />
          </div>
        ) : null}
        {svgStr ? (
          <>
            <div className='mt-6 w-[700px] bg-white border rounded p-2 border-purple-400' dangerouslySetInnerHTML={{ __html: svgStr }} />
            <Button className='mt-4 bg-purple-500 hover:bg-purple-400' onClick={download}><GravityUiFileArrowDown className='h-4 w-4 mr-2'/>下载</Button>
          </>
        ) : null}
      </div>
    </main>
  );
}