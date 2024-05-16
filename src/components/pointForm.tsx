import { useState } from 'react'
import { Point } from '@/utils/dxf'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const PointForm = ({ onSubmit }: { onSubmit: (min: Point, max: Point) => void }) => {
  const [minPoint, setMinPoint] = useState<Point>({ x: 0, y: 0 })
  const [maxPoint, setMaxPoint] = useState<Point>({ x: 0, y: 0 })
  
  return (
    <div className="flex flex-col items-center">
      <span>Viewbox设置</span>
      <div className="flex items-center my-4">
        minX
        <Input value={minPoint.x} onChange={(e) => setMinPoint({ x: Number(e.target.value), y: minPoint.y })} className='w-[100px] mx-2' type="number"/>
        minY
        <Input value={minPoint.y} onChange={(e) => setMinPoint({ x: minPoint.x, y: Number(e.target.value) })} className='w-[100px] mx-2' type="number"/>
      </div>
      <div className="flex items-center">
        maxX
        <Input value={maxPoint.x} onChange={(e) => setMaxPoint({ x: Number(e.target.value), y: maxPoint.y })} className='w-[100px] mx-2' type="number"/>
        maxY
        <Input value={maxPoint.y} onChange={(e) => setMaxPoint({ x: maxPoint.x, y: Number(e.target.value) })} className='w-[100px] mx-2' type="number"/>
      </div>
      <Button disabled={!minPoint.x && !minPoint.y && !maxPoint.x && !maxPoint.y} className='ml-4 bg-purple-500 hover:bg-purple-400 mt-4' onClick={() => onSubmit(minPoint, maxPoint)}>生成svg</Button>
    </div>
  )
};
