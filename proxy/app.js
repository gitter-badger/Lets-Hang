var http = require('http');
var fs = require('fs');
var httpProxy = require('http-proxy');

var devURLS = {
	main: 'http://127.0.0.1:8080',
	calendar: 'http://127.0.0.1:8000'
}

var proxy = httpProxy.createProxyServer({
	xfwd: true,
	prependPath: true,
	changeOrigin: true
});

var server = http.createServer(function(req, res){
	if(req.url=='/calendar'){
		proxy.web(req, res, {target: devURLS.calendar});
		return;
	}
	proxy.web(req, res, {target: devURLS.main});
});
