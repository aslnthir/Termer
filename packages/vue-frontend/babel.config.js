module.exports = {
  // Workaround for error:
  // TypeError: assign to read only property 'exports' of object '#<Object>'
  // (see https://github.com/Kitware/vtk-js/issues/993#issuecomment-457928634)
  // ignore: [/\/core-js/],
  presets: [
    ['@vue/app']
  ]
}
