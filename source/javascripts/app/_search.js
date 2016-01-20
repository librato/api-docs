//= require ../lib/_lunr
//= require ../lib/_jquery.highlight
(function () {
  'use strict';

  var content, searchResults;
  var highlightOpts = { element: 'span', className: 'search-highlight' };

  var index = new lunr.Index();

  index.ref('id');
  index.field('title', { boost: 10 });
  index.field('body');
  index.pipeline.add(lunr.trimmer, lunr.stopWordFilter);

  $(populate);
  $(bind);

  function populate() {
    $('h1, h2').each(function() {
      var title = $(this);
      var body = title.nextUntil('h1, h2');
      index.add({
        id: title.prop('id'),
        title: title.text(),
        body: body.text()
      });
    });
  }

  function bind() {
    content = $('.content');
    searchResults = $('.search-results');

    $('#input-search').on('keyup', search);

  }

  function search(event) {
    //ga('send', 'pageview', '/search_results.php?q=keyword');
    
    unhighlight();
    searchResults.addClass('visible');

    // ESC clears the field
    if (event.keyCode === 27) this.value = '';

    // Keydown to search results. 
    if (event.keyCode==40) {
       console.log('keydown');
      $('.search-results li a').focus();
       console.log('keydown1');
    }

    
    if (this.value) {
      var results = index.search(this.value).filter(function(r) {
        return r.score > 0.0001;
      });

      if (results.length) {
        searchResults.empty();
        $.each(results, function (index, result) {
          var elem = document.getElementById(result.ref);
          searchResults.append("<li><a href='#" + result.ref + "'>" + $(elem).text() + "</a></li>");
          searchToGA.call(this);
        });
        highlight.call(this);
      } else {
        searchResults.html('<li></li>');
        $('.search-results li').text('No Results Found for "' + this.value + '"');
        searchToGA.call(this);
      }
    } else {
      unhighlight();
      searchResults.removeClass('visible');
    }
  }

  function searchToGA(){
     if (this.value) ga('send', 'pageview', '/search_results_api.php?q='+this.value );
  }

  function highlight() {
    if (this.value) content.highlight(this.value, highlightOpts);
  }

  function unhighlight() {
    content.unhighlight(highlightOpts);
  }
})();
