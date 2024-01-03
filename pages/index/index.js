Page({

  /**
   * 页面的初始数据
   */
  data: {
    gameList: [],
    gameIndex: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },

  onShow(options) {
    this.initCurrentGame();
  },


  initCurrentGame() {
    let regexp = /<script id="__NEXT_DATA__" type="application\/json">(.*)<\/script>/;
    wx.request({
      url: "https://m.hupu.com/nba/schedule",
      success: res => {
        let html = res.data;
        let nextDataStr = html.match(regexp)[1];
        let nextData = JSON.parse(nextDataStr);
        console.log(nextData);
        let gameList = nextData.props.pageProps.gameList;
        let day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        let i;
        for (i in gameList) {
          if (gameList[i].day == day) {
            break;
          }
        }
        this.setData({
          gameList: gameList,
          gameIndex: i
        })
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  onClickMatch(e) {
    console.log(e);
    let matchId = e.currentTarget.dataset.id;

    let match = null;
    for (let item of this.data.gameList[this.data.gameIndex].matchList) {
      if (item.matchId == matchId) {
          match = item;
          break;
      }
    }
    console.log('点击的比赛信息', match);
    if (match.matchStatus != 'COMPLETED') {
        wx.showToast({
          icon: 'error',
          title: '未完赛',
          mask: true,
          duration: 1000,
        })
        return;
    }

    let requestTask = wx.request({
      url: `https://m.hupu.com/nba/live/${matchId}`,
      redirect: 'manual',
    });
    requestTask.onHeadersReceived(res => {
      console.log('请求重定向', res);
      let location = res.header.Location;
      let params = location.substr(location.lastIndexOf("?"));
      wx.navigateTo({
        url: '/pages/match-detail/match-detail' + params,
      })
    })
  },
  bindPickerChange(e) {
    this.setData({
      gameIndex: e.detail.value
    })
  }
})