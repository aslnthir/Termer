//logger to  be used in other parts of the project
export default {
  log () {
    console.log((new Date()).toISOString(), ...arguments)
  }
}
