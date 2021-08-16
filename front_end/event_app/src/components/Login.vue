<template>
  <nav class="navbar navbar-expand-lg navbar-light" style="background: peachpuff; height: 50px">
    <img alt="meetUp logo" src="../assets/Meetup_Logo.png" height="32" width="32">
    <a class="navbar-brand" href="/">LogInPage</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"></button>
    <div class="collapse navbar-collapse">
    </div>
    <div>
      <ul class="navbar-nav mr-auto">
        <button class="btn btn-outline-link" type="button">
          <router-link :to="{name: 'register'}"> Sign Up</router-link>
        </button>
        <button class="btn btn-outline-link" type="button">
          <router-link :to="{path: '/'}">Go back to Home Page</router-link>
        </button>
      </ul>
    </div>
  </nav>
  <div class="context">
    <div class="container">
      <img alt="meetUp logo" src="../assets/Meetup_Logo.png" height="99" width="99">
      <h1>Please Log In</h1>
      <form name="login">
          <input v-model="email" placeholder="Email" type="email"/>
          <input v-model="password" placeholder="Password" type="password"/>
        <div style="margin-left: 40%;margin-top:15px;width: 20%;">
          <button type="button" class="btn btn-primary btn-lg btn-block" v-on:click="userLogin()">Log In</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return{
      error: "",
      errorFlag: false,
      email: "",
      password: ""
    }
  },
  mounted() {
  },
  methods:{
    userLogin() {
      if (this.email === "" || this.password === "") {
        alert("Please entry an email or a password!")
      } else {
        this.axios.post('http://localhost:4941/api/v1/users/login', {"email": this.email, "password": this.password})
            .then((res) => {
              localStorage.setItem('token', res.data.token);
              localStorage.setItem('userId', res.data.userId);
              localStorage.setItem('email', this.email);
              localStorage.setItem('password', this.password);
              this.$router.push('/');
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
              alert("The email or password is wrong!");
            });
      }
    },
  }
}


</script>

<style scoped>
.context{background-image: url('../assets/background.jpeg');
  background-size: cover;
  position: absolute;
  left: 0;
  top:50%;
  width: 100%;
  height: 400px;
  margin-top: -200px;
  overflow: hidden;
}
.container{
  max-width: 600px;
  height: 400px;
  padding: 80px 0;
  text-align: center;
  margin: 0 auto;
  margin-top: -40px;
}
.container h1{
  font-size: 40px;
  font-weight: 300;}
form{padding: 20px 0;}
form input{border: 1px solid #FFF;
  width: 220px;
  padding: 10px 15px;
  display: block;
  margin: 0 auto 10px auto;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 300;
  text-align: center;
}
</style>