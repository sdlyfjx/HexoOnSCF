# Hexo-theme-diaspora-lite

此模板是针对原diaspora模板的精简，并根据本项目的需求进行了删减（如删除tag模块、categories模块等，如有需要请使用原版主题或其他主题），具体修改内容如下：

> 2020-02-15修改内容

- 修复之前`diaspora.js`、`screen.ejs`、`plugin.js`文件中引入视频背景后会在出现错误的问题（主要是由于视频资源未加载完成或获取不到视频尺寸导致js获取不到数据）
- 修复`index.js`中由于使用`indexOf()`函数判断时返回-1从而使得判断条件为true导致无法刷新CDN的BUG
- 新增了静态资源文件的minify版本并修改主题中引入的路径为min资源

> 上一版本

- 增加百度统计（配置文件中配置）
- 增加匿名留言Valine（配置文件中配置,支持阅读次数统计）
- `post`中在头部增加`disComment: true`可以隐藏当前文章的评论区
- 修改欢迎页`screen.ejs`中页面cover处，增加支持视频或其他自定义内容并修改对应的`diaspora.js`中的代码，主题配置中配置`welcome_video`即可
- 新增404页面，在生成网站的`public/404/`
- 去除谷歌的广告模块，如有需要可自行添加下列代码到`/layout/_partial/head.ejs`中即可
- 将gitalk相关内容是否需要初始化进行判断，若不开启gitalk则不加载gitalk的JS和CSS等资源文件
- 修改`screen.ejs`中最下方post0展示内容为固定站点内容而非最新的文章标题和内容（原内容如下）
- 精简`index.ejs`，去除下面的文章内容，实现纯全屏欢迎页面。(原内容如下)
- 修改`diaspora.css`中`#122`行，去掉`#container`中的`padding-bottom:100px;`属性实现首页全屏效果
- 修改`diaspora.css`中`#284`行，去掉`#container`中的`padding-bottom:50px;`属性实现手机端首页全屏效果
- 修改`diaspora.js`中`#243`行、`#278`行，时间由1000改为10毫秒，加快加载动画消失时间
- 去除页面MP3背景音乐（由于音乐文件加载慢可能会导致页面加载慢，没有必要，如有需要请参看原主题）
- 新增字数统计，见配置文件
- 增加不蒜子站点访问量统计，具体使用见主题配置文件和官方文档

> head.ejs中的谷歌广告代码

```js
    <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
    <script>
         (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "ca-pub-8691406134231910",
              enable_page_level_ads: true
         });
    </script>
    <script async custom-element="amp-auto-ads"
        src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js">
    </script>
```

> screen.ejs中post0标题的原内容h2和p

```html
        <h2><%- link_to(first.path, first.title || config.title, {class: "posttitle"}) %></h2>
        <p class="summary"><%- truncate(strip_html(first.content), {length: 60, omission: '...'}) %></p>
```

> index.ejs原内容

```html
    <%- partial("_partial/menu", null, {cache: true}) %>
    <div id="container">
    <%- partial("_partial/screen", null, {cache: false}) %>
    <div id="primary">
        <%- partial('_partial/list', {start: 1}) %>
    </div>
    <% if (page.total > 1 && page.next_link){ %>
    <div id="pager"><a href="<%- url_for(page.next_link) %>" class="more">加载更多</a></div>
    <% } %>
    </div>
    <div id="preview"></div>
```


**[在线预览 | PREVIEW ](http://fech.in)**

一款基于WP移植的Hexo主题，适合喜欢摄影，影评，乐评和玩弄文字的你，干净，清新； 响应式，Ajax，更多好玩的等你来发现。 

> 再次感谢原作者创作出这么精美的主题 [@Loeify](https://github.com/LoeiFy/Diaspora) 。如果你喜欢，请捐助原作者。

![cover](https://fech.in/static/images/Diaspora.jpg)


### 安装主题

``` bash
$ git clone https://github.com/Fechin/hexo-theme-diaspora.git diaspora
```


### 启用主题

修改Hexo配置文件 `_config.yml` 主题项设置为diaspora


``` yaml

...
theme: diaspora
...
```
### 更新主题

注意：请在更时主题时备份`_config.yml`配置文件

``` bash
cd themes/diaspora
git pull
```


### 新建文章模板

``` markdown
---
title: My awesome title
date: 2016-10-12 18:38:45
categories: 
    - 分类1
    - 分类2
tags: 
    - 标签1
    - 标签2
mp3: http://domain.com/awesome.mp3
cover: http://domain.com/awesome.jpg
---
```

### 创建分类页
1 新建一个页面，命名为 categories 。命令如下：
```
hexo new page categories
```
2 编辑刚新建的页面，将页面的类型设置为 categories
```
title: categories
date: 2014-12-22 12:39:04
type: "categories"
---
```
主题将自动为这个页面显示所有分类。

### 创建标签页
1 新建一个页面，命名为 tags 。命令如下：
```
hexo new page tags
```
2 编辑刚新建的页面，将页面的类型设置为 tags
```
title: tags
date: 2014-12-22 12:39:04
type: "tags"
---
```
主题将自动为这个页面显示所有标签。


### 主题配置
```yml
# 头部菜单，title: link
menu:
  Whoami: /whoami
  Github: https://github.com/Fechin
  Twitter: https://twitter.com/FechinLi
  分类: /categories
  归档: /archives
  标签云: /tags

# 是否显示目录
TOC: false

# 是否自动播放音乐
autoplay: false

# 默认音乐（随机播放）
mp3: 
    - http://link.hhtjim.com/163/425570952.mp3
    - http://link.hhtjim.com/163/425570952.mp3

# 首页封面图, 为空时取文章的cover作为封面
welcome_cover: # /img/welcome-cover.jpg

# 默认文章封面图
cover: /img/cover.jpg

# Gitalk 评论插件（https://github.com/gitalk/gitalk）
gitalk:
    # 是否自动展开评论框
    autoExpand: false
    # 应用编号
    clientID: ''
    # 应用秘钥
    clientSecret: ''
    # issue仓库名
    repo: ''
    # Github名
    owner: ''
    # Github名
    admin: ['']
    # Ensure uniqueness and length less than 50
    id: location.pathname
    # Facebook-like distraction free mode
    distractionFreeMode: false

# 网站关键字
keywords: Fechin

# 要使用google_analytics进行统计的话，这里需要配置ID
google_analytics: 

# 网站ico
favicon: /img/favicon.png

# rss文件
rss: atom.xml
```

