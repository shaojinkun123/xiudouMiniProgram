var util = require('../../utils/util.js');
var changeNum = 0;
var domain = wx.getStorageSync('domain')
Page({
	data: {
		voucher: "优惠券",
		useVoucher: 0,
		save: "save",
        index : 0,
        modal : false,
        modal1 : true,
        modal2 : true,
        third : "false",
        defultPlace : 1
	},
	onLoad: function(o) {
		var that = this;
        console.log(o)
        if(o.addressId){
            that.setData({
                resetAddress : true,
                changePlace : true,
                userName : o.buyerName,
                phoneNumber : o.buyerPhone,
                choseLocation : o.location,
                placeInfo : o.place,
                choseArray : o.locationArray,
                addressId : o.addressId,
                longPlace : o.longPlace
            })
        }else{
            that.setData({
                shopCar : o.type  
            })
        }
        console.log(that.data.shopCar)
		//获取设备信息
		wx.getSystemInfo({
			success: function(res) {
				that.setData({
					sysWidth: res.windowWidth,
					sysHeight: res.windowHeight
				})
			}
		});
		var value = wx.getStorageSync('userInfo');
		that.setData({
			userInfo: value
		}) 
        // that.takeIndexMes();
        that.makePlaceMes();
        wx.setNavigationBarTitle({
            title: '地址信息'
        })
	},
    // 生成联动地址菜单
    makePlaceMes :function(){
    	var that = this;
        var provincial = [];
        var provincialIndex = [];
		var url =  domain + '?version=1.0&request_url=user/district_list&source=h5x';
		var data = {
                        district_id	: 1
                	}
		var success = function(res) {
                var len =  res.data.data.length;
                for(var i = 0; i < len; i ++){
                    provincial.push(res.data.data[i].district_name);
                    provincialIndex.push(res.data.data[i].district_id);
                }
                that.setData({
                    provincial : provincial,
                    provincialIndex : provincialIndex
                })
		    }
		//微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
		util.wxUrl(url, data, success);
    },
    hiddenThis : function(){
        var that = this;
        that.setData({
            modal : true
        })
    },
	takeUser: function(e) {
        var that = this;
		that.setData({
			userName: e.detail.value
		})
        var resetAddress = that.data.resetAddress;
        if(resetAddress){
            changeNum ++;
        }
	},
	takePhoneNumber: function(e) {
        var that = this;
		that.setData({
			phoneNumber: e.detail.value
		})
        var resetAddress = that.data.resetAddress;
        if(resetAddress){
            changeNum ++;
        }
	},
	takePlace: function(e) {
        var that = this;
		that.setData({
			place: e.detail.value
		})
        var resetAddress = that.data.resetAddress;
        if(resetAddress){
            changeNum ++;
        }
	},
	takePlaceInfo: function(e) {
        var that = this;
		that.setData({
			placeInfo: e.detail.value
		})
        var resetAddress = that.data.resetAddress;
        if(resetAddress){
            changeNum ++;
        }
	},
    choseDefult: function(e) {
        var that = this;
		if(e.detail.value){
            that.setData({
                defultPlace : 1
            })
        }else{
            that.setData({
                defultPlace : 0
            })
        }
	},
    checkNull : function(e){
        var save = e.currentTarget.dataset.save;
        var that = this;
        var userName = that.data.userName;
        var phoneNumber = that.data.phoneNumber;
        var place = that.data.place;
        var placeInfo = that.data.placeInfo;
        var first = that.data.first;
        var second = that.data.second;
        var third = that.data.third;
        var userInfo = wx.getStorageSync('userInfo');
        var auth_token = userInfo.auth_token;
        var address_arrays = that.data.placeInfo;
        var phone_number = that.data.phoneNumber;
        var default_address = that.data.defultPlace;
        var provincialArray = that.data.provincialIndexChose;
        var cityArray = that.data.countyIndexChose;
        var countyArray = that.data.cityIndexChose;
            if(!save){
                that.showModal(third,"地区不能为空");
            }else{
                if(changeNum == 0){
                    that.showModal(third,"您没有做任何修改"); 
                }else{
                    var third = "true";
                }
            }
            if(!placeInfo){
                that.showModal(placeInfo,"详细地址不能为空");
            }else if(!phoneNumber){
                that.showModal(phoneNumber,"手机号码不能为空");
            }else if(!userName){
                that.showModal(userName,"收件人不能为空"); 
            }
        if(userName && phoneNumber && placeInfo && third != "false") {
            if(!save){
                var url = domain + '?version=2.6&request_url=user/add_address&source=h5x';
            }else{
                var url = domain + '?version=2.6&request_url=user/edit_address&source=h5x';
            }
            var data = {
                    auth_token:auth_token,
                    id:that.data.addressId,
                    name:userName,
                    address_array:[provincialArray,cityArray,countyArray],
                    address_detail:address_arrays,
                    phone_number:phone_number,
                    default_address:default_address,
                    h5:'yes'
                };
            var success = function(res){
                changeNum = 0;
                if(that.data.shopCar){
                    console.log(222)
                    wx.redirectTo({
                        url: '../buyInfo/buyInfo?type=shopCar'
                    })
                }else{
                    console.log(111)
                    wx.redirectTo({
                        url: '../buyInfo/buyInfo'
                    })
                }
            }
            util.wxUrl(url, data, success);        
        }  
    },
    showModal : function(someThing,content,doSomething){
        var that = this;
        if(someThing == "" || someThing == undefined || someThing == "false"){
            wx.showModal({
                title: '提示',
                content: content,
                showCancel : false,
                success: function(res) {
                    if (res.confirm) {
                        doSomething
                    }
                }
            })
        }
    },
    //省份选择
    bindPickerChange: function(e) {
        var that = this;
        var provincial = that.data.provincial;
        that.setData({
            modal1 : false,
            index: e.detail.value,
            provincialIndexChose : that.data.provincialIndex[e.detail.value],
            provincialValue : provincial[e.detail.value],
            changePlace : false
        })
        wx.setStorage({
            key:"provincial",
            data:that.data.provincialValue
        })
        var city = [];
        var cityIndex = [];
        var cityId = that.data.provincialIndexChose;
		var url = domain + '?version=1.0&request_url=user/district_list&source=h5x';
		var data = {
                        district_id	: cityId
                	}
		var success = function(res) {
                var len =  res.data.data.length;
                for(var i = 0; i < len; i ++){
                    city.push(res.data.data[i].district_name);
                    cityIndex.push(res.data.data[i].district_id);
                }
                that.setData({
                    city : city,
                    cityIndex : cityIndex
                })
		    }
		//微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
		util.wxUrl(url, data, success);
    },
    bindPickerChangeCity : function(e){
        var that = this;
        var city = that.data.city;
        that.setData({
            modal1 : true,
            modal2 : false,
            indexCity: e.detail.value,
            cityIndexChose : that.data.cityIndex[e.detail.value],
            cityValue : city[e.detail.value],
        })
        wx.setStorage({
            key:"city",
            data:that.data.cityValue
        })
        var county = [];
        var countyIndex = [];
        var countyId = that.data.cityIndexChose;
		var url = domain + '?version=1.0&request_url=user/district_list&source=h5x';
		var data = {
                        district_id	: countyId
                	}
		var success = function(res) {
                var len =  res.data.data.length;
                for(var i = 0; i < len; i ++){
                    county.push(res.data.data[i].district_name);
                    countyIndex.push(res.data.data[i].district_id);
                }
                that.setData({
                    county : county,
                    countyIndex : countyIndex
                })
		    }
		//微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
		util.wxUrl(url, data, success);
    },
    bindPickerChangeCounty : function(e){
        var that = this;
        var county = that.data.county;
        that.setData({
            modal2 : true,
            third :"true",
            indexCounty: e.detail.value,
            countyIndexChose : that.data.countyIndex[e.detail.value],
            countyValue : county[e.detail.value],
        })
        wx.setStorage({
            key:"county",
            data:that.data.countyValue
        })
    },
    delAddress : function(){
        var that = this;
        var addressId = that.data.addressId;
		var url = domain + '?version=1.0&request_url=user/del_address&source=h5x';
        var userInfo = wx.getStorageSync('userInfo');
        var auth_token = userInfo.auth_token;
		var data = {
                        auth_token:auth_token,
                        id:addressId
                    }
		var success = function(res) {
                wx.redirectTo({
                    url: '../addressList/addressList'
                })
		    }
		//微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
		util.wxUrl(url, data, success);
    }
})