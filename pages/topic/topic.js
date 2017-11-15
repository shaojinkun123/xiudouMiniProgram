//index.js
//获取应用实例
var util = require('../../utils/util.js');
var current_page = 1;
var domain = wx.getStorageSync('domain')
Page({
  data: {
    'hidden':true,
    endImg:true
  },
  onLoad: function (o) {
    var that = this;
    that.setData({
        topic : o.topic
    })
    console.log(o)
    //获取设备信息
    wx.getSystemInfo({
        success: function(res) {
          that.setData({
              sysWidth: res.windowWidth + "px",
              sysHeight:res.windowHeight + "px"
          })
        }
    });
    that.takeIndexMes();
  },
//     onShow : function(){
//       var that = this;
//       that.onLoad();
//   },
  //生成信息
  takeIndexMes : function(){
    var that = this;
    var url = domain + '?version=2.6&request_url=topic/get_topic_video_list&source=h5x';
    var topic = that.data.topic
    // .toString().replace(/#/, "");
    var data = 
        {
            current_page:1,
            item_count:10,
            topic_name:topic
        }
    var success = function(res){
        that.setData({
            indexMes:res.data.list,
            headImage:res.data.head_image,
            headTitle:res.data.head_title,
            shareImg : res.data.topic_head_image32
          })
        wx.setNavigationBarTitle({
            title: "#" + topic + "#"
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
        var url = domain + '?version=2.6&request_url=topic/get_topic_video_list&source=h5x';
        var topic = that.data.topic.split("#").join("");
        var data =  {
            current_page:current_page,
            item_count: 10,
            topic_name:topic
            };
            var success = function(res){
            if(res.data.code == 0){
                that.setData({
                    indexMes:that.data.indexMes.concat(res.data.list)
                })
            }else{
                that.setData({
                    hidden:true,
                    endImg:false
                });
            }
            
            }
            util.wxUrl(url,data,success)
    },
      onShareAppMessage: function () {
            var that = this;
            var topic = that.data.topic.split("#").join("");
            return {
                title: that.data.headTitle,
                path: "/pages/topic/topic?topic="+that.data.topic
            }
    }
})

