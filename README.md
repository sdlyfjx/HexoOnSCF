# Hexo自动生成及部署系统

## 更新说明

- [2020-01-21]更新版本将Hexo升级到4.2，提高生成性能
- [2020-01-21]内置diaspora-lite主题，根据本项目场景进行精简，首页可配置视频首页，增加百度站点统计，并集成了Valine评论插件等
- [2020-01-21]将hexo-abbrlink的依赖包改为本地依赖（由于NPM上的包会有braces警告问题）
- [2020-01-21]尽可能实现了本项目开箱即用（只需修改配置文件即可，不需要修改代码或其他内容）

## 系统说明

本系统灵活的借用了腾讯云COS作为对象存储和静态网站托管，使用腾讯云SCF作为Hexo的运行环境。通过SCF上内置的COS触发器，实现了COS上markdown源文件一旦修改，则自动通过SCF上的Hexo将页面渲染为静态页面并部署到COS的指定目录下，同时刷新CDN。具有全自动、自扩容、高并发、无服务器特点的FasS架构。

本项目主要有以下几个功能：
1. 渲染Markdown文件为静态页面
1. 将渲染的静态页面部署到COS的指定目录下
1. 刷新CDN缓存

本项目的初衷是由于公司业务需要，加入平台的商户可以在管理后台发广告、公告、文章等等，遂决定采用Hexo作为Markdown的渲染引擎，前端使用Editor.md作为编辑器，用户只要将编辑的文件保存到COS指定目录后就会触发SCF上的Hexo进行页面渲染，并自动部署到COS上的静态网站中，实现发布的文章的多渠道访问。同时页面的访问压力全部转移到COS上，借助CDN，提高用户的访问体验。

示例网站CDN访问链接为：https://blog.yo.sjfw365.com

### 系统流程详解
1. SCF绑定了该Bucket的全部创建和全部删除事件的触发器
1. COS上指定Bucket中指定目录下拥有如下类型前缀（`res/`）和后缀（`.md`）的文件（如`/res/xxx/wrt_[timestamp].md`）发生变动时，会自动通过触发器触发SCF上的HexoServer函数
1. SCF下载新增的文件到`/tmp/source/[filename].md`目录下
1. SCF读取源文件头部的`Front-Matter`部分，获取文件的`abbrlink`字段值拼接为该文件的永久链接
1. SCF调用Hexo的Generate命令生成指定文件，并将文件生成于`/tmp/public/abbrlink/index.html`目录下
1. SCF删除下载的source源文件（目的是减少下一次生成的处理量，加快生成速度）
1. SCF将本次新生成的文件上传到COS对应的目录下
1. 当COS上有新文件上传后，触发SCF的创建事件，SCF根据路由规则自动刷新相应的CDN链接

## COS目录及文件命名规则
### 目录说明
> 1. `SMD5(*)`表示对*进行内容进行16位MD5
> 1. `[*]`整体表示该字段为变量，替换对应内容时无需保留方括号

---

**COS目录详细说明：**

- `/404`该目录对应的网站的404页面
- `/blog`该目录为文章的静态页面目录，该目录内容由Hexo自动生成，该目录文件由SCF自动维护，通过修改`/res/SMD5([organType][organId])/wrt_[timestamp].md`的源文件，SCF会自动生成对应静态页面并替换到该目录下。同时该目录也是面向用户的目录，用户看到的一切静态页面都存放于该目录下。
- `/css`该目录对应的网站的css目录
- `/img`该目录对应网站的img资源，并非用户的资源，请勿存放其他资源
- `/audio`该目录对应网站的音乐资源，并非用户的资源，用户的音乐请存放到`/res/*`的对应目录下
- `/js`该目录对应网站的js资源
- `/photoswipe`该目录对应网站的看图插件
- `/index.html`该文件为网站首页
- `/res`该目录为用户的资源文件目录
  - `/res/SMD5([organType][organId])`该目录为机构的资源目录，目录名采用16位md5值，md5内容为`机构类型+机构ID`的形式
    1. `/res/SMD5([organType][organId])/[organName]`该文件为该目录所属机构的标识文件，文件无内容，文件名`[organName]`为该机构的中文名称，方便后期管理维护
    1. `/res/SMD5([organType][organId])/img_*.*`以`img_`前缀的文件为该用户上传的图片资源文件
    1. `/res/SMD5([organType][organId])/aud_*.*`以`aud_`前缀的文件为该用户上传的音频资源文件
    1. `/res/SMD5([organType][organId])/vid_*.*`以`vid_`前缀的文件为该用户上传的视频资源文件
    1. `/res/SMD5([organType][organId])/wrt_[timestamp].md`以`wrt_`前缀和`.md`后缀的文件为该用户上传的文章资源，该类资源具有特殊的触发器（触发规则为`res/`目录下且后缀为`.md`的文件），当资源发生改动时会自动触发SCF上的Hexo去Generate静态页面并上传到`/blog/[uuid]/index.html`。其中uuid为在对应markdown源文件中Front-matter中配置的`abbrlink`字段。该字段随着该文章的产生而产生，代表该文章的唯一标识，Hexo生成的永久链接也是以该字段构成。这样就实现了即使修改了原文件的文件名和内容，生成的文章链接依然不会改变。

