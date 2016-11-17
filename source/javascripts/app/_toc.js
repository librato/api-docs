//= require ../lib/_jquery_ui
//= require ../lib/_jquery.tocify
//= require ../lib/_imagesloaded.min
(function (global) {
  'use strict';

  var closeToc = function() {
    $(".tocify-wrapper").removeClass('open');
    $("#nav-button").removeClass('open');
  };

  var makeToc = function() {
    global.toc = $("#toc").tocify({
      selectors: 'h1, h2',
      extendPage: false,
      theme: 'none',
      smoothScroll: false,
      showEffectSpeed: 0,
      hideEffectSpeed: 180,
      ignoreSelector: '.toc-ignore',
      highlightOffset: 180,
      scrollTo: 170,
      scrollHistory: true,
      hashGenerator: function (text, element) {
        return element.prop('id');
      }
    }).data('toc-tocify');

    $("#nav-button").click(function() {
      $(".tocify-wrapper").toggleClass('open');
      $("#nav-button").toggleClass('open');
      return false;
    });

    $(".page-wrapper").click(closeToc);
    $(".tocify-item").click(closeToc);
  };

  // scroll the given anchor into view
  var scrollToAnchor = function($anchor) {
    toc._scrollTo($anchor);
    // highlight the parent heading when hash is not in TOC (i.e. an h3)
    var hash = $anchor.attr('data-unique-parent') || '',
        $tocParent = hash && toc.element.find("li[data-unique='" + hash + "']");
    $tocParent.length && $("html, body").promise().done(function() {
      $tocParent.addClass(toc.focusClass);
      toc._triggerShow($tocParent);
    });
  };

  // scroll the current hash's matching anchor into view
  global.scrollToHash = function() {
    setTimeout(function() {
      var hash = window.location.hash.slice(1) || hash,
          $anchor = hash && $("div[data-unique='" + hash + "']");
      $anchor.length && scrollToAnchor($anchor);
    }, 0);
  };

  function makeAnchors() {
    // add anchor links to all h1, h2, and h3 headings
    anchors.add('h1, h2, h3');

    // set proper scroll position when clicking on anchor links
    $('a.anchorjs-link').click(function(e){
      var $anchor = $(e.target).closest('h1, h2, h3').prev('[data-unique]');
      if($anchor.length) {
        e.preventDefault();
        window.location.hash = $anchor.attr("data-unique");
        scrollToAnchor($anchor);
      }
    });

    // inject anchor divs for h3 headings, since they're excuded from TOC
    $('h3').each(function(){
      var $h3 = $(this),
          id = $h3.prop('id'),
          $anchor = $('<div name="' + id + '" data-unique="' + id + '"/>'),
          $parent = $h3.prevAll('h1, h2').first();
      $parent.length && $anchor.attr('data-unique-parent', $parent.prop('id'));
      $anchor.insertBefore($h3);
    });
  }

  // Hack to make already open sections to start opened,
  // instead of displaying an ugly animation
  function animate() {
    setTimeout(function() {
      toc.setOption('showEffectSpeed', 180);
    }, 50);
  }

  $(function() {
    makeToc();
    makeAnchors();
    animate();
    $('.content').imagesLoaded( function() {
      global.toc.calculateHeights();
      $(window).load(scrollToHash);
    });
  });
})(window);

