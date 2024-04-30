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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let query = this.data.query;
    Object.assign(query, options);
    this.setData({
      query: query
    })
    this.loadData();
  },

  loadData() {
    console.log(this.data.query);
    wx.request({
      url: 'https://games.mobileapi.hupu.com/1/8.0.1/bplcommentapi/bpl/score_tree/getCurAndSubNodeByBizKey',
      data: this.data.query,
      header: {
        reqId: new Date().getTime()
      },
      success: res => {
        console.log(res)
        let list = res?.data?.data?.pageResult?.data || [];
        if (list.length === 0) {
          console.log('noMore...');
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
          scoreList: scoreList
        })
      }
    });
  },

  onReachBottom() {
    if (this.data.noMore) {
      return;
    }
    this.data.query.page++;
    this.loadData();
  }
})