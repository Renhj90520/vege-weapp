// pages/shoppingcart/shoppingcart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartlist: [],
    hasdelivery: false,
    totalcount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onShow() {
    let that = this;
    wx.getStorage({
      key: 'cart',
      success: function (res) {
        that.setData({ cartlist: res.data });
        that.computeTotal();
      },
    })
  },
  gotoOrder() {
    wx.navigateTo({
      url: '/pages/order/order',
    });
  },
  increase: function (e) {
    let that = this;
    let item = e.currentTarget.dataset.item;
    const target = that.data.cartlist.find(i => i.Id === item.Id);
    target.Count += target.Step;
    that.setData({ cartlist: that.data.cartlist });
    that.computeTotal();
    wx.setStorageSync('cart', that.data.cartlist);
  },
  decrease: function (e) {
    let that = this;
    let item = e.currentTarget.dataset.item;
    const target = that.data.cartlist.find(i => i.Id === item.Id);
    if (target.Count > 0) {
      target.Count -= target.Step;
      that.setData({ cartlist: that.data.cartlist });
    }
    that.computeTotal();
    wx.setStorageSync('cart', that.data.cartlist);
  },
  computeTotal() {
    let that = this;
    const items = that.data.cartlist;
    let total = items.map(item => item.Price * item.Count).reduce((x, y) => x + y);
    that.setData({
      totalcount: (total < 20 && total > 0) ? total + 5 : total,
      hasdelivery: total < 20 && total > 0
    });
  },
  removeItem: function (e) {
    let that = this;
    const item = e.currentTarget.dataset.item;
    const index = that.data.cartlist.findIndex(i => i.Id === item.Id);
    that.data.cartlist.splice(index, 1);
    that.setData({
      cartlist: that.data.cartlist
    });
    that.computeTotal();
    wx.setStorageSync('cart', that.data.cartlist);
  }
})