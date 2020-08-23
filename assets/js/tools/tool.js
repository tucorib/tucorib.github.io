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
