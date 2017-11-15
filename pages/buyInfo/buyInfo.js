//index.js
//获取应用实例
var util = require('../../utils/util.js');
var domain = wx.getStorageSync('domain');
Page({
  data: {
      voucher : "优惠券",
      useVoucher : 0,
      flag:true
  },
  onLoad: function (o) {
    var that = this;
    var remark = []; 
    wx.setStorageSync('remark',remark)
    var remarkDel = wx.getStorageSync('remark');
        remarkDel.splice(0,remarkDel.length);
    wx.setNavigationBarTitle({
        title: '购买详情'
    })
    if(o){
        that.setData({
            addressId : o.addressId,
            buyerName : o.buyerName,
            buyerPhone : o.buyerPhone,
            location : o.location,
            place : o.place,
            shopCar : o.type  
        })
    }
    that.takeIndexMes();
    //获取省市区
    wx.getStorage({
        key: 'provincialValue',
        complete: function(res) {
            console.log(res.data)
        } 
    })
  },
  //生成信息
  takeIndexMes : function(){
      var that = this;
      if(!that.data.shopCar){
            var url = domain + '?version=1.0&request_url=product/get_payment_info&source=h5x';
            var defalutAddress = wx.getStorageSync('defalutAddress');
            var product_count = wx.getStorageSync('product_count');
            var product_id = wx.getStorageSync('product_id');
            var product_type_id = wx.getStorageSync('product_type_id');
            var spike_or_normal = wx.getStorageSync('spike_or_normal');
            var userInfo = wx.getStorageSync('userInfo');
            that.setData({
                defalutAddress : defalutAddress
            })
            var data = 
                {
                    auth_token :userInfo.auth_token,
                    product:[{"product_count":product_count,"product_id":product_id,"product_type_id":product_type_id,"spike_or_normal":spike_or_normal}]
                }
            var success = function(res){
                console.log(data)
				if(res.data.code == 4040){
					wx.showToast({
						title: '登陆状态过期,请您重新登陆',
						icon: 'loading',
						duration: 2000,
						success:function(){
							wx.redirectTo({
								url: '../login/login',
							})
						}
					})
					return false;
				}
                var reserverInfo = res.data.reserver_info;
                if(that.data.addressId){
                    reserverInfo.name = that.data.buyerName;
                    reserverInfo.address = that.data.place;
                    reserverInfo.location = that.data.location;
                    reserverInfo.phone_number = that.data.buyerPhone;
                    reserverInfo.id = that.data.addressId;
                }
                console.log(res.data)
                res.data.list[0].user.shop_delivery_charge = (Math.round(Number(res.data.list[0].user.shop_delivery_charge)*100)/100);
                res.data.list[0].user.shop_total_price = (Math.round(Number(res.data.list[0].user.shop_total_price)*100)/100);
                res.data.total_price = Number(res.data.total_price);
                res.data.total_delivery_charge = Number(res.data.total_delivery_charge);
                var payMoney = Number(res.data.total_price) + Number(res.data.total_delivery_charge);
                that.setData({
                    indexMes:res.data,
                    actuallyPrice:(Math.floor(payMoney*100)/100)
                })
            }
            //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
            util.wxUrl(url,data,success);
      }else{
            var url = domain + '?version=1.0&request_url=product/get_payment_info_shopping_cart&source=h5x';
            var userInfo = wx.getStorageSync('userInfo');
            var data = {
                    auth_token :userInfo.auth_token,
            }
            var success = function(res){
                console.log(res + 222)
                var reserverInfo = res.data.reserver_info;
                if(that.data.addressId){
                    reserverInfo.name = that.data.buyerName;
                    reserverInfo.address = that.data.place;
                    reserverInfo.location = that.data.location;
                    reserverInfo.phone_number = that.data.buyerPhone;
                    reserverInfo.id = that.data.addressId;
                }
                for(var i = 0;i < res.data.list.length;i ++){
                    res.data.list[i].user.shop_delivery_charge = (Math.round(Number(res.data.list[i].user.shop_delivery_charge)*100)/100);
                    res.data.list[i].user.shop_total_price = (Math.round(Number(res.data.list[i].user.shop_total_price)*100)/100)
                }
                res.data.total_price = Number(res.data.total_price);
                res.data.total_delivery_charge = Number(res.data.total_delivery_charge);
                var payMoney = Number(res.data.total_price) + Number(res.data.total_delivery_charge);
                 that.setData({
                    indexMes:res.data,
                    actuallyPrice:( Math.floor(payMoney*100)/100)
                })
            }
            util.wxUrl(url,data,success);
      }  
  },
  //显示选择优惠券
    showVoucher : function(){
        var that= this;
        var voucherLen = that.data.indexMes.vouchers;
        var voucherS = [];
        var useVoucher = [];
        var voucherSN = []
        for(var i = 0; i < voucherLen.length;i ++){
            voucherS.push(voucherLen[i].voucher_description)
            useVoucher.push(voucherLen[i].voucher_amount)
            voucherSN.push(voucherLen[i].voucher_sn)
        }
        wx.showActionSheet({
            itemList: voucherS,
            success: function(res) {
                that.setData({
                    voucher : voucherS[res.tapIndex],
                    useVoucher : useVoucher[res.tapIndex],
                    voucher_sn : voucherSN[res.tapIndex]
                })
                var allPrice = that.data.indexMes.total_price;
                var thisVoucher = parseInt(that.data.useVoucher);
                var payEnd = allPrice - thisVoucher;
                var payEnd = ( Math.round(payEnd*100)/100);
                if(payEnd <= 0){
                    that.setData({
                        actuallyPrice: that.data.indexMes.total_delivery_charge
                    })
                }else{
                    that.setData({
                        actuallyPrice: payEnd + that.data.indexMes.total_delivery_charge
                    })
                }
            },
            fail: function(res) {
                 that.setData({
                    voucher : "优惠券",
                    useVoucher : 0,
                    actuallyPrice : that.data.indexMes.total_price
                })
            }
    })
  },
  takeRemark : function(e){
      var that = this;
      var remark = wx.getStorageSync('remark')
      remark.push(e.detail.value)
      wx.setStorageSync('remark', remark)
  },
  wechatPay : function(){
        var that = this;
        var flag = that.data.flag;
        if(flag){
            that.setData({
                flag:false
            })
        that.takeRemark();
        var url= domain + "?version=2.4&request_url=user/order&source=h5x";
        var indexMes = that.data.indexMes;
        var userInfo = wx.getStorageSync('userInfo');
        var user = [];
        for(var i = 0; i < indexMes.list.length;i ++){
            var nick_name = indexMes.list[i].user.nick_name;     
            var avatar = indexMes.list[i].user.avatar;
            var shop_total_price  = indexMes.list[i].user.shop_total_price;
            var shop_total_count = indexMes.list[i].user.shop_total_count;
            var shop_delivery_charge = indexMes.list[i].user.shop_delivery_charge;
            var shop_type = indexMes.list[i].user.shop_type;
            var remark = wx.getStorageSync('remark')
            var shop_remark = remark[i];
            var product = [];
            for(var j = 0; j < indexMes.list[i].user.product.length;j++){
                var productInfo = indexMes.list[i].user.product[j];
                var productList = {
                    'product_id':productInfo.product_id,
                    'product_name':productInfo.product_name,
                    'product_image':productInfo.product_image,
                    'product_price':productInfo.product_price,
                    'product_count':productInfo.product_count,
                    'type_id':productInfo.type_id,
                    'product_type':productInfo.product_type,
                    'product_stock':productInfo.product_stock,
                    'forward_charge':productInfo.forward_charge,
                    "product_status":productInfo.product_status,
                    "spike_or_normal":0
                };
                product.push(productList)
            }
            var payamount = parseInt(parseFloat(indexMes.total_price)*1000)+parseInt(parseFloat(indexMes.list[0].user.shop_delivery_charge)*1000);
            var total_delivery_charge = indexMes.total_delivery_charge;
            var userList = {
                    'user_id':indexMes.list[i].user.user_id,
                    'nick_name':indexMes.list[i].user.nick_name,
                    'avatar':indexMes.list[i].user.avatar,
                    'shop_total_price':indexMes.list[i].user.shop_total_price,
                    'shop_total_count':indexMes.list[i].user.shop_total_count,
                    'shop_delivery_charge':indexMes.list[i].user.shop_delivery_charge,                             
                    'shop_type':indexMes.list[i].user.shop_type,
                    'shop_remark':remark[i],
                    'product':product
                    };
              user.push(userList);
        }
        if(that.data.addressId){
            var addressId = that.data.addressId
        }else{
            var addressId = that.data.indexMes.reserver_info.id
        }
        if(that.data.shopCar){
            var order_entrance = 1
        }else if(that.data.unpaidOrder){
            var order_entrance = 2
        }else{
            var order_entrance = 0
        }
        var parameter_data = {
                can_pay : 1,
                auth_token:userInfo.auth_token,
                order_source:2,
                address_id: addressId, 
                order_entrance:order_entrance,
                h5:1,
                list:user,
                total_delivery_charge:Number(total_delivery_charge),
                total_price:that.data.indexMes.total_price,
                voucher_sn:that.data.voucher_sn || ""
            }
        var data = parameter_data;
        var success = function(res){
            if(res.data.code == 0){
                that.setData({
                    trade_id : res.data.trade_id,
                    need_pay : res.data.need_pay
                })
                if(that.data.actuallyPrice == 0){
                    wx.redirectTo({
                        url: '/pages/allOrder/allOrder'
                    })
                }else{
                    that.takeOrder(); 
                }
            }else if(res.data.code == 3){
                    wx.showModal({
                    title: '支付成功',
                    content: res.data.message,
                    success: function(res) 
                    {
                         wx.redirectTo({
                            url: '/pages/allOrder/allOrder'
                        })
                    }
                })               
            }else if(res.data.code == 4){
                    wx.showModal({
                    title: '支付失败',
                    content: res.data.message,
                    success: function(res) 
                    {
                        console.log(res.data.message)
                    }
                })               
            }        
        }
        util.wxUrl(url, data, success);
        }
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
                            wx.redirectTo({
                                url: '/pages/allOrder/allOrder'
                            })
                        }
                    })
                }
            })
        }
        util.wxUrl(url,data,success);        
    }
})

