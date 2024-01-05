/*
 * Vertraulich
 */

import JsCookie from 'js-cookie'
let Cookies = JsCookie
if (!Cookies) {
  Cookies = window.Cookies
}

let safeMethods = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE'])

export default class GlossaryAPIBase {
  getLoggedInUser () {
    /* The default implementation returns {}. */
    return new Promise(resolve => resolve({}))
  }

  _ajaxPATCH (url, options, payload) {
    return this._ajax(url, 'PATCH', options, payload)
  }

  _ajaxPOST (url, options, payload) {
    return this._ajax(url, 'POST', options, payload)
  }

  _ajaxGET (url, options) {
    return this._ajax(url, 'GET', options, null)
  }

  _ajaxDELETE (url, options) {
    return this._ajax(url, 'DELETE', options, null)
  }

  _ajax (url, method, optionData, payload) {
    return new Promise((resolve, reject) => {
      let xhr = new window.XMLHttpRequest()
      const options = optionData.options
      if (options && options.params) {
        let params = options.params
        let first = true
        for (let key in params) {
          if (params.hasOwnProperty(key)) {
            let value = params[key]
            let p = first ? '?' : '&'
            url += `${p}${key}=${value}`
            if (first) first = false
          }
        }
      }
      xhr.open(method, url, true)
      if (options && options.headers) {
        let headers = options.headers
        for (let key in headers) {
          xhr.setRequestHeader(key, headers[key])
        }
        if (!safeMethods.has(method)) {
          const csrftoken = Cookies.get('csrftoken')
          if (csrftoken) {
            xhr.setRequestHeader('X-CSRFToken', csrftoken)
          }
        }
      } else {
        xhr.setRequestHeader('Accept', 'application/json')
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
        if (!safeMethods.has(method)) {
          const csrftoken = Cookies.get('csrftoken')
          if (csrftoken) {
            xhr.setRequestHeader('X-CSRFToken', csrftoken)
          }
        }
      }

      if (options.options && options.options.withCredentials) {
        // send session cookies in cross domain requests.
        xhr.withCredentials = true
      }

      xhr.onload = () => {
        if (xhr.status === 204) {
          resolve('None')
        } else if (xhr.status >= 200 && xhr.status < 400) {
          try {
            let response = JSON.parse(xhr.response)
            if (Object.keys(response).length === 0) {
              reject(new Error('empty response from server'))
            } else {
              resolve(response)
            }
            return
          } catch (e) {
            console.error('error parsing response', xhr.response, e)
            reject(e)
          }
        } else {
          if (xhr.status >= 400 && xhr.status < 500) {
            let errorMessage
            try {
              errorMessage = JSON.parse(xhr.response)
            } catch (e) {
              errorMessage = xhr.response
            } finally {
              const error = new Error(xhr.status)
              error.info = errorMessage
              reject(error)
            }
          } else {
            console.error('Unknown response from server:',
                          {status: xhr.status, response: xhr.response}
            )
            reject(new Error('Unknown response from server'))
          }
        }
      }
      xhr.onerror = error => {
        console.error('Error in contacting server:', error)
        reject(new Error('Error in contacting server'))
      }

      if (payload) {
        payload = JSON.stringify(payload)
      }
      xhr.send(payload)
    })
    .then(response => {
      if (!response ||
          (Array.isArray(response) && response.length === 0) ||
          Object.keys(response).length === 0 ||
          response.error) {
        throw response
      } else {
        return response
      }
    })
  }

  getUrlParams (url) {
    let elem = document.createElement('a')
    elem.href = url
    let _match
    let pl = /\+/g  // Regex for replacing addition symbol with a space
    let _search = /([^&=]+)=?([^&]*)/g
    let _decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')) }
    let _query = elem.search.substring(1)
    let urlParams = {}
    _match = _search.exec(_query)
    while (_match) {
      urlParams[_decode(_match[1])] = _decode(_match[2])
      _match = _search.exec(_query)
    }
    return urlParams
  }
}
