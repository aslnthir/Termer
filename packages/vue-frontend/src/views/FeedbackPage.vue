<license>
  Vertraulich
</license>

<template>
  <div class="content">
    <h1>{{ $t('User feedback') }}</h1>
    <table>
      <tr class="tableRows">
        <th :title="idTitle">
          {{ $t('No.') }}
        </th>
        <th :title="feedbackTitle">
          {{ $t('Feedback') }}
        </th>
        <th :title="timeTitle">
          {{ $t('Time') }}
        </th>
        <th :title="webpageTitle">
          {{ $t('From page') }}
        </th>
      </tr>
      <tr v-for="item in orderByDate" :key="item.id" class="tableRows">
        <td>{{item.id}}</td>
        <td>{{item.comment}}</td>
        <td>{{item.date_created}}</td>
        <td>{{decodeURI(item.webpage_reported)}}</td>
      </tr>
    </table>
  </div>
</template>

<script>

export default {
  name: 'feedbackPage',
  data () {
    return {
      idTitle: this.$t('Issue number'),
      feedbackTitle: this.$t(' Feedback from users'),
      timeTitle: this.$t('Time stamp for feedback'),
      webpageTitle: this.$t('URL from where the feedback has been sent'),
      feedbackList: []
    }
  },
  created () {
    // fetch('http://127.0.0.1:8000/api/FeedbackReport/?domain=localhost:3002')
    fetch('https://tallgrafikk.tingtun.no/api/FeedbackReport/?domain=' + window.location.host)
      .then(response => response.json())
      .then(data => { this.feedbackList = data })
  },
  components: {
  },
  computed: {
    backUrl () {
      if (this.$route.query.back) return decodeURIComponent(this.$route.query.back)
      return false
    },
    orderByDate () {
      return [...this.feedbackList].sort((a, b) => {
        if (new Date(a.date_created) < new Date(b.date_created)) return 1
        else return -1
      })
    }
  },
  metaInfo () {
    return {
      title: this.$t('User Feedback')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.content
  padding: 1em
  background: var(--information-box-color)
  border: solid thin
  border-radius: 1em
  max-width: Max(30em, 55%)
  margin: auto
  margin-top: 2em

table
  width: 100%
  table-layout: fixed
  border-collapse: collapse

td, th
  width: 25%
  border: 1px black solid
  word-wrap: break-word
</style>
