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
            timeHidden : false,
            hidden : true
        })
        //获取设备信息
        wx.getSystemInfo({
            success: function(res) {
            that.setData({
                sysWidth: res.windowWidth,
                sysHeight:res.windowHeight
            })
            }
        });     
        that.takeIndexMes();
        wx.setNavigationBarTitle({
            title: '订单详情'
        })
    },
  //生成信息
  takeIndexMes : function(){
    var that = this;
    var url = domain + '?version=1.0&request_url=order/get_customer_order_detail&source=h5x';
    var userInfo = wx.getStorageSync('userInfo');
    var data = 
        {
            auth_token : userInfo.auth_token,
            order_id : that.data.orderId
        }
    var success = function(res){
        var finallyPay = res.data.product_info.total_price - res.data.product_info.voucher_price
        that.setData({
            orderMes : res.data,
            payMethod : res.data.product_info.pay_method,
            finallyPay : finallyPay.toFixed(2)
        })
        //获取物流信息
        if(res.data.product_info.logistics_number){
            var url = domain + '?version=2.6&request_url=Logisticss/getOrderTracesByJson';
            var data={
                auth_token : userInfo.auth_token,
                logisticss_name: res.data.product_info.logistics_name,
                logisticCode: res.data.product_info.logistics_number
            }
            var success = function(res){
                var json = JSON.parse(res.data.list)
                that.setData({
                    logisticMes : json.Traces
                })
            }
            util.wxUrl(url,data,success)
        }
        if(that.data.orderMes.product_info.extend_delivery_time != 0){
            that.setData({
                extend : true
            })
        }
        var orderInfo = that.data.orderMes.product_info;
        if(orderInfo.return_order_status == 1){
            that.setData({
                backMes : "backMes"
            })
        }
        if(orderInfo.pay_method == 0){
            that.setData({
                payMethod : ""
            })
        }else if(orderInfo.pay_method == 1){
            that.setData({
                payMethod : "微信"
            })
        }else if(orderInfo.pay_method == 2){
            that.setData({
                payMethod : "支付宝"
            })
        }else{
            that.setData({
                payMethod : "银联"
            })
        };
        var order_status = that.data.orderMes.product_info.order_status;
        if(order_status == 0){
            that.setData({
                orderStatus : "付款失败"
            })
        }else if(order_status == 1){
             that.setData({
                orderStatus : "待付款"
            })
        }else if(order_status == 2){
             that.setData({
                orderStatus : "待发货"
            })
        }else if(order_status == 3){
             that.setData({
                orderStatus : "已发货",
            })
            //发货后开始执行计时操作
            var time = that.data.orderMes.product_info.wx_delivery_time;
            that.takeRemaining(time);
        }else if(order_status == 4){
             that.setData({
                orderStatus : "已完成",
                timeHidden : true,
                extend : true
            })
        }else if(order_status == 5){
             that.setData({
                orderStatus : "支付中"
            })
        }else if(order_status == 9){
             that.setData({
                orderStatus : "已关闭"
            })
        }else if(order_status == 10){
             that.setData({
                orderStatus : "已取消"
            })
        }
    }
    //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
    util.wxUrl(url,data,success)
  },
  //取消订单
    closeOrder : function(){
        var that = this;
        var url = domain + '?version=2.0&request_url=order/cancel_order&source=h5x';
        var userInfo = wx.getStorageSync('userInfo');
        var data = {
            auth_token : userInfo.auth_token,
            order_id : that.data.orderId
        }
        var success = function(res){
            if(res.data.code == 0){
                wx.navigateBack({
                    delta: 1
                })
            }else{
                console.log("失败")
            }
        }
        util.wxUrl(url,data,success);
    },
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
    //延长收货时间
    extendTime : function(){
        var that = this;
        var url = domain + '?version=2.0&request_url=order/extend_delivery_time&source=h5x';
        var userInfo = wx.getStorageSync('userInfo');
        var data = {
            auth_token : userInfo.auth_token,
            order_id : that.data.orderId
        }
        var success = function(res){
            var day = that.data.day
            if(res.data.code == 0){
                that.setData({
                    days : day + 3,
                    extend : true
                })
                that.setData({
                    time : that.data.days + "天" + that.data.hour  + "小时" + that.data.minute  + "分"
                })
            }else{
                wx.showModal({
                    showCancel : false,
                    title: '提示',
                    content: '延长收获期失败',
                    success: function(res) {
                        if (res.confirm) {
                            console.log('用户点击确定')
                        }
                    }
                })
            }
        }
        util.wxUrl(url,data,success);
    },
    //确认收货
    makeSure : function(){
        var that = this;
        wx.showModal({
            title: '温馨提示',
            content: '请收到货再确认收货，否则产生纠纷时可能无法追回损失',
            success: function(res) {
                if (res.confirm) {
                    var url = domain + '?version=1.0&request_url=order/confirm_finish_order&source=h5x';
                    var userInfo = wx.getStorageSync('userInfo');
                    var data = {
                        auth_token : userInfo.auth_token,
                        order_id : that.data.orderId
                    }
                    var success = function(res){
                        if(res.data.code == 0){
                            // that.setData({
                            //     timeHidden : true,
                            //     extend : true
                            // })
                            wx.redirectTo({
                              url: '/pages/allOrder/allOrder',
                            })
                        }else if(res.data.code == 2){
                            wx.showModal({
                                showCancel : false,
                                title: '提示',
                                content: '订单不存在',
                                success: function(res) {
                                    if (res.confirm) {
                                    console.log('用户点击确定')
                                    }
                                }
                            })
                        }else if(res.data.code == 3){
                            wx.showModal({
                                showCancel : false,
                                title: '提示',
                                content: '订单状态有误',
                                success: function(res) {
                                    if (res.confirm) {
                                    console.log('用户点击确定')
                                    }
                                }
                            }) 
                        }
                    }
                    util.wxUrl(url,data,success);
                }
            }
        })
    },
    wechatPay : function(){
        var that = this;
        var url= domain + "?version=1.0&request_url=user/settle_accounts&source=h5x";
        var userInfo = wx.getStorageSync('userInfo');
        var orderId = that.data.orderMes.product_info.order_id
        var data = {
            can_pay:1,
            auth_token:userInfo.auth_token,
            order_id:orderId,
            order_entrance:2
        }
        var success = function(res){
            if(res.data.code == 0){
                that.setData({
                    trade_id : res.data.trade_id
                });
                if(that.data.finallyPay == 0){
                    wx.redirectTo({
                        url: '/pages/allOrder/allOrder'
                    })
                }else{
                    that.takeOrder(); 
                }
            }else{
                wx.showModal({
                    showCancel : false,
                    title: '提示',
                    content: res.data.message,
                    success: function(res) {
                        if (res.confirm) {
                            console.log('用户点击确定')
                        }
                    }
                })
            }
        }
        util.wxUrl(url,data,success);
    },
    takeOrder : function(){
        var that = this;
        var url= domain + "?version=1.0&request_url=weixin/small_index&source=wx";
        var openId = wx.getStorageSync('openId');
        var data = {
            trade_id : that.data.trade_id,
            openid : openId
        }
        var success = function(res){
            var str = res.data.Parameters;
            var obj = JSON.parse(str);
            wx.requestPayment({
                'timeStamp': obj.timeStamp,
                'nonceStr': obj.nonceStr,
                'package': obj.package,
                'signType': 'MD5',
                'paySign': obj.paySign,
                'success':function(res){
                    wx.showModal({
                        title: '支付成功',
                        content: '恭喜您支付成功',
                        success: function(res) 
                        {
                            wx.redirectTo({
                                url: '/pages/allOrder/allOrder'
                            })        
                        }
                    })
                },
                'fail':function(res){
                    wx.showModal({
                        title: '支付失败',
                        content: '您可到订单页面继续支付',
                        success: function(res) 
                        {
                            wx.navigateBack({
                                delta:1
                            })
                        }
                    })
                }
            })
        }
        util.wxUrl(url,data,success);        
    }
})

