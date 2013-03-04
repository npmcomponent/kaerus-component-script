var Promise = require('promise'),
    Event = require('event');

var cached = {}; 
 // Script ////////////////////////////////////////////////////////////////////////////

function Script(file,timeout) {
    var loaded = cached[file];

    if(loaded) return loaded;

    loaded = cached[file] = new Promise();

    if(timeout) loaded.timeout(timeout);

    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");

    /* add timestamp to bypass cache */
    script.src = file+'?'+Date.now();
    script.async = true;
    script.defer = true;

    function onloaded(event) {
        loaded.attach(file).fulfill(Event.normalize(event));
    }

    function onerror(event) {
        loaded.attach(file).reject(Event.normalize(event));
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