const request = require('../../utils/request.js');
const api = require('../../utils/api.js');

// pages/dishdetail/dishdetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menu: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.id);
    this.fetchDish(options.id).then(resp => {
      if (resp.state === 1) {
        const recipes = [];
        resp.body.Recipes.forEach(function (r) {
          r.Count = r.Step;
          recipes.push(r.Name.indexOf('(') > 0 ? r.Name.substring(0, r.Name.indexOf('(')) : r.Name)
        });
        resp.body.recipesStr = recipes.join(',');
        this.setData({ menu: resp.body });
        wx.setNavigationBarTitle({
          title: resp.body.Name,
        });
      }
    });
  },
  fetchDish(id) {
    let that = this;
    return request({
      method: 'GET', url: api.getUrl(`/menus/${id}`)
    });
  },
  addCart() {
    let that = this;
    const orderitems = that.data.menu.Recipes;
    wx.setStorageSync('cart', orderitems);
    wx.navigateBack();
  }
})