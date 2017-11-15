//orderMes.js
var util = require('../../utils/util.js');
var current_page = 1;
var domain = wx.getStorageSync('domain')
Page({
    data: {
    },
    onLoad: function (o) {
        var that = this;
        that.setData({
            orderId : o.orderId,
            backMes : o.backMes
        })
        that.takeIndexMes();
    },
    onShow : function(){
      var that = this;
      that.onLoad();
    },
  //生成信息
  takeIndexMes : function(){
    var that = this;
    var url = domain + '?version=2.0&request_url=order/back_detail&source=h5x';
    var userInfo = wx.getStorageSync('userInfo');
    var data = 
        {
            auth_token : userInfo.auth_token,
            order_id : that.data.orderId
        }
    var success = function(res){
        that.setData({
            returnMes : res.data,
        })
        var returnMes = that.data.returnMes;
        if(returnMes.back_status == 1){
            var backStatus = '买家申请退款，等待卖家处理';
        }else if(returnMes.back_status == 2){
            var backStatus = '卖家同意退货';
        }
        else if(returnMes.back_status == 3){
            var backStatus = '卖家拒绝退货，等待买家处理';
        }
        else if(returnMes.back_status == 4){
            var backStatus = '取消退货';
        }
        else if(returnMes.back_status == 5){
            var backStatus = '申诉退货';
        }
        else if(returnMes.back_status == 6){
            var backStatus = '申请退货后发货';
        }
        that.setData({
            backStatus : backStatus
        })
        var time = that.data.returnMes.back_time;
        console.log(time)
        that.takeRemaining(time);
        var backTime = that.getLocalTime(time)
        that.setData({
            backTime : backTime
        })
    }
    //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
    util.wxUrl(url,data,success)
  },
    getLocalTime : function(nS) {     
        return new Date(parseInt(nS) * 1000).toLocaleString().substr(0,19)    
    },
    cancle : function(){
        var that = this;
        var url = domain + '?version=2.0&request_url=order/cancle_back&source=h5x';
        var userInfo = wx.getStorageSync('userInfo');
        var data = 
            {
                auth_token : userInfo.auth_token,
                order_id : that.data.orderId
            }
        var success = function(res){
            if(res.data.code == 0){
                wx.redirectTo({
                    url: '../allOrder/allOrder'
                })
            }
        } 
        util.wxUrl(url,data,success)
    },
      //生成自动收货时间
    takeRemaining : function(time){
        var that = this;
        var endTime = parseInt(time)*1000 + 604800000;
        var now = new Date();
        var nowS = now.getTime();
        var remainingTime = endTime - nowS;
        var days    = remainingTime / 1000 / 60 / 60 / 24;
        var daysRound   = Math.floor(days);
        var hours    = remainingTime/ 1000 / 60 / 60 - (24 * daysRound);
        var hoursRound   = Math.floor(hours);
        var minutes   = remainingTime / 1000 /60 - (24 * 60 * daysRound) - (60 * hoursRound);
        var minutesRound  = Math.floor(minutes);
        that.setData({
            day : daysRound,
            hour : hoursRound,
            minute : minutesRound
        })
        var time = that.data.day + "天" + that.data.hour  + "小时" + that.data.minute  + "分";
            that.setData({
                time : time
            })
        if(remainingTime <= 0){
            that.setData({
                timeHidden : true,
                hidden : false
            })
        }
    },   
})

