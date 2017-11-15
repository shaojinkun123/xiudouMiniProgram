//index.js
//获取应用实例
var util = require('../../utils/util.js');
var current_page = 1;
var app = getApp();
Page({
    data: {
        userMenu:[
            {menu:"微信客服：867604355"},
            {menu:"在线客服：秀兜人工客服"},
            {menu:"客服电话：400-625-6109"},
            {menu:"客服邮箱：kefu@xiudou.net"},
            {menu:"微信公众号：xiudou2015"},
            {menu:"合作邮箱：xiudou@xiudou.net"},
            {menu:"意见反馈"}
        ]
    },
    onLoad: function () {
        // var that = this;
        //获取设备信息
        // wx.getSystemInfo({
        //     success: function(res) {
        //         that.setData({
        //             sysWidth: res.windowWidth + "px",
        //             sysHeight:res.windowHeight + "px"
        //         })
        //     }
        // });
        // app.getUserInfo(function(userInfo){
        //      that.setData({
        //          userInfo : userInfo
        //      })
        // });
    }
})

