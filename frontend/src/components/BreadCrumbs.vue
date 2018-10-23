<template>
    <div class="bread-crumbs">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">Company</el-breadcrumb-item>
            <el-breadcrumb-item>Overview</el-breadcrumb-item>
            <el-breadcrumb-item>Draw.io Diagram</el-breadcrumb-item>
        </el-breadcrumb>
    </div>
</template>


<style scoped>
.bread-crumbs {
    padding:20px;
}
</style>
