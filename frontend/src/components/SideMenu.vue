<template>
    <el-aside width="230px">
        <div class="logo-container">
            <h1 style="font-size:2em;">Company</h1>
        </div>

        <el-menu
            default-active="2"
            :router="true"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b">
            <el-submenu index="1">
            <template slot="title">
                <i class="el-icon-location"></i>
                <span>Navigator One</span>
            </template>
            <el-menu-item-group title="Home">
                <el-menu-item :route="{name:'home'}" index="1-1">item one</el-menu-item>
                <el-menu-item index="1-2">item two</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="Posts">
                <el-menu-item :route="{name:'posts'}" index="1-3">item three</el-menu-item>
            </el-menu-item-group>
            <el-submenu index="1-4">
                <template slot="title">item four</template>
                <el-menu-item index="1-4-1">item one</el-menu-item>
            </el-submenu>
            </el-submenu>
            <el-menu-item index="2">
            <i class="el-icon-menu"></i>
            <span>Navigator Two</span>
            </el-menu-item>
            <el-menu-item index="3" disabled>
            <i class="el-icon-document"></i>
            <span>Navigator Three</span>
            </el-menu-item>
            <el-menu-item index="4" :route="{name:'table'}">
            <i class="el-icon-setting"></i>
            <span>Tables</span>
            </el-menu-item>
        </el-menu>
    </el-aside>
</template>
