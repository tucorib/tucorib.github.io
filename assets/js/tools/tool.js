$("button.navbar-toggler").on("click", function(e){
    e.preventDefault();
    e.stopPropagation();
    $(".mobile-offcanvas").toggleClass("show");
    $('body').toggleClass("offcanvas-active");
    $(".screen-overlay").toggleClass("show");
}); 

$(".screen-overlay").click(function(e){
    $(".screen-overlay").removeClass("show");
    $(".mobile-offcanvas").removeClass("show");
    $("body").removeClass("offcanvas-active");
}); 
			
if(typeof Tool == "undefined"){
	Tool = {
		listeners: new Map(),
		
		register: function(evt, callback){
			if(!this.listeners.has(evt))
				this.listeners.set(evt, []);
			this.listeners.get(evt).push(callback);
		},
		
		fire: function(evt, args){
			$.each(this.listeners.get(evt), function(i, listener){
				listener(args);
			});
		}
	};
}
