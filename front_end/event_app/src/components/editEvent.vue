<template>
  <NavBar />
  <h2>Edit the Event!</h2>
  <form class="px-3" >
    <div class="form-group">
      <h5>Title:</h5>
      <input class="form-control" placeholder="eg.Netflix Night" v-model="title">
    </div>
    <div class="form-group">
      <h5>Category:</h5>
      <div class="m-3 p-1" >
        <div class="form-check-inline" v-for="category in categories" v-bind:key="category">
          <input class="form-check-input" type="checkbox" id="catorgoryCheck" v-model="categoryFilter" :value="category"/>
          <label class="form-check-label" for="catorgoryCheck">
            {{ category.name }}
          </label>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="form-group col-2 pr-5">
        <h5>Date: </h5>
        <div class="m-3 p-1">
          <input type="datetime-local" v-model="date">
        </div>
        <h5>Image:</h5>
        <div class="m-3 p-1">
          <input type="file" v-on:change="imageSelect" accept="image/jpeg,image/gif,image/png"/>
        </div>
      </div>

      <div class="form-group col-10 pl-5">
        <h5>Description:</h5>
        <textarea class="form-control" rows="5" v-model="description"></textarea>
      </div>
    </div>
    <div class="form-group">
      <h5>Maximum capacity:</h5>
      <div class="form-check m-3 px-3">
        <input class="form-check-input" type="checkbox" value="" id="capacityCheck" v-model="capacityCheck">
        <label class="form-check-label pr-3" for="capacityCheck">
          Capacity applicable
        </label>
        <input type="number" min="0" :disabled="capacityCheck === false" v-model="capacity">
      </div>
    </div>
    <div class="form-group">
      <div class="row">
        <div class="col-sm-2">
          <h5>URL & Venue:</h5>
        </div>
        <div class="col-sm-10">
          <input class="form-check-input" type="checkbox" value="" id="onlineCheck" v-model="onlineCheck">
          <label class="form-check-label pr-3" for="onlineCheck">
            is a Online Event
          </label>
        </div>
      </div>
      <div class="form-check m-3 px-3">
        <label class="form-label pr-3">URL:</label>
        <input type="url" placeholder="https://example.com" pattern="https://.*" size="50" required v-model="urlInput">
      </div>
      <div class="form-check m-3 px-3">
        <label class="form-check-label pr-3">
          Venue:
        </label>
        <input type="text" v-model="venue" :disabled="onlineCheck" placeholder="Venue">
      </div>
    </div>
    <div class="form-group">
      <h5>Addendance & Fee:</h5>
      <div class="form-check m-3 px-3">
        <input class="form-check-input" type="checkbox" value="" id="controlAttendance" v-model="controlAttendance">
        <label class="form-check-label pr-3" for="controlAttendance">
          Control attendance status
        </label>
      </div>
      <div class="form-check px-2">
        <label class="form-check-label pr-3" for="capacityCheck">
          Fee:
        </label>
        <input type="number" min="0" v-model="fee">
      </div>
    </div>
  </form>
  <div class="px-5" style="text-align: center;">
    <button class="btn btn-primary btn-lg btn-block" type="button" v-on:click="editEvent()">Edit!</button>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar";
