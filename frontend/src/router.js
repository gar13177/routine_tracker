import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Table from './views/Table.vue';
import DockerCompose from './views/DockerCompose';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/docker-compose',
      name: 'docker-compose',
      component: DockerCompose,
    },
    {
      path: '/table',
      name: 'table',
      component: Table,
    },
    {
      path: '/reference',
      name: 'reference',
      component: Table,
    },
    {
      path: '/posts',
      name: 'posts',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "posts" */ './views/Posts.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
});
