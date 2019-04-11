(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/home/serapath/Desktop/dev/code/@registry/repo/url-registry/demo/demo.js":[function(require,module,exports){
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

},{"../":"/home/serapath/Desktop/dev/code/@registry/repo/url-registry/src/url-registry.js"}],"/home/serapath/Desktop/dev/code/@registry/repo/url-registry/src/url-registry.js":[function(require,module,exports){
const _cors = url => `https://cors-anywhere.herokuapp.com/${url}`
const _postURL = id => `http://ptsv2.com/t/${id}/post`
const _get_registryURL = id => `http://ptsv2.com/t/${id}`
const _parse_index = async (content) => {
  parse.innerHTML = ['<table>', content.split('tbody>')[1], 'table>'].join('')
  const urls = [...parse.children[0].querySelectorAll('tr')]
    .filter(tr => tr.children.length > 2)
    .map(x=>x.children[x.children.length - 1].children[0].getAttribute('href'))
    .map(path => `https://ptsv2.com${path}/json`)
  return urls
}
const _extract_data = async (json) => {
  const {
    Timestamp: timestamp,
    Headers: { Origin: [origin], Referer: [url] },
    Body: data
  } = JSON.parse(json)
  return { meta: { timestamp, origin, url }, data }
}
const _validize = (item, ttl) => {
  if (!item) return []
  var { data, timestamp } = JSON.parse(item)
  const diff = (Date.now() - parseInt(timestamp, 10)) / ttl
  if (diff > 1) return []
  return [data]
}
const _ajax_cache_post = async (href, { url, value }, ttl, cache) => {
  // @NOTE: the current USER can't be identified
  // @NOTE: the current PAGE is the same if multiple ppl open it
  // @NOTE: if the current `url`, `value` pair is locally stored is already checked
  // => send request, because if code execution comes here, all has been done
  //    already to prevent double sends
  return await fetch(_cors(href), {
    method: 'post', body: JSON.stringify({ url, value })
  }).then(async res => ({ status: res.status, text: await res.text() }))
}
const _ajax_cache_get = async (url, transform, ttl, registry_url, cache) => {
  if (cache) {
    const content = _validize(localStorage[url], ttl)
    if (content.length) return content[0]
  }
  if (url === registry_url) {
    // @NOTE: STATUS: item_url stored + stored registry_url entries updated,
    // AND if not 'registry_url' then NO RISK OF localStorage LEAK or overwrites,
    // BUT:
    // => if `registry_url` and page refreshes cache, then:
    //    => remote URLS will nicely overwrite stored registry_url entries
    //    => new remote item url will be included
    //    => validkv will not include temporary URLs anymore
    //    => ...but localStorage will still have outdated temporary entries

    // @NOTE - ... set flag to remove temporary entries somehow ...
    // because temporary_entries from PUTs have been added and will only
    // overwrite if the code execution reaches THIS LINE of code
    // ...which is fine, because the REMOTE contains replacements
    // ...just delete the TEMPORARY ONES BEFORE!!!

    // SOLUTION: before continuing to UPDATE `registry_url` cache,
    // => search and remove all `temporary_` addresses
    var all_urls
    try {
      all_urls = JSON.parse(localStorage[registry_url]).data || []
      const temporary = all_urls.filter(url => url.startsWith('temporary_'))
      temporary.forEach(url => localStorage.removeItem(url))
    } catch (e) { }
  }
  const data = await transform(await fetch(_cors(url)).then(x => x.text()))
  const timestamp = Date.now()
  localStorage[url] = JSON.stringify({ data, timestamp })
  return data
}
const _isURL = (url = '') => {
  const href = url.split('#')[0].split('?')[0]
  check.value = href
  if (check.validity.valid) {
    var a = document.createElement('a')
    a.setAttribute('href', url)
    const href = a.href
    const islocalhost = href.includes('//localhost')
    || href.startsWith('localhost')
    || href.includes('//127.0.0.1') || href.includes('//0.0.0.0')
    || href.includes('//10.0.0') || href.includes('//192.168')
    || href.includes('//172.')
    if (islocalhost) return
    return true
  }
}
const parse = document.createElement('div')
const check = ((parse.innerHTML = `<input type="url">`), parse.children[0])
const absoluteURLregex = /(?:^[a-z][a-z0-9+.-]*:|\/\/)/
// @NOTE: update `data` only after `ttl` has passed
const default_ttl = 1000 * 3600 /* = 1 hour */

module.exports = registry

async function registry (name, validate, ttl = default_ttl) {
  if (!name || typeof name !== 'string') throw new Error('`name` is not a string')
  if (!validate || typeof validate !== 'function') throw new Error('`validate` is not a function')
  const registry_url = _get_registryURL(name)
  const validkv = {}
  var valid = []
  var last_update
  var _lists = []
  var _gets = []
  var _puts = []
  setTimeout(update, 0)
  const api = Object.freeze({
    list: async (cache = true) => new Promise(resolve => {
      if (_lists) return _lists.push(resolve)
      if (!cache || !_validize(last_update, ttl).length) {
        _gets = []
        _lists = [resolve]
        return setTimeout(update, 0, cache)
      }
      resolve(Object.entries(validkv).map(x => x[0]))
    }),
    get: async (url, cache = true) => new Promise((resolve, reject) => {
      if (!_isURL(url)) {
        console.error('invalid url - [put] `url`', url)
        return reject(new Error('`url` must be a valid fully specified non-localhost absolute url'))
      }
      if (_gets) return _gets.push([url, resolve])
      if (!cache && !_validize(last_update, ttl).length) {
        _lists = []
        _gets = [[url, resolve]]
        return setTimeout(update, 0, cache)
      }
      resolve(validkv[url])
    }),
    put: async (url, value = '{}', cache = true) => new Promise((resolve, reject) => {
      if (!_isURL(location.href)) {
        console.error('not allowed to publish from `location.origin`', location.href)
        return reject(new Error('`location.href` must be a valid fully specified non-localhost absolute url'))
      }
      if (!_isURL(url)) {
        console.error('invalid url - [put] `url`', url)
        return reject(new Error('`url` must be a valid fully specified non-localhost absolute url'))
      }
      if (!value || typeof value !== 'string' || !validate({ url, value })) {
        console.error('invalid string - [put] `value`', value)
        return reject(new Error('`value` must be a valid string - `validate(value) === true`'))
      }
      if (_lists) return _puts.push([url, value, resolve, reject, cache])
      if (!cache || !_validize(last_update, ttl).length) {
        _lists = []
        _gets = []
        _puts = [[url, value, resolve, reject, false]]
        return setTimeout(update, 0, cache)
      }
      push([url, value, resolve, reject, cache])
    })
  })
  return api
  async function push ([url, value, resolve, reject, cache]) {
    var val = await api.get(url)
    if (val !== undefined) return resolve(false) // @TODO: how can a client update ever?
    const href = _postURL(name)
    try {
      // @NOTE: INVARIANTS:
      // 1. not in local cache from a PUT by current user
      //    (that would have added it locally)
      // 2. not in local cache from a PULL within the `ttl`
      //    => so PUBLISH IT
      const response = await _ajax_cache_post(href, { url, value }, ttl)
      if (response.status === 200) {
        // IF SUCCESSFULLY ADDED, then CACHE LOCALLY TOO!
        // 1. db.put(new entry)
        // 2. lookup entry - if it exists in cache, dont POST
        // 3. if it doesnt exist in cache, maybe it exists already remote
        //    1. maybe another user visited the page and already "pulished" it
        //       (that is only possible within the `ttl` of the last update)
        //       => mitigation: reduce `ttl`
        //       ACTION: just POST it again (it will get filtered out)
        //               => if new workshops get published multiple times, reduce `default_ttl`
        //    2. maybe the current user visited the page and refreshes
        //       (that can easily happen, so the cache should be aware of a PUT)
        //       => the first PUT already added it remote, so the next non-cache GET will get it
        //       => the first PUT SHOULD update just the local CACHE
        //       ACTION: update local cache manually!!!

        // @NOTE: update memory and cache temporarily until next remote update
        validkv[url] = value
        const timestamp = Date.now() // Infinity?
        const item_url = `temporary_${('' + Math.random()).substring(2)}`
        const item = { data: JSON.stringify({ url, value }) }
        localStorage[item_url] = JSON.stringify({ data: item, timestamp })
        const ALL = JSON.parse(localStorage[registry_url])
        ALL.data.push(item_url)
        localStorage[registry_url] = JSON.stringify(ALL)
        return resolve(true)
      } else return reject(response)
    } catch (err) {
      reject(err)
    }
  }
  async function update (cache = true) {
    valid = []
    const reqs = []
    const invalid = []
    try {
      const url_keys = await _ajax_cache_get(registry_url, _parse_index, ttl, registry_url, cache)
      for (var i = 0, len = url_keys.length; i < len; i++) {
        reqs.push(_ajax_cache_get(url_keys[i], _extract_data, Infinity, registry_url, cache))
      }
      const all = await Promise.all(reqs)
      last_update = JSON.stringify({ timestamp: Date.now() })
      for (var i = len; i; i--) {
        const { data, meta } = all[i - 1]
        var json
        try {
          json = JSON.parse(data)
        } catch (e) {
          json = {}
        }
        const isPublicURL = _isURL((meta || {}).url)
        const isvalid = isPublicURL && validate(json, meta)
        if (isvalid) valid.push({ data: json, meta })
        else invalid.push({ data: json, meta })
      }
      const spam = invalid.length
      if (spam) console.error(`registry contains ${spam} SPAM item(s)`, invalid)
      valid.forEach(({ data: { url, value }, meta }) => (validkv[url] = value))
      _lists.forEach(resolve => resolve(Object.entries(validkv).map(x => x[0])))
      _lists = void 0
      _gets.forEach(([url, resolve]) => resolve(validkv[url]))
      _gets = void 0
      _puts.map(args => [...args, cache]).forEach(push)
      _puts = []
      // @NOTE: complete cache update is done
    } catch (e) {
      console.error('UPDATE error', e)
    }
  }
}

},{}]},{},["/home/serapath/Desktop/dev/code/@registry/repo/url-registry/demo/demo.js"]);
