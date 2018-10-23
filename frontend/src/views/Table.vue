<template>
<el-container>
  <el-table
    :data="tableData6"
    border
    show-summary
    style="width: 100%">
    <el-table-column
      prop="id"
      label="ID"
      width="180">
    </el-table-column>
    <el-table-column
      prop="name"
      label="Name">
    </el-table-column>
    <el-table-column
      prop="amount1"
      sortable
      label="Amount 1">
    </el-table-column>
    <el-table-column
      prop="amount2"
      sortable
      label="Amount 2">
    </el-table-column>
    <el-table-column
      prop="amount3"
      sortable
      label="Amount 3">
    </el-table-column>
  </el-table>
  </el-container>
</template>


<script>
  export default {
    data() {
      return {
        tableData6: [{
          id: '12987122',
          name: 'Tom',
          amount1: '234',
          amount2: '3.2',
          amount3: 10
        }, {
          id: '12987123',
          name: 'Tom',
          amount1: '165',
          amount2: '4.43',
          amount3: 12
        }, {
          id: '12987124',
          name: 'Tom',
          amount1: '324',
          amount2: '1.9',
          amount3: 9
        }, {
          id: '12987125',
          name: 'Tom',
          amount1: '621',
          amount2: '2.2',
          amount3: 17
        }, {
          id: '12987126',
          name: 'Tom',
          amount1: '539',
          amount2: '4.1',
          amount3: 15
        }]
      };
    },
    mounted: function() {
      const h = this.$createElement;
      this.$notify({
          title: '2018 Financials',
          message: h('i', { style: 'color: teal;' }, 'Table loaded successfully'),
          offset: 50,
        });
    },
    methods: {
      getSummaries(param) {
        const { columns, data } = param;
        const sums = [];
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = 'Total Cost';
            return;
          }
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = '$ ' + values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0);
          } else {
            sums[index] = 'N/A';
          }
        });

        return sums;
      }
    }
  };
</script>

<style>
.el-table {
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: 20px;
    margin-right: 20px;
}
</style>
