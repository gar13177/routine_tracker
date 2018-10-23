<template>
  <div id="app">
    <el-container>
      <side-menu></side-menu>
      <el-container>
        <el-main>
          <top-nav></top-nav>
          <bread-crumbs></bread-crumbs>
          <el-container></el-container>
            <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>

import './assets/css/reset.css';
import TopNav from './components/TopNav.vue';
import BreadCrumbs from './components/BreadCrumbs.vue';
import SideMenu from './components/SideMenu.vue';

export default {
  components: {
    TopNav,
    BreadCrumbs,
    SideMenu,
  },
  data() {
    return {
      // activeIndex: '1',
      // activeIndex2: '1',
    };
  },
};
</script>

<style>

html {
  font-family: "Helvetica Neue",Helvetica;
}

.container {
  max-width: 1200px;
  margin: auto;
}

.el-aside {
  background: #545c64;
  color:white;
  min-height:100vh;
}

.logo-container {
  padding: 22px;
  background: #434A50;
}

header.el-header {
  padding-left: 0px;
  padding-right:0px;
}

.el-main {
  padding-top:0px;
  padding-left: 0px;
  padding-right:0px;
  background: #EEF1F4;
}

.el-menu {
  border-right: 0 !important;
}

</style>
