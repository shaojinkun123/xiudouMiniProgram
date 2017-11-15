//addressList.js
//获取应用实例
var util = require('../../utils/util.js');
var domain = wx.getStorageSync('domain')
Page({
  data: {
     
  },
    onLoad: function (o) {
        var that = this
        //获取设备信息
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    sysWidth: res.windowWidth,
                    sysHeight:res.windowHeight
                })
            }
        });
        if(o != ""){
            that.setData({
                shopCar : o.type
            })
        }
        var value = wx.getStorageSync('userInfo');
            that.setData({
                userInfo : value
            })
        that.takeIndexMes();
        wx.setNavigationBarTitle({
            title: '地址列表'
        })
        var addressId = wx.getStorageSync('addressId');
        if(addressId){
            that.setData({
                addressId : addressId
            })
        }
    },
    // onShow : function(){
    //   var that = this;
    //   that.onLoad();
    // },
    //生成信息
    takeIndexMes : function(){
        var that = this;
        var url = domain + '?version=1.0&request_url=user/address_list&source=h5x';
        var data = 
            {
                auth_token :that.data.userInfo.auth_token,
            }
        var success = function(res){
            that.setData({
                indexMes:res.data
            })
        }
        //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
        util.wxUrl(url,data,success);
    },
    radioChange : function(e){
        wx.setStorage({
            key:"addressId",
            data:e.detail.value
        })
    },
    showAddress : function(e){
        var that = this;
        var address = e.currentTarget.dataset.address;
        var buyerName = address.name;
        var buyerPhone = address.phone_number;
        var location = address.location;
        var place = address.address;
        var addressId = address.id;
        wx.setStorageSync('addressId', addressId)
        if(that.data.shopCar){
            wx.redirectTo({
                url: '../buyInfo/buyInfo?type=shopCar&buyerName='+buyerName+'&buyerPhone='+buyerPhone+'&location='+location+'&place='+place+'&addressId='+addressId+''
            })
        }else{
            wx.redirectTo({
                url: '../buyInfo/buyInfo?buyerName='+buyerName+'&buyerPhone='+buyerPhone+'&location='+location+'&place='+place+'&addressId='+addressId+''
            })           
        }
    },
    reSetAddress : function(e){
        var that = this;
        var address = e.currentTarget.dataset.address;
        var buyerName = address.name;
        var buyerPhone = address.phone_number;
        var locationArray =  address.address_array
        var location = address.location;
        var place = address.address;
        var addressId = address.id;
        var longPlace = e.currentTarget.dataset.longplace;
        if(!that.data.shopCar){
            wx.redirectTo({
                url: '../addAddress/addAddress?buyerName='+buyerName+'&buyerPhone='+buyerPhone+'&location='+location+'&place='+place+'&locationArray='+locationArray+'&addressId='+addressId+'&longPlace='+longPlace+''
            })
        }else{
            wx.redirectTo({
                url: '../addAddress/addAddress?type=shopCar&buyerName='+buyerName+'&buyerPhone='+buyerPhone+'&location='+location+'&place='+place+'&locationArray='+locationArray+'&addressId='+addressId+'&longPlace='+longPlace+''
            })
        }

    },
    onUnload: function() {
        wx.removeStorageSync('defalutAddress')
    }
})

