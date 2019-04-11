const registry = require('../')

const name = `5shh5s3a45a3`
const validate = ({ url, value }, meta) => {
  if (typeof url === 'string') return true
  // @TODO: check that the "URL" actually makes sense - otherwise, filter it out
  // @TODO: design or update `url-registry` so that data is always bound the URL
  // which issues the `put` command and if that url (=location.href) is illegal
  // don't make the request! - ...maybe allow disabeling via `validate(...)` ?
}

;(async () => {
  if (await tests()) var db = await run(await registry(name, validate))
  const urls = [
    '//google.com',
    'google.com',
    'localhost:8000',
    'https://localhost:8000',
    'https://127.0.0.1/foobar',
    'https://10.0.0.8/foobar',
    'https://192.168.3.45/foobar',
    '//0.0.0.0/foobar',
    '0.0.0.0/foobar',
    './foo/bar.html'
  ]
  urls.forEach(async (url) => {
    try {
      await db.put(url)
    } catch (e) {
      console.error(e)
    }
  })
  debugger
  const response = await db.put('https://ethereum-play.github.io/workshop-solidity/fooc')
  run(db)
  console.log('DEMO: db.put()', response)
})()

async function run (db) {
  const urls = await db.list()
  console.log('DEMO: db.list()', urls)
  try {
    const data = await Promise.all(urls.map(async key => ({ key, value: await db.get(key) })))
    console.log('DEMO: all db.get()', data)
    document.body.innerHTML = `<pre>${
      data.map(x => JSON.stringify(x, 0, 2)).join('\n')
    }</pre>`
  } catch (e) {
    console.error('DEMO: ERROR', e)
  }
  return db
}

async function tests () {
  if (await reg()) return
  if (await reg({})) return
  if (await reg(name)) return
  if (await reg(name, {})) return
  return true
}
async function reg (name, validate) {
  try {
    var db = await registry(name, validate)
  } catch (e) {
    return console.error(e)
  }
  return db
}
