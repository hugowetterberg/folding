(function () {
  "use strict";

  var headlineExp = /^H(\d)$/;
  var todoExp = /^(.+)\.todo$/;
  var tagExp = /@([\w]+)/;

  function foldIt(elements) {
    elements = elements || document.getElementsByClassName('folding');
    for (var i = 0; i < elements.length; i++) {
      foldingIt(elements.item(i));
    }
  }
  window.foldIt = foldIt;

  function foldingIt(element) {
    element.classList.add('folding');
    element.addEventListener('click', function detectInteractiveElements(e) {
      var match;

      // Tags
      if (e.target.classList.contains('folding-tag')) {
        var tag = e.target.getAttribute('data-tag');
        if (!element.classList.contains('tag-filter-' + tag)) {
          var tagClass = 'folding-tagged-' + tag;
          var tagged = element.getElementsByClassName('folding-tagged'), candidate;
          for (var i=0; i<tagged.length; i++) {
            candidate = tagged.item(i);
            if (candidate.classList.contains(tagClass)) {
              candidate.classList.add('active-tag');
            }
            else {
              candidate.classList.remove('active-tag');
            }
          }
          element.classList.add('tag-filter');
          element.classList.add('tag-filter-' + tag);
        }
        else {
          element.classList.remove('tag-filter');
          element.classList.remove('tag-filter-' + tag);
        }
      }
      // Headlines (folding)
      else if (match = headlineExp.exec(e.target.nodeName)) {
        e.preventDefault();
        toggleHeadlineFolding(e.target, match);
      }
    });

    var current = element.firstElementChild;
    var match = null;
    var tagList = null;
    while (current) {
      if (headlineExp.exec(current.nodeName) && (match = todoExp.exec(current.textContent))) {
        handleTodo(current, match[1]);
      }

      tagList = [];
      detectTags(current, tagList);
      if (tagList.length) {
        moveUpHeadlines(current, function tagParentHeadlines(h) {
          tagList.forEach(tagElement.bind(h));
        });
      }

      current = current.nextElementSibling;
    }
  }

  function detectTags(element, tagList) {
    tagList = tagList || [];
    var appendTags = [];

    var node = element.firstChild, next;
    while (node) {
      next = node.nextSibling;
      if (node.nodeName == '#text') {
        tagChopper(node, tagList);
      }
      else {
        var childTags = tagList.slice();
        detectTags(node, childTags);
        if (childTags.length > tagList.length) {
          appendTags = appendTags.concat(childTags.slice(tagList.length));
        }
      }
      node = next;
    }

    appendTags.forEach(function appendTag(tag) {
      tagList.push(tag);
    });

    if (element.nodeName == 'LI' || element.nodeName == 'P' || headlineExp.exec(element.nodeName)) {
      if (tagList.length) {
        tagList.forEach(tagElement.bind(element));
      }
      else {
        element.classList.add('no-tag');
      }
    }
  }

  function tagChopper(node, tagList) {
    var match, tag;
    var text = node.textContent;
    while (match = tagExp.exec(text)) {
      var tagName = match[1].toLowerCase();
      node.textContent = match.index ? text.substr(0, match.index) : '';

      tagList.push(tagName);
      tag = document.createElement('span');
      tag.textContent = match[0];
      tag.classList.add('folding-tag');
      tag.setAttribute('data-tag', tagName);

      node.parentElement.insertBefore(tag, node.nextSibling);
      text = text.substr(match.index + match[0].length);

      if (text.length) {
        tag.insertAdjacentText('afterend', text);
        node = tag.nextSibling;
      }
      else {
        node = null;
      }
    }
  }

  function tagElement(tag) {
    this.classList.add('folding-tagged');
    this.classList.add('folding-tagged-' + tag);
  }

  function moveUpHeadlines(element, each) {
    var match = headlineExp.exec(element.nodeName);
    var candidateMatch;
    while (element && (element = element.previousElementSibling)) {
      if (candidateMatch = headlineExp.exec(element.nodeName)) {
        if (!match || candidateMatch[1] < match[1]) {
          each(element);
          match = candidateMatch;
        }
      }
    }
  }

  function moveAcrossGap(element, each) {
    var match = headlineExp.exec(element.nodeName);
    var current = element.nextElementSibling;
    while (current) {
      var siblingMatch = headlineExp.exec(current.nodeName);
      // If we hit a headline element at the same or higher level.
      if (siblingMatch && siblingMatch[1] <= match[1]) {
        return current;
      }
      if (each) current = each(current);
      current = current.nextElementSibling;
    }
  }

  function toggleHeadlineFolding(element, match) {
    element.classList.toggle('folded')
    var fold = element.classList.contains('folded');
    var siblingMatch;

    if (!fold) {
      element.removeChild(element.lastElementChild);
    }

    moveAcrossGap(element, function toggleFolding(current) {
      if (fold) {
        current.classList.add('hidden-by-fold');
      }
      else {
        current.classList.remove('hidden-by-fold');
        if (current.classList.contains('folded')) {
          current = moveAcrossGap(current);
          current = current ? current.previousElementSibling : null;
        }
      }
      return current;
    });

    if (fold) {
      var ellipsis = document.createElement('div');
      ellipsis.textContent = '…';
      ellipsis.classList.add('folding-ellipsis');
      element.appendChild(ellipsis);
    }
  }

  function handleTodo(header, title) {
    while (header.childNodes.length) {
      header.removeChild(header.childNodes.item(0));
    }
    header.appendChild(document.createTextNode(title));
    var decorator = document.createElement('span');
    decorator.classList.add('decorator');
    decorator.appendChild(document.createTextNode('.todo'));
    header.appendChild(decorator);

    var list = header.nextElementSibling;
    if (list.nodeName == 'UL') {
      handleTodoList(list);
    }
  }

  function handleTodoList(list) {
    list.classList.add('todo');
    var exp = /@done$/m;
    var items = list.getElementsByTagName('li');
    var i, item;
    for (i = 0; i < items.length; i++) {
      item = items.item(i);
      if (exp.exec(item.childNodes.item(0).textContent)) {
        item.classList.add('done');
      }
    }
  }
})();
