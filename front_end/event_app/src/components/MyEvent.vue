<template>
<NavBar />
  <div class="row">
    <div class="card border-0" style="width: 50rem;margin:0 auto;">
        <div class="card-body">
          <h1 class="card-title" style="text-align: center">My Event</h1>
        </div>
    </div>
  </div>

  <div>
    <h3>Events as an organizer:</h3>
  </div>
  <div class="row">
    <div class="card col-12 border-0">
      <div class="card-body">
        <table class="table">
          <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Hero Image</th>
            <th scope="col">Date</th>
            <th scope="col">Category</th>
            <th scope="col">Host</th>
            <th scope="col">Attendees</th>
            <th scope="col"></th>
            <th scope="col"></th>
          </tr>
          </thead>
          <tbody v-for="event in eventsInfo" :key="event.id">
          <tr v-if="event.hostId == userId">
            <td><router-link :to="{name: 'event', params: { eventId: event.eventId }}">{{ event.title }}</router-link></td>
            <td>
              <div v-if="event.eventImageCheck">
                <img :src="'http://localhost:4941/api/v1/events/' + event.eventId + '/image'" height="50" width="50" alt="">
              </div>
              <div v-else>
                <img src="../assets/defaultEventImage.png" height="50" width="50" alt="">
              </div>
            </td>
            <td>{{ formatDate(event.date) }}</td>
            <div class="table-responsive-sm">
              <table>
                <tr v-for="category in event.categories" v-bind:key="category">
                  {{ category }}
                </tr>
              </table>
            </div>
            <td>
              <div class="row">
                <div v-if="event.hostImageCheck">
                  <img :src="'http://localhost:4941/api/v1/users/' + event.hostId + '/image'" height="50" width="50" alt="" class="rounded-circle">
                </div>
                <div v-else>
                  <img src="../assets/defaultUserImage.png" height="50" width="50" alt="" class="rounded-circle">
                </div>
                <div class="p-1 mt-2">
                  {{ event.organizerFirstName }}
                  {{ event.organizerLastName }}
                </div>
              </div>
            </td>
            <td>{{ event.numAcceptedAttendees }}</td>
            <td style="width: 5%">
              <div v-if="new Date(event.date) < new Date()">
                <button class="btn btn-warning btn-sm" type="button" disabled>
                  Edit
                </button>
              </div>
              <div v-else>
                <button class="btn btn-warning btn-sm" type="button">
                  <router-link :to="{name: 'editEvent', params: { eventId: event.eventId }}">Edit</router-link>
                </button>
              </div>
            </td>
            <td style="width: 5%">
              <button type="button" class="btn btn-danger btn-sm" data-toggle="modal" data-target="#delEvent" :disabled="new Date(event.date) < new Date()">
                Delete
              </button>
              <div class="modal fade" id="delEvent" tabindex="-1" role="dialog" aria-labelledby="delEventLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="delEventLabel">Delete Avatar</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">x</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      Are you sure that you want to delete this event?
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="deleteEvent(event.eventId)">
                        Delete
                      </button>
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <br/><br/>

  <div>
    <h3>Events as an attendee:</h3>
  </div>
  <div class="row">
    <div class="card col-12 border-0">
      <div class="card-body">
        <table class="table">
          <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Hero Image</th>
            <th scope="col">Date</th>
            <th scope="col">Category</th>
            <th scope="col">Host</th>
            <th scope="col">Attendees</th>
            <th scope="col">Status</th>
          </tr>
          </thead>
          <tbody v-for="event in eventsInfo" :key="event.id">
          <tr v-if="event.attendeeCheck">
            <td><router-link :to="{name: 'event', params: { eventId: event.eventId }}">{{ event.title }}</router-link></td>
            <td>
              <div v-if="event.eventImageCheck">
                <img :src="'http://localhost:4941/api/v1/events/' + event.eventId + '/image'" height="50" width="50" alt="">
              </div>
              <div v-else>
                <img src="../assets/defaultEventImage.png" height="50" width="50" alt="">
              </div>
            </td>
            <td>{{ formatDate(event.date) }}</td>
            <div class="table-responsive-sm">
              <table>
                <tr v-for="category in event.categories" v-bind:key="category">
                  {{ category }}
                </tr>
              </table>
            </div>
            <td>
              <div class="row">
                <div v-if="event.hostImageCheck">
                  <img :src="'http://localhost:4941/api/v1/users/' + event.hostId + '/image'" height="50" width="50" alt="" class="rounded-circle">
                </div>
                <div v-else>
                  <img src="../assets/defaultUserImage.png" height="50" width="50" alt="" class="rounded-circle">
                </div>
                <div class="p-1 mt-2">
                  {{ event.organizerFirstName }}
                  {{ event.organizerLastName }}
                </div>
              </div>
            </td>
            <td>{{ event.numAcceptedAttendees }}</td>
            <td>{{ event.attendeeStatus }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar';
export default {
name: "MyEvent",
  components: {
    NavBar
  },
  data() {
    return{
      error: "",
      errorFlag: false,
      token: "",
      userName: "",
      eventsInfo: [],
      searchWord:"",
      categories: [],
      categoryCheck: false,
      categoryFilter: [],
      userId: "",
      attendeesInfo:[],
    }
  },
  mounted() {
    this.getUser()
    this.getEvents()
  },
  methods: {
    getUser() {
      this.token = localStorage.getItem('token')
      this.userId = localStorage.getItem('userId')
      if (this.userId !== null) {
        this.axios.get('http://localhost:4941/api/v1/users/' + this.userId)
            .then((res) => {
              this.userName = res.data;
            })
      }
    },
    getEvents() {
      let url = "http://localhost:4941/api/v1/events"
      let params = {sortBy: "DATE_DESC"};
      this.axios.get(url, {params: params})
          .then((res) => {
            this.eventsInfo = res.data
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          })
          .then(this.getAttendees)
          .then(this.checkEventsImage)
          .then(this.checkHostImage)
          .then(this.getCategories)
    },
    checkEventsImage() {
      for (let i = 0; i < this.eventsInfo.length; i++) {
        let id = this.eventsInfo[i].eventId;
        this.axios
            .get("http://localhost:4941/api/v1/events/" + id + "/image")
            .then(() => {
                  this.eventsInfo[i].eventImageCheck = true;
                }, error => {
                  this.error = error;
                  this.errorFlag = true;
                  this.eventsInfo[i].eventImageCheck = false;
                }
            );
      }
    },
    checkHostImage() {
      for (let i = 0; i < this.eventsInfo.length; i++) {
        let eventId = this.eventsInfo[i].eventId;
        this.axios.get("http://localhost:4941/api/v1/events/" + eventId)
            .then((res) => {
              this.getHostImage(res.data.organizerId, eventId)
            }, error => {
              this.error = error;
              this.errorFlag = true;
            })
      }
    },
    getHostImage(hostId, eventId) {
      this.axios.get("http://localhost:4941/api/v1/users/" + hostId + "/image")
          .then(() => {
            let obj = this.eventsInfo.find(event => event.eventId === eventId);
            obj.hostImageCheck = true;
            obj.hostId = hostId
          }, error => {
            this.error = error;
            this.errorFlag = true;
            let obj = this.eventsInfo.find(event => event.eventId === eventId);
            obj.hostImageCheck = false;
            obj.hostId = hostId
          })
    },
    formatDate(date) {
      let d = new Date(date);
      let year = d.getFullYear();
      let month = d.getMonth() + 1;
      let dt = d.getDate();
      if (dt < 10) {
        dt = "0" + dt;
      }
      if (month < 10) {
        month = "0" + month;
      }
      let thour = d.getHours();
      let tmins = d.getMinutes();
      if (thour < 10) {
        thour = "0" + thour;
      }
      if (tmins < 10) {
        tmins = "0" + tmins;
      }
      return dt + "/" + month + "/" + year + " " + thour + ":" + tmins
    },
    getCategories() {
      this.axios.get("http://localhost:4941/api/v1/events/categories")
          .then((res) => {
            this.categories = res.data;
            this.categoryCheck = true
          }, error => {
            this.error = error;
            this.errorFlag = true;
            this.categoryCheck = false;
          })
          .then(this.setCategories)
    },
    setCategories() {
      if (this.categoryCheck) {
        for (let i = 0; i < this.eventsInfo.length; i++) {
          let cateId = this.eventsInfo[i].categories;
          for (let j = 0; j < cateId.length; j++) {
            let oneCateId = cateId[j];
            let obj = this.categories.find((element) => element.id === oneCateId);
            let cName = obj.name;
            cateId[j] = cName
          }
        }
      }
    },
    getAttendees() {
      for (let i = 0; i < this.eventsInfo.length; i++){
        let eventId = this.eventsInfo[i].eventId
        const headers = {
          headers: {'X-Authorization': this.token}
        };
        this.axios.get('http://localhost:4941/api/v1/events/' + eventId + '/attendees', headers)
            .then((res) => {
              this.attendeesInfo = res.data
              let obj = this.attendeesInfo.find(attendees => attendees.attendeeId == this.userId);
              if(obj !== undefined){
                this.eventsInfo[i].attendeeCheck = true
                this.eventsInfo[i].attendeeStatus = obj.status
              }
            }, error => {
              this.error = error;
              this.errorFlag = true;
            })
      }
    },
    deleteEvent(eventId){
      const headers = {
        headers: {'X-Authorization': this.token}
      };
      this.axios.delete('http://localhost:4941/api/v1/events/' + eventId, headers)
          .then(() => {
            location.reload();
          }, error => {
            this.error = error;
            this.errorFlag = true;
          })
    }
  },
  computed:{
    filterTable: function () {
      const now = new Date();
      let events = this.eventsInfo.filter((event)=>new Date(event.eventId) > now)
      return events



    }
  },
  beforeRouteEnter(to, from, next){
    let token = localStorage.getItem('token')
    if(token === null) {
      next('/users/login')
    } else {
      next();
    }
  },
}
</script>

<style scoped>
.table td, .table th, .table tr{
  vertical-align: middle;
}
</style>