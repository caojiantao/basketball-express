const api = require('../../services/api')

// 格式化评分人数
function formatScoreCount(count) {
  if (!count) return '0 评分'
  if (count < 10000) return `${count} 评分`
  return `${(count / 10000).toFixed(1)}万 评分`
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scoreList: [],
    query: {
      relation: 'CHILD',
      page: 1,
      pageSize: 10,
    },
    noMore: false,
    matchId: '',
    matchDetail: null,
    isLoading: false,
    isRefreshing: false,
    loadError: false,
    // 评论相关数据
    showComments: false,
    currentBizId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { env, outBizNo, outBizType } = options
    
    this.setData({ 
      query: {
        ...this.data.query,
        env,
        outBizNo,
        outBizType
      }
    })

    this.loadData()
  },

  onPullDownRefresh() {
    this.refreshData()
  },

  async refreshData() {
    try {
      this.setData({ 
        isRefreshing: true,
        loadError: false,
        scoreList: [],
        noMore: false,
        query: {
          ...this.data.query,
          page: 1
        }
      })
      await this.loadData()
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 500
      })
    } catch (error) {
      wx.showToast({
        title: '刷新失败',
        icon: 'error',
        duration: 1000
      })
    } finally {
      this.setData({ isRefreshing: false })
      wx.stopPullDownRefresh()
    }
  },

  async loadData() {
    if (this.data.isLoading || this.data.noMore) return

    this.setData({ isLoading: true })

    try {
      const list = await api.getMatchScores(this.data.query)
      
      if (!list || list.length === 0) {
        this.setData({ noMore: true })
        return
      }

      const newScoreList = []
      for (const item of list) {
        if (item.node) {
          const formattedItem = {
            ...item.node,
            bizId: item.node.bizId,
            scorePersonCount: formatScoreCount(item.node.scorePersonCount)
          }
          newScoreList.push(formattedItem)
        }
      }

      this.setData({
        scoreList: [...this.data.scoreList, ...newScoreList],
        noMore: list.length < this.data.query.pageSize,
        query: {
          ...this.data.query,
          page: this.data.query.page + 1
        }
      })
    } catch (error) {
      this.setData({ loadError: true })
      wx.showToast({
        icon: 'error',
        title: '加载失败，请重试',
        duration: 1000
      })
      console.error('加载评分数据失败:', error)
    } finally {
      this.setData({ isLoading: false })
    }
  },

  onReachBottom() {
    if (!this.data.noMore && !this.data.isLoading) {
      this.loadData()
    }
  },

  // 重试加载
  retryLoad() {
    if (this.data.loadError) {
      this.setData({
        query: {
          ...this.data.query,
          page: 1
        },
        scoreList: [],
        noMore: false,
        loadError: false
      })
      this.loadData()
    }
  },

  // 点击评分项
  onScoreItemTap(e) {
    const { bizId } = e.currentTarget.dataset
    
    if (!bizId) {
      wx.showToast({
        title: '加载评论失败',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      showComments: true,
      currentBizId: bizId
    })
  },

  // 关闭评论弹层
  onCommentsClose() {
    this.setData({ 
      showComments: false,
      currentBizId: ''
    })
  },

  // 阻止冒泡
  catchContentTap() {
    // 阻止点击内容区域时关闭弹层
  },

  // 评论列表触底加载更多
  onCommentScrollToLower() {
    if (!this.data.commentNoMore && !this.data.commentLoading) {
      this.loadComments()
    }
  },

  // 重试加载评论
  retryLoadComments() {
    if (this.data.commentError) {
      this.setData({
        commentQuery: {
          ...this.data.commentQuery,
          page: 1
        },
        commentList: [],
        commentNoMore: false,
        commentError: false
      })
      this.loadComments()
    }
  }
})