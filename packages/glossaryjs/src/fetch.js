// Same type as window.fetch
if (!('fetch' in window)) {
  window.fetch = async function (input, init) {
    const { fetch } = await import('whatwg-fetch')
    return fetch(input, init)
  }
}
