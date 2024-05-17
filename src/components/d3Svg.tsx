'use client';
import { IDxf } from 'dxf-parser'
import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { GravityUiFileArrowDown } from '@/components/icons/loading'
import { Reset } from '@/components/icons'
import { uniq } from 'lodash-es';
import { useWindowSize } from 'react-use'
import * as d3 from 'd3'

const C: React.FC<{ dxf: IDxf }> = ({ dxf }) => {
  const ref = useRef<SVGSVGElement>(null)
  const reload = useRef<() => void>()
  const types = uniq(dxf.entities.map(e => e.type))
  const [state, setState] = useState({
    lineWidth: 1,
    strokeColor: 'black',
    viewBox: '0 -2000 2500 2000',
    types
  })
  const { width, height } = useWindowSize()
  const transform = useRef(null)

  const draw = useCallback(() => {
    if (!ref.current) return
    const svg = d3.select(ref.current)
    if (!svg.select('g').empty()) {
      svg.select('g').remove()
    }
    const g = svg.append('g')
    if (transform.current) {
      g.attr('transform', transform.current)
    }
    const {lineWidth, strokeColor, viewBox, types} = state
    dxf.entities.forEach((e: any) => {
      switch (e.type) {
        case 'LINE':
          if (!types.includes('LINE')) return
          g.append('line')
            .attr('x1', e.vertices[0].x)
            .attr('y1', -e.vertices[0].y)
            .attr('x2', e.vertices[1].x)
            .attr('y2', -e.vertices[1].y)
            .attr('stroke', strokeColor)
            .attr('stroke-width', lineWidth)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
          break
        case 'CIRCLE':
          if (!types.includes('CIRCLE')) return
          g.append('circle')
            .attr('cx', e.center.x)
            .attr('cy', -e.center.y)
            .attr('r', e.radius)
            .attr('fill', 'none')
            .attr('stroke', strokeColor)
            .attr('stroke-width', lineWidth)
          break
        case 'ARC':
          if (!types.includes('ARC')) return
          const startAngle = (e.startAngle * Math.PI) / 180
          const endAngle = (e.endAngle * Math.PI) / 180
          const startX = e.center.x + e.radius * Math.cos(startAngle)
          const startY = -e.center.y - e.radius * Math.sin(startAngle)
          const endX = e.center.x + e.radius * Math.cos(endAngle)
          const endY = -e.center.y - e.radius * Math.sin(endAngle)
          const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'
          g.append('path')
            .attr('d', `M ${startX} ${startY} A ${e.radius} ${e.radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`)
            .attr('stroke', strokeColor)
            .attr('stroke-width', lineWidth)
            .attr('fill', 'none')
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
          break
        case 'POLYLINE':
          if (!types.includes('POLYLINE')) return
          g.append('polyline')
            .attr('points', e.vertices.map((v: any) => `${v.x},${-v.y}`).join(' '))
            .attr('stroke', strokeColor)
            .attr('stroke-width', lineWidth)
            .attr('fill', 'none')
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
          break
        case 'LWPOLYLINE':
          if (!types.includes('LWPOLYLINE')) return
          g.append('polyline')
            .attr('points', e.vertices.map((v: any) => `${v.x},${-v.y}`).join(' '))
            .attr('stroke', strokeColor)
            .attr('stroke-width', lineWidth)
            .attr('fill', 'none')
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
          break
        // 感觉可以不要
        case 'POINT':
          if (!types.includes('POINT')) return
          g.append('circle')
            .attr('cx', e.position.x)
            .attr('cy', -e.position.y)
            .attr('r', 1)
            .attr('fill', strokeColor)
          break
        // 感觉可以不要
        case 'SOLID':
          if (!types.includes('SOLID')) return
          g.append('polygon')
            .attr('points', e.points.map((p: any) => `${p.x},${-p.y}`).join(' '))
            .attr('stroke', strokeColor)
            .attr('stroke-width', lineWidth)
            .attr('fill', strokeColor)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
          break
        // 感觉可以不要
        case 'ELLIPSE':
          if (!types.includes('ELLIPSE')) return
          const rx = e.majorAxisEndPoint.x
          const ry = e.majorAxisEndPoint.y
          const rotation = Math.atan2(ry, rx) * (180 / Math.PI)
          g.append('ellipse')
            .attr('cx', e.center.x)
            .attr('cy', -e.center.y)
            .attr('rx', Math.sqrt(rx * rx + ry * ry))
            .attr('ry', e.radius)
            .attr('transform', `rotate(${rotation} ${e.center.x} ${-e.center.y})`)
            .attr('stroke', strokeColor)
            .attr('stroke-width', lineWidth)
            .attr('fill', 'none')
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
          break
        default:
          break
      }
    })
    svg.attr('viewBox', viewBox)
    const zoom = d3.zoom()
      .scaleExtent([0.001, 1000])
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
      <div className="bg-white mt-2 border border-gray-300 rounded p-4 relative">
        <div className="absolute top-4 right-4 z-10 flex items-center flex-col gap-1">
          <Reset className=' hover:bg-purple-300 p-1 rounded text-[30px] text-purple-500 cursor-pointer' onClick={() => reload.current?.()}/>
          <GravityUiFileArrowDown className='hover:bg-purple-300 p-1 rounded text-[30px] text-purple-500 cursor-pointer' onClick={download}/>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" ref={ref} width={width * 3 / 4} height={height * 2 / 3}/>
      </div>
    </>
  )
}

export const D3Svg = memo(C)