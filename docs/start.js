(function () {
  function initBundle(k) {
    require("babel-polyfill")
    window.F = require("fastener")
    window.R = require("ramda")
    k()
  }

  var hljsLanguages = ["javascript"]

  window.klipse_settings = {
    codemirror_options_in: {
      lineWrapping: true,
      autoCloseBrackets: true,
      cursorBlinkRate: 0
    },
    codemirror_options_out: {
      lineWrapping: true
    },
    selector_eval_js: '.lang-js'
  }

  function hop(op, k) {setTimeout(function() {op(k)}, 0)}
  function ignore() {}
  function queue(op) {hop(op, ignore)}

  function seq(ops) {
    return function(k) {
      var i = 0
      function lp() {
        if (i < ops.length)
          ops[i++](lp)
        else
          k()
      }
      lp()
    }
  }

  function loadScript(url) {
    return function(k) {
      var script = document.createElement("script")
      script.onload = k
      script.type = "text/javascript"
      script.src = url
      document.head.appendChild(script)
    }
  }

  function toArray(x) {
    return Array.prototype.slice.call(x)
  }

  function initHLJS(k) {
    document.querySelectorAll(".hljs")
      .forEach(function (elem) {
        hljs.highlightBlock(elem)
      })
    k()
  }

  function removeIds(elem) {
    elem.removeAttribute("id")
    for (var i=0, n=elem.childElementCount; i < n; ++i)
      removeIds(elem.children[i])
    return elem
  }

  function addTips() {
    var tips = []

    function headerOf(elem) {
      if (!elem)
        return null
      if (/^H[1-6]$/.test(elem.tagName))
        return elem
      return headerOf(elem.parentElement)
    }

    toArray(document.querySelectorAll('a')).forEach(function (link) {
      var href = link.getAttribute("href")
      if (!href || href[0] !== '#' || href === '#')
        return
      if (link.onclick)
        return

      var targetHeader = headerOf(document.querySelector(href))
      if (!targetHeader)
        return

      var linkHeader = headerOf(link)
      if (linkHeader === targetHeader)
        return

      var targetSibling = targetHeader.nextElementSibling
      if (!targetSibling)
        return
      if (targetSibling.tagName !== "P")
        return

      targetHeader = removeIds(targetHeader.cloneNode(true))
      targetSibling = removeIds(targetSibling.cloneNode(true))

      tips.push({link: link,
                 targetHeader: targetHeader,
                 targetSibling: targetSibling})
    })

    tips.forEach(function (args) {
      var preview = document.createElement("div")
      preview.setAttribute("class", "preview")
      preview.appendChild(args.targetHeader)
      preview.appendChild(args.targetSibling)
      args.link.setAttribute("class", "preview-anchor")
      args.link.appendChild(preview)
    })
  }

  function createMenu() {
    var menu = document.querySelector(".menu")
    if (!menu)
      return
    var menuContents = menu.querySelector(".menu-contents")
    if (!menuContents)
      return
    var contents = document.querySelector("#contents")
    if (!contents)
      return
    var tree = contents.nextElementSibling
    if (!tree)
      return
    menu.onclick = function(e) {
      menu.className = menu.className === "menu" && e.target.tagName === "DIV"
        ? "menu open"
        : "menu"
      e.stopPropagation()
    }
    menuContents.appendChild(removeIds(tree.cloneNode(true)))
  }

  window.onload = function () {
    createMenu()
    addTips()
  }

  queue(seq([].concat(
    [loadScript("bundle.js"),
     initBundle,
     loadScript("https://storage.googleapis.com/app.klipse.tech/plugin_prod/js/klipse_plugin.min.js"),
     loadScript("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.8.0/highlight.min.js")],
    hljsLanguages.map(function (lang) {
      return loadScript("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.8.0/languages/" + lang + ".min.js")
    }),
    [initHLJS]
  )))
})()
