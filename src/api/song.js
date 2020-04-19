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

// 获取歌曲的vkey
export function getPlaySongVkey(songmid) {
  const url = '/api/getPlaySongVkey'
  const data = Object.assign({}, {
    format: 'json205361747',
    platform: 'yqq',
    cid: 205361747,
    songmid,
    filename: `C400${songmid}.m4a`,
    guid: 126548448,
  })

  return axios.get(url, {
    params: data
  }).then( res => {
    return Promise.resolve(res.data.data.items[0].vkey)
  })
}
