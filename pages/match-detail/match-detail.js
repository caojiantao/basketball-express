const api = require('../../services/api')

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
    loadError: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ matchId: options.id })
      this.loadMatchDetail()
    }
    let query = this.data.query;
    Object.assign(query, options);
    this.setData({
      query: query
    })
    this.loadData();
  },

  onPullDownRefresh() {
    this.refreshData()
  },

  async refreshData() {
    try {
      this.setData({ 
        isRefreshing: true,
        loadError: false
      })
      await this.loadMatchDetail()
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

  async loadMatchDetail() {
    if (this.data.isLoading) return

    try {
      this.setData({ 
        isLoading: true,
        loadError: false
      })
      if (!this.data.isRefreshing) {
        wx.showLoading({ 
          title: '加载中',
          mask: true
        })
      }

      const res = await api.getMatchDetail(this.data.matchId)
      this.setData({
        matchDetail: res.data
      })
    } catch (error) {
      this.setData({ loadError: true })
      wx.showToast({
        icon: 'error',
        title: '加载失败，请重试',
        duration: 1000
      })
      console.error('加载比赛详情失败:', error)
    } finally {
      this.setData({ isLoading: false })
      if (!this.data.isRefreshing) {
        wx.hideLoading()
      }
    }
  },

  loadData() {
    if (this.data.isLoading) return

    this.setData({ 
      isLoading: true,
      loadError: false
    })

    wx.request({
      url: 'https://games.mobileapi.hupu.com/1/8.0.1/bplcommentapi/bpl/score_tree/getCurAndSubNodeByBizKey',
      data: this.data.query,
      header: {
        reqId: new Date().getTime()
      },
      success: res => {
        let list = res?.data?.data?.pageResult?.data || [];
        if (list.length === 0) {
          this.setData({
            noMore: true
          })
          return;
        }
        let scoreList = this.data.scoreList;
        for (let data of list) {
          let scorePersonCount = data.node.scorePersonCount;
          if (scorePersonCount < 10000) {
            scorePersonCount = scorePersonCount + ' 评分'
          } else {
            scorePersonCount = (scorePersonCount / 10000.0).toFixed(1) + '万 评分'
          }
          data.node.scorePersonCount = scorePersonCount;
          scoreList.push(data.node);
        }
        this.setData({
          scoreList: scoreList,
          noMore: list.length < this.data.query.pageSize
        })
      },
      fail: error => {
        this.setData({ loadError: true })
        wx.showToast({
          icon: 'error',
          title: '加载失败，请重试',
          duration: 1000
        })
        console.error('加载评分数据失败:', error)
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    });
  },

  onReachBottom() {
    if (this.data.noMore || this.data.isLoading) {
      return;
    }
    this.data.query.page++;
    this.loadData();
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
        noMore: false
      })
      this.loadData()
    }
  }
})