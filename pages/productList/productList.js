//shpCar.js
var util = require('../../utils/util.js');
var flag = true;
var domain = wx.getStorageSync('domain')
var app = getApp()
Page({
    data: {
        tap : 1,
        buy : 0,
        checkNum : 0
    },
    onLoad: function () {
        var that = this
        //获取设备信息
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    sysWidth: res.windowWidth,
                    sysHeight:res.windowHeight,
                    checkNum: 0
                })
            }
        });
        that.takeIndexMes();
        wx.setNavigationBarTitle({
            title: '购物兜'
        })
    },
    // onReady:function(){
    //     var that = this;
    //     that.setData({
    //         checkNum: 0
    //     })
    //     console.log(that.data.checkNum + 'nononon')
    // },
    //生成信息
    takeIndexMes : function(){
        var that = this;
        var url = domain + '?version=1.9&request_url=cart/shopping_cart';
        var userInfo = wx.getStorageSync('userInfo');
        var data = 
            {
                auth_token : userInfo.auth_token
            }
        var success = function(res){
            if(res.data.code == 4040){
                app.reSetUserInfo();
            }else{
                var productList = res.data.list;
                var product = [];
                for (var i = 0; i < productList.length; i++) {
                    for (var j = 0; j < productList[i].user.product.length; j++) {
                        productList[i].user.product[j].is_select = 0;
                        product.push(productList[i].user.product[j])
                    }
                }
                that.setData({
                    product: product
                })
            // that.checkCounts();   
            }       
        }
        //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
        util.wxUrl(url,data,success)
    },
    checkChlids : function(e){
        var that = this;
        var index = e.currentTarget.dataset.index;
        var product = that.data.product;
        var checkNum = that.data.checkNum;
        console.log(checkNum);
        console.log(product.length)
        flag = true;
        if(product[index].is_select == 0){
            product[index].is_select = 1;
            checkNum ++;
            that.setData({
                checkNum : checkNum
            })
        }else{
            product[index].is_select = 0; 
            checkNum --;
            that.setData({
                tap : 1,
                checkNum : checkNum
            })
        }
        if(checkNum == product.length){
            that.setData({
                tap : 0
            })
        }
        that.setData({
            product : product
        });
        that.buy();
    },
    reduceShopNum : function(e){
        var that = this;
        var index = e.currentTarget.dataset.index;
        var product = that.data.product;
        product[index].product_count --;
        var userInfo = wx.getStorageSync('userInfo');
        var url = domain + '?version=1.5&request_url=product/shopping_package_count';
        var data = {
            auth_token:userInfo.auth_token,
            sid:product[index].sid,
            count:product[index].product_count,
            spike_or_normal:0
        }
        var success = function(res){
            console.log(res)
        }
        util.wxUrl(url,data,success)
        that.setData({
            product : product
        })
        that.buy();
    },
    plusShopNum : function(e){
        var that = this;
        var index = e.currentTarget.dataset.index;
        var product = that.data.product;
        product[index].product_count ++;
        var userInfo = wx.getStorageSync('userInfo');
        var url = domain + '?version=1.5&request_url=product/shopping_package_count';
        var data = {
            auth_token:userInfo.auth_token,
            sid:product[index].sid,
            count:product[index].product_count,
            spike_or_normal:0
        }
        var success = function(res){
            console.log(res)
        }
        util.wxUrl(url,data,success)
        that.setData({
            product : product
        })
        that.buy();
    },
    selectAll : function(){
        var that =this;
        var product = that.data.product; 
        var checkNum = that.data.checkNum;
        if(flag){
            for(var i = 0; i < product.length;i++){    
                if(product[i].is_on_market !=0){
                    product[i].is_select = 1;
                    that.setData({
                        tap : 0,
                        checkNum : 1
                    })
                }                
            }
            checkNum = product.length;
            flag = false;
        }
        // 反选功能
        else{
            for(var i = 0; i < product.length;i++){           
                product[i].is_select = 0;
                that.setData({
                    tap : 1,
                    checkNum : 0
                })
            }
            checkNum = 0;
            flag = true;           
        }
        that.setData({
            product : product
        });
         that.buy();
    },
    buy : function(){
        var that =this;
        var product = that.data.product; 
        var buy = [];  
        for(var i = 0; i < product.length;i++){
            if(product[i].is_select == 1){
                buy.push(product[i].product_count * product[i].product_price)  
            }
        }
        var sum = 0;
        for (var i = 0; i < buy.length; i++){
            sum += buy[i]
        }
        that.setData({
            buy : sum
        })
    },
    // checkCounts : function(){
    //     var that =this;
    //     var product = that.data.product;
    //     console.log(product)
    //     for(var i = 0; i < product.length; i ++){
    //         if(product[i].product_count < product[i].product_stock){
    //             wx.showModal({
    //                 title: '提示',
    //                 content: '您选择的商品 ' + product[i].product_name + '规格为' + product[i].product_type + '最多可选择' + product[i].product_count + '个,请您修改购买的数量',
    //                 success: function(res) 
    //                 {
    //                     if (res.confirm) {
                           
    //                     }
    //                 }
    //             })
    //         }
    //     }
    // },
    takeAllShop : function(){
        var that =this;
        that.setData({
            checkNum: 0
        })
        var product = that.data.product;   
        for(var i = 0; i < product.length;i++){
                var url = domain + '?version=1.0&request_url=product/select_product_shopping_cart';
                var userInfo = wx.getStorageSync('userInfo');
                var data = 
                    {
                        auth_token : userInfo.auth_token,
                        product_id:product[i].product_id,
                        type_id:product[i].product_type_id,
                        is_select: product[i].is_select,
                        spike_or_normal:0
                    }
                var success = function(res){
                    console.log(res);
                }
                //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
                util.wxUrl(url,data,success)
        } 
        wx.showToast({
            title: 'loading',
            icon: 'loading',
            duration: 1500
        })
        setTimeout(function(){
            wx.redirectTo({
                url: '../buyInfo/buyInfo?type=productList'
            }) 
        },1500)
    },
    toProduct : function(e){
        var that = this;
        var touchTime = that.data.touch_end - that.data.touch_start;  
        var productId = e.currentTarget.dataset.productid       
        if(touchTime < 350){
            wx.navigateTo({
                url: '../product/product?shopId='+productId
            })
        }
    },
    delProduct: function(e){
        var that = this;
        var sid = e.currentTarget.dataset.sid       
        wx.showModal({
            title: '删除',
            content: '确认删除商品？',
            success: function(res) 
            {
                if (res.confirm) {
                    var checkNum = that.data.checkNum;
                    checkNum = 0;
                    var url = domain + '?version=1.5&request_url=product/del_product_shopping_cart';
                    var userInfo = wx.getStorageSync('userInfo');
                    var data = {
                        auth_token : userInfo.auth_token,
                        sid : sid
                    }
                    var success = function(res){
                        if(res.data.code == 0){
                            wx.redirectTo({
                                url: '/pages/productList/productList'
                            })
                        }
                    }
                    util.wxUrl(url,data,success)     
                }
            }
        })      
    },
    mytouchstart: function (e) {  
        var that = this;  
        that.setData({  
            touch_start: e.timeStamp  
        })  
    },
    mytouchend: function (e) {  
        var that = this;  
        that.setData({  
            touch_end: e.timeStamp  
        })  
    }
})

