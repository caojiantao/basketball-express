const api = require('../../services/api')
const util = require('../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    gameList: [],
    gameIndex: "",
    isLoading: false,
    isRefreshing: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.initCurrentGame()
  },

  onShow() {
    this.initCurrentGame()
  },

  onPullDownRefresh() {
    this.refreshData()
  },

  async refreshData() {
    try {
      this.setData({ isRefreshing: true })
      await this.initCurrentGame()
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      })
    } catch (error) {
      wx.showToast({
        title: '刷新失败',
        icon: 'error',
        duration: 2000
      })
    } finally {
      this.setData({ isRefreshing: false })
      wx.stopPullDownRefresh()
    }
  },

  async initCurrentGame() {
    if (this.data.isLoading) return

    try {
      this.setData({ isLoading: true })
      if (!this.data.isRefreshing) {
        wx.showLoading({ title: '加载中' })
      }

      const gameList = await api.getSchedule()
      const day = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      let currentIndex

      for (let i in gameList) {
        if (gameList[i].day == day) {
          currentIndex = i
        }
        for (let m of gameList[i].matchList) {
          m.beginTime = util.convertMillsToHM(m.chinaStartTime)
        }
      }

      this.setData({
        gameList: gameList,
        gameIndex: currentIndex
      })
    } catch (error) {
      wx.showToast({
        icon: 'error',
        title: '加载失败，请重试',
        duration: 2000
      })
      console.error('初始化数据失败:', error)
    } finally {
      this.setData({ isLoading: false })
      if (!this.data.isRefreshing) {
        wx.hideLoading()
      }
    }
  },

  onClickMatch: util.debounce(async function(e) {
    const matchId = e.currentTarget.dataset.id
    const match = this.data.gameList[this.data.gameIndex].matchList.find(
      item => item.matchId == matchId
    )

    if (!match) return

    if (match.matchStatus != 'COMPLETED') {
      wx.showToast({
        icon: 'error',
        title: '未完赛',
        mask: true,
        duration: 1000
      })
      return
    }

    try {
      wx.showLoading({ title: '加载中' })
      const res = await api.getMatchDetail(matchId)
      const location = res.header.Location
      const params = location.substr(location.lastIndexOf("?"))
      wx.navigateTo({
        url: '/pages/match-detail/match-detail' + params
      })
    } catch (error) {
      wx.showToast({
        icon: 'error',
        title: '获取详情失败',
        duration: 2000
      })
      console.error('获取比赛详情失败:', error)
    } finally {
      wx.hideLoading()
    }
  }),

  bindPickerChange(e) {
    this.setData({
      gameIndex: e.detail.value
    })
  }
})