<license>
  Vertraulich
</license>

<template>
  <div>
    <keep-alive>
      <textarea
          class="editable"
          v-html="value"
      ></textarea>
    </keep-alive>
  </div>
</template>

<script>
import EditorMixin from './EditorMixin.js'

export default {
  name: 'editor-box',
  data () {
    return {
      constructorName: 'replace'
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
</style>
