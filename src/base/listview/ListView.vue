<template>
  <scroll class='list-view' :data='data' ref='listView'
  :listen-scroll='listenScroll' @scroll='scroll' :probe-type='probeType'>
    <ul>
      <li v-for='(group, i) in data' :key='i' class='list-group' ref='listGroup'>
        <h2 class='list-group-title'>{{group.title}}</h2>
        <ul>
          <li v-for='(item, j) in group.items' :key='j' class='list-group-item' 
          @click='selected(item)'>
            <img v-lazy="item.avatar" class='avatar'>
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart='onShortcutTouchStart'
    @touchmove.stop.prevent='onShortcutTouchMove'>
      <ul>
        <li v-for='(item, i) in shortcutList' :key='i' class='item' 
        :data-index='i' :class='{current: currentIndex === i}'>{{item}}</li>
      </ul>
    </div>
    <div class="list-fixed" v-show='fixedTitle' ref='fixed'>
      <h1 class='fixed-title'>{{fixedTitle}}</h1>
    </div>
    <div v-show='!data.length' class='loading-container'>
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/Scroll'
  import Loading from 'base/loading/Loading'
  import {getData} from 'common/js/dom'

  const TITLE_HEIGHT = 30
  const ANCHOR_HEIGHT = 18

  export default {
    created() {
      this.touch = {} // 不需要观测值的变化，所以不需要绑定在props
      this.listenScroll = true
      this.listHeight = []
      this.probeType = 3 // 当 probeType 为 3 的时候，不仅在屏幕滑动的过程中，而且在 momentum 滚动动画运行过程中实时派发 scroll 事件。
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    computed: {
      shortcutList() {
        return this.data.map(group => {
          return group.title.substr(0, 1)
        })
      },
      fixedTitle() {
        if(this.scrollY > 0) return ''
        return this.data[this.currentIndex]? this.data[this.currentIndex].title: ''
      }
    },
    data() {
      return {
        scrollY: -1,  // 滚动的y值，为负数
        currentIndex: 0,
        diff: -1
      }
    },
    methods: {
      onShortcutTouchStart(e) {
        let anchorIndex = getData(e.target, 'index')
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta

        this._scrollTo(anchorIndex)
      },
      refresh() {
        this.$refs.listView.refresh()
      },
      scroll(pos) {
        this.scrollY = pos.y
      },
      _scrollTo(index) {
        // 边界值处理
        // console.log(index)
        if(!index && index !== 0) return // 上下两个区域
        // console.log(index)
        if(index < 0) {
          index = 0
        } else if(index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        // console.log(index)

        // this.scrollY = - this.listHeight[index]

        this.$refs.listView.scrollToElement(this.$refs.listGroup[index], 0)
      },
      // 计算每组的高度信息，并保存在 this.listHeight
      _calculateHeight() {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for(let i = 0; i< list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      },
      selected(item) {
        this.$emit('selected', item)
      }
    },
    watch: {
      data() {
        return setTimeout(() => {
          this._calculateHeight()
        }, 20);
      },
      // scrollY(newY, oldY)
      scrollY(newY) {
        const listHeight = this.listHeight
        // 滚动到顶部
        if(newY > 0) {
          this.currentIndex = 0
          return 
        }
        // 中间部分滚动
        for(let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          if(!height2 || ((-newY) >= height1 && (-newY) < height2)) {
            this.currentIndex = i
            // console.log(i)
            this.diff = height2 + newY
            return 
          }
        }
        // 滚动到底部，且-newY大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ?newVal - TITLE_HEIGHT: 0
        if(this.fixedTop === fixedTop) return
        this.fixedTop = fixedTop
        // console.log(this.fixedTop)
        this.$refs.fixed.style.transform = `translate3d(0, ${this.fixedTop}px, 0)`
      }
    },
    components: {
      Scroll,
      Loading
    }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .list-view
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
