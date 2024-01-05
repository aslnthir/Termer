// <license>
//   Vertraulich
// </license>

import eventBus from '../eventbus'
import ckeditorConfig from './ckeditor-config.js'

export default {
  name: null,
  props: ['value'],
  data () {
    return {
      // ckeditorURL: 'https://cdn.ckeditor.com/ckeditor5/11.0.1/inline/ckeditor.js',
      ckeditorURL: '//cdn.ckeditor.com/4.10.0/standard-all/ckeditor.js',
      // editorName: 'InlineEditor',
      editorName: 'CKEDITOR',
      editor: null,
      contents: this.value,
      ckeditorConfig
    }
  },
  created () {
    this.injectScript().then(() => this.createEditor())
  },

  beforeDestroy () {
    if (!this.editor) {
      return
    }
    this.editor.focusManager.blur(true)
    this.editor.removeAllListeners()
    // Throws a harmless error in the console due to bug in ckeditor.
    // (“Uncaught TypeError: Cannot read property 'getRanges' of null”)
    // May also warn: “Error code: editor-destroy-iframe.”
    this.editor.destroy()
    this.editor = null
  },

  methods: {
    onInput () {
      // Can’t be trusted in ckeditor5, does not fire on text deletion. (ckeditor5 11.0.1)
      this.$emit('input', this.editor.getData())
    },
    onCut () {
      // forward to onInput, after the text has been pasted
      setTimeout(() => this.onInput(...arguments), 40)
    },
    onPaste () {
      // forward to onInput, after the text has been pasted
      setTimeout(() => this.onInput(...arguments), 40)
    },
    onBlur () {
      this.$emit('save', this.editor.getData())
    },

    async injectScript () {
      const theScript = document.querySelector('script[src$="ckeditor.js"]')
      if (!theScript) {
        const s = document.createElement('script')
        s.src = this.ckeditorURL
        document.head.appendChild(s)
      }

      /* After the script has been inserted, we must wait for the constructor
       * to become available.
       */

      const self = this
      const promise = new Promise(resolve => {
        function waitForCkeditor () {
          if (window[self.editorName]) {
            window[self.editorName].disableAutoInline = true
            resolve()
          } else {
            setTimeout(waitForCkeditor, 10)
          }
        }
        setTimeout(waitForCkeditor, 0)
      })
      return promise
    },

    async createEditor () {
      const editor = window[this.editorName][this.constructorName](
        this.$el.querySelector('.editable'),
        this.ckeditorConfig
      )
      this.editor = editor
      editor.on('instanceReady', evt => {
        // when the instance appears, request a resize.
        eventBus.$emit('requestResize')
        editor.on('change', this.onInput)
        editor.on('blur', this.onBlur)
      })
      return editor
    }
  }
}
