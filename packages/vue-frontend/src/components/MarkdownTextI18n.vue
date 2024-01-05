<template>
  <MarkdownText
    :document="document"
    :language="getLanguage"
    :site="site" />
</template>

<script>
import MarkdownText from '@/components/MarkdownText'
import { mapGetters } from 'vuex'
export default {
  props: {
    document: {
      type: String,
      required: true
    },
    site: {
      type: String,
      required: false
    }
  },
  components: {
    MarkdownText
  },
  computed: {
    ...mapGetters('Language', ['getLanguage'])
  }
}
</script>
