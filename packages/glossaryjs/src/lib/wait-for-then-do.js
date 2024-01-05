export default function waitForThenDo (test, act, win) {
  win = win || window
  // 16ms corresponds to about once every frame (at 60 FPS).
  const interval = win.setInterval(fun, 16)
  function fun () {
    let result = false
    try {
      result = test()
    } catch (e) {
      // Abort in case of errors
      console.error(e)
      result = true
    } finally {
      if (result) {
        win.clearInterval(interval)
        act()
      }
    }
  }
}
