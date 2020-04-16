<template>
  <div ref='wrapper'>
    <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
  export default {
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: []
      },
      listenScroll: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      setTimeout(() => {
        this._initScroll()
      }, 20);
    },
    methods: {
      _initScroll() {
        if(!this.$refs.wrapper) return
        this.scroll =  new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click,
        })

        if(this.listenScroll) {
          // 监听滚动，传递位置信息
          // 参数：{Object} {x, y} 滚动的实时坐标，触发时机：滚动过程中，具体时机取决于选项中的 probeType。
          this.scroll.on('scroll', pos => {
            this.$emit('scroll', pos)
          })
        }
      },
      enable() {
        this.scroll && this.scroll.enable()
      },
      disable() {
        this.scroll && this.scroll.disable()
      },
      refresh() { // 刷新scroll
        this.scroll && this.scroll.refresh()
      },
      scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll,arguments) // 接收参数
      },
      scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll,arguments)
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this.refresh()
        }, 20);
      }
    }
  }
</script>

<style lang="stylus" scoped>

</style>
