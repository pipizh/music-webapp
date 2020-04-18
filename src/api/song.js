import {commonParams, options} from './config'
import axios from 'axios'
import jsonp from 'jsonp'

export function getLyric(mid) {
  const url = '/api/getLyric'

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    pcachetime: +new Date(),
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    let ret = res.data
    if(typeof ret === 'string') {
      var reg = /^\w+\(({[^()]+})\)$/
      var matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
      }
    }
    return Promise.resolve(ret)
  })
}

// export function getPlaySongVkey(songmid) {
//   const url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg'

//   const data = Object.assign({}, commonParams, {
//     g_tk: 195219765,
//     loginUin :1297716249, //可以传空值
//     hostUin: 0,
//     notice: 0,
//     platform: 'yqq',
//     needNewCode: 0,
//     cid: 205361747,
//     uin: 0, //可以传空值
//     songmid,
//     filename: `C400${songmid}.m4a`,
//     guid: 5976381156
//   })

//   return jsonp(url, data, options)
// }
