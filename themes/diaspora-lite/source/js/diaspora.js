var Home = location.href,
    Pages = 4,
    xhr,
    xhrUrl = '';

var Diaspora = {
    L: function (url, f, err) {
        if (url == xhrUrl) {
            return false;
        }
        xhrUrl = url;
        if (xhr) {
            xhr.abort();
        }
        xhr = $.ajax({
            type: 'GET',
            url: url,
            timeout: 10000,
            success: function (data) {
                f(data);
                xhrUrl = '';
            },
            error: function (a, b, c) {
                if (b == 'abort') {
                    err && err()
                } else {
                    window.location.href = url;
                }
                xhrUrl = '';
            }
        });
    },
    P: function () {
        return !!('ontouchstart' in window);
    },
    PS: function () {
        if (!(window.history && history.pushState)) {
            return;
        }
        history.replaceState({
            u: Home,
            t: document.title
        }, document.title, Home);
        window.addEventListener('popstate', function (e) {
            var state = e.state;
            if (!state) return;
            document.title = state.t;

            if (state.u == Home) {
                $('#preview').css('position', 'fixed');
                setTimeout(function () {
                    $('#preview').removeClass('show');
                    $('#container').show();
                    window.scrollTo(0, parseInt($('#container').data('scroll')));
                    setTimeout(function () {
                        $('#preview').html('');
                        $(window).trigger('resize');
                    }, 300);
                }, 0);
            } else {
                Diaspora.loading();
                Diaspora.L(state.u, function (data) {
                    document.title = state.t;
                    $('#preview').html($(data).filter('#single'));
                    Diaspora.preview();
                });
            }
        });
    },
    HS: function (tag, flag) {
        var id = tag.data('id') || 0,
            url = tag.attr('href'),
            title = tag.attr('title') + " - " + $("#config-title").text();

        if (!$('#preview').length || !(window.history && history.pushState)) location.href = url;
        Diaspora.loading()
        var state = {
            d: id,
            t: title,
            u: url
        };
        Diaspora.L(url, function (data) {
            if (!$(data).filter('#single').length) {
                location.href = url;
                return
            }
            switch (flag) {
                case 'push':
                    history.pushState(state, title, url)
                    break;
                case 'replace':
                    history.replaceState(state, title, url)
                    break;
            }
            document.title = title;
            $('#preview').html($(data).filter('#single'))
            switch (flag) {
                case 'push':
                    Diaspora.preview()
                    break;
                case 'replace':
                    window.scrollTo(0, 0)
                    Diaspora.loaded()
                    break;
            }
            setTimeout(function () {
                $('#top').show();
                comment = $("#gitalk-container");
                if (comment.data('ae')) {
                    comment.click();
                }
                comment = $("#valine-container");
                if (comment.data('ae')) {
                    comment.click();
                }
            }, 0)
        })
    },
    preview: function () {
        // preview toggle
        $("#preview").one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function () {
            var previewVisible = $('#preview').hasClass('show');
            if (!!previewVisible) {
                $('#container').hide();
            } else {
                $('#container').show();
            }
            Diaspora.loaded();
        });
        setTimeout(function () {
            $('#preview').addClass('show');
            $('#container').data('scroll', window.scrollY);
            setTimeout(function () {
                $('#preview').css({
                    'position': 'static',
                    'overflow-y': 'auto'
                });
            }, 500);
        }, 0);
    },
    loading: function () {
        var w = window.innerWidth;
        var css = '<style class="loaderstyle" id="loaderstyle' + w + '">' +
            '@-moz-keyframes loader' + w + '{100%{background-position:' + w + 'px 0}}' +
            '@-webkit-keyframes loader' + w + '{100%{background-position:' + w + 'px 0}}' +
            '.loader' + w + '{-webkit-animation:loader' + w + ' 3s linear infinite;-moz-animation:loader' + w + ' 3s linear infinite;}' +
            '</style>';
        $('.loaderstyle').remove()
        $('head').append(css)
        $('#loader').removeClass().addClass('loader' + w).show()
    },
    loaded: function () {
        $('#loader').removeClass().hide()
    },
    F: function (id, w, h) {
        var _height = $(id).parent().height(),
            _width = $(id).parent().width(),
            ratio = h / w;
        if (_height / _width > ratio) {
            id.style.height = _height + 'px';
            id.style.width = _height / ratio + 'px';
        } else {
            id.style.width = _width + 'px';
            id.style.height = _width * ratio + 'px';
        }
        id.style.left = (_width - parseInt(id.style.width)) / 2 + 'px';
        id.style.top = (_height - parseInt(id.style.height)) / 2 + 'px';
    }
};

