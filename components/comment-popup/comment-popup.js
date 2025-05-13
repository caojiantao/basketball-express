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
    },
    page: {
      type: Number,
      value: 1
    },
    pageSize: {
      type: Number,
      value: 10
    },
    noMore: {
      type: Boolean,
      value: false
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
      if (this.data.loading || this.data.noMore) return

      this.setData({ loading: true })

      try {
        const response = await api.getComments({
          outBizNo: this.data.outBizNo,
          outBizType: this.data.outBizType,
          page: this.data.page,
          pageSize: this.data.pageSize
        })

        if (!response || !response.data || !response.data.length) {
          this.setData({ noMore: true })
          return
        }

        this.setData({
          commentList: [...this.data.commentList, ...response.data],
          page: this.data.page + 1,
          noMore: response.data.length < this.data.pageSize
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