const api = require('../../services/api')

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    outBizNo: {
      type: String,
      value: ''
    },
    outBizType: {
      type: String,
      value: ''
    }
  },

  data: {
    commentList: [],
    loading: false,
    error: false
  },

  observers: {
    'show, outBizNo': function(show, outBizNo) {
      if (show && outBizNo) {
        this.resetData()
        this.loadComments()
      }
    }
  },

  methods: {
    resetData() {
      this.setData({
        commentList: [],
        error: false
      })
    },

    async loadComments() {
      if (this.data.loading) return

      this.setData({ loading: true })

      try {
        const response = await api.getComments({
          outBizNo: this.data.outBizNo,
          outBizType: this.data.outBizType
        })

        if (!response || !response.data || !response.data.length) {
          return
        }

        this.setData({
          commentList: [...this.data.commentList, ...response.data]
        })
      } catch (error) {
        this.setData({ error: true })
        console.error('加载评论失败:', error)
      } finally {
        this.setData({ loading: false })
      }
    },

    // 关闭弹层
    onClose() {
      this.triggerEvent('close')
    },

    // 阻止冒泡
    catchContentTap() {
      // 阻止点击内容区域时关闭弹层
    },

    // 阻止滑动穿透
    catchTouchMove() {
      return false
    },

    // 重试加载
    retryLoad() {
      if (this.data.error) {
        this.loadComments()
      }
    }
  }
}) 