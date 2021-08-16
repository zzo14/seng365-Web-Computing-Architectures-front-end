<template>
  <div class="navBar">
    <div v-if="token">
      <nav class="navbar navbar-expand-lg navbar-light" style="background: peachpuff; height: 50px">
        <img alt="meetUp logo" src="../assets/Meetup_Logo.png" height="32" width="32">
        <a class="navbar-brand" href="/">Home</a>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <a class="nav-link mt-sm-1" href="/createEvent">Start New Event <span class="sr-only">(current)</span></a>
            </li>
            <li class="nav-item active">
              <a class="nav-link mt-sm-1" href="/myEvent">My Events <span class="sr-only">(current)</span></a>
            </li>
          </ul>
        </div>
        <div>
          <ul class="navbar-nav mr-auto">
            <button class="btn btn-outline-parimary" type="button" >
              <router-link :to="{name: 'profile'}">Hey, {{user}} !</router-link>
            </button>
            <button class="btn btn-outline-parimary" type="button" v-on:click="logout()">
              Logout
            </button>
          </ul>
        </div>
      </nav>
    </div>
    <div v-else>
      <nav class="navbar navbar-expand-lg navbar-light" style="background: peachpuff; height: 50px" >
        <img alt="meetUp logo" src="../assets/Meetup_Logo.png" height="32" width="32">
        <a class="navbar-brand" href="/">Home</a>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <a class="nav-link mt-sm-1" href="/createEvent">Start New Event <span class="sr-only">(current)</span></a>
            </li>
          </ul>
        </div>
        <div>
          <ul class="navbar-nav mr-auto">
            <button class="btn btn-outline-link" type="button">
              <router-link :to="{name: 'login'}">LogIn</router-link>
            </button>
            <button class="btn btn-outline-link" type="button">
              <router-link :to="{name: 'register'}"> Sign Up</router-link>
            </button>
          </ul>
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
name: "NavBar",
  data() {
    return{
      error: "",
      errorFlag: false,
      token: "",
      user: "",
    }
  },
  mounted() {
    this.getUser();
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

    logout() {
      const headers = {
        headers: {'X-Authorization': this.token}
      };
      this.axios.post('http://localhost:4941/api/v1/users/logout', {}, headers)
          .then(() => {
            localStorage.clear();
            this.token = "";
            location.reload();
            this.$router.push('/');
          }, (error) => {
            localStorage.clear();
            location.reload();
            this.$router.push('/');
            this.error = error;
            this.errorFlag = true;
          })
    },
  },
}
</script>

<style scoped>

</style>