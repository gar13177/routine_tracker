<template>
    <el-header>
        <el-menu
        :default-active="activeIndex2"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleSelect"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b">
        <el-menu-item index="1">Processing Center</el-menu-item>
        <el-submenu index="2">
            <template slot="title">Workspace</template>
            <el-menu-item index="2-1-1">item one</el-menu-item>
            <el-menu-item index="2-2">item two</el-menu-item>
            <el-menu-item index="2-3">item three</el-menu-item>
            <el-submenu index="2-4">
            <template slot="title">item four</template>
            <el-menu-item index="2-4-1">item one</el-menu-item>
            <el-menu-item index="2-4-2">item two</el-menu-item>
            <el-menu-item index="2-4-3">item three</el-menu-item>
            </el-submenu>
        </el-submenu>
        <el-menu-item index="5" class="right">Logout</el-menu-item>
        <el-menu-item index="4" class="right">Documnetation</el-menu-item>
        <el-menu-item index="3" class="right">Settings</el-menu-item>
        </el-menu>
    </el-header>
</template>

<style scoped>
.right {
  float: right;
}

header.el-header {
  padding-left: 0px;
  padding-right: 0px;
}
html {
  font-family: "Helvetica Neue", Helvetica;
}

.container {
  max-width: 1200px;
  margin: auto;
}

.el-aside {
  background: #545c64;
  color: white;
  min-height: 100vh;
}

.logo-container {
  padding: 22px;
  background: #434a50;
}

header.el-header {
  padding-left: 0px;
  padding-right: 0px;
}

.el-main {
  padding-top: 0px;
  padding-left: 0px;
  padding-right: 0px;
}

.el-menu {
  border-right: 0 !important;
}
</style>
