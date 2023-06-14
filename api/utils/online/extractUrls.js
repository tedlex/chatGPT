function extractUrls(str) {
    var pattern = new RegExp('((https?:\\/\\/)([a-z\\d.-]+)\\.([a-z]{2,})(:[0-9]+)?([\\/\\w.-]*)*\\/?((\\?)\\w+=[\\w\\+%-]+(&\\w+=[\\w\\+%-]+)*)?)', 'gi');
    var matches = str.match(pattern);
    if (matches) {
        return matches
    } else {
        return []
    }
}

module.exports = extractUrls;