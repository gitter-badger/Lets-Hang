var http = require('http');
var fs = require('fs');
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({
	xfwd: true,
	prependPath: true,
	changeOrigin: true
});

http.createServer(function(req, res){
	
});
