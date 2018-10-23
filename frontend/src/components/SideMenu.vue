<template>
    <el-aside width="230px">
        <div class="logo-container">
            <h1 style="font-size:2em;">Company</h1>
        </div>

        <el-menu
            default-active="1"
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
                <span>Overview</span>
            </template>
            <el-menu-item-group title="Architecture">
                <el-menu-item :route="{name:'home'}" index="1-1">Draw.io Diagram</el-menu-item>
                <el-menu-item :route="{name:'docker-compose'}" index="1-2">docker-compose</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="Posts">
                <el-menu-item :route="{name:'posts'}" index="1-3">Posts</el-menu-item>
            </el-menu-item-group>
            <el-submenu index="1-4">
                <template slot="title">Nested</template>
                <el-menu-item index="1-4-1">Nested 1</el-menu-item>
                <el-menu-item index="1-4-2">Nested 2</el-menu-item>
            </el-submenu>
            </el-submenu>
            <el-menu-item :route="{name:'reference'}" index="2">
            <i class="el-icon-menu"></i>
            <span>Navigator Two</span>
            </el-menu-item>
            <el-menu-item index="3" :route="{name:'table'}">
            <i class="el-icon-setting"></i>
            <span>Tables</span>
            </el-menu-item>
        </el-menu>
    </el-aside>
</template>
