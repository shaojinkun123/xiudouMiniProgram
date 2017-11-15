//normal.js
//获取应用实例
var util = require('../../utils/util.js');
var current_page = 1;
var allMes = [];
var domain = wx.getStorageSync('domain');
var app = getApp();

Page({
    //seleted为tab切换方法
    data:{
        selected:true,
        selected1:false,
        //模态框控制
        dialog : true,
        dialog1: true,
        imgsHide : true,
        shopNum : 1,
        specHidden: true,
        shopCar : true,
        model : true,
        autoplay:false,
        Bdisabled: false
        },
    selected:function(e){
        this.setData({
            selected1:false,
            selected:true
        })
    },
    selected1:function(e){
        var that = this;
        this.setData({
            selected:false,
            selected1:true
        });
        that.takeBuyersShowList();
    },
  onLoad: function (o) {
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
              sysHeight:res.windowHeight + 2,
              spec : true
          })
        }
    });
    that.takeProductMes();
  },
  onShow:function(){
        var that = this;
        that.setData({
            Bdisabled:false
        })
  },
  //生成信息
  takeProductMes : function(){
    var that = this;
    var url = domain + '?version=1.9&request_url=product/product_detail&source=h5x';
    var userInfo = wx.getStorageSync('userInfo');
    var data;
    if(userInfo){
        data =
            {
                auth_token: userInfo.auth_token,
                product_id: that.data.shopId,
                spike: 0
            }
    }else{
        data =
            {
                product_id: that.data.shopId,
                spike: 0
            }
    }
    var success = function(res){
            wx.setNavigationBarTitle({
                title: res.data.product_name
            })
            if(res.data.code == 4){
                wx.showToast({
                    title: '商品已下架',
                    image: '../../images/war.png',
                    duration: 1500
                })
                setTimeout(function(){
                    wx.navigateBack({
                        delta: 1
                    })
                },1500)
                return;
            } else if (res.data.code == 4040) {
                app.reSetUserInfo()
            }
            that.setData({
                productMes:res.data,
                minPrice : res.data.product_type,
                product_delivery_price : parseInt(res.data.product_delivery_price)
            })
            //用户不能购买自己的商品
            if (userInfo.user_id == that.data.productMes.user.user_id){
                that.setData({
                    cantBuySelf:true
                })
            }
            var shareMoney = parseFloat(that.data.productMes.forward_charge) * parseFloat(that.data.productMes.min_price);
            that.setData({
                shareMoney : Math.round(parseFloat(shareMoney)*100)/100
            })
            if(that.data.productMes.user.is_faved == 0){
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
            that.takeMinPrice();
    }
    //微信接口调用方法   需定义url,data,success//    可以定义fail,callback
    util.wxUrl(url,data,success);
  },
  //生成买家秀首页
  takeBuyersShowList : function(){
      var that = this;
      var url = domain + "?version=2.5&request_url=index/buyers_show_list&source=h5x";
      var data =
          {
                product_id:that.data.shopId,
                page:current_page,
                page_num:10  
          }
        var success = function(res)
        {
            that.setData({
                buyersShowList:res.data.list
            });
            if(res.data.list.length < 10){
                that.setData({
                    hidden:true,
                    endImg:false
                });
            }
        }
        util.wxUrl(url,data,success)
  },
    //加载更多信息
  loadMore: function() {
    var that = this;
    current_page ++;
    var url = domain + "?version=2.5&request_url=index/buyers_show_list&source=h5x";
    var data =  {
                product_id:that.data.shopId,
                page:current_page,
                page_num:10  
        };
    var success = function(res){
        if(res.data.code == 0){
            that.setData({
                hidden: false,
                endImg: true,
                buyersShowList:that.data.buyersShowList.concat(res.data.list)
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
    playVideo : function(e){
        var that = this;
        var videoUrl = e.target.dataset.videourl;
        that.setData({
            dialog : false,
            videoHide : false,
            videoUrl : videoUrl
        });
    },
    playProduct: function(e){
        var that = this;
        that.setData({
            dialog1 : false,
            autoplay:true
        });
            that.videoContext = wx.createVideoContext('productVideo') || wx.createVideoContext('productVideos');
            that.videoContext.play();
    },
    closeDialog : function(){
        var that = this;
        that.setData({
            dialog : true,
            imgsHide : true
        });
        that.videoContext = wx.createVideoContext('productVideos');
        that.videoContext.pause();
    },
    bindImgs : function(e){
        var that = this;
        var imgs = e.currentTarget.dataset.imgs;
        var num = e.currentTarget.dataset.num;
        that.setData({
            num : num,
            imgsUrl : imgs
        });
    },
    showSwiper : function(e){
        var that = this;
        var imgs = e.currentTarget.dataset.imgs;
        var index = e.target.dataset.index;
        that.setData({
            dialog : false,
            videoHide : true,
            imgsHide : false,
            index : index + 1
        });
    },
    faved : function(){
        var that = this;
        var url = domain + "?version=1.0&request_url=user/fellow_seller&source=h5x";
        var userInfo = wx.getStorageSync('userInfo')
        var data =
            {
                    auth_token:userInfo.auth_token,
                    user_id:that.data.productMes.user.user_id
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
        var userInfo = wx.getStorageSync('userInfo')
        var data =
            {
                    auth_token:userInfo.auth_token,
                    user_id:that.data.productMes.user.user_id
            }
            var success = function(res)
            {   
                console.log(res)
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
    plusShopNum : function(){
        var that = this;
        var plus = that.data.shopNum;
        plus ++;
        that.setData({
            shopNum : plus
        })
    },
    reduceShopNum : function(){
        var that = this;
        var reduce = that.data.shopNum;
        reduce --;
        that.setData({
            shopNum : reduce
        })
    },
    //默认选择价格最低个规格
    takeMinPrice : function(){
        var that = this;
        var arr=[];
        var isStockNull = [];
        var checkCanBuyStatus  = 0;
        for(var i = 0;i < that.data.minPrice.length;i++){
            arr.push(that.data.minPrice[i].type_price);
            isStockNull.push(that.data.minPrice[i].stock)
        }
        that.setData({
            minP : Math.min.apply(null, arr)
        });
        for (var i = 0; i < isStockNull.length; i++) {
            if (isStockNull[i] == 0) {
                checkCanBuyStatus ++;
                console.log(checkCanBuyStatus)
                if (checkCanBuyStatus == isStockNull.length){
                    that.setData({
                        buyShowButton: true
                    })
                }
            }
        }
        for(var i = 0;i < arr.length;i++){
            if(arr[i] == that.data.minP){
                that.setData({
                    specNum : i,
                    choseId : that.data.minPrice[i].type_id
                })
            }
        }
    },
    // 选择规格
    choseThis : function(e){
        var that = this;
        that.setData({
            choseId : e.currentTarget.dataset.id,
            shopNum : 1
        })
        var arr=[];
        for(var i = 0;i < that.data.minPrice.length;i++){
            arr.push(that.data.minPrice[i].type_id)
        }  
        for(var i = 0;i < arr.length;i++){
            if(arr[i] == that.data.choseId){
                that.setData({
                    specNum : i
                })
            }
        }
    },
    closeSpec : function(){
        var that = this;
        that.setData({
            specHidden : true
        })
    },
    openSpec : function(e){
        var that = this;
        if(e.currentTarget.dataset.shopcar == "shopCar"){
            that.setData({
                shopCar : false
            })
        }else{
            that.setData({
                shopCar : true
            })
        }
        var that = this;
        that.setData({
            specHidden : false
        })
    },
    goBuyInfo : function(e){
        var that = this;
        var product_count = that.data.shopNum;
        var product_id = that.data.shopId;
        var product_type_id = that.data.choseId;
        var spike_or_normal = '0';
        var userInfo = wx.getStorageSync('userInfo')
        if (userInfo){
            that.setData({
                Bdisabled:true
            })
            wx.setStorage({
                key: "defalutAddress",
                data: true
            });
            wx.setStorage({
                key: "product_count",
                data: product_count
            });
            wx.setStorage({
                key: "product_id",
                data: product_id
            });
            wx.setStorage({
                key: "product_type_id",
                data: product_type_id
            });
            wx.setStorage({
                key: "spike_or_normal",
                data: spike_or_normal
            })
            wx.navigateTo({
                url: '../buyInfo/buyInfo?product=product'
            })
        }else{
            app.reSetUserInfo();
        }

    },
    playCountAdd : function(){
        var that = this;
        var product_id = that.data.shopId;
        var url = domain + "?version=1.0&request_url=product/product_video_play_incr&source=h5x";
        var userInfo = wx.getStorageSync('userInfo')
        var data =
            {
                    auth_token:userInfo.auth_token,
                    product_id:product_id
            }
            var success = function(res)
            {   
                console.log(res)
            }
            util.wxUrl(url,data,success)
    },
    close : function(){
        var that = this;
        that.videoContext = wx.createVideoContext('productVideo') || wx.createVideoContext('productVideos');
        that.videoContext.pause();
        that.setData({
            dialog1 : true
        })
    },
    onShareAppMessage: function () {
        var that = this;
        return {
            title: that.data.productMes.product_name,
            path: 'pages/product/product?shopId='+that.data.shopId
        }
    },
    addShopCar : function(e){
        var that = this;
        var product_count = that.data.shopNum;
        var product_id = that.data.shopId;
        var product_type_id = that.data.choseId;
        var spike_or_normal = '0';
        var userInfo = wx.getStorageSync('userInfo')
        var url = domain + "?version=1.0&request_url=product/add_shopping_cart&source=h5x";
        var data = {
                auth_token:userInfo.auth_token,
                product_id:product_id,
                product_count:product_count,
                product_type_id:product_type_id,
                is_need_limit:"yes",
                spike_or_normal:spike_or_normal
            }
        var success = function(res){
            if (res.data.code == 4040) {
                app.reSetUserInfo()
            }else{
                wx.showToast({
                    title: res.data.message,
                    icon: 'success',
                    duration: 2000
                })
            }
        }
        util.wxUrl(url,data,success);
        that.setData({
            specHidden : true
        })
    },
    showIconMes : function(){
        var that = this;
        that.setData({
            model:false
        })
    },
    closeModel : function(){
        var that = this;
        that.setData({
            model:true
        })
    }
})



