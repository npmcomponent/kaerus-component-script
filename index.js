// Script ////////////////////////////////////////////////////////////////////////////
// Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>. 
var Promise = require('micropromise'),
    Ajax = require('ajax');

var global = window;

var cached = {};
 
function Script(file,options) {
    var loaded = cached[file], 
        source, stamp = '', 
        head, child, promise;

    options = options ? options : {};
    
    if(!isNaN(options)) options = {timeout:options};
    if(options.cache === undefined) options.cache = true;
    if(options.cache && loaded) return loaded;    
    if(options.timeout === undefined) options.timeout = 5000;
    
    // stamp to circumvent the browser cache
    if(options.stamp === undefined||options.stamp === true){
        var timestamp = Date.now();
        if(file.indexOf('?') < 0 ) options.stamp = '?' + timestamp;
        else options.stamp = '&' + timestamp;
    }    
    else if(options.stamp === false) options.stamp = '';
    
    if(options.async === undefined) options.async = true;
    if(options.defer === undefined) options.defer = true;
    if(!options.type) options.type = 'application/javascript';

    source = file + options.stamp;

    function onloaded(event) {
        loaded.timeout(null);
        loaded.fulfill(source);

        // detach script from head
        if(options.detach && head && script) 
            head.removeChild(script);
    }

    function onerror(event) {
        event = event || window.event;
        loaded.reject(event);
    }

    loaded = new Promise();

    if(options.ajax){
        loaded = Ajax.get(source, {
                timeout:options.timeout,
                accept:options.type
            },
            null,
            loaded).then(function(code){
                try {                  
                    return new Function('exports',code + ';return exports')(Object.create(null));
                } catch(error) {
                    if(console.error) console.error(source,error);
                    else console.log(source, error);
                }
            });
    }
    else {
        loaded.timeout(options.timeout);        
        head = document.getElementsByTagName("head")[0];
        script = document.createElement("script");

        script.src = source;
        script.async = options.async;
        script.defer = options.defer;

        if(script.readyState) {
            script.onreadystatechange = function(event) {
                if(this.readyState === "loaded" || 
                    this.readyState === "complete") {
                    this.onreadystatechange = null;
                    onloaded(event);
                }   
            }
        } else {
            script.onload = onloaded;
            script.onerror = onerror;
        }   

        head.appendChild(script);
    }

    if(options.cache) cached[file] = loaded;

    return loaded;
}

var SCRIPT = /<script\b(.*)[^>]*>([\s\S]*?)<\/script>/gm;

Script.parse = function(html){
    var script, scr, type;

    while ((script = SCRIPT.exec(html))) {
        if((src = script[1].match(/src=\"(.+)\"/))) {
            Script(src).done();
        } 
        else {
            type = script[1].match(/type=\"(.+)\"/);
            if(script[2] && (!type || type[1] === 'text/javascript')) {
                /* todo: consider injecting into head to get better traces */
                global.eval(script[2]);
            }
        }
    }
}

module.exports = Script;