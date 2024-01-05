<license>
  Vertraulich
</license>

<template>
<div name="sharedUsers" class="tripleContainer fullWidth">
  <table>
  <tr>
    <th>User</th>
    <th>Write Access</th>
    <th>Remove</th>
  </tr>
  <tr v-for="user in sharedUsers" :key="user.id">
    <td><span>{{ user.name }}</span></td>
    <td><input type="checkbox" :value="user.id" @click="changeWriteAccess" :checked="user.write_access" /></td>
    <td><button @click=removeSharedUser(user.id)>{{ $t('Remove') }}</button></td>
  </tr>
  </table>
</div>
</template>

<script>

export default {
  name: 'shareGlossary',
  props: [],
  data () {
    return {
      endpoint: 'sharesource/',
      sharedUsers: []
    }
  },
  computed: {
    GlossaryAPI () {
      return this.$store.getters.GlossaryAPI
    },
    apiURL () {
      return this.GlossaryAPI.endpointURL + this.endpoint
    },
    sourceID () {
      return this.$route.params.glossary
    },
    token () {
      return document.getElementsByName('csrfmiddlewaretoken')[0].value
    }
  },
  created: function () {
    this.getSharedUsers()
    window.eventBus.$on('newUserAdded', this.getSharedUsers)
  },
  components: {
  },
  mounted () {
  },
  events: {
    'update-shared-users': function () {
      this.getSharedUsers()
    }
  },
  methods: {
    changeWriteAccess (e) {
      const data = { write_access: this.target.checked }
      this.GlossaryAPI.updateSharedAccess(e.target.value, data)
    },
    getSharedUsers () {
      this.GlossaryAPI.getSharedAccessList({})
        .then(response => {
          this.sharedUsers = response.results
        })
    },
    removeSharedUser (id) {
      this.GlossaryAPI.deleteSharedAccess(id)
        .then(response => {
          this.getSharedUsers()
        })
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.sharedUser
  border: 1px solid #ccc
  border-radius: 16px
  min-height: 39px
.halfSpaceing
  display: inline-block
  width: 48%
.quaterSpaceing
  display: inline-block
  width: 25%
.tripleContainer
  display: flex
.fullWidth
  width: 100%
.minSize
  min-width: 200px
.min52Width
  min-width: 60px
.min25Width
  min-width: 25px
li
  list-style-type: none
ul
  margin: 0px
</style>
    }
