() => [{
  user: 'polytypic',
  project: 'fastener',
  scripts: [
    'https://unpkg.com/babel-polyfill/dist/polyfill.min.js',
    'infestines.js',
    'fastener.js',
    'https://unpkg.com/ramda/dist/ramda.min.js'
  ],
  source: 'README.md',
  target: 'index.html',
  title: 'Fastener',
  stripComments: true,
  constToVar: true,
  menu: true,
  tooltips: true
}]
