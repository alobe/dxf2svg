import { Doodle } from './Doodle'

export const Bg = () => {
  const str = `
    :doodle {
      @grid: 1x8 / 100vmax;
      position: absolute;
      top: -100px; left: 300px;
      z-index: 0;
    }

    width: 100%;
    height: 100%;
    position: absolute;
    transform: rotate(45deg);

    background: @m(100, (
      linear-gradient(transparent, @p(
        #54ea52@repeat(2, @p([0-9a-f])),
        #d83587@repeat(2, @p([0-9a-f])),
        #f2e15d@repeat(2, @p([0-9a-f])),
        #5d5fee@repeat(2, @p([0-9a-f])),
        #2153ee@repeat(2, @p([0-9a-f])),
        #6cf5f3@repeat(2, @p([0-9a-f]))
      ))
      @r(0%, 100%) @r(0%, 100%) /
      @r(7px) @r(23vmin)
      no-repeat
    ));

    will-change: transform;
    animation: f 10s linear calc(-10s / @size() * @i()) infinite;
    @keyframes f {
      from { transform: translateY(-100%) }
      to { transform: translateY(100%) }
    }
  `
  return (
    <div className="h-screen w-screen fixed overflow-hidden bg-black z-[-10]">
      <Doodle className="h-full overflow-hidden absolute top-0 bottom-0 left-0 right-0" rule={str} doodleStyle={`transform:rotate(45deg)translate(-25%,0);`} />
    </div>
  )
}
