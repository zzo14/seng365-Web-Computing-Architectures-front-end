<template>
  <NavBar />

  <div class="card border-0">
    <div class = "row">
      <div class="col-9">
        <div class="row">
          <div class="card-body col-8 p-4">
            <h4 class="card-title">
              {{ eventDetail.title }}
              <span
                  v-if="userLoggedIn.uId !== '' &&  userLoggedIn.AttendeeStatus =='accepted'"
                  class="badge bg-success"
              >You're an attendee of this event</span>
              <span
                  v-if="userLoggedIn.uId !== '' &&  userLoggedIn.orgainizerOfCurrentEvent ==true"
                  class="badge bg-success"
              >You're the orgainizer of this event</span>
              <span
                  v-if="userLoggedIn.uId !== '' &&  userLoggedIn.AttendeeStatus =='pending'"
                  class="badge bg-warning text-dark"
              >Waiting for approval to join this event</span>
              <span
                  v-if="userLoggedIn.uId !== '' &&  userLoggedIn.AttendeeStatus =='rejected'"
                  class="badge bg-danger"
              >The orgainizer rejected your request to join this event</span>
            </h4>
            <h6 class="card-subtitle mb-2 text-muted">{{ eventDetail.date }}</h6>
            <p class="card-text">{{ eventDetail.description }}</p>
          </div>
          <div class="card col-4 border-0" style="height: 6rem">
            <div class="row">
              <div v-if="avatarCheck" class="col-6 p-2">
                <img :src="'http://localhost:4941/api/v1/users/'+ eventDetail.organizerId +'/image'" height="80" width="80" alt=""  class="rounded-circle">
              </div>
              <div v-else class="col-6 p-2">
                <img src="../assets/defaultUserImage.png" height="80" width="80" alt=""  class="rounded-circle">
              </div>
              <div class="col-6 p-3">
                <div class="mt-1 mb-2">
                  <strong>Host By:</strong>
                </div>
                {{eventDetail.organizerFirstName}}
                {{eventDetail.organizerLastName}}
              </div>
              <ul class="list-group " style="width: 48%;">
                <li class="list-group-item"><h6>Categories:</h6></li>
                <li class="list-group-item" v-for="category in eventDetail.categories" v-bind:key="category">
                  {{ category }}
                </li>
              </ul>
              <ul class="list-group px-1 " style="width: 52%;">
                <li class="list-group-item" v-if="eventDetail.capacity"><strong>Capacity: </strong>{{ eventDetail.capacity }}</li>
                <li class="list-group-item" v-else><strong>Capacity: </strong>Not provided</li>
                <li class="list-group-item" v-if="eventDetail.venue"><strong>Venue: </strong>{{ eventDetail.venue }}</li>
                <li class="list-group-item" v-else><strong>Venue: </strong>none</li>
                <li class="list-group-item" v-if="eventDetail.fee != 0"><strong>Fee: </strong>{{ eventDetail.fee }}</li>
                <li class="list-group-item" v-else><strong>Fee: </strong>free</li>
                <li class="list-group-item" v-if="eventDetail.url"><strong>URL: </strong>{{ eventDetail.url }}</li>
                <li class="list-group-item" v-else><strong>URL: </strong>Not provided</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="col-3 pl-4 mt-2" v-if="eventImageCheck">
        <img :src="'http://localhost:4941/api/v1/events/' + $route.params.eventId + '/image'" height="400" width="400" alt="">
      </div>
      <div class="col-3 p-1" v-else>
        <img src="../assets/defaultEventImage.png" height="400" width="400" alt="">
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-5 px-5 py-4">
      <h5>
        Attendees({{attendeesInfo.length}}):
      </h5>
      <ul class="list-group "  id="scroll-bar3">
        <div v-for="attendee in attendeesInfo" v-bind:key="attendee">
          <li class="list-group-item">
            <div class="row">
              <div v-if="attendee.attendeesImageCheck">
                <img :src="'http://localhost:4941/api/v1/users/'+ attendee.attendeeId +'/image'" height="80" width="80" alt=""  class="rounded-circle">
              </div>
              <div v-else>
                <img src="../assets/defaultUserImage.png" height="80" width="80" alt=""  class="rounded-circle">
              </div>
              <div class="py-4 px-2">
                {{ attendee.firstName }}
                {{ attendee.lastName }}
                <div v-if="eventDetail.organizerId === attendee.attendeeId" class="card-subtitle mb-2 text-muted">
                  @Organizer
                </div>
                <div v-else class="card-subtitle mb-2 text-muted">
                  @Attendee
                </div>
              </div>
              <div class=" admin-container py-4 px-2" v-if="userLoggedIn.uId !== '' &&  userLoggedIn.orgainizerOfCurrentEvent ==true">
                <div class="row">
                  <div class="p-2">
                    Status: {{attendee.status}}
                  </div>
                  <div class="px-2 py-1">
                    <select
                        class="form-select form-select-sm my-2"
                        aria-label="Default select example"
                        v-model="statusSelected[attendee.attendeeId]" >
                      <option v-if="attendee.status!='rejected'" value="rejected">Reject</option>
                      <option v-if="attendee.status!='pending'" value="pending">Pending</option>
                      <option v-if="attendee.status!='accepted'" value="accepted">Accept</option>
                    </select>
                  </div>
                  <div class="p-2">
                    <button type="button" class="btn btn-primary btn-sm" v-on:click="changeStatus(attendee.attendeeId)">Confirm</button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </div>
      </ul>
    </div>
    <div class="col-5 px-4 py-4" >
      <h5>
        Similar Events:
      </h5>
      <div class="row" id="scroll-bar2">
        <div v-for="event in filterTable" v-bind:key="event" >
          <div class="card border-0" style="width: 19rem;" v-if="eventDetail.title !== event.title">
            <div class="card-body">
                <h5 class="card-title"><router-link :to="{name: 'event', params: { eventId: event.eventId }}">{{ event.title }}</router-link></h5>
              <h6 class="card-subtitle mb-2 text-muted">{{ event.date }}</h6>
              <p class="card-text">Number Of Attendees: {{ event.numAcceptedAttendees }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-2">
      <div class="mt-5 pr-5" style="text-align: center; vertical-align: middle; height: 50%">
        <br/><br/><br/><br/><br/><br/><br/>
        <button v-if="userLoggedIn.uId == ''">
          <router-link class="nav-link" to="/users/login">Log in to Join the event</router-link>
        </button>

        <!--popup modal and ask user to confirm quiting event-->
        <button
            v-if="userLoggedIn.uId !== '' && userLoggedIn.AttendeeOfCurrentEvent == true && userLoggedIn.orgainizerOfCurrentEvent == false && userLoggedIn.AttendeeStatus !='rejected'"
            type="button"
            class="btn btn-primary"
            data-toggle="modal"
            data-target="#quitEventModal"
        >I would like to withdraw from this event</button>

        <div class="modal" id="quitEventModal" tabindex="-1">
          <br/><br/><br/><br/><br/><br/><br/>
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h6 class="modal-title">Request to withdraw from {{eventDetail.title}}</h6>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">x</span>
                </button>
              </div>
              <div class="modal-body">
                <p>Please confirm that you are no longer interested in participating this event.</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button
                    type="button"
                    class="btn btn-primary"
                    v-on:click="removeUserFromEvent"
                >Confirm</button>
              </div>
            </div>
          </div>
        </div>

        <button
            v-if="
               userLoggedIn.uId != '' &&
                 userLoggedIn.AttendeeOfCurrentEvent == false &&
                   userLoggedIn.orgainizerOfCurrentEvent == false
             "
            type="button"
            class="btn btn-primary"
            v-on:click="joinEvent"
        >Join the Event</button>

        <!--if event is full-->
        <button
            v-if="eventDetail.capacity == attendeesInfo.length"
            type="button"
            class="btn btn-primary"
            disabled
        >Event is Full</button>
      </div>
    </div>
  </div>

</template>

<script>
import NavBar from "@/components/NavBar";
export default {
name: "event",
  components:{
    NavBar
  },
  data() {
    return{
      error: "",
      errorFlag: false,
      token: "",
      userId: "",
      userName: "",
      eventId: this.$route.params.eventId,
      eventDetail: [],
      avatarCheck:false,
      categoryCheck: false,
      eventImageCheck: false,
      attendeesInfo: [],
      attendeesImageCheck: false,
      similarEvents: [],
      userLoggedIn: {
        uId: "",
        orgainizerOfCurrentEvent: false,
        AttendeeOfCurrentEvent: false,
        AttendeeStatus: "",
        userName: ""
      },
      statusSelected:[]
    }
  },
  mounted() {
    this.getUser();
    this.getEvent();
  },
  watch:{
    $route(){
      location.reload();
    }
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

    getEvent(){
      this.axios.get('http://localhost:4941/api/v1/events/' + this.eventId)
      .then((res) => {
        this.eventDetail = res.data;
        this.eventDetail.date = this.eventDetail.date.replace('Z', '').replace('T', ' ').slice(0, -4)
      }, (error) => {
        this.error = error;
        this.errorFlag = true;
      })
      .then(this.getOrganizerImage)
      .then(this.getCategories)
      .then(this.checkEventsImage)
      .then(this.getAttendees)
      .then(this.getSimilarEvents)
    },

    getOrganizerImage() {
      this.axios.get('http://localhost:4941/api/v1/users/' + this.eventDetail.organizerId + '/image')
          .then(() => {
            this.avatarCheck = true
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          })
    },
    getCategories() {
      this.axios.get("http://localhost:4941/api/v1/events/categories")
          .then((res) => {
            this.categories = res.data;
            let cateId = this.eventDetail.categories;
            for (let j = 0; j < cateId.length; j++) {
              let oneCateId = cateId[j];
              let obj = this.categories.find((element) => element.id === oneCateId);
              cateId[j] = obj.name
            }
          }, error => {
            this.error = error;
            this.errorFlag = true;
          })
    },
    checkEventsImage() {
      this.axios.get("http://localhost:4941/api/v1/events/" + this.eventId + "/image")
          .then(() => {
                this.eventImageCheck = true;
              }, error => {
                this.error = error;
                this.errorFlag = true;
                this.eventImageCheck = false;
              });
      },
    getAttendees() {
      const headers = {
        headers: {'X-Authorization': this.token}
      };
      this.axios.get('http://localhost:4941/api/v1/events/' + this.eventId + '/attendees', headers)
      .then((res) => {
        let fullUserList = res.data;
        if(this.userId == this.eventDetail.organizerId) {
          this.userLoggedIn.orgainizerOfCurrentEvent = true;
          this.attendeesInfo = fullUserList
        } else {
          this.attendeesInfo = fullUserList.filter(
              a => a.status == "accepted" || this.userId  == a.attendeeId
          );
        }
      }, error => {
        this.error = error;
        this.errorFlag = true;
      })
      .then(this.checkAttendeesImage)
          .then(this.setLoggedInUser);
    },
    checkAttendeesImage() {
      for( let i = 0; i < this.attendeesInfo.length; i++){
        this.axios.get('http://localhost:4941/api/v1/users/' + this.attendeesInfo[i].attendeeId + '/image')
            .then(() => {
              let obj = this.attendeesInfo.find(attendee => attendee.attendeeId === this.attendeesInfo[i].attendeeId);
              obj.attendeesImageCheck = true;
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
              let obj = this.attendeesInfo.find(attendee => attendee.attendeeId === this.attendeesInfo[i].attendeeId);
              obj.attendeesImageCheck = false;
            })
      }
    },
    setLoggedInUser() {
      if (localStorage.length > 0) {
        this.userLoggedIn.uId = this.userId;
        let ufn = this.userName.firstName;
        let uln = this.userName.lastName;
        this.userLoggedIn.userName = ufn + " " + uln;
        // check if logged in user an attendee this the event
        let attendence = this.attendeesInfo.filter(a => a.attendeeId == this.userId);
        if (attendence.length !== 0) {
          this.userLoggedIn.AttendeeOfCurrentEvent = true;
          this.userLoggedIn.AttendeeStatus = attendence[0].status;
        }
      }
      console.log(this.userLoggedIn)
    },
    getSimilarEvents() {
      let url = "http://localhost:4941/api/v1/events?"
      let categories = this.eventDetail.categories
      for (let i = 0; i < categories.length; i++) {
          url = url + 'categoryIds=' + categories[i] + '&'
      }
      this.axios.get(url)
          .then((res) => {
            this.similarEvents = res.data
            for (let i = 0; i < this.similarEvents.length; i++) {
              this.similarEvents[i].date = this.similarEvents[i].date.replace('Z', '').replace('T', ' ').slice(0, -4)
            }
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          })
    },
    removeUserFromEvent() {
      const headers = {
        headers: {'X-Authorization': this.token}
      };
      this.axios.delete("http://localhost:4941/api/v1/events/" + this.eventId + "/attendees", headers)
          .then(
              () => {
                location.reload();
              },
              error => {
                this.error = error;
                this.errorFlag = true;
              }
          );
    },
    joinEvent() {
      const headers = {
        headers: {'X-Authorization': this.token}
      };
      this.axios.post("http://localhost:4941/api/v1/events/" + this.eventId + "/attendees", {},headers )
          .then(
              () => {
                location.reload();
              },
              error => {
                this.error = error;
                this.errorFlag = true;
              }
          );
    },
    changeStatus(uid){
      let bodyMsg = this.statusSelected[uid]
      let eid=this.eventId
      const headers = {
        headers: {'X-Authorization': this.token}
      };

      this.axios.patch('http://localhost:4941/api/v1/events/' + eid +'/attendees/' + uid, {status:bodyMsg}, headers)
          .then(()=>{
            location.reload()
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          })
    },
  },
  computed:{
    filterTable: function () {
      const now = new Date();
      let events = this.similarEvents.filter((event) => new Date(event.date) > now)
      return events
    }
  }
}

</script>

<style scoped>
#scroll-bar {
  height: calc(47vh - 80px);
  overflow-y:scroll;
}
#scroll-bar2 {
  height: calc(47vh - 80px);
  overflow-y:scroll;
}
#scroll-bar3 {
  height: calc(47vh - 80px);
  overflow-y:scroll;
}
</style>