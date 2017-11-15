// pages/login/login.js
var util = require('../../utils/util.js');
var domain = wx.getStorageSync('domain');
Page({
    data: {
        isPassWord: true,
        login: true,
        placeShow: ['中国大陆 +86', '香港 +852', '澳门 +853', '台湾 +886', '日本 +81', '韩国 +82'],
        placeNumber: ['+86', '+852', '+853', '+886', '+81', '+82'],
        SelectedplaceNumber: '+86',
        places: ['中国大陆', '香港', '澳门', '台湾', '日本', '韩国'],
        place: "中国大陆",
        forgetPassWord: true,
        loginFirstView: false,
        nextPassWord: true,
        header: false,
        register: false,
        loginErrMes: '',
        loginUserName: '',
        loginPassWord: '',
        checkPhoneNumber: '',
        isLoginCodeDesabled: false,
        loginButtonText: '获取验证码',
        VCode: '',
        newPassWord: ''
    },
    onReady: function (options) {
        var that = this;
        //获取设备信息
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    sysWidth: res.windowWidth + "px",
                    sysHeight: res.windowHeight + "px",
                    scroll: 0
                })
            }
        })
    },
    switch1Change: function (e) {
        var that = this;
        that.setData({
            isPassWord: e.detail.value
        })
    },
    toRegister: function () {
        var that = this;
        that.setData({
            login: false
        })
    },
    toLogin: function () {
        var that = this;
        that.setData({
            login: true
        })
    },
    toLoginFail: function () {
        wx.navigateTo({
            url: '../loginFail/loginFail',
        })
    },
    bindPickerChange: function (e) {
        var that = this;
        that.setData({
            SelectedplaceNumber: that.data.placeNumber[e.detail.value],
            place: that.data.places[e.detail.value]
        })
    },
    toForgetPassWord: function () {
        var that = this;
        that.setData({
            header: true,
            loginFirstView: true,
            forgetPassWord: false
        })
    },
    toNextPassword: function () {
        var that = this;
        var checkPhoneNumber = that.data.checkPhoneNumber;
        var telReg = !!checkPhoneNumber.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
        if (!telReg) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon:'loading',
                duration: 1000
            })
        } else {
            that.setData({
                forgetPassWord: true,
                nextPassWord: false,
                showNumber: checkPhoneNumber
            })
        }
    },
    checkUserPhone: function (e) {
        var that = this;
        that.setData({
            loginUserName: e.detail.value
        })
    },
    checkUserPassWord: function (e) {
        var that = this;
        that.setData({
            loginPassWord: e.detail.value
        })
    },
    checkPhoneNumber: function (e) {
        var that = this;
        that.setData({
            checkPhoneNumber: e.detail.value
        })
    },
    loginIn: function () {
        var that = this;
        var loginUserName = that.data.loginUserName;
        var loginPassWord = that.data.loginPassWord;
        console.log(loginUserName)
        console.log(loginPassWord)
        if (loginUserName == '') {
            that.setData({
                loginErrMes: '请输入用户名'
            })
            return false
        } else if (loginPassWord == "") {
            that.setData({
                loginErrMes: '请输入密码'
            })
        } else {
            that.setData({
                loginErrMes: ''
            })
        }
        var url = domain + '?version=1.0&request_url=user/sign_in&source=h5x';
        var data =
            {
                username: loginUserName,
                password: loginPassWord
            }
        var success = function (res) {
            if (res.data.code == 0) {
                wx.setStorageSync('userInfo', res.data);
                wx.navigateBack({
                    delta:1
                })
            } else {
                that.setData({
                    loginErrMes: res.data.message
                })
            }
        }
        //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
        util.wxUrl(url, data, success)
    },
    sendForgetVerificationCodeButton: function () {
        var that = this;
        var time = 60;
        that.setData({
            isLoginCodeDesabled: 'disabled'
        })
        var micro_timer = setInterval(function () {
            that.setData({
                loginButtonText: time-- + "s"
            });
            if (time == 0) {
                that.setData({
                    isLoginCodeDesabled: false,
                    loginButtonText: '获取验证码'
                })
                clearInterval(micro_timer);
            }
        }, 1000);
        that.forgetPageTakeCode();
    },
    //忘记密码页调用获取验证码接口
    forgetPageTakeCode: function () {
        var that = this;
        var url = domain + '?version=1.9&request_url=sms/registedSend&source=h5x';
        var data =
            {
                "mobile": that.data.checkPhoneNumber,
                "area": that.data.SelectedplaceNumber
            }
        var success = function (res) {
            console.log(res)
            if (res.data.code == "0") {
                wx.showToast({
                    title: '获取验证码成功',
                    duration: 1000
                })
            } else if (res.data.code == 3) {
                wx.showToast({
                    title: res.data.message,
                    icon:'loading',
                    duration: 1000
                })
                setTimeout(function () {
                    wx.reLaunch({
                        url: '../login/login',
                    })
                }, 1000)
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon:'loading',
                    duration: 1000
                })
                return false;
            }
        }
        //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
        util.wxUrl(url, data, success)
    },
    //注册页调用获取验证码接口
    registerPageTakeCode: function () {
        var that = this;
        var url = domain + '?version=1.9&request_url=sms/registSend&source=h5x';
        var data =
            {
                "mobile": that.data.checkPhoneNumber,
                "area": that.data.SelectedplaceNumber
            }
        var success = function (res) {
            if (res.data.code == "0") {
                wx.showToast({
                    title: '获取验证码成功',
                    duration: 1000
                })
            } else if (res.data.code == 3) {
                wx.showToast({
                    title: res.data.message,
                    icon:'loading',
                    duration: 1000
                })
                setTimeout(function () {
                    wx.reLaunch({
                        url: '../index/index',
                    })
                }, 1000)
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon:'loading',
                    duration: 1000
                })
                return false;
            }
        }
        //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
        util.wxUrl(url, data, success)
    },

    //记录验证码
    storageVCode: function (e) {
        var that = this;
        that.setData({
            VCode: e.detail.value
        })
    },
    //记录新密码
    storageNewPassWord: function (e) {
        var that = this;
        that.setData({
            newPassWord: e.detail.value
        })
    },
    //更改密码提交按钮
    sendNewPassWord: function () {
        var that = this;
        if (that.data.VCode == "") {
            wx.showToast({
                title: '验证码不能为空',
                icon:'loading',
                duration: 1000
            })
            return false;
        } else if (that.data.newPassWord == '') {
            wx.showToast({
                title: '密码不能为空',
                icon:'loading',
                duration: 1000
            })
            return false;
        }
        var url = domain + '?version=1.9&request_url=sms/check&source=h5x';
        var data =
            {
                "mobile": that.data.checkPhoneNumber,
                "code": that.data.VCode
            }
        var success = function (res) {
            if (res.data.code == "0") {
                var url = domain + '?version=2.0&request_url=user/find_back_password&source=h5x';
                var data =
                    {
                        'phone_number': that.data.checkPhoneNumber,
                        'password': that.data.newPassWord,
                        'code': that.data.VCode
                    }
                var success = function (res) {
                    if (res.data.code == "0") {
                        wx.showToast({
                            title: res.data.message,
                            duration: 1000
                        })
                        //修改成功以后直接登录
                        var url = domain + '?version=1.0&request_url=user/sign_in&source=h5x';
                        var data =
                            {
                                username: that.data.checkPhoneNumber,
                                password: that.data.newPassWord
                            }
                        var success = function (res) {
                            if (res.data.code == 0) {
                                that.setData({
                                    VCode: '',
                                    newPassWord: '',
                                })
                                wx.setStorageSync('userInfo', res.data);
                                wx.reLaunch({
                                    url: '../index/index'
                                })
                            } else {
                                wx.showToast({
                                    title: '修改失败，请重新修改',
                                    duration: 1000
                                })
                                wx.reLaunch({
                                    url: '../login/login',
                                })
                            }
                        }
                        //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
                        util.wxUrl(url, data, success)
                    } else {
                        wx.showToast({
                            title: res.data.message,
                            duration: 1000
                        })
                    }
                }
                //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
                util.wxUrl(url, data, success)
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon:'loading',
                    duration: 1000
                })
                return false;
            }
        }
        //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
        util.wxUrl(url, data, success)
    },
    //新用户注册记录手机号
    takeNewUserPhoneNumber: function (e) {
        var that = this;
        that.setData({
            newUserPhoneNumber: e.detail.value
        })
    },
    //注册button
    generateNewUser: function () {
        var that = this;
        var newUserPhoneNumber = that.data.newUserPhoneNumber;
        var telReg = !!newUserPhoneNumber.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
        if (!telReg) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon:'loading',
                duration: 1000
            })
            return false;
        } else {
            var url = domain + '?version=1.9&request_url=sms/registSend&source=h5x';
            var data =
                {
                    mobile: that.data.newUserPhoneNumber,
                    area: that.data.SelectedplaceNumber
                }
            var success = function (res) {
                if (res.data.code == 0) {
                    that.setData({
                        register: true
                    });
                    var time = 60;
                    that.setData({
                        isLoginCodeDesabled: 'disabled'
                    })
                    var micro_timer = setInterval(function () {
                        that.setData({
                            loginButtonText: time-- +'s'
                        });
                        if (time == 0) {
                            that.setData({
                                isLoginCodeDesabled: false,
                                loginButtonText: '获取验证码'
                            })
                            clearInterval(micro_timer);
                        }
                    }, 1000);
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon:'loading',
                        duration: 1000
                    })
                    setTimeout(function(){
                        that.setData({
                            login: true
                        })
                    },2000)
                }
            }
            //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
            util.wxUrl(url, data, success)
        }
    },
    MakeNewUser: function () {
        var that = this;
        if (that.data.VCode == "") {
            wx.showToast({
                title: '验证码不能为空',
                icon:'loading',
                duration: 1000
            })
            return false;
        } else if (that.data.newPassWord == '') {
            wx.showToast({
                title: '密码不能为空',
                icon:'loading',
                duration: 1000
            })
            return false;
        }
        var url = domain + '?version=1.9&request_url=sms/check&source=h5x';
        var data =
            {
                "mobile": that.data.newUserPhoneNumber,
                "code": that.data.VCode
            }
        var success = function (res) {
            if (res.data.code == "0") {
                wx.showToast({
                    title: res.data.message,
                    duration: 1000
                })
                //修改成功以后直接登录
                var url = domain + '?version=1.0&request_url=user/sign_up&source=h5x';
                var data =
                    {
                        phone_number: that.data.newUserPhoneNumber,
                        password: that.data.newPassWord,
                        code: that.data.VCode
                    }
                var success = function (res) {
                    if (res.data.code == 0) {
                        that.setData({
                            VCode: '',
                            newPassWord: '',
                        })
                        wx.setStorageSync('userInfo', res.data);
                        wx.reLaunch({
                            url: '../index/index'
                        })
                    } else {
                        wx.showToast({
                            title: '注册失败，请重新注册',
                            duration: 1000
                        })
                        wx.reLaunch({
                            url: '../login/login',
                        })
                    }
                }
                //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
                util.wxUrl(url, data, success)
            } else {
                wx.showToast({
                    title: res.data.message,
                    duration: 1000
                })
            }
        }
        //微信接口调用方法   需定义url,data,success//    可以定义failfail,callback
        util.wxUrl(url, data, success)
    }
})