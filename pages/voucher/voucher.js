//voucher.js
//获取应用实例
var util = require('../../utils/util.js');
var domain = wx.getStorageSync('domain')
Page({
    data: {

    },
    onLoad: function (o) {
        var that = this;
        that.setData({
            userId : o.userId,
            model : true
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
        that.makeIndexMes()
    },
    onShow : function(){
      var that = this;
      that.onLoad();
    },
    makeIndexMes : function(){
        var that = this;
        var url = domain + "?version=2.5&request_url=user/shop_voucher&source=h5x";
        var data = {
                user_id:that.data.userId,
        };
        var success = function(res){
            that.setData({
                voucherMes : res.data.list
            });
            var voucherMes = that.data.voucherMes;
            for(var i = 0;i < voucherMes.length;i++){
                var start = that.getLocalTime(parseInt(voucherMes[i].start_time)).replace(/\//g, "-").substring(0, 10);
                voucherMes[i].start_time = start;
            }
            for(var i = 0;i < voucherMes.length;i++){
                var end = that.getLocalTime(parseInt(voucherMes[i].end_time)).replace(/\//g, "-").substring(0, 10);
                voucherMes[i].end_time = end;
            }
            that.setData({
                voucherMes : voucherMes
            });
        }
        util.wxUrl(url,data,success);
    },
    getLocalTime : function(nS) {
        return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
    },
    takeVoucher : function(e){   
        var that = this;
        var typeId = e.currentTarget.dataset.typeid;
        var mes = e.currentTarget.dataset.mes;
        that.setData({
            mes : mes
        })
        var url= domain + "?version=2.5&request_url=user/receive_shop_voucher&source=h5x";
        var userInfo = wx.getStorageSync('userInfo')
        var data = {
            auth_token:userInfo.auth_token,
            voucher_type_id : typeId
        }
        var success = function(res){
            if(res.data.code == 0){
                that.setData({
                    model : false
                });
            }else{
                wx.showModal({
                    content: '您已经领取过了',
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
    close : function(e){    
        var that = this;
        that.setData({
            model : true
        })
    },
    getBack : function(){
        wx.navigateBack({
            delta: 1
        })
    }
})

