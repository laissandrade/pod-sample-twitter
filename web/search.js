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

	var query = document.getElementById('search-form').elements['query'].value;

	if(query) {

		// default search
		search.query = {
			'*': {
				operator: 'match',
				value: {
					query: query
				}
			}
		};

		// phrase search
		// search.query = {
		// 	'*': {
		// 		operator: 'match',
		// 		value: {
		// 			query: query,
		// 			type: 'phrase'
		// 		}
		// 	}
		// };

		// fuzzy search
		// search.query = {
		// 	'*': {
		// 		operator: 'fuzzy',
		// 		value: {
		// 			query: query
		// 		}
		// 	}
		// };
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
					plot(map, doc, queryResult.metadata[doc.id].highlights);
				});
			}

			document.getElementById('json-canvas').innerHTML = JSON.stringify(queryResult, null, 2);
		});

}

function initialize() {
    document.getElementById('search-form').onsubmit = function(e) {
        e.preventDefault();
        reloadTweets(map);
        return false;
    }
}

window.onload = initialize;