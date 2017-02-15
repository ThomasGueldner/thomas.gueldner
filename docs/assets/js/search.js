(function () {
    function displaySearchResults(results, store) {
        var searchResults = document.getElementById('search-results');
        if (results.length) { // Are there any results?
            var appendString = '';
            for (var i = 0; i < results.length; i++) { // Iterate over the results
                var item = store[results[i].ref];
                
                if (item.content.indexOf(item.title + item.title) != -1) {
                    item.content = item.content.substring(item.title.length, 150 + item.title.length)
                } else {
                    item.content = item.content.substring(0, 150)
                }
                
                appendString += '<li><a class="search-result-link" href="' + item.url + '"><h3>' + item.title + '</h3></a>';
                appendString += '<p>' + item.content + '...</p></li>';
            }

            searchResults.innerHTML = appendString;
        }
        else {
            if (language == "en") {
                searchResults.innerHTML = '<br><li>No results found</li>';
            } else {
                searchResults.innerHTML = '<br><li>結果が見つかりません</li>';
            }
        }
    }

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] === variable) {
                return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
            }
        }
    }
    var searchTerm = getQueryVariable('query');
    if (searchTerm) {
        document.getElementById('search-box').setAttribute("value", searchTerm);
        
        var elasticlunr = require('./lib/elasticlunr.js');
        require('./lunr.stemmer.support.js')(elasticlunr);
        require('./lunr.jp.js')(elasticlunr);
        require('./lunr.multi.js')(elasticlunr);
        
        var idx = elasticlunr(function () {
            this.use(elasticlunr.multiLanguage('en', 'jp'));
            this.addField('title');
            this.addField('content');
        });
        for (var key in window.store) { // Add the data to elasticlunr
            idx.addDoc({
                "id": key,
                "title": window.store[key].title,
                "content": window.store[key].content
            });
            
            var results = idx.search(searchTerm, {
                bool: "OR",
                expand: true
            }); // Get elasticlunr to perform a search
            
            displaySearchResults(results, window.store, language);
        }
    }
})();