$(function () {
    if (Diaspora.P()) {
        $('body').addClass('touch')
    }
    if ($('#preview').length) {
        var cover = {};
        cover.t = $('#cover');
        cover.w = cover.t.attr('width');
        cover.h = cover.t.attr('height');;
        (cover.o = function () {
            $('#mark').height(window.innerHeight)
        })();
        cover.t.on('load', function () {
            (cover.f = function () {
                var _w = $('#mark').width(),
                    _h = $('#mark').height(),
                    x, y, i, e;
                e = (_w >= 1000 || _h >= 1000) ? 1000 : 500;
                if (_w >= _h) {
                    i = _w / e * 50;
                    y = i;
                    x = i * _w / _h;
                } else {
                    i = _h / e * 50;
                    x = i;
                    y = i * _h / _w;
                }
                $('.layer').css({
                    'width': _w + x,
                    'height': _h + y,
                    'marginLeft': -0.5 * x,
                    'marginTop': -0.5 * y
                })
                if (!cover.w) {
                    cover.w = cover.t.width();
                    cover.h = cover.t.height();
                }
                Diaspora.F($('#cover')[0], cover.w, cover.h)
            })();
            setTimeout(function () {
                $('html, body').removeClass('loading')
            }, 10)
            $('#mark').parallax()
            var vibrant = new Vibrant(cover.t[0]);
            var swatches = vibrant.swatches()
            if (swatches['DarkVibrant']) {
                $('#vibrant polygon').css('fill', swatches['DarkVibrant'].getHex())
                $('#vibrant div').css('background-color', swatches['DarkVibrant'].getHex())
            }
            if (swatches['Vibrant']) {
                $('.icon-menu').css('color', swatches['Vibrant'].getHex())
            }
        })
        if (cover.t.prop('complete') && cover.t.prop('naturalHeight')) { // 如果是图片则通过complete和naturalHeight属性判断图片是否设置正确
            // why setTimeout ? 答：开启一个后台任务用于load()
            setTimeout(function () {
                cover.t.load()
            }, 0)
        } else if (cover.t.prop('networkState') != undefined && cover.t.prop('networkState') != 3) { // 如果不是图片且网络状态正常，则通过下面的方法循环判断加载完成
            setTimeout(async () => {
                while (true) {
                    // console.log({readyState:cover.t.prop('readyState'),networkState:cover.t.prop('networkState')})
                    if (cover.t.prop('readyState') > 3) {
                        cover.t.load();
                        break;
                    } else if (cover.t.prop('networkState') == 3) break;
                    await new Promise((res, rej) => {
                        setTimeout(() => {
                            res()

                        }, 10);
                    })
                }
            }, 0);
        } else {
            alert('未设置封面或封面资源加载失败！')
        }
        $('#preview').css('min-height', window.innerHeight)
        Diaspora.PS()
        $('.pview a').addClass('pviewa')
        var T;
        $(window).on('resize', function () {
            clearTimeout(T)
            T = setTimeout(function () {
                if (!Diaspora.P() && location.href == Home) {
                    cover.o()
                    cover.f()
                }
                if ($('#loader').attr('class')) {
                    Diaspora.loading()
                }
            }, 500)
        })
    } else {
        $('#single').css('min-height', window.innerHeight)
        setTimeout(function () {
            $('html, body').removeClass('loading')
        }, 10)
        window.addEventListener('popstate', function (e) {
            if (e.state) location.href = e.state.u;
        })
        $('.icon-icon, .image-icon').attr('href', '/')
        $('#top').show()
    }
    $(window).on('scroll', function () {
        if ($('.scrollbar').length && !Diaspora.P() && !$('.icon-images').hasClass('active')) {
            var wt = $(window).scrollTop(),
                tw = $('#top').width(),
                dh = document.body.scrollHeight,
                wh = $(window).height();
            var width = tw / (dh - wh) * wt;
            $('.scrollbar').width(width)
            if (wt > 80 && window.innerWidth > 800) {
                $('.subtitle').fadeIn()
            } else {
                $('.subtitle').fadeOut()
            }
        }
    })
    $(window).on('touchmove', function (e) {
        if ($('body').hasClass('mu')) {
            e.preventDefault()
        }
    })
    $('body').on('click', function (e) {
        var tag = $(e.target).attr('class') || '',
            rel = $(e.target).attr('rel') || '';
        // .content > ... > img
        if (e.target.nodeName == "IMG" && $(e.target).parents('div.content').length > 0) {
            tag = 'pimg';
        }
        if (!tag && !rel) return;
        switch (true) {
            // nav menu
            case (tag.indexOf('switchmenu') != -1):
                window.scrollTo(0, 0)
                $('html, body').toggleClass('mu');
                return false;
                // next page
            case (tag.indexOf('more') != -1):
                tag = $('.more');
                if (tag.data('status') == 'loading') {
                    return false
                }
                var num = parseInt(tag.data('page')) || 1;
                if (num == 1) {
                    tag.data('page', 1)
                }
                if (num >= Pages) {
                    return
                }
                tag.html('加载中...').data('status', 'loading')
                Diaspora.loading()
                Diaspora.L(tag.attr('href'), function (data) {
                    var link = $(data).find('.more').attr('href');
                    if (link != undefined) {
                        tag.attr('href', link).html('加载更多').data('status', 'loaded')
                        tag.data('page', parseInt(tag.data('page')) + 1)
                    } else {
                        $('#pager').remove()
                    }
                    var tempScrollTop = $(window).scrollTop();
                    $('#primary').append($(data).find('.post'))
                    $(window).scrollTop(tempScrollTop + 100);
                    Diaspora.loaded()
                    $('html,body').animate({
                        scrollTop: tempScrollTop + 400
                    }, 500);
                }, function () {
                    tag.html('加载更多').data('status', 'loaded')
                })
                return false;
                // home
            case (tag.indexOf('icon-home') != -1):
                $('.toc').fadeOut(100);
                if ($('#preview').hasClass('show')) {
                    history.back();
                } else {
                    location.href = $('.icon-home').data('url')
                }
                return false;
                // qrcode
            case (tag.indexOf('icon-scan') != -1):
                if ($('.icon-scan').hasClass('tg')) {
                    $('#qr').toggle()
                } else {
                    $('.icon-scan').addClass('tg')
                    $('#qr').qrcode({
                        width: 128,
                        height: 128,
                        text: location.href
                    }).toggle()
                }
                return false;
                // history state
            case (tag.indexOf('cover') != -1):
                Diaspora.HS($(e.target).parent(), 'push')
                return false;
                // history state
            case (tag.indexOf('posttitle') != -1):
                Diaspora.HS($(e.target), 'push')
                return false;
                // prev, next post
            case (rel == 'prev' || rel == 'next'):
                if (rel == 'prev') {
                    var t = $('#prev_next a')[0].text
                } else {
                    var t = $('#prev_next a')[1].text
                }
                $(e.target).attr('title', t)
                Diaspora.HS($(e.target), 'replace')
                return false;
                // toc
            case (tag.indexOf('toc-text') != -1 || tag.indexOf('toc-link') != -1 ||
                tag.indexOf('toc-number') != -1):
                hash = '';
                if (e.target.nodeName == 'SPAN') {
                    hash = $(e.target).parent().attr('href')
                } else {
                    hash = $(e.target).attr('href')
                }
                to = $("a.headerlink[href='" + hash + "']")
                $("html,body").animate({
                    scrollTop: to.offset().top - 50
                }, 300);
                return false;
                // quick view
            case (tag.indexOf('pviewa') != -1):
                $('body').removeClass('mu')
                setTimeout(function () {
                    Diaspora.HS($(e.target), 'push')
                    $('.toc').fadeIn(1000);
                }, 300)
                return false;
                // photoswipe
            case (tag.indexOf('pimg') != -1):
                var pswpElement = $('.pswp').get(0);
                if (pswpElement) {
                    var items = [];
                    var index = 0;
                    var imgs = [];
                    $('.content img').each(function (i, v) {
                        // get index
                        if (e.target.src == v.src) {
                            index = i;
                        }
                        var item = {
                            src: v.src,
                            w: v.naturalWidth,
                            h: v.naturalHeight
                        };
                        imgs.push(v);
                        items.push(item);
                    });
                    var options = {
                        index: index,
                        shareEl: false,
                        zoomEl: false,
                        allowRotationOnUserZoom: true,
                        history: false,
                        getThumbBoundsFn: function (index) {
                            // See Options -> getThumbBoundsFn section of documentation for more info
                            var thumbnail = imgs[index],
                                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                                rect = thumbnail.getBoundingClientRect();

                            return {
                                x: rect.left,
                                y: rect.top + pageYScroll,
                                w: rect.width
                            };
                        }
                    };
                    var lightBox = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
                    lightBox.init();
                }
                return false;
                // comment
            case -1 != tag.indexOf("comment"):
                Diaspora.loading()
                comment = $('#gitalk-container');
                if (comment.data('ci')) {
                    console.log('INIT GITALK')
                    gitalk = new Gitalk({
                        clientID: comment.data('ci'),
                        clientSecret: comment.data('cs'),
                        repo: comment.data('r'),
                        owner: comment.data('o'),
                        admin: comment.data('a'),
                        id: decodeURI(window.location.pathname),
                        distractionFreeMode: comment.data('d')
                    })
                    $(".comment").removeClass("link")
                    gitalk.render('gitalk-container')
                } else {
                    // init valine
                    comment = $('#valine-container');
                    if (comment.data('ai')) {
                        console.log('INIT VALINE')
                        valine = new Valine({
                            el: '#valine-container',
                            appId: comment.data('ai'),
                            appKey: comment.data('ak'),
                            placeholder: comment.data('ph'),
                            notify: comment.data('nt'),
                            verify: comment.data('vr'),
                            avatar: comment.data('a'),
                            avatarForce: comment.data('af'),
                            meta: comment.data('mt'),
                            pageSize: comment.data('ps'),
                            visitor: comment.data('vs'),
                            highlight: comment.data('hl'),
                            recordIP: comment.data('ip'),
                            clazzName: comment.data('cn')
                        })
                        $(".comment").removeClass("link")
                    }
                }
                Diaspora.loaded();
                return false;
            default:
                return true;
        }
    })
    // 是否自动展开评论
    comment = $("#gitalk-container");
    if (comment.data('ae')) {
        comment.click();
    }
    comment = $('#valine-container');
    if (comment.data('ae')) {
        comment.click();
    }
    console.log("%c Github %c", "background:#24272A; color:#ffffff", "", "https://github.com/sdlyfjx/HexoOnSCF")
})