const request = (options = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => {
        // 如果设置了手动处理重定向，直接返回完整响应
        if (options.redirect === 'manual') {
          resolve(res)
          return
        }
        
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: reject
    })
  })
}

const getSchedule = async () => {
  try {
    const res = await request({
      url: 'https://m.hupu.com/nba/schedule'
    })
    const regexp = /<script id="__NEXT_DATA__" type="application\/json">(.*)<\/script>/
    const match = res.match(regexp)
    
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
    const res = await request({
      url: `https://m.hupu.com/nba/live/${matchId}`,
      redirect: 'manual'
    })
    return res
  } catch (error) {
    console.error('获取比赛详情失败:', error)
    throw error
  }
}

const getMatchScores = async (params) => {
  try {
    const res = await request({
      url: 'https://games.mobileapi.hupu.com/1/8.0.1/bplcommentapi/bpl/score_tree/getCurAndSubNodeByBizKey',
      data: params,
      method: 'GET',
      header: {
        reqId: new Date().getTime()
      }
    })
    return res?.data?.pageResult?.data || []
  } catch (error) {
    console.error('获取评分数据失败:', error)
    throw error
  }
}

// 获取评论列表
const getComments = (params) => {
  return request({
    url: 'https://games.mobileapi.hupu.com/1/8.0.99/bplcommentapi/bpl/comment/list/primarySingleRow/hottest',
    method: 'GET',
    data: {
      outBizNo: params.outBizNo,
      outBizType: params.outBizType,
      clientCode: '',
      page: params.page,
      pageSize: params.pageSize
    }
  })
}

module.exports = {
  getSchedule,
  getMatchDetail,
  getMatchScores,
  getComments
} 