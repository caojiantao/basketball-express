const api = require('../../services/api')
const util = require('../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    gameList: [],
    isLoading: false,
    isRefreshing: false,
    today: new Date().toISOString().slice(0, 10).replace(/-/g, '')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.initGames()
  },

  onShow() {
    this.initGames()
  },

  onPullDownRefresh() {
    this.refreshData()
  },

  async refreshData() {
    try {
      this.setData({ isRefreshing: true })
      await this.initGames()
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

  getDateDesc(day) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10).replace(/-/g, '')
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10).replace(/-/g, '')

    if (day === today) return '今天'
    if (day === yesterday) return '昨天'
    if (day === tomorrow) return '明天'
    return ''
  },

  async initGames() {
    if (this.data.isLoading) return

    try {
      this.setData({ isLoading: true })
      if (!this.data.isRefreshing) {
        wx.showLoading({ title: '加载中' })
      }

      const gameList = await api.getSchedule()
      
      // 处理比赛时间的显示格式
      gameList.forEach(dayGames => {
        dayGames.matchList.forEach(match => {
          match.beginTime = util.convertMillsToHM(match.chinaStartTime)
        })
      })

      this.setData({ gameList })

      // 自动滚动到今天或之前最近的比赛日
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const targetDay = gameList
        .map(item => item.day)
        .filter(day => day <= today)
        .sort((a, b) => b - a)[0]

      if (targetDay) {
        wx.pageScrollTo({
          selector: `#date-${targetDay}`
        })
      }

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
    
    // 查找比赛数据
    const match = this.data.gameList.find(dayGames => 
      dayGames.matchList.find(m => m.matchId === matchId)
    )?.matchList.find(m => m.matchId === matchId)

    if (!match) {
      console.error('未找到对应的比赛数据')
      return
    }

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
      
      // 检查是否是重定向响应
      if (res.statusCode === 307 || res.statusCode === 302) {
        const location = res.header && (res.header.Location || res.header.location)
        
        if (!location) {
          console.error('未获取到重定向地址')
          wx.showToast({
            icon: 'error',
            title: '获取详情失败',
            duration: 2000
          })
          return
        }
        
        // 从重定向 URL 中提取参数
        const params = location.substr(location.lastIndexOf("?"))
        const url = '/pages/match-detail/match-detail' + params
        
        wx.navigateTo({
          url,
          fail: (error) => {
            console.error('跳转失败:', error)
            wx.showToast({
              icon: 'error',
              title: '跳转失败',
              duration: 2000
            })
          }
        })
      } else {
        wx.showToast({
          icon: 'error',
          title: '获取详情失败',
          duration: 2000
        })
      }
    } catch (error) {
      console.error('获取比赛详情失败:', error)
      wx.showToast({
        icon: 'error',
        title: '获取详情失败',
        duration: 2000
      })
    } finally {
      wx.hideLoading()
    }
  })
})