## 文章源文件说明
用户的每一篇文章对应的都是一个MarkDown源文件。该源文件由Hexo自动渲染为静态页面并部署到COS的静态网站中。此源文件需要有一段Front-Matter，以此告知Hexo文章的一些基本属性。以下就文章的Front-Matter做一下说明：
```yaml
---
title: 你好，世界 //文章标题，显示文章的标题
date: 2019-01-14 11:01:30 //文章的创建时间
abbrlink: '1521186' // 文章的永久链接或唯一标识，该内容一旦创建后不可变更，否则导致永久链接失效
updated: 2019-01-14 11:01:30 //文章更新时间，选填
disComment: false //是否禁用文章评论，当在配置文件中开启了全局评论时，可通过本字段禁用当前文章的评论功能
---
```

## 关于草稿文件
为了方便资源统一管理，用户可将文章草稿保存到`/res/SMD5([organType][organId])/wrt_[timestamp].md.draft`文件。只要后缀名不是`.md`系统就不会进行渲染自动发布。

## 关于访问缓存
由于外部域名`https://xxx.com`开启了CDN加速，所以存在一定的缓存时间（默认设置为30天），这会导致即使系统渲染完source文件并上传不部署到COS中，在CDN缓存未过期前用户也无法查看最新的已更改的网页内容。为此，系统在deploy页面完成后，触发SCF调用接口刷新CDN缓存，但即使这样CDN的缓存刷新时间也存在大概5min延时。所以如果希望用户在第一时间可以查看渲染后的页面，可使用非CDN路径进行访问：`https://xxx.cos-website.xxx.myqcloud.com`。但此域名由于未开启CDN加速，虽然能够实时看到文件变化但会影响用户的访问体验，所以建议仅供预览时使用。

## 关于文章资源和页面的删除
当用户将res目录下的资源删除时，不会触发任何事件删除已发布的页面，用户需自己实现在删除source文件时删除对应的已发布的页面静态页面。但用户无需关心刷新CDN，因为系统会自动处理

## 关于文章中插入原生HTML标签或JS代码的问题

由于当前项目使用了`Hexo-Renderer-Markdown-it-plus引擎`进行页面渲染，所以在全局`_config.yml`中已经开启了不转义原生HTML，所以不再需要进行下面的处理即可在页面上渲染原生的HTML代码。且该引擎支持emoji、上下角标、公式等丰富功能。详情请移步该引擎官网查看：[传送门](https://github.com/CHENXCHEN/hexo-renderer-markdown-it-plus)

~~更多标签说明参考[官方文档](https://hexo.io/zh-cn/docs/tag-plugins)：通过用`{% raw %}HTML{% endraw %}`标签包裹的内容，Hexo不会做处理。例如下面，在文章资源中插入一段视频的代码：~~

```html
{% raw %}
<video controls="" preload="none" poster="封面缩略图URL">
      <source src="资源地址.mp3" type="audio/mp3">
</video>
{% endraw %}
```

## 使用说明：
1. ~~clone项目到CentOS7中。（由于腾讯云的SCF是运行于CentOS7环境下的，所以需要使用CentOS7上执行一下`npm install`来安装对应的依赖包）~~
1. 腾讯云SCF已推出在线安装依赖功能，可使用在线安装依赖功能而不用到CentOS7下安装依赖包
1. 根据需要和配置修改`_config.yml`中的配置
1. 修改`themes\diaspora-lite`主题中的`_config.yml`文件，根据需要开启功能
1. 配置好后，执行`npm install`
1. 本地调试运行
1. 根据需要修改`index.js`
1. 打ZIP包并上传到SCF的函数中
1. 配置号SCF的触发器（COS触发器-你的bucket-全部创建  和 全部删除）
