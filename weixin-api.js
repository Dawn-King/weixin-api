window.WeixinAPI = (function() {
    var events = {};
    var asynchronous = false;
    var isReady = false;
    var lastShareAction;
    var wxData;

    function ready(data, callback) {
        var self = this;
        if (!isReady) {
            var _wxBridgeReady = function () {
                wxBridgeReady(self, callback);
            };
            wxData = data || {};
            if ('addEventListener' in document) {
                document.addEventListener('WeixinJSBridgeReady', _wxBridgeReady, false);
            } else if (document.attachEvent) {
                document.attachEvent('WeixinJSBridgeReady', _wxBridgeReady);
                document.attachEvent('onWeixinJSBridgeReady', _wxBridgeReady);
            }
        } else if (callback) {
            callback.call(null, self);
        }
        return self;
    }

    function wxBridgeReady(context, callback) {
        isReady = true;
        WeixinJSBridge.on('menu:share:appmessage', function() {
            wxShare('sendAppMessage');
        });
        WeixinJSBridge.on('menu:share:timeline', function() {
            wxShare('shareTimeline');
        });
        WeixinJSBridge.on('menu:share:weibo', function() {
            wxShare('shareWeibo');
        });
        if (callback) callback.call(null, context);
    }

    function wxShare(action) {
        if (!asynchronous) {
            shareReady(action);
        } else if (!lastShareAction) {
            lastShareAction = action;
        }
    }

    var wxInvokes = {
        sendAppMessage: function(action) {
            WeixinJSBridge.invoke(action, {
                'appid': wxData.appId || '',
                'img_url': wxData.imgUrl,
                'link': wxData.link,
                'desc': wxData.desc,
                'title': wxData.title,
                'img_width': '120',
                'img_height': '120'
            }, wrapWxInvokeCallback(action));
        },
        shareTimeline: function(action) {
            WeixinJSBridge.invoke(action, {
                'appid': wxData.appId || '',
                'img_url': wxData.imgUrl,
                'link': wxData.link,
                'desc': wxData.title,
                'title': wxData.desc, // 注意这里要分享出去的内容是desc
                'img_width': '120',
                'img_height': '120'
            }, wrapWxInvokeCallback(action));
        },
        shareWeibo: function(action) {
            WeixinJSBridge.invoke(action, {
                'content': wxData.desc,
                'url': wxData.link
            }, wrapWxInvokeCallback(action));
        }
    };
    
    function wrapWxInvokeCallback(action) {
        return function(resp) {
            wxInvokeCallback(action, resp);
        };
    }

    function wxInvokeCallback(action, resp) {
        switch (resp.err_msg) {
            // send_app_msg:cancel 用户取消
            case 'send_app_msg:cancel':
                fireEvent(getEventName(action, 'cancel'), [resp.err_msg]);
                fireEvent('cancel', [resp.err_msg]);
                break;
            // send_app_msg:confirm 发送成功
            //case 'send_app_msg:confirm':
            case 'send_app_msg:ok':
                fireEvent(getEventName(action, 'ok'), [resp.err_msg]);
                fireEvent('ok', [resp.err_msg]);
                break;
            // send_app_msg:fail　发送失败
            //case 'send_app_msg:fail':
            default:
                fireEvent(getEventName(action, 'fail'), [resp.err_msg]);
                fireEvent('fail', [resp.err_msg]);
                break;
        }
        // 无论成功失败都会执行的回调
        fireEvent(getEventName(action, 'complete'), [resp.err_msg]);
        fireEvent('complete', [resp.err_msg]);
    }

    function shareReady(action) {
        if (isReady) {
            fireEvent(getEventName(action, 'ready'));
            fireEvent('ready');
            wxInvokes[action].call(null, action);
        }
    }

    function async(value) {
        asynchronous = !!value;
    }

    function asyncStart(data) {
        if (lastShareAction)  {
            wxData = data || wxData || {};
            shareReady(lastShareAction);
        }
    }

    function addListener(eventName, callback) {
        if (typeof eventName === 'string') {
            events[eventName] = events[eventName] || [];
            if (callback) {
                events[eventName].push(callback);
            }
        } else {
            for (var o in eventName) {
                addListener(o, eventName[o]);
            }
        }
    }

    function removeListener(eventName, callback) {
        if (typeof eventName === 'string') {
            if (events[eventName]) {
                for (var i = 0, len = events[eventName].length; i < len; i++) {
                    if (!callback || events[eventName][i] === callback) {
                        events[eventName].splice(i, 1);
                        return;
                    }
                }
            }
        } else {
            for (var o in eventName) {
                removeListener(o, eventName[o]);
            }
        }
    }

    function fireEvent(eventName, args) {
        if (events[eventName]) {
            for (var i = 0, len = events[eventName].length; i < len; i++) {
                var eventCb = events[eventName][i];
                if (eventCb && eventCb.apply(null, args || []) === false) {
                    return;
                }
            }
        }
    }

    function getEventName(action, event) {
        var prefix;
        if (action == 'sendAppMessage') {
            prefix = 'appmessage';
        } else if (action == 'shareTimeline') {
            prefix = 'timeline';
        } else if (action == 'shareWeibo') {
            prefix = 'weibo';
        }
        return prefix + ':' + event;
    }


    /*
     * 加关注（此功能只是暂时先加上，不过因为权限限制问题，不能用，如果你的站点是部署在*.qq.com下，也许可行）
     * @param {String} username 微信公众号ID或公众号名称
     * @param {Function} success 成功回调方法
     * @param {Function} fail 失败回调方法
     */
    function addContact(appWeixinId, success, fail){
        if (isReady) {
            WeixinJSBridge.invoke('addContact', {
                'webtype': '1',
                'username': username
            }, function (resp) {
                if (resp.err_msg == 'add_contact:ok' || resp.err_msg == 'add_contact:added') {
                    if (success) success.call(null);
                } else {
                    if (fail) fail.call(null);
                }
            });
        }
    }
    
    function imagePreview(current, urls) {
        if(isReady && current && urls && urls.length !== 0) {
            WeixinJSBridge.invoke('imagePreview', {
                'current': current,
                'urls': urls
            });
        }
    }

    function getNetworkType(callback) {
        if (isReady && callback && typeof callback === 'function') {
            WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                // 在这里拿到e.err_msg，这里面就包含了所有的网络类型
                callback(e.err_msg);
            });
        }
    }
    
    function showOptionMenu() {
        if (isReady) WeixinJSBridge.call('showOptionMenu');
    }

    function hideOptionMenu() {
        if (isReady) WeixinJSBridge.call('hideOptionMenu');
    }
    
    function showToolbar() {
        if (isReady) WeixinJSBridge.call('showToolbar');
    }

    function hideToolbar() {
        if (isReady) WeixinJSBridge.call('hideToolbar');
    }

    function closeWindow() {
        if (isReady) WeixinJSBridge.call('closeWindow');
    }

    return {
        /**
         * 初始化
         * @param {Object} wxData
         */
        ready: ready,

        /**
         * 设置异步状态
         * @param {Boolbean} value
         */
        async: async,

        /**
         * 异步invoke时，当数据加载完成，需要调用asyncStart()继续往下执行
         * @param {Object} wxData
         */
        asyncStart: asyncStart,

        /**
         * 绑定事件
         * @param {String} eventName
         * @param {String} callback
         *
         * 支持事件：
         *  - ready
         *  - cancel
         *  - ok
         *  - fail
         *  - complete
         * 
         * 对应分享动作，增加前缀，如：appmessage:ok
         *  - appmessage
         *  - timeline
         *  - weibo
         */
        on: addListener,

        /**
         * 解绑事件
         * @param {String} eventName
         * @param {String} callback
         */
        off: removeListener,
        
        /**
         * 调起微信Native的图片播放组件。
         * 这里必须对参数进行强检测，如果参数不合法，直接会导致微信客户端crash
         *
         * @param {String} current 当前播放的图片地址
         * @param {Array} urls 图片地址列表
         */
        imagePreview: imagePreview,
        
        /**
         * 返回如下几种类型：
         *  - network_type:wifi     wifi网络
         *  - network_type:edge     非wifi，包含3G/2G
         *  - network_type:fail     网络断开连接
         *  - network_type:wwan     2g或者3g
         *
         * @param {Function} callback
         */
        getNetworkType: getNetworkType,
        
        /**
         * 显示网页右上角的按钮
         */
        showOptionMenu: showOptionMenu,
        
        /**
         * 隐藏网页右上角的按钮
         */
        hideOptionMenu: hideOptionMenu,
        
        /**
         * 显示底部工具栏
         */
        showToolbar: showToolbar,
        
        /**
         * 隐藏底部工具栏
         */
        hideToolbar: hideToolbar,
        
        /**
         * 关闭当前微信公众平台页面
         */
        closeWindow: closeWindow
    };
}());