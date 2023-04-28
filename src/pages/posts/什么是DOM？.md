---
layout: "../../layouts/MarkdownPost.astro"
title: "什么是DOM"
pubDate: 2023-04-28
description: ""
author: "liyucheng"
cover:
  url: ""
  square: ""
  alt: "cover"
tags: ["前端", "DOM"]
theme: "light"
featured: true
---

DOM（文档对象模型 document object model）是 HTML 和 XML 文档的编程接口，定义了一种可以访问文档结构的方式，从而改变文档结构、样式和内容。

web=DOM+JS

DOM 与编程语言独立，不仅是 JavaScript，DOM 也可以用其他语言（如 Python）访问实现。

DOM 编程中最常用的是 Document 和 window 对象。window 表示浏览器中的内容，而 document 对象是文档的根节点。
下载的实现：

```
// 文件下载处理
handleDownload(row) {
  var name = row.fileName;
  var url = row.filePath;
  var suffix = url.substring(url.lastIndexOf("."), url.length);
  const a = document.createElement('a')
  a.setAttribute('download', name + suffix)
  a.setAttribute('target', '_blank')
  a.setAttribute('href', url)
  a.click()
}
```

参考：
[DOM 概述-Web 开发技术](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model/Introduction)
