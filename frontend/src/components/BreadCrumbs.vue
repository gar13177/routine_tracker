<template>
    <div class="bread-crumbs">
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">Company</el-breadcrumb-item>
        <el-breadcrumb-item>Reports</el-breadcrumb-item>
        <el-breadcrumb-item>2018</el-breadcrumb-item>
        <el-breadcrumb-item>Financials</el-breadcrumb-item>
        </el-breadcrumb>
    </div>
</template>


<style scoped>
.bread-crumbs {
    padding:20px;
}
</style>
