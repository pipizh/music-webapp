const axios = require('axios')
axios.get('https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?format=json205361747&platform=yqq&cid=205361747&songmid=001fTFGe0LqzdT&filename=C400001fTFGe0LqzdT.m4a&guid=126548448')
.then( res => {
  console.log(res.data.data.items[0].vkey)
})
