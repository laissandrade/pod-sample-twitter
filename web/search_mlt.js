
function reloadTweets(map) {

    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var search = {
        pre_filter: {
            location: {
                operator: 'gp',
                value: [
                    [sw.lng(), ne.lat()], // upper left
                    [ne.lng(), sw.lat()]  // lower down
                ]
            }
        },
        highlight: {
            text:{},
            fullname: {}
        }
    };

    var example = document.getElementById('search-form').elements.query.value;

    if(example) {
        search.query = {
            text: {
                operator: 'mlt',
                value: {
                    query: example
                }
            }
        };
    }

    LaunchpadClient
        .url('http://localhost:8080/search/tweet_geo')
        .query('search', JSON.stringify(search))
        .query('limit', 1000)
        .get()
        .then(function(clientResponse) {
            clearPlot();

            var queryResult = clientResponse.body();
            if (queryResult.documents) {
                queryResult.documents.forEach(function(doc) {
                    plot(map, doc, queryResult.metadata[doc.id].highlights, resetExample);
                });
            }

            document.getElementById('json-canvas').innerHTML = JSON.stringify(queryResult, null, 2);
        });

}

function resetExample(map, text) {
    document.getElementById('search-form').elements.query.value = text;
    reloadTweets(map);
}

function initialize() {
    document.getElementById('search-form').elements.query.disabled = true;
    document.getElementById('search-form').onsubmit = function(e) {
        e.preventDefault();
        reloadTweets(map);
        return false;
    };

    google.maps.event.addListener(map, 'rightclick', function() {
        resetExample(map, null);
    });
}

window.onload = initialize;