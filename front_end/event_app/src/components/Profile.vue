<template>
  <nav class="navbar navbar-expand-lg navbar-light" style="background: peachpuff; height: 50px">
    <img alt="meetUp logo" src="../assets/Meetup_Logo.png" height="32" width="32">
    <a class="navbar-brand" href="/">ProfilePage</a>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item active">
          <a class="nav-link" href="/createEvent">Start New Event <span class="sr-only">(current)</span></a>
        </li>
        <li class="nav-item active">
          <a class="nav-link" href="/myEvent">My Events <span class="sr-only">(current)</span></a>
        </li>
      </ul>
    </div>
    <div>
      <ul class="navbar-nav mr-auto">
        <button class="btn btn-outline-parimary" type="button" v-on:click="logout()">
          Logout
        </button>
      </ul>
    </div>
  </nav>

  <div class="context" v-if="$route.params.edit">
    <div>
      <div v-if="avatarCheck">
        <img :src="'http://localhost:4941/api/v1/users/'+ userId +'/image'" height="300" width="300" alt="" class="rounded-circle">
      </div>
      <div v-else>
        <img src="../assets/defaultUserImage.png" height="360" width="360" alt="" class="rounded-circle">
      </div>
      <button type="button" class="btn btn-primary mt-1" data-toggle="modal" data-target="#delAvatar" v-if="avatarCheck">
         Delete Avatar
      </button>
      <button type="button" class="btn btn-primary mt-1" data-toggle="modal" data-target="#editAvatar">
        Edit Avatar
      </button>
    </div>
    <br />
    <h5 class="text">
      Name:
        <input v-model="newFirstName" :placeholder="userName.firstName">
        <input v-model="newLastName" :placeholder="userName.lastName">
      <br />
      <br />
      Email:
        <input v-model="newEmail" :placeholder="email">
      <br />
      <br />
      Current Password:
        <input v-model="currentPassword" placeholder="password" type="password">
      <br />
      <br />
      Password:
        <input v-model="newPassword" placeholder="password" type="password">
    </h5>
    <div>
      <button class="btn btn-primary" v-on:click="editUserProfile()">Save</button>
    </div>

    <div class="modal fade" id="delAvatar" tabindex="-1" role="dialog" aria-labelledby="delAvatarLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="delAvatarLabel">Delete Avatar</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">x</span>
            </button>
          </div>
          <div class="modal-body">
            Are you sure that you want to delete this avatar?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="deleteAvatar()">
              Delete
            </button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="editAvatar" tabindex="-1" role="dialog" aria-labelledby="editAvatarLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editAvatarLabel">Edit Avatar</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">x</span>
            </button>
          </div>
          <div class="modal-body">
            <input type="file" v-on:change="imageSelect" accept="image/jpeg,image/gif,image/png"/>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="editAvatar()">
              Edit
            </button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>


  </div>

  <div class="context" v-else>
    <div v-if="avatarCheck">
      <img :src="'http://localhost:4941/api/v1/users/'+ userId +'/image'" height="300" width="300" alt="" class="rounded-circle">
    </div>
    <div v-else>
      <img src="../assets/defaultUserImage.png" height="360" width="360" alt="" class="rounded-circle">
    </div>
    <h5>
      {{userName.firstName}} {{userName.lastName}}
      <br />
      <br />
      {{ email }}
    </h5>
    <div>
      <button class="btn btn-link"><router-link :to="{name: 'profileEdit', params:{'edit': 1 }}">Edit</router-link></button>
    </div>
  </div>

</template>

<script>

export default {
  name: "Profile",

  data() {
    return{
      error: "",
      errorFlag: false,
      token: "",
      userName: "",
      userId: "",
      email: "",
      password: "",
      avatarCheck: false,
      editCheck: false,
      selectedFile: null,
      newFirstName:"",
      newLastName:"",
      newEmail:"",
      newPassword:"",
      currentPassword:"",
      errorMsg: ""

    }
  },
  mounted() {
    this.getUserInfo();
    this.getUserImage();
  },
  methods:{
    getUserInfo() {
      this.token = localStorage.getItem('token')
      this.userId = localStorage.getItem('userId')
      this.email = localStorage.getItem('email')
      this.password = localStorage.getItem('password')
      this.axios.get('http://localhost:4941/api/v1/users/' + this.userId)
          .then((res) => {
            this.userName = res.data;
          })
    },
    logout() {
      const headers = {
        headers: {'X-Authorization': this.token}
      };
      this.axios.post('http://localhost:4941/api/v1/users/logout', {}, headers,)
          .then(() => {
            localStorage.clear();
            this.token = "";
            location.reload();
            this.$router.push('/');
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          })
    },
    getUserImage() {
      this.axios.get('http://localhost:4941/api/v1/users/' + this.userId + '/image')
      .then(() => {
        this.avatarCheck = true
      }, (error) => {
        this.error = error;
        this.errorFlag = true;
      })
    },
    imageSelect(e) {
      this.selectedFile = e.target.files[0]
    },
    deleteAvatar() {
      const headers = {
        headers: {'X-Authorization': this.token}
      };
      this.axios.delete('http://localhost:4941/api/v1/users/' + this.userId + '/image', headers)
      .then(() => {
        this.avatarCheck = false
      }, (error) => {
        this.error = error;
        this.errorFlag = true;
      })
    },
    editAvatar() {
      this.avatarCheck = false
      const headers = {
        headers: {'X-Authorization': this.token, "Content-Type": this.selectedFile.type}
      };
      if (this.selectedFile !== null) {
        this.axios.put('http://localhost:4941/api/v1/users/' + this.userId + '/image', this.selectedFile, headers)
            .then((res) => {
              this.avatarCheck = true
              console.log(res)
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
              alert(this.error)
            })
      }
    },

    vaildCheck() {
      this.errorMsg = ""
      if (this.newFirstName === ""){
        this.newFirstName = this.userName.firstName
      }
      if(this.newLastName === ""){
        this.newLastName = this.userName.lastName
      }
      if(this.newEmail === "") {
        this.newEmail = this.email
      } else {
        if (!this.newEmail.includes("@")) {
          this.errorMsg = "The email address must be syntactically valid."
          return this.errorMsg
        }
      }
      if (this.currentPassword === "" || this.newPassword === "") {
        this.errorMsg = "Please entry complete password!"
        return this.errorMsg
      } else {
        if (this.currentPassword !== this.password) {
          this.errorMsg = "The current password is not correct"
          return this.errorMsg
        }
      }
    },

    editUserProfile(){
      this.vaildCheck();
      if (this.errorMsg === "") {
        const headers = {
          headers: {'X-Authorization': this.token}
        };
        this.axios.patch("http://localhost:4941/api/v1/users/" + this.userId, {
          "firstName": this.newFirstName,
          "lastName":this.newLastName,
          "email": this.newEmail,
          "password": this.newPassword,
          "currentPassword": this.currentPassword}, headers)
            .then(()=>{
              this.userName.firstName = this.newFirstName
              this.userName.lastName = this.newLastName
              this.email = this.newEmail
              localStorage.setItem('email', this.newEmail);
              localStorage.setItem('password', this.newPassword);
              this.$router.push({name: "profile"})
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
              alert("The email address is already used.")
            })
      } else {
        alert(this.errorMsg)
      }
    }
  }
}
</script>

<style scoped>
.context{
  background-image: url('../assets/background.jpeg');
  background-size: cover;
  position: absolute;
  top:35%;
  width: 100%;
  text-align: center;
  margin-top: -200px;
  overflow: hidden;
}
.text{
  padding-left: 30%;
  text-align: left;
}
</style>