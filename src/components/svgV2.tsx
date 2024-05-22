'use client';
import { IDxf } from 'dxf-parser'
import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { GravityUiFileArrowDown } from '@/components/icons/loading'
import { Lines, Circles, Arcs, Polylines, Lwpolylines, Points, Solids, Ellipses } from './svgComp'
import { Collapse, Reset, Expand } from '@/components/icons'
import { uniq } from 'lodash-es';
import { useWindowSize } from 'react-use'
import * as d3 from 'd3'
import { cn } from '@/lib/utils';

const C: React.FC<{ dxf: IDxf }> = ({ dxf }) => {
  const ref = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement>(null)
  const svgDiv = useRef<HTMLDivElement>(null)
  const reload = useRef<() => void>()
  const types = uniq(dxf.entities.map(e => e.type))
  const [state, setState] = useState({
    lineWidth: 1,
    strokeColor: 'black',
    viewBox: '0 -2000 2500 2000',
    types,
    fullScreen: false,
  })
  const { width, height } = useWindowSize()
  const transform = useRef(null)

  const draw = useCallback(() => {
    if (!ref.current) return
    const svg = d3.select(ref.current)
    const g = svg.select('g')
    if (transform.current) {
      g.attr('transform', transform.current)
    }
    const { viewBox } = state
    svg.attr('viewBox', viewBox)
    const zoom = d3.zoom()
      .scaleExtent([0.001, 5000])
      .on('zoom', (e) => {
        transform.current = e.transform
        g.attr('transform', e.transform)
      })
    svg.call(zoom as any)
    reload.current = () => zoom.transform(svg as any, d3.zoomIdentity)
  }, [dxf.entities, state])

  const download = useCallback(() => {
    const svg = d3.select(ref.current!)?.node()?.outerHTML
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dxf-${new Date().toLocaleString()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [])

  const C = state.fullScreen ? Collapse : Expand

  useEffect(() => {
    draw()
  }, [draw])
  
  return (
    <>
      <div className="flex flex-row gap-x-4 gap-y-2 items-center mt-4 bg-white rounded py-2 px-4 flex-wrap max-w-[80%]">
        lineWidth
        <Input className='w-[200px]' type='number' value={state.lineWidth} onChange={(e) => setState({ ...state, lineWidth: +e.target.value })}/>
        lineColor
        <Input className='w-[200px]' value={state.strokeColor} onChange={(e) => setState({ ...state, strokeColor: e.target.value })}/>
        SVG viewBox
        <Input className='w-[200px]' value={state.viewBox} onChange={(e) => setState({ ...state, viewBox: e.target.value })}/>
      </div>
      <div className="flex flex-row gap-x-3 gap-y-1 items-center mt-2 bg-white rounded py-2 px-4 flex-wrap max-w-[80%]">
        {types.map((type) => {
          const checked = state.types.includes(type)
          return (
            <div className="flex items-center" key={type}>
              <Checkbox className='mr-1' checked={checked} onClick={() => setState({ ...state, types: !checked ? [...state.types, type] : state.types.filter((t) => t !== type) })}/>
              {type}
            </div>
          )
        })}
      </div>
      <div ref={svgDiv} className={cn('transition-all duration-300', state.fullScreen ? 'fixed top-0 left-0 right-0 bottom-0 bg-white' : 'bg-white mt-2 border border-gray-300 rounded p-4 relative')}>
        <div className="absolute top-4 right-4 z-10 flex items-center flex-col gap-1">
          <Reset className=' hover:bg-purple-300 p-1 rounded text-[30px] text-purple-500 cursor-pointer' onClick={() => reload.current?.()}/>
          <GravityUiFileArrowDown className='hover:bg-purple-300 p-1 rounded text-[30px] text-purple-500 cursor-pointer' onClick={download}/>
          <C className='hover:bg-purple-300 p-1 rounded text-[30px] text-purple-500 cursor-pointer' onClick={() => setState({ ...state, fullScreen: !state.fullScreen })}/>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" ref={ref} width={state.fullScreen ? width : width * 3 / 4} height={state.fullScreen ? height : height * 2 / 3}>
          <g ref={gRef} >
            {state.types.includes('LINE') && <Lines getMountedDiv={() => svgDiv.current!} dxf={dxf} color={state.strokeColor} width={state.lineWidth} />}
            {state.types.includes('CIRCLE') && <Circles dxf={dxf} color={state.strokeColor} width={state.lineWidth} />}
            {state.types.includes('ARC') && <Arcs dxf={dxf} color={state.strokeColor} width={state.lineWidth} />}
            {state.types.includes('POLYLINE') && <Polylines dxf={dxf} color={state.strokeColor} width={state.lineWidth} />}
            {state.types.includes('LWPOLYLINE') && <Lwpolylines dxf={dxf} color={state.strokeColor} width={state.lineWidth} />}
            {state.types.includes('POINT') && <Points dxf={dxf} color={state.strokeColor} width={state.lineWidth} />}
            {state.types.includes('SOLID') && <Solids dxf={dxf} color={state.strokeColor} width={state.lineWidth} />}
            {state.types.includes('ELLIPSE') && <Ellipses dxf={dxf} color={state.strokeColor} width={state.lineWidth} />}
          </g>
        </svg>
      </div>
    </>
  )
}

export const SvgV2 = memo(C)