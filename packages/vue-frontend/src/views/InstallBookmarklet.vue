<license>
  Vertraulich
</license>

<template>
<div id="install-addon-view" class="content">
  <div class="box1">
    <BookmarkletInstallation />
  </div>
</div>
</template>

<script>
import BookmarkletInstallation from '@/components/BookmarkletInstallation'

export default {
  name: 'installBookmarklet',
  components: {
    BookmarkletInstallation
  },
  metaInfo () {
    return {
      title: this.$t('Install Bookmarklet')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.content
  margin-top: 2em

.box1
  padding: 1.5em
  background: var(--information-box-color)
  border: solid thin
  border-radius: 1em
  margin: 0 auto
  max-width: 20rem
</style>
