export default {
  log () {
    console.log((new Date()).toISOString(), ...arguments)
  }
}
