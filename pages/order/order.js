const request = require('../../utils/request.js');
const api = require('../../utils/api.js');

// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderlist: [],
    address: null,
    isopen: false,
    totalcost: 0,
    hasdelivery: false
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    const openid = wx.getStorageSync('openid');
    request({ method: "GET", url: api.getUrl(`/addresses/${openid}`) })
      .then(resp => {
        if (resp.state === 1) {
          that.setData({
            address: resp.body ? resp.body[0] : null
          });
        }
      });
    wx.getStorage({
      key: 'cart',
      success: function (res) {
        let total = 0;
        res.data.forEach(o => {
          o.Cost = o.Count * o.Price;
          total += o.Cost
        });

        that.setData({
          orderlist: res.data,
          totalcost: total < 20 ? total + 5 : total,
          hasdelivery: total < 20
        });
      },
    })
  },
  addAddr: function (e) {
    let that = this;
    console.log(e.detail.value);
    const addr = {};
    const formValue = e.detail.value;
    addr.Name = formValue.name;
    addr.Phone = formValue.phone;
    addr.Street = formValue.street;
    addr.OpenId = wx.getStorageSync('openid');
    request({ method: "POST", url: api.getUrl('/addresses'), body: addr })
      .then(resp => {
        if (resp.state === 1) {
          that.setData({
            address: addr
          });
        }
      });
    that.setData({
      isopen: false,
      address: addr
    });
  },
  hidemodal() {
    this.setData({
      isopen: false
    });
  },
  showmodal() {
    this.setData({
      isopen: true
    });
  },
  btnpay() {
    let that = this;
    const openid = wx.getStorageSync('openid');
    let delivery = 0;
    if (that.data.hasdelivery) {
      delivery = 5;
    }
    const order = {
      DeliveryCharge: delivery,
      State: 0,
      AddressId: that.data.address.Id,
      OpenId: openid,
      products: that.data.orderlist.map(p => { return { ProductId: p.Id, Count: p.Count, Price: p.Price } })
    };
    request({ method: "POST", url: api.getUrl(`/orders/${openid}`), body: order })
      .then(resp => {
        if (resp.state === 1) {
          const newOrder = resp.body;
          const id = newOrder.Id;
          const totalfee = that.data.totalcost * 100;
          wx.removeStorageSync('cart');
          request({ method: 'PUT', url: api.getUrl(`wechat/prepay/${id}/${totalfee}/${openid}`) }).then(ress => {
            if (ress.state === 1) {
              const wxconfig = ress.body;
              const prepayid = wxconfig.prepayid;
              const key = wxconfig.key;
              const appid = wxconfig.appId;
              const wxpay = {};
              wxpay.timeStamp = new Date().getTime().toString();
              wxpay.nonceStr = Math.random().toString(36).substr(2);
              wxpay.package = `prepay_id=${prepayid}`;
              wxpay.signType = 'MD5';
              wxpay.appId = appid;
              wxpay.paySign = that.buildSign(wxpay, key);
              wxpay.success = function (rrr) {
                if (rrr.err_msg === 'requestPayment:ok') {
                  const patchDoc = [];
                  if (orderState === 0) {
                    const stateOp = {};
                    stateOp.path = '/State';
                    stateOp.value = '1';
                    patchDoc.push(stateOp);
                  }
                  const notifyState = {};
                  notifyState.path = '/NotifyState';
                  notifyState.value = '2';
                  patchDoc.push(notifyState);
                  const ispaid = {};
                  ispaid.path = '/IsPaid';
                  ispaid.value = '1';
                  patchDoc.push(ispaid);
                  request({ method: 'PATCH', url: api.getUrl(`/orders/${id}`), body: patchDoc }).then(r => {
                    if (r.state === 1) {
                      wx.navigateTo({
                        url: '/pages/orderlist/orderlist',
                      });
                    }
                  })
                }
              };
              wx.requestPayment(wxpay);

              wx.navigateTo({
                url: '/pages/orderlist/orderlist',
              });
            }
          });
        }
      });
  },
  buildSign(info, wxkey) {

    const keys = Object.keys(info);
    keys.sort();
    const infos = [];
    keys.forEach(key => {
      infos.push(key + '=' + info[key]);
    });
    let tempStr = infos.join('&');
    tempStr += '&key=' + wxkey;
    // console.log('tempStr is :' + tempStr);
    const sign = Md5.hashStr(tempStr);
    return sign.toString().toUpperCase();
  }
})