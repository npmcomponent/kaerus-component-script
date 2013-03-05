var Promise = require('promise'),
    Event = require('event');

var cached = {}; 
 // Script ////////////////////////////////////////////////////////////////////////////

function Script(file,options) {
    var loaded = cached[file];

    if(loaded) return loaded;

    loaded = cached[file] = new Promise();

    options = options ? options : {};
        
    if(!isNaN(options)) options = {timeout:options};
    if(options.timeout) loaded.timeout(options.timeout);

    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");

    /* todo: include ajax loading options.ajax */

    /* timestamp src to bypass browser cache */
    script.src = file + (options.cache ? '' : '?'+Date.now());
    script.async = options.async || true;
    script.defer = options.defer || true;

    function onloaded(event) {
        event = Event.normalize(event);
        loaded.attach(event).fulfill(file);
    }

    function onerror(event) {
        event = Event.normalize(event);
        loaded.attach(event).reject(file);
    }

    if(script.readyState) {
        script.onreadystatechange = function(event) {
            /* FIXME: IE on 404 error hell */
            if(this.readyState === "loaded" || 
                this.readyState === "complete") {
                this.onreadystatechange = null;
                onloaded(event);
            } else {
                onerror(event);
            }   
        }
    } else {
        script.onload = onloaded;
        script.onerror = onerror;
    }   

    head.appendChild(script);

    return loaded;
}

module.exports = Script;