var http = require('http'),
	url = require('url'),
	path = require('path'),
	qs = require('querystring'),
	cookie = require('cookie'),
	fs = require('fs'),
	c = require('controller'),
	content_type = require('content_type'),
	webroot = path.join(__dirname, '/www'),
	serv, port = 8000;

serv = http.createServer(function (req, res){
	
//	console.log(req.method, req.connection.remoteAddress, req.url);
	
	req.uri = url.parse(req.url, true);
	req.redirect = function (path){
		res.statusCode = 302;
		res.setHeader('Location', path);
		res.end();
	}
	var body = '';
	req.on('data', function (d){
		body += d.toString('utf8');
	});
	req.on('end', function (){
		try{ body = JSON.parse(body) }catch(e){
			try{ body = qs.parse(body) }catch(e){}
		}
		req.body = body;
		
		if(req.uri.pathname === '/logout.html'){
			console.log(req.method, req.connection.remoteAddress, req.url);
			return c.logout(req, res, function (){
				req.redirect('/login.html');
			});
		}
		
		c.auth(req, res, function (e, auth){
			
			if(e){
				console.log(req.method, req.connection.remoteAddress, req.url);
				return req.redirect('/500.html');
			}
			
			console.log(req.method, req.connection.remoteAddress, 'auth='+ (auth||{name:false}).name, req.url);
			
			if(auth && req.uri.pathname.slice(0,4) === '/api'){
				c.api(req, res, function (e, data){
					res.setHeader('Content-Type': 'application/json');
					if(e){
						res.statusCode = 500;
						res.end('{"err":500}');
						return;
					}
					if(typeof data !== 'string') data = JSON.stringify(data || {});
					res.statusCode = 200;
					res.setHeader('Content-Length', Buffer.byteLength(data));
					res.setHeader('Cache-Control', 'no-cache');
					res.setHeader('Pragma', 'no-cache');
					res.end(data);
				});
				return;
			}
			
			if(req.method === 'POST') return req.redirect(req.url);
			
			if(!auth && req.uri.pathname !== '/login.html' && req.uri.pathname.indexOf('.html') !== -1) return req.redirect('/login.html');
			
			if(auth && req.uri.pathname === '/login.html') return req.redirect('/index.html');
			
			var filepath = path.join(webroot, req.uri.pathname);
			
			fs.exists(filepath, function (exists){
				if(!exists) return req.redirect('/404.html');
				
				var stat = fs.statSync(filepath),
					filetype = content_type(filepath),
					encoding = ~filetype.indexOf('image') ? 'binary' : 'utf8';;
				
				if(stat.isDirectory()) return req.redirect(path.join(req.uri.pathname, '/index.html'));
				
				fs.readFile(filepath, encoding, function file_callback (e, data){
					if(e) return req.redirect('/500.html');
					res.statusCode = 200;
					res.setHeader('Content-Type', content_type(filepath));
					res.setHeader('Content-Length', stat.size);
					res.write(data, encoding);
					return res.end();
				});
			});	
		});
	});
});

serv.listen(port);

console.log('server running on port:', port);
