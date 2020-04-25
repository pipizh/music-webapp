import Vue from 'vue'
import VueRouter from 'vue-router'
import Rank from 'components/rank/Rank'
import Recommend from 'components/recommend/Recommend'
import Search from 'components/search/Search'
import Singer from 'components/singer/Singer'
import SingerDetail from 'components/singer-detail/SingerDetail'
import Disc from 'components/disc/Disc'
import TopList from 'components/top-list/TopList'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/recommend' },
  { path: '/recommend', component: Recommend, 
    children: [
      {path: '/recommend/:id', component: Disc}
    ]
  },
  { path: '/singer', component: Singer,
    children: [
      {path: '/singer/:id', component: SingerDetail}
    ]
  },
  { path: '/search', component: Search,
    children: [
      {path: '/singer/:id', component: SingerDetail}
    ] 
  },
  { path: '/rank', component: Rank,
    children: [
      {path: '/rank/:id', component: TopList}
    ]
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
