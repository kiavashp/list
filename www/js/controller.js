function setUrl (path, title){
	if('history' in window && typeof history.pushState === 'function'){
		history.replaceState({}, title||'', path);
	}
}
document.url = setUrl;

function _ (id){ return window[id] || document.getElementById(id) }

var api = {
	ls: {
		lists: function (callback){
			ajax('GET', location.origin +'/api/lists', function (status, data, res){
				if(!status || !data.length){
					console.log(arguments);
				}else data = JSON.parse(data);
				!status ? callback({status_code:status}, null) : callback(null, data);
			});
		},
		list: function (id, callback){
			ajax('GET', location.origin +'/api/list/'+ id, function (status, data, res){
				if(!status || !data.length){
					console.log(arguments);
				}else data = JSON.parse(data);
				!status ? callback({status_code:status}, null) : callback(null, data);
			});
		},
		items: function (callback){
			ajax('GET', location.origin +'/api/items', function (status, data, res){
				if(!status || !data.length){
					console.log(arguments);
				}else data = JSON.parse(data);
				!status ? callback({status_code:status}, null) : callback(null, data);
			});
		}
	},
	ad: {
		list: function (list, callback){
			ajax('POST', location.origin +'/api/add/list/', function (status, data, res){
				if(!status || !data.length){
					console.log(arguments);
				}else try{ data = JSON.parse(data) }catch(e){ status = 1 }
				!status ? callback({status_code:status}, null) : callback(null, data);
			}, { name: list });
		},
		list_item: function (listid, item, callback){
			ajax('POST', location.origin +'/api/add/list_item/', function (status, data, res){
				if(!status || !data.length){
					console.log(arguments);
				}else try{ data = JSON.parse(data) }catch(e){ status = 1 }
				!status ? callback({status_code:status}, null) : callback(null, data);
			}, { listid: listid, name: item });
		},
		item: function (item, callback){
			ajax('POST', location.origin +'/api/add/item/', function (status, data, res){
				if(!status || !data.length){
					console.log(arguments);
				}else try{ data = JSON.parse(data) }catch(e){ status = 1 }
				!status ? callback({status_code:status}, null) : callback(null, data);
			}, { name: item });
		}
	}
}

var render = {
	screen_list: function (list){
		var i, html = '';
		for(i=0;i<list.items.length;i++)
			html += '<div class="screen-main-item" '+
				'data-item-inv="'+ list.items[i].inventory +'"'+
				'data-item-par="'+ list.items[i].par +'"'+
				'>'+ list.items[i].name +'</div>';
		return html;
	},
	screen_lists: function (lists){
		var l, lists_html = '';
		for(l=0;l<lists.length;l++)
			lists_html += '<div class="screen-main-item" '+
				'onclick="nav.list(\''+ lists[l]._id +'\')"'+
				'data-list-items="'+ lists[l].items.length +'"'+
				'>'+ lists[l].name +'</div>';
		return lists_html;
	},
	screen_items: function (items){
		var i, html = '';
		for(i=0;i<items.length;i++)
			html += '<div class="screen-main-item" '+
				'data-item-inv="'+ items[i].inventory +'"'+
				'data-item-par="'+ items[i].par +'"'+
				'>'+ items[i].name +'</div>';
		return html;
	},
	nav_lists: function (lists){
		var l, lists_html = '';
		for(l=0;l<lists.length;l++)
			lists_html += '<div class="sidebar-content-item" '+
				'onclick="nav.list(\''+ lists[l]._id +'\')"'+
				'>'+ lists[l].name +'</div>';
		return lists_html;
	}
}

var nav = {
	last_refresh: 0,
	page: { },
	open: function (){
	//	console.log('nav.open()');
		if(Date.now() - nav.last_refresh > 5e3)
			api.ls.lists(function (e, lists){
				if(e) return console.log('api.ls.lists.error:', e);
				nav.last_refresh = Date.now();
				window['api-lists'].innerHTML = render.nav_lists(lists);
			});
		window['menu-sidebar'].classList.add('show');
		window['sidebar-overlay'].classList.add('show');
	},
	close: function (){
	//	console.log('nav.close()');
		window['menu-sidebar'].classList.remove('show');
		window['sidebar-overlay'].classList.remove('show');
	},
	lists: function (){
		nav.close();
	//	console.log('nav.lists()');
		document.title = 'Lists | Shopping';
	//	document.url('/lists', 'Lists | Shopping');
		window['add-button'].setAttribute('data-add-action', 'list');
		window['screen-title'].innerText = 'Lists';
		api.ls.lists(function (e, lists){
			if(e) return console.log('api.ls.lists.error:', e);
			window['screen-main'].innerHTML = render.screen_lists(lists);
		});
	},
	list: function (id){
		nav.close();
	//	console.log('nav.list('+ id +')');
		api.ls.list(id, function (e, list){
			if(e) return console.log('api.list.error:', e);
			nav.page = { listid: id };
			document.title = list.name +' | Shopping';
		//	document.url('/lists/'+ list.name, list.name +' | Shopping');
			window['add-button'].setAttribute('data-add-action', 'list_item');
			window['screen-title'].innerText = list.name;
			window['screen-main'].innerHTML = render.screen_list(list);
		});
	},
	items: function (){
		nav.close();
	//	console.log('nav.items()');
		document.title = 'Inventory | Shopping';
	//	document.url('/inventory', 'Inventory | Shopping');
		window['add-button'].setAttribute('data-add-action', 'item');
		window['screen-title'].innerText = 'Inventory';
		api.ls.items(function (e, items){
			if(e) return console.log('api.items.error:', e);
			window['screen-main'].innerHTML = render.screen_items(items);
		});
	},
	settings: function (){
		nav.close();
		console.log('nav.settings()');
	},
	logout: function (){
		nav.close();
		window.location = location.origin +'/logout.html';
	}
}

var pop = {
	open: function (which){
	//	console.log('pop.open()');
		if(!which in pop) return false;
		pop[which]();
		_('input-popup').classList.add('show');
		_('input-popup-field').focus();
		_('popup-overlay').classList.add('show');
	},
	close: function (){
	//	console.log('pop.close()');
		document.activeElement.blur();
		_('input-popup').classList.remove('show');
		_('popup-overlay').classList.remove('show');
	},
	list: function (){
	//	console.log('pop.list()');
		_('input-popup-title').innerText = 'New List';
		var iter = 0;
		pop.action = function a (){
			var val = _('input-popup-field').value.trim();
			if(!val) return;
			api.ad.list(val, function (e, data){
				if(e && ++iter < 5) return a();
				nav.lists();
				_('input-popup-field').value = '';
			});
		}
	},
	list_item: function (){
	//	console.log('pop.item()');
		_('input-popup-title').innerText = 'New Item';
		var iter = 0;
		pop.action = function a (){
			var val = _('input-popup-field').value.trim();
			if(!val) return;
			api.ad.list_item(nav.page.listid, val, function (e, data){
				if(e && ++iter < 5) return a();
				nav.list(nav.page.listid);
				_('input-popup-field').value = '';
			});
		}
	},
	item: function (){
	//	console.log('pop.item()');
		_('input-popup-title').innerText = 'New Item';
		var iter = 0;
		pop.action = function a (){
			var val = _('input-popup-field').value.trim();
			if(!val) return;
			api.ad.item(val, function (e, data){
				if(e && ++iter < 5) return a();
				nav.items();
				_('input-popup-field').value = '';
			});
		}
	},
	action: function (){},
	act: function (){
		if(typeof pop.action === 'function') pop.action();
		pop.close();
	}
}

addEventListener('DOMContentLoaded', nav.lists)