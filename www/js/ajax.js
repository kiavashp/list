function ajax (method, url, callback, data){
	if(typeof callback !== 'function') throw Error('callback is not a function');
	
	var req = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"),
        data = typeof data !== 'string' ? JSON.stringify(data)||'' : data||'';
	
	req.onreadystatechange = function(){
		if(req.readyState === 4) callback(req.status, req.responseText, req);
	};
	
	req.open(method || 'GET', url, true);
	req.send(data || '');
};

function ajaxoverkill (method, url, callback, data){
	if(typeof callback !== 'function') throw Error('callback is not a function');
	
	var req = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"),
        data = typeof data !== 'string' ? JSON.stringify(data)||'' : data||'';
	
	req.open(method || 'GET', url, true);
	req.onabort = function (){ console.log('req.onabort', arguments) }
	req.onerror = function (){ console.log('req.onerror', arguments) }
	req.onload = function (){ console.log('req.onload', arguments) }
	req.onloadstart = function (){ console.log('req.onloadstart', arguments) }
	req.onprogess = function (){ console.log('req.onprogress', arguments) }
	req.onreadystatechange = function(){
		console.log('req.readyState', req.readyState);
		if(req.readyState === 4) callback(req.status, req.responseText, req);
	};
	req.ontimeout = function (){ console.log('req.ontimeout', arguments) }
	
	req.send(data || '');
};
