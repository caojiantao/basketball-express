const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      ...options,
      success: resolve,
      fail: reject
    })
  })
}

const getSchedule = async () => {
  try {
    const res = await request('https://m.hupu.com/nba/schedule')
    const regexp = /<script id="__NEXT_DATA__" type="application\/json">(.*)<\/script>/
    const match = res.data.match(regexp)
    
    if (!match) {
      throw new Error('数据解析失败')
    }

    const nextData = JSON.parse(match[1])
    return nextData.props.pageProps.gameList
  } catch (error) {
    console.error('获取赛程失败:', error)
    throw error
  }
}

const getMatchDetail = async (matchId) => {
  try {
    const res = await request(`https://m.hupu.com/nba/live/${matchId}`, {
      redirect: 'manual'
    })
    return res
  } catch (error) {
    console.error('获取比赛详情失败:', error)
    throw error
  }
}

module.exports = {
  getSchedule,
  getMatchDetail
} 