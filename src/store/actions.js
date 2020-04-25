import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import {saveSearch, deleteSearch, clearSearch} from 'common/js/cache'

function findIndex(list, song) {
  return list.findIndex(item => item.id === song.id)
}

const actions = {
  selectPlay: ({commit, state}, {list, index}) => {
    commit(types.SET_SEQUENCE_LIST, list)
    if(state.mode === playMode.random) {
      let randomList = shuffle(list)
      commit(types.SET_PLAYLIST, randomList)
      index = findIndex(randomList, list[index])
    } else {
      commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
  },
  randomPlay: ({commit}, {list}) => {
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
  },
  insertSong: ({commit, state}, song) => {
    let playlist = state.playlist.slice()
    let sequenceList = state.sequenceList.slice()
    
    let currentIndex = state.currentIndex  // 值类型
    // 记录当前歌曲
    let currentSong = playlist[currentIndex]
    // 查找当前列表是否有待插入歌曲
    let fpIndex = findIndex(playlist, song)
    // 插入歌曲，索引+1
    currentIndex++
    playlist.splice(currentIndex, 0, song)

    if(fpIndex > -1) {
      if(currentIndex > fpIndex) {
        playlist.splice(fpIndex, 1)
        currentIndex--
      } else{
        playlist.splice(fpIndex + 1, 1)
      }
    }

    let currentSIndex = findIndex(sequenceList, currentSong) + 1
    let fsIndex = findIndex(sequenceList, song)
    sequenceList.splice(currentSIndex, 0, song)
    if(fsIndex > -1) {
      if(sequenceList > fsIndex) {
        playlist.splice(fsIndex, 1)
        currentSIndex--
      } else{
        sequenceList.splice(fsIndex + 1, 1)
      }
    }
    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
  },
  saveSearchHistory: ({commit}, query) => {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query)) // 处理插入值并进行本地存储
  },
  deleteSearchHistory: ({commit}, query) => {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
  },
  clearSearchHistory: ({commit}) => {
    commit(types.SET_SEARCH_HISTORY, clearSearch())
  }
}
export default actions
