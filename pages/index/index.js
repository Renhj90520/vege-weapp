const request = require('../../utils/request.js');
const api = require('../../utils/api.js');

Page({
  data: {
    dishlist: [],
    index: 1,
    perPage: 20
  },
  fetchDish() {
    let that = this;
    return request({ method: 'GET', url: api.getUrl(`/menus/menulist?index=${that.data.index}&perPage=${that.data.perPage}&state=1`) });
  },
  onLoad() {
    this.fetchDish().then(resp => {
      if (resp.state === 1) {
        resp.body.items.forEach(dish => {
          dish.recipesStr = dish.Recipes.map(r => r.ProductName.indexOf('(') > 0 ? r.ProductName.substring(0, r.ProductName.indexOf('(')) : r.ProductName).join(',');
        });
        this.setData({ dishlist: resp.body.items });
        if (resp.body.count > this.data.index * this.data.perPage) {
          that.setData({ index: index++ });
        }
      }
    });
  },
  loadData() {
    let that = this;
    that.fetchDish().then(resp => {
      if (resp.state === 1) {
        resp.body.items.forEach(dish => {
          dish.recipesStr = dish.recipes.join(',');
          that.data.dishlist.push(dish);
        });
        if (resp.body.count > that.data.index * that.data.perPage) {
          that.setData({ index: index++ });
        }
      } else {
        alert(resp.message);
      }
    });
  }
})