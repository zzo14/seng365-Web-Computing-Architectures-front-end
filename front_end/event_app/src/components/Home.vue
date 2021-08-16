<template>
  <NavBar />

  <div>
    <div class="row">
      <div class="col-2">
        <div class="m-3 p-1">
          <input class="form-control input-sm" v-model="searchWord" placeholder="Search"/>
        </div>
        <p class="m-3 p-1">Categories:
          <button class="btn btn-primary btn-sm " type="button" v-on:click="getEvents()">Filter</button>
          <button class="btn btn-primary btn-sm" type="button" v-on:click="refresh()">Clear</button>
        </p>
        <div class="m-3 p-1" id="scroll-bar">
          <div
              class="form-check mb-3"
              v-for="category in categories"
              v-bind:key="category">
            <input class="form-check-input" type="checkbox" id="catorgoryCheck" v-model="categoryFilter" :value="category"/>
            <label class="form-check-label" for="catorgoryCheck">
              {{ category.name }}
            </label>
          </div>
        </div>
      </div>
      <div class="col-10" id="scroll-bar2">
        <div class="table-responsive-sm">
          <table class="table" id="sortTable">
            <thead >
            <tr>
              <th scope="col">Index</th>
              <th scope="col">Title</th>
              <th scope="col">Hero Image</th>
              <th scope="col">
                <div>
                  <div>Date
                    <span class="px-2" v-on:click="sortDate()" v-if="dateSortCheck%2 !== 0">
                      <i class="fas fa-sort-numeric-up-alt"></i>
                    </span>
                    <span class="px-2" v-on:click="sortDate()" v-else>
                      <i class="fas fa-sort-numeric-down-alt"></i>
                    </span>
                  </div>
                </div>
              </th>
              <th scope="col">Category</th>
              <th scope="col">Host</th>
              <th scope="col">
                <div>
                  <div>Attendees
                    <span class="px-2" v-on:click="sortAttendees()" v-if="attendeesSortCheck%2 !== 0">
                      <i class="fas fa-sort-numeric-up-alt"></i>
                    </span>
                    <span class="px-2" v-on:click="sortAttendees()" v-else>
                      <i class="fas fa-sort-numeric-down-alt"></i>
                    </span>
                  </div>
                </div>
              </th>
            </tr>
            </thead>
            <tbody v-for="event in filterTable" :key="event.id">
              <tr>
                <td>{{ (filterTable.indexOf(event)+ currentPage) + (1*(currentPage-1)) }}</td>
                <td><router-link :to="{name: 'event', params: { eventId: event.eventId }}">{{ event.title }}</router-link></td>
                <td>
                  <div v-if="event.eventImageCheck">
                    <img :src="'http://localhost:4941/api/v1/events/' + event.eventId + '/image'" height="130" width="130" alt="">
                  </div>
                  <div v-else>
                    <img src="../assets/defaultEventImage.png" height="130" width="130" alt="">
                  </div>
                </td>
                <td>{{ formatDate(event.date) }}</td>
                <div class="table-responsive-sm">
                  <table>
                    <tr v-for="category in event.categories" v-bind:key="category">
                      <td>{{ category }}</td>
                    </tr>
                  </table>
                </div>
                <td>
                  <div v-if="event.hostImageCheck">
                    <img :src="'http://localhost:4941/api/v1/users/' + event.hostId + '/image'" height="100" width="100" alt="" class="rounded-circle">
                  </div>
                  <div v-else>
                    <img src="../assets/defaultUserImage.png" height="100" width="100" alt="" class="rounded-circle">
                  </div>
                  {{ event.organizerFirstName }}
                  {{ event.organizerLastName }}
                </td>
                <td>{{ event.numAcceptedAttendees }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <nav aria-label="Page navigation example">
      <ul class="pagination justify-content-center">
        <li v-if = "currentPage === 1" class="page-item disabled">
          <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
        </li>
        <li v-else class="page-item">
          <a class="page-link" href="#" tabindex="-1" aria-disabled="true" v-bind="currentPage" v-on:click="currentPage--">Previous</a>
        </li>
        <li class="page-item" v-for="page in pages" v-bind:key="page">
          <a id = "page" class="page-link" href="#" v-on:click="currentPage = page">{{ page }}</a>
        </li>
        <li v-if = "currentPage === pages.length" class="page-item disabled">
          <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Next</a>
        </li>
        <li v-else class="page-item">
          <a class="page-link" href="#" v-bind="currentPage" v-on:click="currentPage++">Next</a>
        </li>
      </ul>
      <div style="text-align: center">
        Current Page: {{currentPage}}
      </div>
    </nav>
  </div>
</template>

<script>
import NavBar from './NavBar';
export default {
  name: "Home",
  components: {
    NavBar
  },
  data() {
    return{
      error: "",
      errorFlag: false,
      token: "",
      user: "",
      eventsInfo: [],
      searchWord:"",
      categories: [],
      categoryCheck: false,
      categoryFilter: [],
      dateSortCheck: 0,
      attendeesSortCheck: 0,
      currentPage:1,
      perPage:10,
      pages:[],
    }
  },
  mounted() {
    this.getUser();
    this.getEvents();
  },
  methods: {
    getUser() {
      this.token = localStorage.getItem('token')
      const id = localStorage.getItem('userId')
      if (id !== null) {
        this.axios.get('http://localhost:4941/api/v1/users/' + id)
            .then((res) => {
              this.user = res.data.firstName;
            })
      }
    },

    getEvents() {
      let url = "http://localhost:4941/api/v1/events?"
      let params = {sortBy: "DATE_DESC"};
      this.cButtonCheck = false
      if (this.categoryFilter.length !== 0) {
        for (let i = 0; i < this.categoryFilter.length; i++) {
          url = url + 'categoryIds=' + this.categoryFilter[i].id + '&'
        }
      }
      if (this.dateSortCheck !== 0) {
        if (this.dateSortCheck % 2 === 0) {
          params = {sortBy: "DATE_DESC"};
        } else {
          params = {sortBy: "DATE_ASC"};
        }
      }
      if (this.attendeesSortCheck !== 0) {
        if (this.attendeesSortCheck % 2 === 0) {
          params = {sortBy: "ATTENDEES_ASC"};
        } else {
          params = {sortBy: "ATTENDEES_DESC"};
        }
      }
      this.axios.get(url, {params: params})
          .then((res) => {
            this.eventsInfo = res.data
            console.log(this.eventsInfo )
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          })
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
    sortDate() {
      this.attendeesSortCheck = 0;
      this.dateSortCheck++;
      this.getEvents();
    },
    sortAttendees() {
      this.dateSortCheck = 0;
      this.attendeesSortCheck++;
      this.getEvents();
    },
    setPages(events) {
      this.pages = [];
      let numberOfPages = Math.ceil(events.length / this.perPage);
      for (let index = 1; index <= numberOfPages; index++) {
        this.pages.push(index)
      }
    },
    paginate(events){
      if(this.searchWord.length > 0 || this.categoryFilter > 0) {
        this. currentPage = 1;
      }
      let currentPage = this.currentPage;
      let perPage = this.perPage;
      let from = (currentPage * perPage) - perPage;
      let to = (currentPage * perPage);
      return events.slice(from, to);
    },
    refresh(){
      location.reload()
    }
  },
  computed:{
    filterTable: function () {
      const now = new Date();
      let events = this.eventsInfo.filter((event)=>new Date(event.date) > now)

      if(this.searchWord.length > 0) {
        let eventSearchResult = events.filter((event)=>event.title.toLowerCase().includes(this.searchWord.trim().toLowerCase()))
        let eventPage = this.paginate(eventSearchResult)
        this.setPages(eventSearchResult)
        return eventPage
      }

      let eventPage = this.paginate(events)
      this.setPages(events)
      return eventPage
    }
  },
}
</script>

<style scoped>
.table td, .table th, .table tr{
  vertical-align: middle;
}

#scroll-bar {
  height: calc(80vh - 110px);
  overflow-y:scroll;
}
#scroll-bar2 {
  height: calc(90vh - 110px);
  overflow-y:scroll;
}
</style>