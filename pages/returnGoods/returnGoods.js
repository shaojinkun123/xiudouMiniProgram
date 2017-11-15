//returnGoods.js
var util = require('../../utils/util.js');
var domain = wx.getStorageSync('domain')
Page({
    data: {
        array : ['未收到货','卖家发错货','收到商品破损','商品质量有问题','商品不好，不喜欢','多拍，拍错，不想要','未按约定时间发货','认为是假货','其他','取消'],
        expressArray : ['顺丰速运','圆通快递','中通快递','申通快递','汇通快运','韵达快递','宅急送','联邦快递','EMS','全峰快递','百世汇通','优速快递','快捷快递','德邦','中国邮政','国通快递','天天快递','晟邦物流']
    },
    onLoad: function (o) 
    {
        console.log(o)
        var that = this;
        that.setData({
            orderId:o.orderId,
            unChecked:true,
            checked:false,
            show : false,
            sure : false,
            cancle : o.status,
            maxPrice : o.price,
            orderStatus : o.orderStatus,
            voucher : o.voucher
        });
        if(that.data.voucher){
            that.setData({
                maxPrice : that.data.maxPrice
            })
        }
        if(that.data.cancle){
            that.setData({
                sure : false
            })
        }
        //获取设备信息
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    sysWidth: res.windowWidth,
                    sysHeight:res.windowHeight
                })
            }
        });
    },
    bindPickerChange: function(e) {
        var that = this;
        that.setData({
            index: e.detail.value
        })
        if(e.detail.value == 8){
            that.setData({
                show : true,
                returnReason : ''
            })
        }else{
            that.setData({
                returnReason: that.data.array[e.detail.value],
                show : false
            })  
        }
    },
    bindExpressChange: function(e) {
        var that = this;
        that.setData({
            indexS: e.detail.value
        })
    },
    changeStatus : function(){
        var that = this;
        if(!that.data.checked){
            that.setData({
                checked: true,
                unChecked:false
            })
        }else{
            that.setData({
                checked: false,
                unChecked:true
            })
        }

    },
    takeReason : function(e){
        var that = this;
        that.setData({
            returnReason : e.detail.value 
        })
    },
    hiddenBox : function(){
        var that = this;
        that.setData({
            show : false
        })
    },
    takeExpressNumber : function(e){
        var that = this;
        that.setData({
            expressNumber : e.detail.value 
        })
    },
    takeReturnPrice : function(e){
        var that = this;
        that.setData({
            returnPrice : e.detail.value 
        })
    },
    returnSure : function(){
        var that = this;
        var maxPrice = that.data.maxPrice;
        if(!that.data.index){
            wx.showModal({
                title: '提示',
                content: '请选择退货原因',
                success: function(res) {
                    if (res.confirm) {
                    console.log('用户点击确定')
                    }
                }
            })
        }else if(that.data.returnPrice > maxPrice){
            wx.showModal({
                title: '提示',
                content: '退款金额不能大于' + maxPrice,
                success: function(res) {
                    if (res.confirm) {
                    console.log('用户点击确定')
                    }
                }
            })
        }else{
            var url = domain + '?version=2.0&request_url=order/apply_return_goods&source=h5x';
            if(that.data.checked && that.data.index != 0){
                var backWay = 0
            }else if(!that.data.checked){
                var backWay = 1
            }
            if(that.data.orderStatus){
                var backWay = 2
            }
            var userInfo = wx.getStorageSync('userInfo')
            var data = 
                {
                    auth_token:userInfo.auth_token,
                    order_id:that.data.orderId,
                    back_reason_id:that.data.index + 1,
                    back_reason:that.data.returnReason,
                    back_price:that.data.returnPrice,
                    back_way:backWay,
                    back_express_number:that.data.expressNumber,
                    back_express_company:that.data.expressArray[that.data.indexS]
                }
            var success = function(res){
                    if(res.data.code == 0){
                        wx.showToast({
                            title: '申请退货成功',
                            icon: 'success',
                            duration: 2000
                        })
                        that.setData({
                            sure : true
                        })
                        wx.redirectTo({
                          url: '../returnMes/returnMes?orderId=' + that.data.orderId + '&backMes=backMes',
                          success: function(res){
                            console.log(res)
                          }
                        })
                    }else{
                        wx.showModal({
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
            //微信接口调用方法   需定义url,data,success//    可以定义fail,callback
            util.wxUrl(url,data,success);
        }
    }
})

