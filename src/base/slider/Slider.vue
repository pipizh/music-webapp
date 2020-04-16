<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class='dot' v-for='(item, i) in dots' :key="i"
            :class='{active: currentPageIndex === i}'></span>
    </div>
  </div>
</template>

<script>
  /*
  使用better-scroll实现轮播
  自动轮播时，跳转下一界面使用 next() 方法
  更改界面分辨率时，需重新计算宽度
  */
  import BScroll from 'better-scroll'
  import {addClass} from 'common/js/dom'
  export default {
    name: 'slider',
    data() {
      return {
        dots: [],
        currentPageIndex: 0,
      }
    },
    props: {
      loop: { // 循环轮播
        type: Boolean,
        default: true
      },
      autoPlay: { // 自动轮播
        type: Boolean,
        default: true
      },
      interval: { // 自动轮播间隔
        type: Number,
        default: 4000
      }
    },
    // 成功渲染
    mounted() {
      // 浏览器刷新通常17ms一次
      setTimeout(() => {
        this._setSliderWidth()
        this._initDots()
        this._initSlider()
        if(this.autoPlay) {
          this._autoPlay()
        }
      }, 20)
      window.addEventListener('resize', () => {
        if(!this.slider) {
          return
        }
        this._setSliderWidth(true)
        this.slider.refresh()
      })
    },
    destroyed() {
      // 组件销毁时，手动清理计时器等资源
      clearTimeout(this.timer)
    },
    methods: {
      _setSliderWidth(isResize = false) {
        this.children = this.$refs.sliderGroup.children
        let width = 0  // 总宽度
        let sliderWidth = this.$refs.slider.clientWidth  // 父容器宽度
        for(let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item'),
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        if(this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initDots() {
        this.dots = new Array(this.children.length)
      },
      _initSlider () {
        this.slider = new BScroll(this.$refs.slider, {
          // 前后拷贝两份
          scrollX: true,
          scrollY: false, // 横向滚动
          // 当快速在屏幕上滑动一段距离的时候，会根据滑动的距离和时间计算出动量，并生成滚动动画。设置为 true 则开启动画。
          momentum: false,
          // snap: true,
          // snapLoop: this.loop,
          // snapThreshold: 0.3,
          // snapSpeed: 400,
          snap: {
            loop: this.loop,
            threshold: 0.3,  // threshold 表示可滚动到下一个的阈值
            speed: 400
          },
          click: true,
        })
        this.slider.on('scrollEnd', () => {
          let pageIndex = this.slider.getCurrentPage().pageX 
          this.currentPageIndex = pageIndex
          if(this.autoPlay) {
            clearTimeout(this.timer);
            this._autoPlay()
          }
        })
      },
      _autoPlay() {
        this.timer = setTimeout(() => {
            this.slider.next()  // 滚动到下一界面
        }, this.interval)
      }
    }
  }
</script>

<style lang="stylus" scoped>
@import '~common/stylus/base.styl'
  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
