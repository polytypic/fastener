'use strict';

const I = require("infestines")
const F = require("../dist/fastener.min")
const sprintf = require("sprintf-js").sprintf

const inc = x => typeof x === "number" ? x + 1 : x

const nested = [{x:1,y:[2,{d:3},4],z:{a:5}}]
const vs10 = Array(10).fill(1)
const vs100 = Array(100).fill(1)
const vs1000 = Array(1000).fill(1)

const z0y1d = I.seq(nested,
                    F.toZipper,
                    F.downPath([0, "y", 1, "d"]))

const z0y = I.seq(nested,
                  F.toZipper,
                  F.downPath([0, "y"]))

const Benchmark = require("benchmark")
Benchmark.options.maxTime = Number(process.argv[2]) || Benchmark.options.maxTime

;[
  [
    'F.pathOf(z0y)',
  ], [
    'F.pathOf(z0y1d)',
  ], [
    'F.fromZipper(F.everywhere(inc, F.toZipper(nested)))',
  ], [
    'F.fromZipper(F.everywhere(inc, F.toZipper(vs10)))',
  ], [
    'F.fromZipper(F.everywhere(inc, F.toZipper(vs100)))',
  ], [
    'F.fromZipper(F.everywhere(inc, F.toZipper(vs1000)))',
  ]
].forEach(bs => {
  global.gc()
  const s = new Benchmark.Suite()
  bs.reverse().forEach(b => {
    b = b.replace(/[ \n]+/g, " ")
    s.add(b, eval("() => " + b))
  })
  s.on('complete', complete)
  s.run()
})

function complete() {
  const bs = I.values(this)
     .filter(x => x instanceof Benchmark)
     .sort((l, r) => l.hz < r.hz ? 1 : l.hz > r.hz ? -1 : 0)
  const fastest = bs.map(x => x.hz).reduce((x, y) => Math.max(x, y), 0)
  bs.forEach(b => {
    console.log(sprintf('%12s/s %7.2fx  %s',
                        Math.round(b.hz).toLocaleString(),
                        fastest/b.hz, b.name))
  })
  console.log()
}