export default {
  name: "editEvent",
  components:{
    NavBar
  },
  data() {
    return{
      error: "",
      errorFlag: false,
      token: "",
      userId: "",
      categories:[],
      categoryFilter: [],
      date: "",
      selectedFile: null,
      capacityCheck: false,
      onlineCheck: false,
      title: "",
      capacity: 0,
      urlInput: "",
      venue: "",
      controlAttendance: false,
      fee: 0,
      description: "",
      categoryIds: [],
      eventId:""
    }
  },
  mounted() {
    this.getUser();
    this.getCategories();
    this.getOldEventInfo();
  },
  methods: {
    getUser() {
      this.eventId = this.$route.params.eventId
      this.token = localStorage.getItem('token')
      const id = localStorage.getItem('userId')
      if (id !== null) {
        this.axios.get('http://localhost:4941/api/v1/users/' + id)
            .then((res) => {
              this.user = res.data.firstName;
            })
      }
    },
    getCategories() {
      this.axios.get("http://localhost:4941/api/v1/events/categories")
          .then((res) => {
            this.categories = res.data;
          }, error => {
            this.error = error;
          })
          .then(this.setCategories)
    },
    imageSelect(e) {
      this.selectedFile = e.target.files[0]
    },
    editEvent(){
      let validCheck = this.validFunction()
      if(validCheck !== null) {
        alert(validCheck)
      } else{
        let params = this.dataPlace()
        const headers = {
          headers: {'X-Authorization': this.token, "Content-Type": "application/json"}
        };
        this.axios.patch('http://localhost:4941/api/v1/events/' + this.eventId, params, headers)
            .then(()=>{
              this.putEventImage(this.eventId)
              this.$router.go(-1)
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
            })
      }
    },
    validFunction(){
      if (this.title === "") {
        return "Please enter a event title!"
      }
      if (this.categoryFilter.length === 0) {
        return "Please choose at least one category!"
      } else{
        for (let i = 0; i < this.categoryFilter.length; i++){
          this.categoryIds.push(this.categoryFilter[i].id)
        }
      }
      if (this.description === "") {
        return "Please enter a event description!"
      }
      const now = new Date();
      if(this.date === "" || new Date(this.date) < now) {
        return "Please enter a valid date!"
      }

      if(this.capacityCheck){
        if(this.capacity === ""){
          return "Please enter a valid capacity!"
        }
      }
      if(this.onlineCheck){
        if(this.urlInput === ""){
          return "Please enter a valid URL!"
        }
      } else{
        if(this.venue === ""){
          return "Please enter a valid venue!"
        }
      }
      return null
    },
    dataPlace(){
      let params = {}
      params.title = this.title
      params.description = this.description
      params.categoryIds = this.categoryIds
      params.date = this.date
      if(this.capacityCheck){
        let capacity = parseInt(this.capacity)
        params.capacity = capacity
      }
      if(this.onlineCheck){
        params.url = this.urlInput
      } else{
        params.venue = this.venue
        if(this.urlInput !== ""){
          params.url = this.urlInput
        }
      }
      if(this.controlAttendance){
        params.requires_attendance_control = 1
      }
      if(this.fee > 0) {
        let fee = parseInt(this.fee)
        params.fee = fee
      }
      return params
    },
    putEventImage(eventId){
      if(this.selectedFile !== null){
        const headers = {
          headers: {'X-Authorization': this.token, "Content-Type": this.selectedFile.type}
        };
        this.axios.put('http://localhost:4941/api/v1/events/' + eventId + '/image', this.selectedFile, headers)
            .then((res) => {
              console.log(res)
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
            })
      }
    },
    getOldEventInfo(){
      this.axios.get('http://localhost:4941/api/v1/events/' + this.eventId)
      .then((res)=> {
        let data = res.data
        this.oldEventInfo(data);
      }, (error) => {
        this.error = error;
        this.errorFlag = true;
      })
    },
    oldEventInfo(data){
      this.title = data.title
      this.date = data.date.slice(0, -8)
      this.description = data.description
      if(data.capacity !== null){
        this.capacityCheck = true
        this.capacity = data.capacity
      }
      if(data.isOnline === 1){
        this.onlineCheck = true
        this.urlInput = data.url
      } else {
        this.venue = data.venue
      }
      if(data.requiresAttendanceControl === 1){
        this.controlAttendance = true
      }
      this.fee = data.fee
      for(let i = 0; i < this.categories.length; i++){
        if(data.categories.indexOf(this.categories[i].id) !== -1){
          this.categoryFilter.push(this.categories[i])
        }
      }
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
#scroll-bar {
  height: calc(95vh - 100px);
  overflow-y:scroll;
}
</style>