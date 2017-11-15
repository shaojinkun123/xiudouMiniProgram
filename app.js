//app.js
App({
    onLaunch: function () {
        var that = this;
        wx.setStorageSync('domain', 'https://m.xiudou.net/api/index.php');
        // wx.setStorageSync('domain', 'http://m.beta.xiudou.net/api/index.php');
    },
    getUserInfo: function () {
        var that = this;
        var value = wx.getStorageSync('rd_session');
        // if (value) {
        //     that.globalData.userInfo = value;
        // } else {
            //调用登录接口
            wx.login({
                //获取code
                success: function (res) {
                    var resCode = res.code;
                    if (res.code) {
                        var domain = wx.getStorageSync("domain");
                        wx.request({
                            url: domain + "?version=1.0&request_url=WeixinSmall/get_session",
                            data: {
                                code: res.code
                            },
                            success: function (res) {
                                wx.setStorage({
                                    key: "rd_session",
                                    data: res.data.rd_session
                                })
                            }
                        })
                        //获取用户信息
                        wx.getUserInfo({
                            withCredentials:true,
                            success: function (res) {
                                var value = wx.getStorageSync('rd_session');
                                wx.request({
                                    url: domain + '?version=1.0&request_url=WeixinSmall/decryptData',
                                    data: {
                                        encryptedData: res.encryptedData,
                                        iv: res.iv,
                                        session_key: value
                                    },
                                    //获取解密后的信息
                                    success: function (res) {
                                        if (res.data.code == 0) {
                                            var str = res.data.data;
                                            var obj = JSON.parse(str);
                                            wx.setStorageSync('openId', obj.openId)
                                            wx.request({
                                                url: domain + '?version=2.5&request_url=user/third_login',
                                                data: {
                                                    bind_user_id: obj.unionId,
                                                    bind_type: 0,
                                                    //#0:微信，1:微博,2:QQ#
                                                    nick_name: obj.nickName,
                                                    avatar: obj.avatarUrl
                                                },
                                                //走第三方接口  注册或者获取用户信息
                                                success: function (res) {
                                                    if (res.data.code == 0) {
                                                        wx.setStorageSync('userInfo', res.data)
                                                    } else if (res.data.code == 1) {
                                                        wx.request({
                                                            url: domain + '?version=2.5&request_url=user/third_registration',
                                                            data: {
                                                                bind_user_id: obj.unionId,
                                                                bind_type: 0,
                                                                nick_name: obj.nickName,
                                                                avatar: obj.avatarUrl
                                                            },
                                                            success: function (res) {
                                                                // success
                                                                wx.setStorageSync('userInfo', res.data)
                                                            },
                                                            fail: function () {
                                                                // fail
                                                            }
                                                        })
                                                    }
                                                    // success
                                                },
                                                fail: function () {
                                                    wx.showModal({
                                                        title: '请求失败',
                                                        content: '请检查您的网络设置',
                                                        success: function (res) {
                                                            if (res.confirm) {
                                                                wx.switchTab({
                                                                    url: '/pages/index/index'
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            })
                                        } 
                                        // else {
                                        //     wx.clearStorageSync();
                                        // }
                                    }
                                })
                            }
                        })
                    } else {
                        wx.showModal({
                            title: '请求失败',
                            content: '请求rd_session接口失败',
                            success: function (res) {
                                if (res.confirm) {
                                    wx.switchTab({
                                        url: '/pages/index/index'
                                    })
                                }
                            }
                        })
                    }
                }
            });
        // };
    },
    globalData: {
        // userInfo: null
    },
    reSetUserInfo:function(my){
        var that = this;
            wx.showModal({
                title: '登陆失败',
                content: '您曾拒绝过用户信息授权，请前往小程序的‘设置’中，允许使用您的‘用户信息’。设置完成后，返回进行授权登陆。',
                showCancel:true,
                cancelText:'游客浏览',
                confirmText:'去设置',
                success:function(res){
                    if (res.confirm) {
                        wx.openSetting({
                            success: function (res) {
                                if (res.authSetting["scope.userInfo"]) {
                                    that.getUserInfo();
                                } else {
                                    console.log(false)
                                }
                            }
                        })
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
    }
})