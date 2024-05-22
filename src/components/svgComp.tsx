'use client';
import { IDxf } from 'dxf-parser'
import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useHover } from 'react-use'
import { useHotkeys } from 'react-hotkeys-hook'
import { uniqueId } from 'lodash-es'

export interface Point {
  x: number
  y: number
}

const Line = ({ x1, y1, x2, y2, color, width, onClick }: { x1: number, y1: number, x2: number, y2: number, color: string, width: number, onClick?: () => void }) => {
  const r = useRef<SVGLineElement>(null)
  const [e] = useHover(hover => (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={hover ? '#3b82f6' : (color || 'black')}
      strokeWidth={width || 0}
      strokeLinecap='round'
      strokeLinejoin='round'
      onClick={onClick}
    />
  ))
  return e
}

export const Lines = ({ dxf, color, width, getMountedDiv }: { dxf: IDxf, color: string, width: number, getMountedDiv: () => HTMLDivElement }) => {
  const lineSet = new Set<string>()
  const fmt = (n: number) => Math.round(n * 100) / 100
  const filterLinePoints = (p1: Point, p2: Point) => {
    const s = `${fmt(p1.x)},${fmt(p1.y)},${fmt(p2.x)},${fmt(p2.y)}`
    if (lineSet.has(s)) return false
    lineSet.add(s)
    return true
  }
  const _lines = dxf.entities.filter((e: any) => e.type === 'LINE' && filterLinePoints(e.vertices[0], e.vertices[1])).map((e: any) => ({...e, id: uniqueId('line-')}))
  const [lines, setLines] = useState(_lines)
  const [line, setLine] = useState<any>(null)

  useHotkeys('backspace', () => {
    if (line) {
      setLines(lines.filter(l => l.id !== line.id))
    }
  })

  return (
    <>
      {line && createPortal((
        <div className="absolute top-1 left-1 z-10 bg-white rounded p-4 border flex flex-col gap-2">
          <pre className='text-[12px] text-purple-500'>{JSON.stringify(line, null, 2)}</pre>
        </div>
      ), getMountedDiv())}
      {lines.map((e: any) => {
        return (
          <Line
            key={e.id}
            x1={fmt(e.vertices[0].x)}
            y1={-fmt(e.vertices[0].y)}
            x2={fmt(e.vertices[1].x)}
            y2={-fmt(e.vertices[1].y)}
            color={line?.id === e.id ? '#3b82f6' : color}
            width={width || 0}
            onClick={() => line?.id === e.id ? setLine(null) : setLine(e)}
          />
        )
      })}
    </>
  )
}

export const Circles = ({ dxf, color, width }: { dxf: IDxf, color: string, width: number }) => {
  const circles = dxf.entities.filter(e => e.type === 'CIRCLE')
  return (
    <>
      {circles.map((e: any, i) => {
        return (
          <circle
            key={i}
            cx={e.center.x}
            cy={-e.center.y}
            r={e.radius}
            fill='none'
            stroke={color || 'black'}
            strokeWidth={width || 0}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        )
      })}
    </>
  )
}

export const Arcs = ({ dxf, color, width }: { dxf: IDxf, color: string, width: number }) => {
  const arcs = dxf.entities.filter(e => e.type === 'ARC')
  return (
    <>
      {arcs.map((e: any, i) => {
        const startAngle = (e.startAngle * Math.PI) / 180
        const endAngle = (e.endAngle * Math.PI) / 180
        const startX = e.center.x + e.radius * Math.cos(startAngle)
        const startY = -e.center.y - e.radius * Math.sin(startAngle)
        const endX = e.center.x + e.radius * Math.cos(endAngle)
        const endY = -e.center.y - e.radius * Math.sin(endAngle)
        const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'
        return (
          <path
            key={i}
            d={`M ${startX} ${startY} A ${e.radius} ${e.radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
            stroke={color || 'black'}
            strokeWidth={width || 0}
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        )
      })}
    </>
  )
}

export const Polylines = ({ dxf, color, width }: { dxf: IDxf, color: string, width: number }) => {
  const polylines = dxf.entities.filter(e => e.type === 'POLYLINE')
  return (
    <>
      {polylines.map((e: any, i) => {
        return (
          <polyline
            key={i}
            points={e.vertices.map((v: any) => `${v.x},${-v.y}`).join(' ')}
            stroke={color || 'black'}
            strokeWidth={width || 0}
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        )
      })}
    </>
  )
}

export const Lwpolylines = ({ dxf, color, width }: { dxf: IDxf, color: string, width: number }) => {
  const lwpolylines = dxf.entities.filter(e => e.type === 'LWPOLYLINE')
  return (
    <>
      {lwpolylines.map((e: any, i) => {
        return (
          <polyline
            key={i}
            points={e.vertices.map((v: any) => `${v.x},${-v.y}`).join(' ')}
            stroke={color || 'black'}
            strokeWidth={width || 0}
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        )
      })}
    </>
  )
}

export const Points = ({ dxf, color, width }: { dxf: IDxf, color: string, width: number }) => {
  const points = dxf.entities.filter(e => e.type === 'POINT')
  return (
    <>
      {points.map((e: any, i) => {
        return (
          <circle
            key={i}
            cx={e.position.x}
            cy={-e.position.y}
            r={1}
            fill={color || 'black'}
            stroke={color || 'black'}
            strokeWidth={width || 0}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        )
      })}
    </>
  )
}

export const Solids = ({ dxf, color, width }: { dxf: IDxf, color: string, width: number }) => {
  const solids = dxf.entities.filter(e => e.type === 'SOLID')
  return (
    <>
      {solids.map((e: any, i) => {
        return (
          <polygon
            key={i}
            points={e.points.map((p: any) => `${p.x},${-p.y}`).join(' ')}
            stroke={color || 'black'}
            strokeWidth={width || 0}
            fill={color || 'black'}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        )
      })}
    </>
  )
}

export const Ellipses = ({ dxf, color, width }: { dxf: IDxf, color: string, width: number }) => {
  const ellipses = dxf.entities.filter(e => e.type === 'ELLIPSE')
  return (
    <>
      {ellipses.map((e: any, i) => {
        const rx = e.majorAxisEndPoint.x
        const ry = e.majorAxisEndPoint.y
        const rotation = Math.atan2(ry, rx) * (180 / Math.PI)
        return (
          <ellipse
            key={i}
            cx={e.center.x}
            cy={-e.center.y}
            rx={Math.sqrt(rx * rx + ry * ry)}
            ry={e.radius}
            transform={`rotate(${rotation} ${e.center.x} ${-e.center.y})`}
            stroke={color || 'black'}
            strokeWidth={width || 0}
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        )
      })}
    </>
  )
}
