<template>
  <form @submit.prevent="onsubmit">
    <va-input
      v-model="email"
      :label="$t('auth.email')"
      :error="!!emailErrors.length"
      :error-messages="emailErrors"
    />

    <va-input
      v-model="password"
      type="password"
      :label="$t('auth.password')"
      :error="!!passwordErrors.length"
      :error-messages="passwordErrors"
    />

    <div class="d-flex justify--center mt-3">
      <va-button type="submit" class="my-0">{{ $t('auth.login') }}</va-button>
    </div>
  </form>
</template>

<script>
import store from '@/store'

export default {
  name: 'login',
  data () {
    return {
      email: '',
      password: '',
      keepLoggedIn: false,
      emailErrors: [],
      passwordErrors: [],
    }
  },
  computed: {
    formReady () {
      return !this.emailErrors.length && !this.passwordErrors.length
    },
  },
  methods: {
    onsubmit () {
      this.emailErrors = this.email ? [] : ['Email is required']
      this.passwordErrors = this.password ? [] : ['Password is required']
      if (!this.formReady) {
        return
      }
      store.state.api.post('/users', { 
        email: this.email,
        password: this.password,
        username: this.email
      })
        .then((response) => {
          console.log(response)
        })
        .catch((e) => {
          console.log(e)
        })
        .finally(() => (this.loading = false))
      // this.$router.push({ name: 'dashboard' })
      this.$router.push({ name: 'dashboard' })
    },
  },
}
</script>

<style lang="scss">
</style>
