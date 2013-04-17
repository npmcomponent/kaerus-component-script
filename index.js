// Script ////////////////////////////////////////////////////////////////////////////
// Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>. 
var Promise = require('promise'),
    Event = require('event'),
    Ajax = require('ajax');

var cached = {}, global = window; 
 
function Script(file,options) {
    var loaded = cached[file], stamp = '';

    options = options ? options : {};
    
    if(!isNaN(options)) options = {timeout:options};
    if(options.cache === undefined) options.cache = true;
    if(options.cache && loaded) return loaded;    
    if(options.timeout === undefined) options.timeout = 5000;
    if(options.stamp === undefined||options.stamp === true) options.stamp = '?' + Date.now();
    else if(options.stamp === false) options.stamp = '';
    if(options.async === undefined) options.async = true;
    if(options.defer === undefined) options.defer = true;


    function onloaded(event) {
        event = Event.normalize(event);
        loaded.fulfill(event);
    }

    function onerror(event) {
        event = Event.normalize(event);
        loaded.reject(event);
    }

    if(options.ajax){
        loaded = Ajax.get(file+options.stamp,{timeout:options.timeout});

        loaded.then(function(code){
            global.eval(code);
        });
    }
    else {
        loaded = new Promise();

        loaded.timeout(options.timeout);

        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");

        script.src = file + options.stamp;
        script.async = options.async;
        script.defer = options.defer;

        if(script.readyState) {
            script.onreadystatechange = function(event) {
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
    }

    if(options.cache) cached[file] = loaded;

    return loaded;
}

module.exports = Script;