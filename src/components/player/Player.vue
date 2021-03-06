<template>
  <div class="player" v-if="playlist.length">
    <transition name="normal" @enter="enter" @after-enter="afterEnter"
                @leave="leave" @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper" >
              <div class="cd" :class='cdCls'>
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine" class="text"
                   :class="{'current': currentLineNum === index}"
                   v-for="(line,index) in currentLyric.lines" :key='index'>{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent='percent' @percentChange='progressPercentChange'></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click='changeMode'>
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class='disableCls'>
              <i @click='prev' class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class='disableCls'>
              <i @click='togglePlaying' :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class='disableCls'>
              <i @click='next' class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" :class='getFavoriteIcon(currentSong)'
              @click='toggleFavorite(currentSong)'></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open"><!-- error：v-if 设置，所以组件移除，ref无法引用 -->
        <div class="icon">
          <img width="40" height="40" :src="currentSong.image" :class='cdCls'>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control" >
          <progress-circle :radius='radius' :percent='percent'>
            <i :class='playMiniIcon' class='icon-mini' @click.stop='togglePlaying'></i>
          </progress-circle>
          <!--子元素点击事件冒泡到父元素导致打开全局播放器-->
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref='playlist'></playlist>
    <audio ref="audio" @play="ready" @timeupdate="updateTime"
           @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import Scroll from 'base/scroll/Scroll'
  import ProgressBar from 'base/progress-bar/ProgressBar'
  import ProgressCircle from 'base/progress-circle/ProgressCircle'
  import Playlist from 'components/playlist/Playlist'
  import animations from 'create-keyframe-animation'
  import Lyric from 'lyric-parser'
  import {prefixStyle} from 'common/js/dom'
  import {playMode} from 'common/js/config'
  import {shuffle} from 'common/js/util'
  import {getPlaySongVkey} from 'api/song'
  import {playerMixin} from 'common/js/mixin'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins: [playerMixin],
    data() {
      return {
        songReady: false,  // 标志位做限制，防止快速点击导致dom异常
        currentTime: 0,
        radius: 32,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric: '',
      }
    },
    computed: {
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex',
      ]),
      // 动态类名
      // 实现cd旋转
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      playMiniIcon() {
        return this.playing? 'icon-pause-mini': 'icon-play-mini'
      },
      disableCls() {
        return this.songReady? '': 'disable'
      },
      percent() {
        return this.currentTime / this.currentSong.duration
      }
    },
    created() {
      this.touch = {}
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      open() {
        this.setFullScreen(true)
      },
      back() {
        this.setFullScreen(false)
      },
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()
        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave(el) {
        // 取不到组件 v-if v-show
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      _getPosAndScale() {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      togglePlaying() {
        if(!this.songReady) return
        this.setPlayingState(!this.playing)
        if(this.currentLyric) this.currentLyric.togglePlay()
      },
      end() {
        if(this.mode === playMode.loop) this.loop()
        else this.next()
      },
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        if(this.currentLyric) this.currentLyric.seek(0)
      },
      prev() {
        if(!this.songReady) return
        if(this.mode === playMode.loop || this.playlist.length === 1) {
          this.loop()
        }
        else {
          let index = this.currentIndex - 1
          if(index === -1) index = this.playlist.length - 1
          this.setCurrentIndex(index)
          if(!this.playing) this.togglePlaying()
          this.songReady = false
        }
      },
      next() {
        // this.$refs.audio.src = ''
        if(!this.songReady) return
        console.log('next')
        if(this.mode === playMode.loop || this.playlist.length === 1) {
          this.loop()
        }
        else {
          let index = this.currentIndex + 1
          if(index === this.playlist.length) index = 0
          this.setCurrentIndex(index)
          if(!this.playing) this.togglePlaying()
          this.songReady = false
        }
      },
      ready() {
        // canplay：当文件就绪可以开始播放时运行的脚本（缓存已足够开始时）
        // play：当媒介就绪可以开始播放时运行的脚本
        this.songReady = true
        this.savePlayHistory(this.currentSong)
      },
      // 视频加载发生错误时触发
      // error() {
      //   this.songReady = true     // 保证正常使用
      // },
      updateTime(e) {
        this.currentTime =  e.target.currentTime
      },
      _pad(num, n = 2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      format(interval) {
        interval = interval | 0
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)
        return `${minute}:${second}`
      },
      progressPercentChange(percent) {
        const time = this.currentSong.duration * percent
        this.$refs.audio.currentTime = time
        if(!this.playing) this.togglePlaying()
        if(this.currentLyric) this.currentLyric.seek(time * 1000)
      },
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          // if (this.currentSong.lyric !== lyric) {
          //   return
          // }
          this.currentLyric = new Lyric(lyric, this.handleLyric)  
          if (this.playing) {
            this.currentLyric.play()
          }
        }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      getUrl() {
        getPlaySongVkey(this.currentSong.mid).then(purl => {
          console.log(purl)
          if(purl.length !== 0) {
            const url = `http://ws.stream.qqmusic.qq.com/${purl}`
            this.$refs.audio.src = url
            console.log(this.$refs.audio)
            this.$refs.audio.play()
          } 
        })
      },
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      middleTouchStart(e) {
        this.touch.initiated = true
        // 用来判断是否是一次移动
        // this.touch.moved = false
        const touch = e.touches[0]  // 第一根手指
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        if (!this.touch.moved) {
          this.touch.moved = true
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd() {
        if (!this.touch.moved) {
          return
        }
        let offsetWidth
        let opacity
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
        this.touch.initiated = false
      },
      showPlaylist() {
        this.$refs.playlist.show()
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    watch: {
      playing(newPlaying) {
        this.$nextTick(() => {  
          const audio = this.$refs.audio
          if(audio.src.length) {
            newPlaying ? audio.play() : audio.pause()
          }
        })
      },
      currentSong(newSong, oldSong) {
        if(!newSong.id) {
          return
        }
        if (newSong.id === oldSong.id) {
          return
        }
        if(this.$refs.audio) {
          this.$refs.audio.src = ''
        } // refs只在组件渲染完成之后生效，第一次监听变化时audio未渲染，但是第一次的src为空，所以不妨碍结果
        if(this.currentLyric) {
          this.currentLyric.stop()
          this.currentTime = 0
          this.playingLyric = ''
          this.currentLineNum = 0
        }
        this.songReady = false
        console.log(this.songReady)
        // 当歌曲在手机上播放，如果进入到后台，再切到前台的时候，
        clearTimeout(this.timer) 
        this.timer = setTimeout(() => {
          this.getUrl()
          this.getLyric()
        }, 1000)
      },
      fullScreen(newVal) {
        if (newVal) {
          setTimeout(() => {
            this.$refs.lyricList.refresh()
          }, 20)
        }
      }
    },
    components: {
      Scroll,
      ProgressBar,
      ProgressCircle,
      Playlist
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
