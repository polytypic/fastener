'use strict';

const I = require("infestines")
const F = require("../lib/fastener")
const R = require("ramda")
const sprintf = require("sprintf-js").sprintf

const inc = x => typeof x === "number" ? x + 1 : x

const nested = [{x:1,y:[2,{d:3},4],z:{a:5}}]
const vs10 = Array(10).fill(1)
const vs100 = Array(100).fill(1)
const vs1000 = Array(1000).fill(1)

const Benchmark = require("benchmark")
Benchmark.options.maxTime = Number(process.argv[2]) || 10

R.forEach(bs => {
  global.gc()
  const s = new Benchmark.Suite()
  bs.reverse().forEach(b => {
    b = b.replace(/[ \n]+/g, " ")
    s.add(b, eval("() => " + b))
  })
  s.on('complete', complete)
  s.run()
}, [
  [
    'F.fromZipper(F.everywhere(inc, F.toZipper(nested)))',
  ], [
    'F.fromZipper(F.everywhere(inc, F.toZipper(vs10)))',
  ], [
    'F.fromZipper(F.everywhere(inc, F.toZipper(vs100)))',
  ], [
    'F.fromZipper(F.everywhere(inc, F.toZipper(vs1000)))',
  ]
])

function complete() {
  const bs = I.seq(this,
                   R.values,
                   R.filter(R.is(Benchmark)),
                   R.sortBy(R.prop("hz")),
                   R.reverse)
  const fastest = I.seq(bs,
                        R.map(R.prop("hz")),
                        R.reduce(R.max, 0))
  bs.forEach(b => {
    console.log(sprintf('%12s/s %7.2fx  %s',
                        Math.round(b.hz).toLocaleString(),
                        fastest/b.hz, b.name))
  })
  console.log()
}
