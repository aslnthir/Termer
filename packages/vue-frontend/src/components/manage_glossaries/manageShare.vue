<license>
  Vertraulich
</license>

<template>
<div>
  <div v-if="glossarySource.sharePremission">
  </div>
  <div>
    <div>
      <h1>{{ $t('Share with users') }}</h1>
      <div>
        <table class="fullWidth">
          <tr>
            <th class="textLeft">
              <span :title="$t('Usernames of the different users')">{{ $t('Users') }}</span>
            </th>
            <th>
              <span :title="$t('Share glossary with user')">{{ $t('Read') }}</span>
            </th>
            <th>
              <span :title="$t('Give user read and write access')">{{ $t('Write') }}</span>
            </th>
          </tr>
          <add-contact-field v-for="user in combinedData" :user="user" :key="user.id" :sharedUsers="sharedUsers" :glossary="sourceID"></add-contact-field>
        </table>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import addContactField from './addContactField'

import Vue from 'vue'
window.eventBus = new Vue()

export default {
  name: 'shareGlossary',
  props: ['sourceID'],
  data () {
    return {
      sourceName: 'No name given',
      glossarySource: {},
      ownerOfGlossary: false,
      numberOfFields: 1,
      numberOfEmpty: 1,
      endpoint: 'sharesource/',
      showContact: false,
      contactButton: 'Show Contacts',
      userButton: 'Find new users to add',
      userContactList: [],
      sharedUsers: [],
      combinedData: []
    }
  },
  computed: {
    GlossaryAPI () {
      return this.$store.getters.GlossaryAPI
    },
    sourceParam () {
      return { source: this.sourceID }
    },
    userParams () {
      return { ordering: 'username' }
    }
  },
  created: function () {
    this.getSource()
    this.getSharedUsers(this.sourceParam)
  },
  components: {
    addContactField
  },
  mounted () {
  },
  events: {
  },
  methods: {
    checkInoutNumber () {
      const inputElements = document.getElementsByName('userNameField')
      for (let i = 0; i < inputElements.length; i++) {
        // console.log(inputElements[i])
      }
    },
    updateFromChild (e) {
      if (!e.status && this.numberOfEmpty <= 1) {
        this.numberOfFields += 1
      } else if (e.status) {
        this.numberOfEmpty += 1
      } else if (!e.status && this.numberOfEmpty > 1) {
        this.numberOfEmpty -= 1
      }
    },
    combineData () {
      for (let i = 0; i < this.userContactList.length; i++) {
        // console.log(this.userContactList[i])
        let found = false
        for (let l = 0; l < this.sharedUsers.length; l++) {
          if (this.userContactList[i].id === this.sharedUsers[l].user) {
            const newSharedUser = this.userContactList[i]
            newSharedUser.write_access = this.sharedUsers[l].write_access
            newSharedUser.shared_id = this.sharedUsers[l].id
            this.combinedData.push(newSharedUser)
            found = true
            continue
          }
        }
        if (!found) {
          const newSharedUser = this.userContactList[i]
          newSharedUser.write_access = false
          newSharedUser.shared_id = null
          this.combinedData.push(newSharedUser)
        }
      }
    },
    changeView (e) {
      // console.log(e.target)
      if (this.showContact) {
        e.target.innerHTML = this.$t(this.contactButton)
      } else {
        e.target.innerHTML = this.$t(this.userButton)
      }
      this.showContact = !this.showContact
    },
    getSource () {
      this.GlossaryAPI.getSource(this.sourceID)
        .then(response => {
          this.glossarySource = response
        })
    },
    getContactList (params = {}) {
      this.GlossaryAPI.getUserList(params)
        .then(response => {
          this.userContactList = this.userContactList.concat(response.results)
          if (response.next) {
            this.getContactList(this.getURLparams(response.next))
          } else {
            this.combineData()
          }
        })
    },
    getURLparams (url) {
      const params = new URL(url).search.substring(1)
      return JSON.parse('{"' + decodeURI(params).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
    },
    getSharedUsers (params = {}) {
      this.GlossaryAPI.getSharedAccessList(params)
        .then(response => {
          this.sharedUsers = this.sharedUsers.concat(response.results)
          if (response.next) {
            this.getSharedUsers(this.getURLparams(response.next))
          } else {
            this.getContactList(this.userParams)
          }
        })
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.halfSpaceing
  display: inline-block
  width: 47%
.quaterSpaceing
  display: inline-block
  min-width: 42px
  width: 25%
.tripleContainer
  display: flex
.fullWidth
  width: 100%
.padding
  padding-left: 50px
.textLeft
  text-align: left
table
  margin: auto
</style>
    }
