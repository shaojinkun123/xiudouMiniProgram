//loginFail.js
Page({
    data: {

    },
    onLoad: function () {
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
        });
    }
})

