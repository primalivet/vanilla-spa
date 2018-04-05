const http = require('http')
const url = require('url')

const PORT = 8001

const Left = x => ({
  map: f => Left(x),
  fold: (f, g) => x,
  inspect: () => `Left(${x})`
})

const Right = x => ({
  map: f => Right(f(x)),
  fold: (f, g) => g(x),
  inspect: () => `Right(${x})`
})

const fromNullable = x => x === undefined || x === null ? Left(x) : Right(x)

const apply = (x, f) => f(x)

const compose = (...fs) => x => fs.reduceRight(apply, x)

const prop = k => o => o[k]

const parsePath = x => x.split('/').filter(y => y !== '')
const parseQuery = x => x.split('&').map(y => y.split('='))

const split = x => ys => ys.split(x)
const filter = x => ys => ys.filter(x)

const notEmptyString = x => x !== ''

const getPath = compose(fromNullable, prop('pathname'), url.parse)
const getQuery = compose(fromNullable, prop('query'), url.parse)

http.createServer((req, res) => {
  // ignore favicon requests for now
  if (req.url === '/favicon.ico') return res.end()

  const path = getPath(req.url)
    .map(split('/'))
    .map(filter(notEmptyString))
    .fold(x => x, x => x)

  const query = getQuery(req.url)
    .map(split('&'))
    .map(x => x.map(split('=')))
    .fold(x => x, x => x)

  res.setHeader('Content-Type', 'application/json')

  switch(path[0]) {
    case 'hello':
      res.write(JSON.stringify({ hello: 'world'}))
      break;
    default:
      res.write(JSON.stringify({ you: 'leave' }))
      break;
  }

  res.end()
}).listen(PORT)

console.log(`Server running on port: ${PORT}`)
