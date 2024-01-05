export default {
  log () {
    console.log((new Date()).toISOString(), ...arguments)
  },
  warn () {
    console.warn((new Date()).toISOString(), ...arguments)
  }
}
