//normal.js
var util = require('../../utils/util.js');
var current_page = 1;
var domain = wx.getStorageSync('domain')
var app = getApp();

Page({
    data: {
        hidden:true,
        endImg:true,
        dialog:true,
        autoplay:false
    },
    onLoad: function (o) 
    {
        var that = this;
        current_page = 1;
        that.setData({
            shopId:o.shopId
        })
        //获取设备信息
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    sysWidth: res.windowWidth,
                    sysHeight:res.windowHeight + 2
                })
            }
        });
        that.takeNormalMes();
        that.takecommentList();
    },
    takeNormalMes : function(){
        var that = this;
        var url = domain + '?version=2.8.1&request_url=product/normal_video_detail&source=iOS';
        var userInfo = wx.getStorageSync('userInfo');
        var data;
        if (userInfo){
            data =
                {
                    normal_video_id: that.data.shopId,
                    auth_token: userInfo.auth_token
                }
        }else{
            data =
                {
                    normal_video_id: that.data.shopId,
                }
        }
        var success = function(res){
                wx.setNavigationBarTitle({
                  title: res.data.title
                })
                if(res.data.code == 4040){
                    wx.showToast({
                        title: '登陆状态过期,请您重新登陆',
                        icon: 'loading',
                        duration: 2000,
                        success: function () {
                            wx.redirectTo({
                                url: '../loginFail/loginFail',
                            })
                        }
                    })
                    return;
                }
                that.setData({
                    normalMes:res.data,
                    faved : false,
                    hasFaved : true
                })
            if(that.data.normalMes.seller_is_faved == 0){
                that.setData({
                    faved : false,
                    hasFaved : true
                })
            }else{
                that.setData({
                    faved : true,
                    hasFaved : false
                })
            }
        }
        //微信接口调用方法   需定义url,data,success//    可以定义fail,callback
        util.wxUrl(url,data,success)
    },
    takecommentList : function(){
      var that = this;
      var url = domain + "?version=2.5&request_url=comment/get_comment_list_new&source=h5x";
      var userInfo = wx.getStorageSync('userInfo');
      var data;
      if (userInfo){
          data =
              {
                  auth_token: userInfo.auth_token,
                  id: that.data.shopId,
                  current_page: current_page,
                  item_count: 100
              }
      }else{
          data =
              {
                  id: that.data.shopId,
                  current_page: current_page,
                  item_count: 10
              }
      }
        var success = function(res)
        {
            that.setData({
                commentList:res.data.list,
                total : res.data.total,
                endImg: false
            });
        }
        util.wxUrl(url,data,success)
    },
    //加载更多信息
    loadMoreComment: function() {
            var that = this;
            current_page ++;
            var url = domain + "?version=2.5&request_url=comment/get_comment_list_new&source=h5x";
            var data =  {
                    id:that.data.shopId,
                    current_page:current_page,
                    item_count:10
                };
            var success = function(res){
                if(res.data.code == 0){
                    that.setData({
                        hidden: false,
                        endImg: true,
                        commentList:that.data.commentList.concat(res.data.list)
                    });
                }else{
                    that.setData({
                        hidden:true,
                        endImg:false
                    });
                }
            }
                util.wxUrl(url,data,success)
        },
        faved : function(){
            var that = this;
            var url = domain + "?version=1.0&request_url=user/fellow_seller&source=h5x";
            var userInfo = wx.getStorageSync('userInfo');
            var data =
                {
                        auth_token:userInfo.auth_token,
                        user_id:that.data.normalMes.user.user_id
                }
                var success = function(res)
                {   
                    if(res.data.code == 4040){
                        app.reSetUserInfo();
                    }else{
                        that.setData({
                            faved: true,
                            hasFaved: false
                        });
                    }
                }
                util.wxUrl(url,data,success)
        },
        hasfaved : function(){
            var that = this;
            var url = domain + "?version=1.0&request_url=user/del_fellow_seller&source=h5x";
            var userInfo = wx.getStorageSync('userInfo');
            var data =
                {
                        auth_token:userInfo.auth_token,
                        user_id:that.data.normalMes.user.user_id
                }
                var success = function(res)
                {   
                    if (res.data.code == 4040) {
                        app.reSetUserInfo();
                    } else {
                        that.setData({
                            faved: false,
                            hasFaved: true
                        });
                    }
                }
                util.wxUrl(url,data,success)
        },
        play : function(){
            var that = this;
            that.setData({
                dialog : false,
                autoplay:true
            })
            that.videoContext = wx.createVideoContext('normalVideo')
            that.videoContext.play();
        },
        close : function(){
            var that = this;
            that.videoContext = wx.createVideoContext('normalVideo');
            that.videoContext.pause();
            that.setData({
                dialog : true
            })
        },  
        onShareAppMessage: function () {
            var that = this;
            return {
                title: that.data.normalMes.normal_video_title,
                path: "pages/normal/normal?shopId="+that.data.shopId
            }
        },
        makeZan : function(e){
            var that = this;
            var index = e.currentTarget.dataset.index;
            var url = domain + "?version=1.9&request_url=Zan/done&source=h5x";
            var userInfo = wx.getStorageSync('userInfo');
            var data = {
                auth_token : userInfo.auth_token,
                id : e.currentTarget.dataset.id,
                pid: e.currentTarget.dataset.pid,
                target_user_id: that.data.commentList[index].target_uid
            }
            var success = function(res){
                if(res.data.code == 0){
                    that.data.commentList[index].isCommented = 1;
                    that.data.commentList[index].zan_count = parseInt(that.data.commentList[index].zan_count) + 1;
                    that.setData({
                        commentList : that.data.commentList
                    })
                }else if(res.data.code == 4040){
                    app.reSetUserInfo()
                }
            }
            util.wxUrl(url,data,success)
        },    
        playCountAdd : function(){
            var that = this;
            var product_id = that.data.shopId;
            var url = domain + "?version=1.5&request_url=product/normal_video_play_incr&source=h5x";
            var userInfo = wx.getStorageSync('userInfo')
            var data =
                {
                        auth_token:userInfo.auth_token,
                        normal_video_id:that.data.shopId
                }
                var success = function(res)
                {   
                    console.log(res)
                }
                util.wxUrl(url,data,success)
        }
})

