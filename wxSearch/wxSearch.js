// 定义数据格式

/***
 * 
 * "wxSearchData":{
 *  configconfig:{
 *    style: "wxSearchNormal"
 *  },
 *  view:{
 *    hidden: true,
 *    searchbarHeght: 20
 *  }
 *  keys:[],//自定义热门搜索
 *  his:[]//历史搜索关键字
 *  value
 * }
 * 
 * 
 */
var __keysColor = [];
var util = require('../utils/util.js');

var __mindKeys = [];
var domain = wx.getStorageSync('domain');

function initColors(colors){
    __keysColor = colors;
}
function initMindKeys(keys){
    __mindKeys = keys;
}

function init(that, barHeight, keys, isShowKey, isShowHis, callBack) {
    var temData = {};
    var view = {
        barHeight: barHeight,
        isShow: false
    }
    
    if(typeof(isShowKey) == 'undefined'){
        view.isShowSearchKey = true;
    }else{
        view.isShowSearchKey = isShowKey;
    }

    if(typeof(isShowHis) == 'undefined'){
        view.isShowSearchHistory = true;
    }else{
        view.isShowSearchHistory = isShowHis;
    }
    temData.keys = keys;
    wx.getSystemInfo({
        success: function(res) {
            var wHeight = res.windowHeight;
            view.seachHeight = wHeight-barHeight;
            temData.view = view;
            that.setData({
                wxSearchData: temData
            });
        }
    })
    
    if (typeof (callBack) == "function") {
        callBack();
    }
    
    getHisKeys(that);
}

function wxSearchInput(e, that, callBack){
    var temData = that.data.wxSearchData;
    var text = e.detail.value;
    var mindKeys = [];
    if(typeof(text) == "undefined" || text.length == 0){
        that.setData({
            foundContent:true,
            searchHidden:true,
            cancle: true
        })
    }else{
        for(var i = 0; i < __mindKeys.length; i++){
            that.setData({
                searchHidden: false,
                cancle:false
            })
            var mindKey = __mindKeys[i];
            if(mindKey.indexOf(text) > -1){
                mindKeys.push(mindKey);
            }
        }
    }
    temData.value = text;
    temData.mindKeys = mindKeys;
    that.setData({
        wxSearchData: temData
    });
}

function wxSearchFocus(e, that, callBack) {
    var temData = that.data.wxSearchData;
    temData.view.isShow = true;
    that.setData({
        wxSearchData: temData
    });
    //回调
    if (typeof (callBack) == "function") {
        callBack();
    }
    // if(typeof(temData) != "undefined"){
    //   temData.view.hidden= false;
    //   that.setData({
    //     wxSearchData:temData
    //   });
    // }else{

    // }
}
function wxSearchBlur(e, that, callBack) {
    var temData = that.data.wxSearchData;
    temData.value = e.detail.value;
    that.setData({
        wxSearchData: temData
    });
    if (typeof (callBack) == "function") {
        callBack();
    }
}

function wxSearchHiddenPancel(that){
    var temData = that.data.wxSearchData;
    temData.view.isShow = false;
    that.setData({
        wxSearchData: temData
    });
}

function wxSearchKeyTap(e, that, callBack) {
    //回调
    var temData = that.data.wxSearchData;
    temData.value = e.target.dataset.key;
    that.setData({
        wxSearchData: temData
    });
    that.setData({
        cancle:false
    })
    this.wxSearchAddHisKey(that);
    if (typeof (callBack) == "function") {
        callBack();
    }
}
function getHisKeys(that) {
    var value = [];
    try {
        value = wx.getStorageSync('wxSearchHisKeys')
        if (value) {
            // Do something with return value
            var temData = that.data.wxSearchData;
            temData.his = value;
            that.setData({
                wxSearchData: temData
            });
        }
    } catch (e) {
        // Do something when catch error
    }
    
}
function wxSearchAddHisKey(that) {
    wxSearchHiddenPancel(that);
    var text = that.data.wxSearchData.value;
    if(typeof(text) == "undefined" || text.length == 0){return;}
    var url = domain + '?version=2.7.32&request_url=index/search_list&source=h5x';
    var data =
        {
            current_page: 1,
            item_count: 20,
            type: 1,
            key_word:text
        }
    var success = function (res) {
        if(res.data.code == 0){
            var temData = that.data.wxSearchData;
                temData.foundContent  = true;
            that.setData({
                wxSearchData: temData,
                searchMes: res.data,
                getTap:true,
                novideo: true,
                endImg:false
            })
            var value = wx.getStorageSync('wxSearchHisKeys');
            if (value) {
                if (value.indexOf(text) < 0) {
                    value.unshift(text);
                }
                wx.setStorage({
                    key: "wxSearchHisKeys",
                    data: value,
                    success: function () {
                        novideo: true,
                        getHisKeys(that);
                    }
                })
            } else {
                value = [];
                value.push(text);
                wx.setStorage({
                    key: "wxSearchHisKeys",
                    data: value,
                    success: function () {
                        getHisKeys(that);
                    }
                })
            } 
        }else{
            var temData = that.data.wxSearchData;
            temData.foundContent = true;
            that.setData({
                wxSearchData: temData,
                searchMes: res.data,
                getTap: true,
                novideo: false,
                endImg: true,
            })
            var value = wx.getStorageSync('wxSearchHisKeys');
            if (value) {
                if (value.indexOf(text) < 0) {
                    value.unshift(text);
                }
                wx.setStorage({
                    key: "wxSearchHisKeys",
                    data: value,
                    success: function () {
                        novideo: true,
                            getHisKeys(that);
                    }
                })
            } else {
                value = [];
                value.push(text);
                wx.setStorage({
                    key: "wxSearchHisKeys",
                    data: value,
                    success: function () {
                        getHisKeys(that);
                    }
                })
            } 
        }
    }
    //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
    util.wxUrl(url, data, success)
}
function wxSearchDeleteKey(e,that) {
    var text = e.target.dataset.key;
    var value = wx.getStorageSync('wxSearchHisKeys');
    value.splice(value.indexOf(text),1);
    wx.setStorage({
        key:"wxSearchHisKeys",
        data:value,
        success: function(){
            getHisKeys(that);
        }
    })
}
function wxSearchDeleteAll(that){
    wx.removeStorage({
        key: 'wxSearchHisKeys',
        success: function(res) {
            var value = [];
            var temData = that.data.wxSearchData;
            temData.his = value;
            that.setData({
                wxSearchData: temData
            });
        } 
    })
}
module.exports = {
    init: init,
    initColor: initColors,
    initMindKeys: initMindKeys,
    wxSearchInput: wxSearchInput,
    wxSearchFocus: wxSearchFocus,
    wxSearchBlur: wxSearchBlur,
    wxSearchKeyTap: wxSearchKeyTap,
    wxSearchAddHisKey:wxSearchAddHisKey,
    wxSearchDeleteKey:wxSearchDeleteKey,
    wxSearchDeleteAll:wxSearchDeleteAll,
    wxSearchHiddenPancel:wxSearchHiddenPancel,
}