import DxfParser from 'dxf-parser'

export const parseDxf = (data: string) => {
  const p = new DxfParser()
  const dxf = p.parseSync(data)
  const svgElements: string[] = []
  dxf!.entities.forEach((entity: any) => {
    switch (entity.type) {
      case 'LINE':
        svgElements.push(
          `<line x1="${entity.vertices[0].x}" y1="${-entity.vertices[0].y}" x2="${entity.vertices[1].x}" y2="${-entity.vertices[1].y}" stroke="black" />`,
        )
        break
      case 'CIRCLE':
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
        svgElements.push(
          `<path d="M ${startX} ${startY} A ${entity.radius} ${entity.radius} 0 ${largeArcFlag} 1 ${endX} ${endY}" stroke="black" fill="none" />`,
        )
        break
      case 'POLYLINE':
      case 'LWPOLYLINE':
        const points = entity.vertices.map((v: any) => `${v.x},${-v.y}`).join(' ')
        svgElements.push(`<polyline points="${points}" stroke="black" fill="none" />`)
        break
      // case 'TEXT':
      // case 'MTEXT':
      //   svgElements.push(
      //     `<text x="${entity.position.x}" y="${-entity.position.y}" font-size="12" fill="black">${entity.text}</text>`,
      //   )
      //   break
      case 'POINT':
        svgElements.push(
          `<circle cx="${entity.position.x}" cy="${-entity.position.y}" r="1" fill="black" />`,
        )
        break
      case 'SOLID':
        const solidPoints = entity.points.map((p: any) => `${p.x},${-p.y}`).join(' ')
        svgElements.push(`<polygon points="${solidPoints}" fill="black" />`)
        break
      case 'ELLIPSE':
        const rx = entity.majorAxisEndPoint.x
        const ry = entity.majorAxisEndPoint.y
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
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -2000 2500 2000">${svgElements.join('')}</svg>`
}