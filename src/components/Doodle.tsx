'use client';
import 'css-doodle' // https://github.com/css-doodle/css-doodle
import LazyLoad from 'react-lazy-load'

interface DoodleProps {
  className: string
  rule: string
  doodleStyle?: string
}

export const Doodle = ({className, rule, doodleStyle = ''}: DoodleProps) => {
  const doodle = {__html: `<css-doodle style=${doodleStyle}>${rule}</css-doodle>`}
  return (
    <LazyLoad>
      <div className={className} dangerouslySetInnerHTML={doodle} />
    </LazyLoad>
  )
};
