var WxSearch = require('../../wxSearch/wxSearch.js');
var app = getApp();
var domain = wx.getStorageSync('domain');
var util = require('../../utils/util.js');

Page({
    data: {
        cancle: true
    },
    onLoad: function () {
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    sysWidth: res.windowWidth + "px",
                    sysHeight: res.windowHeight + "px",
                    scroll: 0,
                    foundContent: false,
                    getTap: true,
                    noTopic: false
                })
            }
        });
        //初始化的时候渲染wxSearchdata
        WxSearch.init(that, 43, ['xiudou']);
        WxSearch.initMindKeys(['xiudou.com', '微信小程序开发', '微信开发', '微信小程序']);
    },
    wxSearchFn: function (e) {
        var that = this;
        WxSearch.wxSearchAddHisKey(that);
        that.setData({
            novideo: true,
            getTap: true
        })
    },
    wxSearchInput: function (e) {
        var that = this
        WxSearch.wxSearchInput(e, that);
    },
    wxSerchFocus: function (e) {
        var that = this
        WxSearch.wxSearchFocus(e, that);
    },
    wxSearchBlur: function (e) {
        var that = this
        WxSearch.wxSearchBlur(e, that);
    },
    wxSearchKeyTap: function (e) {
        var that = this
        WxSearch.wxSearchKeyTap(e, that);
    },
    wxSearchDeleteKey: function (e) {
        var that = this
        WxSearch.wxSearchDeleteKey(e, that);
    },
    wxSearchDeleteAll: function (e) {
        var that = this;
        WxSearch.wxSearchDeleteAll(that);
    },
    wxSearchTap: function (e) {
        var that = this
        WxSearch.wxSearchHiddenPancel(that);
    },
    backToIndex: function () {
        wx.navigateBack({
            delta: 1
        })
    },
    cancle: function () {
        var that = this;
        that.data.wxSearchData.value = "";
        that.data.wxSearchData.foundContent = false;
        that.setData({
            cancle: true,
            searchHidden: true,
            wxSearchData: that.data.wxSearchData
        })
    },
    selectTopic: function () {
        var that = this;
        that.setData({
            getTap: false
            // novideo:true
        })
        var url = domain + '?version=2.7.41&request_url=index/search_list&source=h5x';
        var data =
            {
                current_page: 1,
                item_count: 20,
                type: 3,
                key_word: that.data.wxSearchData.value
            }
        var success = function (res) {
            if (res.data.code == 0) {
                that.setData({
                    topicList: res.data.list,
                    noTopic: false
                })
            } else {
                that.setData({
                    topicList: '',
                    noTopic: true,
                    endImg:true
                })
                // wx.showToast({
                //     title: '没有您查找的话题',
                //     image: '../../images/war.png',
                //     duration: 2000,
                //     success:function(){
                //         that.setData({
                //             getTap:true
                //         })
                //     }
                // })
            }
        }
        //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
        util.wxUrl(url, data, success)
    },
    selectVideo: function () {
        var that = this;
        that.setData({
            getTap: true,
            topicList: '',
            endImg: true
        })
    }
})