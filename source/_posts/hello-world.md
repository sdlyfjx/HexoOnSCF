---
title: Hello World
abbrlink: 4a17b156
date: 2019-01-14 11:01:32
---
Welcome to [Hexo](https://hexo.io/)! This is your very first post. Check [documentation](https://hexo.io/docs/) for more info. If you get any problems when using Hexo, you can find the answer in [troubleshooting](https://hexo.io/docs/troubleshooting.html) or you can ask me on [GitHub](https://github.com/hexojs/hexo/issues).

## Quick Start

### Create a new post

``` bash
$ hexo new "My New Post"
```

More info: [Writing](https://hexo.io/docs/writing.html)

### Run server

``` bash
$ hexo server
```

More info: [Server](https://hexo.io/docs/server.html)

### Generate static files

``` bash
$ hexo generate
```

More info: [Generating](https://hexo.io/docs/generating.html)

### Deploy to remote sites

``` bash
$ hexo deploy
```

More info: [Deployment](https://hexo.io/docs/deployment.html)


@[toc]

# demo
## reason

I use **[hexo-theme-next](https://github.com/iissnan/hexo-theme-next)** for my blog, and I met a problem same with [#826](https://github.com/iissnan/hexo-theme-next/issues/826). 

I wrote a plugin [**hexo-renderer-markdown-it-plus**](https://github.com/CHENXCHEN/hexo-renderer-markdown-it-plus) for fix it,and this article is a demo for `hexo-renderer-markdown-it-plus`

The hexo default [hexo-renderer-marked](https://github.com/hexojs/hexo-renderer-marked) do not support LaTex parser, you must referer external link to parse Latex grammar to html(That's what`hexo-theme-next` did, `hexo-theme-next` use `mathjax`), and the `mathjax` and `hexo-renderer-marked` will cause some problem:

1. `_` parse error, you must change `x_i` to `x\_i`(This problem had been fixed when i test.)
2. do not support lines grammar, expample below:

```latex
$$
H=-\sum_{i=1}^N (\sigma_{i}^x \sigma_{i+1}^x+g \sigma_{i}^z)
$$

$$
f(n) = \begin{cases}
 \frac{n}{2},
 & \text{if } n\text{ is even}
 \\ 3n+1, & \text{if } n\text{ is odd}
 \end{cases}
$$

$$
\begin{aligned}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} & = \frac{4\pi}{c}\vec{\mathbf{j}} \\   
\nabla \cdot \vec{\mathbf{E}} & = 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} & = \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} & = 0 \end{aligned}
$$
```

<!-- more -->

## hexo-renderer-markdown-it-plus

[**hexo-renderer-markdown-it-plus**](https://github.com/CHENXCHEN/hexo-renderer-markdown-it-plus) support lines grammer for $\KaTeX$(Don't worry, it's grammer same with Latex).

The latex code of above will be display below:


$$
H=-\sum_{i=1}^N (\sigma_{i}^x \sigma_{i+1}^x+g \sigma_{i}^z)
$$

$$
f(n) = \begin{cases}
 \frac{n}{2},
 & \text{if } n\text{ is even}
 \\ 3n+1, & \text{if } n\text{ is odd}
 \end{cases}
$$

$$
\begin{aligned}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} & = \frac{4\pi}{c}\vec{\mathbf{j}} \\   
\nabla \cdot \vec{\mathbf{E}} & = 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} & = \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} & = 0 \end{aligned}
$$

BTW, i bundle some plugins, example below:

1. H~2~0
2. x^2^
3. ++inserted++, ~~Delete~~
4. $\KaTeX$, example $x_i + y_i = z_i$ and $y_i + z_i = 10$
5. ​:smile: :joy: :stuck_out_tongue:
6. toc&anchor(do not explain this)
7. deflist

Term 1

:   Definition 1

Term 2 with *inline markup*

:   Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.

8. abbr

*[abbr]: hover this will show you something.

9. Look at the bottom[^hello]

   [^hello]: footnote
10. ==mark==, `==mark==`


**The markdown code show as below:**
```markdown
1. H~2~0
2. x^2^
3. ++inserted++, ~~Delete~~
4. $\KaTex$, example $x_i + y_i = z_i$ and $y_i + z_i = 10$
5. :smile: :joy: :stuck_out_tongue:
6. toc&anchor(do not explain this)
7. deflist

Term 1

:   Definition 1

Term 2 with *inline markup*

:   Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.

8. abbr

*[abbr]: hover this will show you something.

9. Look at the bottom[^hello]

   [^hello]: footnote
10. ==mark==, `==mark==`
```