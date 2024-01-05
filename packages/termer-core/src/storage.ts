import { sites } from 'site-configurations'

export class Storage {

  constructor (addHost: string | undefined) {
    if (addHost) {
      this.allowedDomains.push(addHost)
    }
    sites.forEach(siteName => {
      this.allowedDomains.push(siteName + '.termer.no')
    })
  }

  private allowedDomains: string[] = [
    'localhost',
    'glossary.tingtun.no',
    'termer.no',
    'termer.test.tingtun.no',
    'termer.x.tingtun.no'
  ]

  private domainReg: RegExp = new RegExp('termer.no$')

  public correctDomain: boolean = (this.allowedDomains.includes(
    window.location.hostname
  ) || this.domainReg.exec(window.location.hostname) !== null)

  removeKey(key: string): StorageReturnObject {
    if (this.correctDomain) {
      window.localStorage.removeItem(key)
      return {
        status: 'success',
        value: null
      }
    } else {
      return {
        status: 'error',
        value: 'Wrong domain: ' + window.location.hostname
      }
    }
  }

  storeValue(
    key: string,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    value: any,
    location: string
  ): StorageReturnObject {
    if (this.correctDomain) {
      try {
        const item = window.localStorage.getItem(key) || '{}'
        let storedValue
        try {
          storedValue = JSON.parse(item)
        } catch {
          storedValue = item
        }

        if (Array.isArray(storedValue) || typeof storedValue === 'string') {
          storedValue = {
            [location]: storedValue
          }
        }

        storedValue[location] = value
        value = JSON.stringify(storedValue)
        window.localStorage.setItem(key, value)
        return {
          status: 'success',
          value
        }
      } catch {
        return {
          status: 'error',
          value: 'Failed to store ' + value + ' in ' + key
        }
      }
    } else {
      return {
        status: 'error',
        value: 'Wrong domain: ' + window.location.hostname
      }
    }
  }

  fetchValue(key: string, location: string): StorageReturnObject {
    if (this.correctDomain) {
      let value = window.localStorage.getItem(key)
      if (value) value = this.fixFetchValues(value, location)
      if (value) {
        return {
          status: 'success',
          value: value
        }
      } else {
        return {
          status: 'nokey',
          value: key + ' do not exsist'
        }
      }
    } else {
      return {
        status: 'error',
        value: 'Wrong domain: ' + window.location.hostname
      }
    }
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  fixFetchValues(value: string, location: string): any {
    try {
      const retturnVal = JSON.parse(value)
      if (Array.isArray(retturnVal)) return retturnVal
      else return retturnVal[location]
    } catch {
      return value
    }
  }
}

interface StorageReturnObject {
  status: 'success' | 'nokey' | 'error'
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  value: any | null | undefined
}
