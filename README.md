Weixin API
==========
> 微信 WebView JS 接口封装类，用来替代 WeixinJSBridge 超级难用的接口。

## 我能做什么？

 1. 分享到微信朋友圈、微信好友或腾讯微博
 2. 调用微信客户端的图片播放组件
 3. 获取当前的网络状态
 4. 隐藏/显示右上角的菜单入口
 5. 隐藏/显示底部浏览器工具栏
 6. 关闭当前WebView页面


## 使用方法

### 1、API初始化

WeixinAPI 初始化所有操作的起始，调用方法：

```javascript
var wxData = {
    'appId': '', // 服务号可以填写appId，没有则留空
    'imgUrl': '', // 分享显示的图标
    'link': 'http://maxzhang.github.io', // 分享链接
    'title': "大家好，我是炎燎（maxzhang）", // 分享标题
    'desc': '另一个WeixinApi的代码写得真的有点烂，另一个WeixinApi的链接在页面最下面。' // 分享内容
};

WeixinAPI.ready(wxData);
```

你可以在`ready`动作之后的任何时候更改`wxData`对象，比如：

```javascript
wxData.link = 'http://lavaflow.75team.com';
```


### 2、监听分享事件

支持的事件名称：
 - **ready** 准备分享
 - **cancel** 取消分享
 - **ok** 分享成功
 - **fail** 分享失败
 - **complete** 分享结束

默认事件监听应用到全局，不伦哪个分享渠道都会执行毁掉。调用方法：

```javascript
WeixinAPI.on('ok', function() { alert('share success!'); });
WeixinAPI.on('fail', function() { alert('share failure!'); });
```

除此之外，你还可监听特定动作的事件，支持：
 - **timeline** 朋友圈
 - **appmessage** 微信朋友
 - **weibo** 腾讯微博

调用方法：

```javascript
WeixinAPI.on('timeline:ok', function() { alert('share timeline success!'); });
WeixinAPI.on('timeline:fail', function() { alert('share timeline failure!'); });
```


### 3、移除监听事件

调用方法：

```javascript
function callback() {}
WeixinAPI.on('ok', callback);
WeixinAPI.off('ok', callback); // 取消监听
```

也可以一次性移除所有监听，调用方法：

```javascript
WeixinAPI.off('ok');
```


### 4、调用微信客户端的图片播放组件

调用方法：

```javascript
// 需要播放的图片url列表
var urls = ['url1', 'url1', ..., 'urlN'];

// 选一个作为当前展示的图片url
var current = 'url';

WeixinAPI.imagePreview(current, urls);
```


### 5、获取当前的网络状态

Network 类型取值：
 - **network_type:wifi** wifi网络
 - **network_type:edge** 非wifi，包含3G/2G
 - **network_type:fail** 网络断开连接
 - **network_type:wwan** 2g或者3g

调用方法：

```javascript
WeixinAPI.getNetworkType(function(networkType) {
    alert(networkType);
});
```


### 6、隐藏/显示右上角的菜单入口

调用方法：

```javascript
WeixinAPI.showOptionMenu();
WeixinAPI.hideOptionMenu();
```


### 7、隐藏/显示底部浏览器工具栏

调用方法：

```javascript
WeixinAPI.showToolbar();
WeixinAPI.hideToolbar();
```


### 8、关闭当前WebView页面

调用方法：

```javascript
WeixinAPI.closeWindow();
```

## 吐槽

虽然觉得另一个 [WeixinApi](https://github.com/zxlie/WeixinApi) 代码写得烂，但是不妨碍大家到 [http://www.baidufe.com/item/f07a3be0b23b4c9606bb.html](http://www.baidufe.com/item/f07a3be0b23b4c9606bb.html) 探讨交流。
