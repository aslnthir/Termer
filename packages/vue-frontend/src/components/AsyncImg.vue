<template>
  <a v-if="image.thumbnail && image.url"
     :href="image.url"
     target="_blank"
     :title="$t('Click to view full-size image')">
    <img :src="image.thumbnail" @load="loaded" />
  </a>
  <img v-else :src="image.url" @load="loaded" />
</template>

<script>
import eventBus from '../eventbus'
export default {
  props: ['url'],
  data () {
    return {
      image: {
        url: this.url,
        thumbnail: undefined
      }
    }
  },
  methods: {
    loaded () {
      eventBus.$emit('requestResize')
    }
  }
}
</script>
