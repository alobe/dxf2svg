import DxfParser from 'dxf-parser'
import { percentile } from './percentile'

export interface Point {
  x: number
  y: number
}

export const parseDxf = (data: string) => {
  const p = new DxfParser()
  const dxf = p.parseSync(data)
  const svgElements: string[] = []
  const points: Point[] = []
  const handlePoint = (x: number, y: number) => points.push({ x, y })
  dxf!.entities.forEach((entity: any) => {
    switch (entity.type) {
      case 'LINE':
        handlePoint(entity.vertices[0].x, entity.vertices[0].y)
        svgElements.push(
          `<line x1="${entity.vertices[0].x}" y1="${-entity.vertices[0].y}" x2="${entity.vertices[1].x}" y2="${-entity.vertices[1].y}" stroke="black" />`,
        )
        break
      case 'CIRCLE':
        handlePoint(entity.center.x, entity.center.y)
        svgElements.push(
          `<circle cx="${entity.center.x}" cy="${-entity.center.y}" r="${entity.radius}" stroke="black" fill="none" />`,
        )
        break
      case 'ARC':
        const startAngle = (entity.startAngle * Math.PI) / 180
        const endAngle = (entity.endAngle * Math.PI) / 180
        const startX = entity.center.x + entity.radius * Math.cos(startAngle)
        const startY = -entity.center.y - entity.radius * Math.sin(startAngle)
        const endX = entity.center.x + entity.radius * Math.cos(endAngle)
        const endY = -entity.center.y - entity.radius * Math.sin(endAngle)
        const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'
        // handlePoint(startX, startY)
        handlePoint(endX, endY)
        svgElements.push(
          `<path d="M ${startX} ${startY} A ${entity.radius} ${entity.radius} 0 ${largeArcFlag} 1 ${endX} ${endY}" stroke="black" fill="none" />`,
        )
        break
      case 'POLYLINE':
      case 'LWPOLYLINE':
        const points = entity.vertices.map((v: any) => (handlePoint(v.x, v.y), `${v.x},${-v.y}`)).join(' ')
        svgElements.push(`<polyline points="${points}" stroke="black" fill="none" />`)
        break
      // case 'TEXT':
      // case 'MTEXT':
      //   svgElements.push(
      //     `<text x="${entity.position.x}" y="${-entity.position.y}" font-size="12" fill="black">${entity.text}</text>`,
      //   )
      //   break
      case 'POINT':
        handlePoint(entity.position.x, entity.position.y)
        svgElements.push(
          `<circle cx="${entity.position.x}" cy="${-entity.position.y}" r="1" fill="black" />`,
        )
        break
      case 'SOLID':
        const solidPoints = entity.points.map((p: any) => (handlePoint(p.x, p.y), `${p.x},${-p.y}`)).join(' ')
        svgElements.push(`<polygon points="${solidPoints}" fill="black" />`)
        break
      case 'ELLIPSE':
        const rx = entity.majorAxisEndPoint.x
        const ry = entity.majorAxisEndPoint.y
        handlePoint(entity.center.x, entity.center.y)
        // handlePoint(rx, ry)
        const rotation = Math.atan2(ry, rx) * (180 / Math.PI)
        svgElements.push(
          `<ellipse cx="${entity.center.x}" cy="${-entity.center.y}" rx="${Math.sqrt(rx * rx + ry * ry)}" ry="${entity.radius}" transform="rotate(${rotation} ${entity.center.x} ${-entity.center.y})" stroke="black" fill="none" />`,
        )
        break
      // 添加对其他实体类型的处理逻辑
      default:
        break
    }
  })

  const getByNum = (num: number) => ({
    min: {
      x: percentile(points.map(p => p.x), num, true),
      y: percentile(points.map(p => p.y), num, true),
    },
    max: {
      x: percentile(points.map(p => p.x), num),
      y: percentile(points.map(p => p.y), num),
    }
  })
  
  return {
    getSvg: (min: Point, max: Point) => {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${min.x} -${max.y} ${max.x - min.x} ${max.y - min.y}">${svgElements.join('')}</svg>`
    },
    percentile: [0.99, 0.98, 0.97, 0.96, 0.95, 0.90].map(n => ({ [`${n * 100}分位`]: n * 100, '分位数据详情': getByNum(n) })),
  }
}