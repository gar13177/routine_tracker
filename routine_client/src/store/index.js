import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'
import VuexI18n from 'vuex-i18n' // load vuex i18n module
import app from './modules/app'

import * as getters from './getters'

Vue.use(Vuex)

const api = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  withCredentials: false,
  credentials: 'same-origin',
  mode: 'no-cors',
  headers: {
    'content-type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
  },
})

// Add a request interceptor
api.interceptors.request.use(function (config) {
  if (!('Authorization' in config.headers)) {
    var token = localStorage.getItem('campaigns_token')
    if (token !== null) {
      config.headers.Authorization = 'Bearer ' + token
    }
  }
  return config
})

// Configurate interceptor to redirect to login when it 401 is the returned status
api.interceptors.response.use((response) => {
  return response
},
(error) => {
  if (error.response === undefined || error.response.status === 401 || error.response.status === 403) {
    error.redirectPending = true

    if (error.response && error.response.status === 401) {
      const query = {}
      if (router.currentRoute.query && router.currentRoute.query.redirect) {
        query.redirect = router.currentRoute.query.redirect
      } else if (router.currentRoute.fullPath !== '/auth/login') {
        query.redirect = router.currentRoute.fullPath
      }

      // Unauthorized request was made
      router.push({
        path: '/auth/login',
        query: query,
      })
    } else if (error.response && error.response.status === 403) {
      router.push({ name: 'forbidden' })
    }
  }

  return Promise.reject(error)
})

const store = new Vuex.Store({
  strict: true, // process.env.NODE_ENV !== 'production',
  getters,
  modules: {
    app,
  },
  state: {
    api: api,
  },
  mutations: {},
})

Vue.use(VuexI18n.plugin, store)

export default store
