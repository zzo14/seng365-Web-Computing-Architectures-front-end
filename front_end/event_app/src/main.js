import { createApp } from 'vue'
import { createWebHistory, createRouter } from "vue-router";
import axios from 'axios';
import App from './App.vue';
import Login from './components/Login';
import Home from "./components/Home";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Event from "./components/event";
import CreateEvent from "./components/createEvent";
import MyEvent from "@/components/MyEvent";
import EditEvent from "@/components/editEvent"

const routes = [
    {
        path:'/',
        name: 'home',
        component: Home
    },
    {
        path:'/event/:eventId',
        name: 'event',
        component: Event
    },
    {
        path:'/users/login',
        name: 'login',
        component: Login
    },
    {
        path:'/users/register',
        name:'register',
        component: Register
    },
    {
        path:'/users/profile',
        name:'profile',
        component: Profile
    },
    {
        path:'/users/profile/edit',
        name:'profileEdit',
        component: Profile
    },
    {
        path:'/createEvent',
        name:'createEvent',
        component: CreateEvent
    },
    {
        path: '/myEvent',
        name:'myEvent',
        component: MyEvent
    },
    {
        path: "/editEvent",
        name: 'editEvent',
        component: EditEvent
    }
];

const router = createRouter({
    routes,
    history: createWebHistory()
});

const app = createApp(App)

app.use(router);
app.config.globalProperties.axios = axios;
app.mount('#app')
