/*
 * Vertraulich
 */

// Taken from:
// http://stackoverflow.com/questions/37588326/reliabilty-of-isconnected-field-in-dom-node
// Checks if node is part of document.

(function (supported) {
  if (supported) return
  Object.defineProperty(window.Node.prototype, 'isConnected', { get })
  function get () {
    return inDocument(this)
  }
})('isConnected' in window.Node.prototype)

// Taken from:
// http://stackoverflow.com/questions/2620111/javascript-how-to-tell-if-a-node-object-has-been-inserted-into-a-document-anoth
//
// Checks if node is inside the document.
function inDocument (node) {
  var curr = node
  while (curr != null) {
    curr = curr.parentNode
    if (curr === document) return true
  }
  return false
}
