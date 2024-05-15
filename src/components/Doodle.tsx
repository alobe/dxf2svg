'use client';
import LazyLoad from 'react-lazy-load'
import { useEffect } from 'react'

interface DoodleProps {
  className: string
  rule: string
  doodleStyle?: string
}

export const Doodle = ({className, rule, doodleStyle = ''}: DoodleProps) => {

  const doodle = {__html: `<css-doodle style=${doodleStyle}>${rule}</css-doodle>`}
  useEffect(() => {
    require('css-doodle')// https://github.com/css-doodle/css-doodle
  }, [])

  return (
    <LazyLoad>
      <div className={className} dangerouslySetInnerHTML={doodle} />
    </LazyLoad>
  )
};
