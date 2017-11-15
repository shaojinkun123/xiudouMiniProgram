//index.js
//获取应用实例
var util = require('../../utils/util.js');
var app = getApp();
var current_page = 1;
var domain = wx.getStorageSync('domain');
app.getUserInfo();
Page({
  data: {
    'hidden':true,
    endImg:true,
    upper : true
  },
  onLoad: function () {
    var that = this;
    //获取设备信息
    wx.getSystemInfo({
        success: function(res) {
          that.setData({
              sysWidth: res.windowWidth + "px",
              sysHeight:res.windowHeight + "px",
              scroll : 0
          })
        }
    });
    that.takeIndexMes();
    // wx.switchTab({
    //     url: 'my'
    // })
  },
  upperLoad : function(){
      var that = this;
      that.setData({
          upper : false
      })
    if(that.data.upper == false){
        wx.showToast({
                title: '刷新成功',
                icon: 'success',
                duration: 1000
        })
      }
      current_page = 1;
      that.onLoad();
  },
  //生成信息
  takeIndexMes : function(){
    var that = this;
    var url = domain + '?version=2.6&request_url=index/get_home_recommend_list&source=h5x';
    var data = 
        {
            current_page:1,
            item_count:10,
        }
    var success = function(res){
        that.setData({
            indexMes:res.data.list.video,
            recommend:res.data.list.recommend,
            upper : true
          })
    }
    //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
    util.wxUrl(url,data,success)
  },
  //加载信息
  loadMore: function(url,data,success) {
    var that = this;
    current_page ++;
      that.setData({
        hidden:false
      })
       var url = domain + '?version=2.6&request_url=index/get_home_recommend_list&source=h5x';
       var data =  {
          current_page:current_page,
          item_count: 10,
        };
        var success = function(res){
          if(res.data.code == 0){
              that.setData({
                  indexMes:that.data.indexMes.concat(res.data.list.video)
              })
          }else{
              that.setData({
                  hidden:true,
                  endImg:false
              });
          }
         
        }
        util.wxUrl(url,data,success)
    }
})

