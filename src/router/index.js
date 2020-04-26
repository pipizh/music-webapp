import Vue from 'vue'
import VueRouter from 'vue-router'
// import Rank from 'components/rank/Rank'
// import Recommend from 'components/recommend/Recommend'
// import Search from 'components/search/Search'
// import Singer from 'components/singer/Singer'
// import SingerDetail from 'components/singer-detail/SingerDetail'
// import Disc from 'components/disc/Disc'
// import TopList from 'components/top-list/TopList'
// import UserCenter from 'components/user-center/UserCenter'

// 路由懒加载
const Rank = () => import('components/rank/Rank')
const Recommend = () => import('components/recommend/Recommend')
const Search = () => import('components/search/Search')
const Singer = () => import('components/singer/Singer')
const SingerDetail = () => import('components/singer-detail/SingerDetail')
const Disc = () => import('components/disc/Disc')
const TopList = () => import('components/top-list/TopList')
const UserCenter = () => import('components/user-center/UserCenter')

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
  { path: '/user', component: UserCenter}
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
