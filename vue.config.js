module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        'views': '@/views',
        'base': '@/base',
        'components': '@/components',
        'api': '@/api',
        'common': '@/common',
      }
    }
  },
  lintOnSave: false,
  devServer: {
    overlay:{
      warning: false,
      errors: false
    },
    // 服务器代理，解决开发环境跨域问题
    proxy: {
    	// 一旦devServer（5000）服务器接受到 /api/xxx 的请求，就会把请求转发到另外一个服务器（3000）
      // 推荐页歌单列表代理
      '/api/getDiscList': {
        target: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg',
        secure: false, // 如果是https接口，需要配置这个参数
        // 设置请求头（如果网站要严格请求头referer判断的话 才设置）
        bypass: (req, res, proxyOptions) => {
          req.headers.referer = "https://c.y.qq.com/"
          req.headers.host = "c.y.qq.com"
        },
        pathRewrite: {
          '^/api/getDiscList': '' // 这里理解成用'/api/getDiscList'代替target的地址
        }
      },
      // vkey代理
      '/api/getPlaySongVkey': {
        // target: 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg',
        target: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
        secure: false, 
        pathRewrite: {
          '^/api/getPlaySongVkey': ''
        }
      },
      // 歌曲歌词代理
      '/api/getLyric': {
        target: 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg',
        secure: false, 
        bypass: (req, res, proxyOptions) => {
          req.headers.referer = "https://c.y.qq.com/"
          req.headers.host = "c.y.qq.com"
        },
        pathRewrite: {
          '^/api/getLyric': ''
        }
      },
      // 推荐页歌单的全部歌曲代理
      '/api/getSongList': {
        target: 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',
        secure: false, 
        bypass: (req, res, proxyOptions) => {
          req.headers.referer = "https://c.y.qq.com/"
          req.headers.host = "c.y.qq.com"
        },
        pathRewrite: {
          '^/api/getSongList': ''
        }
      },
      // 推荐页歌单的全部歌曲代理
      '/api/search': {
        target: 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp',
        secure: false, 
        bypass: (req, res, proxyOptions) => {
          req.headers.referer = "https://c.y.qq.com/"
          req.headers.host = "c.y.qq.com"
        },
        pathRewrite: {
          '^/api/search': ''
        }
      },
    }
  }
}
