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
          <add-contact-field v-for="user in combinedData" :user="user" :key="user.id" :sharedUsers="sharedUsers"></add-contact-field>
        </table>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import addContactField from '@/components/manage_glossaries/addContactField'

import Vue from 'vue'
window.eventBus = new Vue()

export default {
  name: 'shareGlossary',
  data () {
    return {
      sourceName: 'No name given',
      glossarySource: {},
      ownerOfGlossary: false,
      numberOfFields: 1,
      numberOfEmpty: 1,
      endpoint: 'sharesource/',
      showContact: false,
      contactButton: this.$t('Show Contacts'),
      userButton: this.$t('Find new users to add'),
      userContactList: [],
      sharedUsers: [],
      combinedData: []
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
    userParams () {
      return { ordering: 'username' }
    },
    shareParams () {
      return { source: this.sourceID }
    }
  },
  created: function () {
    this.getSource()
    this.getSharedUsers()
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
        e.target.innerHTML = this.contactButton
      } else {
        e.target.innerHTML = this.userButton
      }
      this.showContact = !this.showContact
    },
    getSource () {
      this.GlossaryAPI.getSource(this.sourceID)
        .then(response => {
          this.glossarySource = response
        })
    },
    getContactList (params = this.userParams) {
      this.GlossaryAPI.getUserList(this.userParams)
        .then(response => {
          this.userContactList = this.userContactList.concat(response.results)
          if (response.next) {
            this.getContactList(this.getURLparams(response.next))
          } else {
            this.combineData()
          }
        })
    },
    getSharedUsers (params = this.shareParams) {
      this.GlossaryAPI.getSharedAccessList(params)
        .then(response => {
          this.sharedUsers = this.sharedUsers.concat(response)
          if (response.next) {
            this.getSharedUsers(this.getURLparams(response.next))
          } else {
            this.getContactList()
          }
        })
    },
    getURLparams (url) {
      const params = new URL(url).search.substring(1)
      return JSON.parse('{"' + decodeURI(params).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.halfSpaceing
  display: inline-block;
  width: 47%;
.quaterSpaceing
  display: inline-block;
  min-width: 42px;
  width: 25%;
.tripleContainer
  display: flex;
.fullWidth
  width: 100%
.padding
  padding-left: 50px;
.textLeft
  text-align: left;
table
  margin: auto;
</style>
    }
