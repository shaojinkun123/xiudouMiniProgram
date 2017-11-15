//index.js
//获取应用实例
var util = require('../../utils/util.js');
var current_page = 1;
var domain = wx.getStorageSync('domain');
var app = getApp();
Page({
    data: {
        userMenu:[
            {menu:"我的购物兜",icon:"../../images/shopCar.png",url:"../productList/productList"},
            {menu:"我的订单",icon:"../../images/myOrder.png",url:"../allOrder/allOrder"}
        ]
    },
    onLoad: function () {
        var that = this;
        //获取设备信息
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    sysWidth: res.windowWidth + "px",
                    sysHeight:res.windowHeight + "px"
                })
            }
        });
        var value = wx.getStorageSync('userInfo');
        that.setData({
            userInfo : value
        })
         wx.setNavigationBarTitle({
            title: '我的'
        })
    },
    onShow:function(){
        var that = this;
        that.onLoad();
    },
    reLogin:function(){
        var that = this;
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
                                        duration: 1000
                                    })
                                    setTimeout(function(){
                                        that.onLoad()
                                    },1000)
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
    }
})

