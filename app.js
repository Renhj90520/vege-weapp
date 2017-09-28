const config = require('./config.js');
const request = require('./utils/request.js');
const api = require('./utils/api.js');
//app.js
App({
  onLaunch() {
    wx.clearStorageSync();
    wx.login({
      success: res => {
        const code = res.code;
        request({ method: 'GET', url: api.getAuthUrl(`/getuserinfo?code=${code}&isapp=true`) }).then(function (resp) {
          if (resp.state === 1) {
            wx.setStorage({
              key: 'openid',
              data: resp.body.openid
            });
            wx.setStorage({
              key: 'unionid',
              data: resp.body.unionid,
            });
            wx.setStorage({
              key: 'token',
              data: resp.body.token,
            })
          }
        });
      }
    })
  }
})