<template>
  <div>
    <div v-if="resp">
      <el-container>
        <b>Please <router-link class="login" to="/login">login</router-link> to see posts. </b>
      </el-container>
    </div>
    <div v-if="posts" v-for="(post, i) in posts" :key="i">
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
      resp: null,
    };
  },
  mounted() {
    this.fetchPosts();
    document.title = "Posts";
  },
  methods: {
    fetchPosts() {
      fetch("/api/posts/", {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      }).then(response => {
        if (response.ok) {
          response.json().then(json => {
            this.posts = json;
          });
        } else if (response.status === 401) {
          this.resp = "no"
          this.$message("You do not have permission to see this page.");
          
        }
      });
    }
  }
};
</script>

<style scoped>
.login {
  text-decoration: none;
}

.el-container {
  padding: 20px;
}
h1 {
  color: green;
}
p {
  color: blue;
}
</style>
