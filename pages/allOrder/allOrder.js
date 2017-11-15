//shpCar.js
var util = require('../../utils/util.js');
var current_page = 1;
var domain = wx.getStorageSync('domain');
var app = getApp();
Page({
    data: {
        hidden: true,
        endImg: true,
        selected: 0,
        selected1: 0,
        selected2: 0,
        selected3: 0,
        selected4: 0
    },
    onLoad: function () {
        var that = this;
        //获取设备信息
        var userInfo = wx.getStorageSync('userInfo');
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    sysWidth: res.windowWidth,
                    sysHeight: res.windowHeight
                })
            }
        });
        that.takeNum();
        that.allOrder();
        wx.setNavigationBarTitle({
            title: '订单信息'
        })
        console.log(111)
    },
    //生成title信息
    takeNum: function () {
        var that = this;
        var url = domain + '?version=1.5&request_url=order/my_order';
        var userInfo = wx.getStorageSync('userInfo');
        var data =
            {
                auth_token: userInfo.auth_token
            }
        var success = function (res) {
            if (res.data.code == 4040) {
                wx.showModal({
                    title: '登陆失败',
                    content: '您曾拒绝过用户信息授权，请前往小程序的‘设置’中，允许使用您的‘用户信息’。设置完成后，返回进行授权登陆。',
                    showCancel: true,
                    cancelText: '游客浏览',
                    confirmText: '去设置',
                    success: function (res) {
                        if (res.confirm) {
                            wx.openSetting({
                                success: function (res) {
                                    if (res.authSetting["scope.userInfo"]) {
                                        app.getUserInfo();
                                        wx.showToast({
                                            title: 'loading',
                                            icon: 'loading',
                                            duration: 2000
                                        })
                                        setTimeout(function () {
                                            that.onLoad()
                                        }, 2000)
                                    } else {
                                        console.log(false)
                                    }
                                }
                            })
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                })
            } else {
                that.setData({
                    num: res.data
                })
            }
        }
        //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
        util.wxUrl(url, data, success)
    },
    //生成订单信息
    takeOrderList: function (status) {
        var that = this;
        var url = domain + '?version=1.5&request_url=order/my_order_list';
        var userInfo = wx.getStorageSync('userInfo');
        var data =
            {
                auth_token: userInfo.auth_token,
                current_page: current_page,
                item_count: 10,
                order_status: status
            }
        var success = function (res) {
            if (res.data.code == 0) {
                for (var i = 0; i < res.data.list.length; i++) {
                    var finallyMoney = res.data.list[i].total_price - res.data.list[i].voucher_amount;
                    var finallyMoney = Math.floor(finallyMoney * 100) / 100;
                    res.data.list[i].finallyMoney = finallyMoney;
                    var time = new Date(res.data.list[i].order_time * 1000);
                    var years = time.getFullYear(time);
                    var months = time.getMonth(time) + 1;
                    var days = time.getDate(time)
                    var orderTime = years + "-" + months + "-" + days
                    res.data.list[i].order_time = orderTime;
                }
                that.setData({
                    orderMes: res.data.list
                });
            } else {
                that.setData({
                    orderMes: "",
                    hidden: true,
                    endImg: false
                });
            }
        }
        //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
        util.wxUrl(url, data, success)
    },
    //全部订单
    allOrder: function () {
        var that = this;
        current_page = 1;
        that.setData({
            status: 0,
            selected: 0,
            selected1: 0,
            selected2: 0,
            selected3: 0,
            selected4: 1
        })
        that.takeOrderList(that.data.status);
    },
    //待付款订单
    waitIngOrder: function () {
        var that = this;
        current_page = 1;
        that.setData({
            status: 1,
            selected: 1,
            selected1: 0,
            selected2: 0,
            selected3: 0,
            selected4: 0
        })
        that.takeOrderList(that.data.status);
    },
    //支付中订单
    payIngOrder: function () {
        var that = this;
        current_page = 1;
        that.setData({
            status: 2,
            selected: 0,
            selected1: 1,
            selected2: 0,
            selected3: 0,
            selected4: 0
        })
        that.takeOrderList(that.data.status);
    },
    //待收货订单
    userTakeOrder: function () {
        var that = this;
        current_page = 1;
        that.setData({
            status: 4,
            selected: 0,
            selected1: 0,
            selected2: 0,
            selected3: 1,
            selected4: 0
        })
        that.takeOrderList(that.data.status);
    },
    //已完成订单
    successOrder: function () {
        var that = this;
        current_page = 1;
        that.setData({
            status: 3,
            selected: 0,
            selected1: 0,
            selected2: 1,
            selected3: 0,
            selected4: 0
        })
        that.takeOrderList(that.data.status);
    },
    //下拉加载
    takeMore: function () {
        var that = this;
        current_page++;
        var url = domain + '?version=1.5&request_url=order/my_order_list';
        var userInfo = wx.getStorageSync('userInfo');
        var data =
            {
                auth_token: userInfo.auth_token,
                current_page: current_page,
                item_count: 10,
                order_status: that.data.status
            }
        var success = function (res) {
            that.setData({
                hidden: false
            })
            if (res.data.code == 0) {
                for (var i = 0; i < res.data.list.length; i++) {
                    var time = new Date(res.data.list[i].order_time * 1000);
                    var years = time.getFullYear(time);
                    var months = time.getMonth(time) + 1;
                    var days = time.getDate(time)
                    var orderTime = years + "-" + months + "-" + days
                    res.data.list[i].order_time = orderTime;
                }
                that.setData({
                    orderMes: that.data.orderMes.concat(res.data.list)
                })
            } else {
                that.setData({
                    hidden: true,
                    endImg: false
                });
            }
        }
        //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
        util.wxUrl(url, data, success)
    },
    toOrder: function (e) {
        var that = this;
        var touchTime = that.data.touch_end - that.data.touch_start;
        var orderId = e.currentTarget.dataset.orderid
        if (touchTime < 350) {
            wx.navigateTo({
                url: "../orderMes/orderMes?orderId=" + orderId
            })
        }
    },
    delOrder: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.orderid;
        var orderStatus = e.currentTarget.dataset.orderstatus;
        var index = e.currentTarget.dataset.index
        if (orderStatus != 1 && orderStatus != 2 && orderStatus != 3) {
            wx.showModal({
                title: '删除',
                content: '确认删除订单？',
                success: function (res) {
                    if (res.confirm) {
                        var url = domain + '?version=2.5&request_url=order/delete_order';
                        var userInfo = wx.getStorageSync('userInfo');
                        var data = {
                            auth_token: userInfo.auth_token,
                            order_id: orderId,
                            type: 2
                        }
                        var success = function (res) {
                            if (res.data.code == 0) {
                                var num = that.data.num;
                                switch (that.data.status ){
                                    case 0:
                                        num[0] = num[0] - 1;
                                        that.takeNum();
                                    break;
                                    case 1:
                                        num[0] = num[0] - 1;
                                        num[1] = num[1] - 1;
                                        break;
                                    case 3:
                                        num[0] = num[0] - 1;
                                        num[3] = num[3] - 1;
                                    default:
                                      break
                                }
                                var orderMes = that.data.orderMes;
                                orderMes.splice(index, 1)
                                that.setData({
                                    num: num,
                                    orderMes: orderMes
                                })
                            }
                        }
                        util.wxUrl(url, data, success)
                    }
                }
            })
        } else {
            wx.showModal({
                title: '删除',
                content: '确认删除订单？',
                success: function (res) {
                    if (res.confirm) {
                        var url = domain + '?version=2.0&request_url=order/cancel_order&source=h5x';
                        var userInfo = wx.getStorageSync('userInfo');
                        var data = {
                            auth_token: userInfo.auth_token,
                            order_id: orderId
                        }
                        var success = function (res) {
                            if (res.data.code == 0) {
                                var num = that.data.num;
                                switch (that.data.status) {
                                    case 0:
                                        num[0] = num[0] - 1;
                                        that.takeNum();
                                        break;
                                    case 1:
                                        num[0] = num[0] - 1;
                                        num[1] = num[1] - 1;
                                        break;
                                    case 3:
                                        num[0] = num[0] - 1;
                                        num[3] = num[3] - 1;
                                    default:
                                        break
                                }
                                var orderMes = that.data.orderMes;
                                orderMes.splice(index, 1)
                                that.setData({
                                    num: num,
                                    orderMes: orderMes
                                })
                            } else {
                                console.log("失败")
                            }
                        }
                        util.wxUrl(url, data, success);
                    }
                }
            })
        }
    },
    mytouchstart: function (e) {
        var that = this;
        that.setData({
            touch_start: e.timeStamp
        })
    },
    mytouchend: function (e) {
        var that = this;
        that.setData({
            touch_end: e.timeStamp
        })
    }
})

