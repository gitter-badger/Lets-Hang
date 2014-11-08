var http = require('http');
var fs = require('fs');
var proxy = require('http-proxy');

http.globalAgent.maxSockets = 10240;

var servers;
if(process.argv[0]=='ENV=dev'){
	servers = [
		{host:'127.0.0.1', port:8080},
		{host:'127.0.0.1', port:5000}
	];	
}

var proxies = servers.map(function(target){
	return new proxy.createProxyServer({
		target: target,
		ws: true,
		xfwd: true
	});
});

