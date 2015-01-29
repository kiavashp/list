function parentHasClass (e, c){
	var root = document, node = e;
	do if(node.classList.contains(c)) return true;
	while((node = node.parentNode) && node.classList)
}

var scrolling = false,
	start_scroll = 0,
	has_scrolled = false;

(function touch_events (w, t, f){
	var m, ma = { touchstart:'mousedown', touchmove:'mousemove',
			touchend:'mouseup', touchcancel:'mouseup'};
	function touch (e){
	//	console.log(e.type);
	//	console.log(e.changedTouches);
		if(e.type === 'touchstart') has_scrolled = false;
		if(!ma[e.type]
			|| e.target.nodeName === 'INPUT'
			|| ( parentHasClass(e.target, 'touchscroll')
				&& (e.type === 'touchstart' || e.type === 'touchmove')
			)) return;
		var c = e.changedTouches[0], s = document.createEvent("MouseEvent"),
			bb = c.target.getBoundingClientRect();
		s.initMouseEvent(ma[e.type], t, t, w, 1, c.screenX, c.screenY,
			c.clientX, c.clientY, f, f, f, f, 0, null);
		e.preventDefault(); c.target.dispatchEvent(s);
		if(e.type === 'touchend' || e.type === 'touchcancel'){
			
			if(has_scrolled)
				return console.log('stopping because has_scrolled:'+ has_scrolled);
			
			if(bb.left <= c.clientX
				&& bb.top <= c.clientY
				&& bb.right >= c.clientX
				&& bb.bottom >= c.clientY
			){
				s = document.createEvent("MouseEvent");
				s.initMouseEvent('click', t, t, w, 1, c.screenX, c.screenY,
					c.clientX, c.clientY, f, f, f, f, 0, null);
				c.target.dispatchEvent(s);
			}
		}
	}
	for(m in ma) w.addEventListener(m, touch, true);
}(window, !0, !1));

addEventListener('DOMContentLoaded', function (){
	var e, ts = document.querySelectorAll('.touchscroll');
	function touchscroll (e){
		var l = this, top = l.scrollTop,
			height = l.scrollHeight, scroll = l.offsetHeight;
		if(e.type === 'touchmove'){
			if(height > scroll){
				if(Math.abs( start_scroll - top ) > 10) has_scrolled = true;
				scrolling = true;
				return e.stopPropagation();
			}else return e.preventDefault();
		}
	//	if(height <= scroll) return;
		if(top < 2) l.scrollTop = 1;
		if(top+scroll === height) l.scrollTop = top-1;
	}
	for(e=0;e<ts.length;e++){
		ts[e].addEventListener('touchstart', touchscroll, true);
		ts[e].addEventListener('touchmove', touchscroll, true);
	}
});
