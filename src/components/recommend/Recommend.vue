<template>
  <div class='recommend'>
    <scroll class="recommend-content" :data='discList' ref='scroll'>
      <div><!-- 外层创建一个div元素包裹内部的需滚动区域-->
        <div class="slider-wrapper" v-if="recommends.length"> <!-- 获取数据延迟，设置立刻渲染 -->
          <slider>
            <div v-for='item in recommends' :key='item.id'>
              <a :href="item.linkUrl">
                <img @load='loadImg' :src="item.picUrl" class='needsclick'> <!-- click与fastclick冲突时 -->
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="item in discList" class="item" :key='item.dissid'>
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show='!discList.length'>
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import {getRecommend, getDiscList} from 'api/recommend'
import {ERR_OK} from 'api/config'
import Slider from 'base/slider/Slider'
import Scroll from 'base/scroll/Scroll'
import Loading from 'base/loading/Loading'

export default {
  data() {
    return {
      recommends: [],
      discList: [],
    }
  },
  created () {
    // setTimeout(() => {
    //  this._getRecommend()
    // }, 2000)
    this._getRecommend(),
    this._getDiscList()
  },
  methods: {
    _getRecommend() {
      // getRecommend().then(res => {
      //   console.log(res)
      //   if(res.code === ERR_OK) {// 接口失效
      //     this.recommends = res.data.slider
      //   }
      // })
      this.recommends = [
        {
          id: '9686',
          linkUrl: 'https://y.qq.com/msa/226/0_3046.html',
          picUrl: 'http://p1.music.126.net/a2Cnxq-KClCenAenOmRyIw==/109951164904833869.jpg?imageView&quality=89'

        },
        {
          id: '9751',
          linkUrl: 'http://y.qq.com/w/album.html?albummid=004byJE516EXmp',
          picUrl: 'http://p1.music.126.net/TCnURh8v8yAOJX-GZRpvIQ==/109951164904679091.jpg?imageView&quality=89'
        },
        {
          id: '9752',
          linkUrl: 'http://y.qq.com/w/album.html?albummid=004byJE516EXmp',
          picUrl: 'http://p1.music.126.net/xcILyiP2OMgC98tG1bdLdw==/109951164908047473.jpg?imageView&quality=89'
        },
      ]
    },
    _getDiscList() {
      getDiscList().then(res => {
        if(res.code === ERR_OK)
          this.discList = res.data.list
      })
    },
    loadImg() {
      if(!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true
      }
    }
  },
  components: {
    Slider,
    Scroll,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "~common/stylus/variable"

.recommend
  position: fixed
  width: 100%
  top: 88px
  bottom: 0
  .recommend-content
    height: 100%
    overflow: hidden
    .slider-wrapper
      position: relative
      width: 100%
      overflow: hidden
    .recommend-list
      .list-title
        height: 65px
        line-height: 65px
        text-align: center
        font-size: $font-size-medium
        color: $color-theme
      .item
        display: flex
        box-sizing: border-box
        align-items: center
        padding: 0 20px 20px 20px
        .icon
          flex: 0 0 60px
          width: 60px
          padding-right: 20px
        .text
          display: flex
          flex-direction: column
          justify-content: center
          flex: 1
          line-height: 20px
          overflow: hidden
          font-size: $font-size-medium
          .name
            margin-bottom: 10px
            color: $color-text
          .desc
            color: $color-text-d
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
