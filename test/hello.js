var uid = Math.floor(Math.random(999)*1000+1);
var timestamp = new Date();

console.log("OK timestamp: %s uid:",timestamp,uid);

exports = {timestamp:timestamp,uid:uid};