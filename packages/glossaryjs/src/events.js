class Events {
  constructor () {
    this.listeners = []
  }
  addEventListener (element, ...args) {
    this.listeners.push([element, args])
    element.addEventListener(...args)
  }

  removeAllListeners () {
    for (const x of this.listeners) {
      x[0].removeEventListener(...x[1])
    }
    this.listeners = []
  }
}

export default new Events()

