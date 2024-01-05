<license>
  Vertraulich
</license>

<template>
  <video
    controls="controls"
    :poster="mod"
    v-bind="{...$props, ...$attrs}"
    v-on="$listeners">
    <slot />
  </video>
</template>

<script>
export default {
  name: 'termer-video',
  props: ['posterImage'],
  data () {
    return {
      mod: ''
    }
  },
  async mounted () {
    if (this.posterImage) {
      const module = await require(
        '@/assets/' + this.posterImage
      )
      this.mod = module
    }
  }
}
</script>
