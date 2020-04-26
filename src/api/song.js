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
  const data = {
    // format: 'json205361747',
    // platform: 'yqq',
    // cid: 205361747,
    // songmid,
    // filename: `C400${songmid}.m4a`,
    // guid: 126548448,
    data: `{"req":{"module":"CDN.SrfCdnDispatchServer","method":"GetCdnDispatch","param":{"guid":"0","calltype":0,"userip":""}},"req_0":{"module":"vkey.GetVkeyServer","method":"CgiGetVkey","param":{"guid":"0","songmid":["${songmid}"],"songtype":[0],"uin":"0","loginflag":1,"platform":"20"}},"comm":{"uin":0,"format":"json","ct":24,"cv":0}}`
  }

  return axios.get(url, {
    params: data
  }).then( res => {
    console.log(res)
    return Promise.resolve(res.data.req_0.data.midurlinfo[0].purl) // res.data.data.items[0].vkey
  })
}
