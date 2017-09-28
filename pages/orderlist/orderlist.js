const request = require('../../utils/request.js');
const api = require('../../utils/api.js');

// pages/orderlist/orderlist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderlist: [{ "Id": 223, "OpenId": "oelKF1go4GNtrD0Z_lvM_hIlBPrA", "CreateTime": "2017-09-16T14:27:17.909985", "CancelTime": "0001-01-01T00:00:00", "FinishTime": "0001-01-01T00:00:00", "State": 0, "Products": [{ "Count": 1.0, "Id": 610, "Name": "宽容皇帝贡长粒香10kg", "UnitId": 9, "UnitName": "袋", "Step": 1.0, "Price": 56.0, "Pictures": [{ "Id": 203, "Path": "http://www.xjconvenience.com/upload/20170810214511.jpg" }], "CategoryId": 15, "Sequence": 0, "State": 1, "Limit": 0 }], "Phone": "17609946203", "Street": "乌伊西路与北京路交叉口654电台家属院2号楼2单元601", "City": null, "Province": null, "Name": "张万年", "Area": null, "DeliveryCharge": 0.0, "WXOrderId": "20170916142718350-223", "Latitude": 0.0, "Longitude": 0.0, "RefundNote": null, "CancelReason": null, "IsPaid": "0" }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    const openid = wx.getStorageSync('openid');

    request({ method: 'GET', url: api.getUrl(`/orders/${openid}?noshowRemove=true`) })
      .then(resp => {
        if (resp.state === 1) {
          const items = resp.body.items;
          items.forEach(item => {
            const total = item.Products.map(p => { return p.Price * p.Count }).reduce((x, y) => x + y);
            if (item.DeliveryCharge !== 0) {
              item.total = total + item.DeliveryCharge;
            } else {
              item.total = total;
            }
            item.CreateTime = item.CreateTime.replace('T', ' ').substring(0, 19);
            item.State = that.getOrderState(item.State);
          });
          that.setData({ orderlist: items });
        }
      })
  },
  getOrderState(state) {
    switch (state) {
      case 0: return "未支付";
      case 1: return "已支付";
      case 2: return "已联系";
      case 3: return "派送中";
      case 4: return "已取消";
      case 5: return "交易完成";
      case 6: return "已退款";
      case 7: return "已删除";
      default: return "";
    }
  }
})