<license>
  Vertraulich
</license>

<template>
  <div>
    <keep-alive>
      <div
          class="editable"
          v-html="value"
          contenteditable
      ></div>
    </keep-alive>
  </div>
</template>

<script>
import EditorMixin from './EditorMixin.js'

export default {
  name: 'editor-inline',
  data () {
    return {
      constructorName: 'inline'
    }
  },
  mixins: [
    EditorMixin
  ]
}
</script>

<style lang="sass" scoped>
.editable
  display: inline-block
  min-width: 100%
</style>
