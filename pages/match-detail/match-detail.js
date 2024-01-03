Page({

  /**
   * 页面的初始数据
   */
  data: {
    scoreList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let data = {
      relation: 'CHILD',
      page: 1,
      pageSize: 10,
    };
    Object.assign(data, options);
    console.log(data);
    wx.request({
      url: 'https://games.mobileapi.hupu.com/1/8.0.1/bplcommentapi/bpl/score_tree/getCurAndSubNodeByBizKey',
      data: data,
      header: {
        reqId: new Date().getTime()
      },
      success: res => {
        console.log(res)
        let scoreList = []
        for (let data of res.data.data.pageResult.data) {
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
})