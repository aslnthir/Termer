/*
 * Vertraulich
 */

// The URL() constructor is experimental, and not supported on Safari 6.1
// We use an <a> element as our parser instead.

export default parser

function parser (urlString) {
  if (!urlString) return null
  let parsed = document.createElement('a')
  parsed.href = urlString
  if (!parsed.origin) {
    // a.origin is not defined in IE11
    let origin = parsed.href.match(/^(https?:|http:|)\/\/[^\/]+\//g)
    if (origin && origin.length > 0) {
      parsed.origin = origin[0]
    } else {
      parsed.origin = origin
    }
  }
  // Convert query string to object
  let searchObject = {};
  let queries = parsed.search.replace(/^\?/, '').split('&');
  for(let i = 0; i < queries.length; i++ ) {
      let split = queries[i].split('=');
      searchObject[split[0]] = split[1];
  }
  parsed.searchObject = searchObject
  return parsed
}
