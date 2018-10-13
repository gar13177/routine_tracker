<template>
  <div>
    <div v-for="(post, i) in posts" :key="i">
      <h1 :key="i">{{ post.title }}</h1>
      <p :key="i">{{ post.content }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      posts: [],
    };
  },
  mounted() {
    this.fetchPosts();
    document.title = 'Posts';
  },
  methods: {
    fetchPosts() {
      fetch('http://backend:8000/api/posts/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((json) => {
              this.posts = json;
            });
          }
        });
    },
  },
};
</script>

<style scoped>
  h1 {
    color: green;
  }
  p {
    color: blue;
  }
</style>
