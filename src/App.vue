<template>
  <div id="app">
    <m-header></m-header>
    <keep-alive><router-view/></keep-alive>
    <tab></tab> <!--路由导航-->
  </div>
</template>
<script>
  import MHeader from 'components/m-header/MHeader'
  import Tab from 'components/tab/Tab'
  export default {
    components: {
      MHeader,
      Tab
    }
  }
</script>
<style lang="stylus" scoped rel="stylesheet/stylus">
  @import "~common/stylus/variable"
</style>
