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
        let scoreList = []
        for (let data of res.data.data.pageResult.data) {
          scoreList.push(data.node);
        }
        this.setData({
          scoreList: scoreList
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
})