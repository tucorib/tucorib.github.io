// --- Initial values
var minxmax = 3; // Start x bounds
var	minymax = 3; // Start y bounds
var xmax = minxmax; // x bounds
var	ymax = minymax; // y bounds

Tool.register('game.hit', function(){
	Tool.fire('hud.combos.reset');
	$('#arena').effect("shake");
});
Tool.register('game.over', function(){
	$('#modal-gameover .score').text(Tool.Hud.score);
});

Tool.register('game.new', function(){
	// Reset values
	xmax = minxmax;
	ymax = minymax;
	Tool.fire('hud.reset');
	// New run
	Tool.fire('game.newrun');
});

//Button click action
var clickHandler = function(win){
	// If click on solution
	if(win){
		Tool.fire('hud.combos.inc');
		Tool.fire('hud.score.add', Math.floor(Tool.Hud.combos*xmax*ymax*Tool.Hud.lives/Tool.Hud.defaults.lives));
		xmax +=1; // Increase x bounds
		ymax +=1; // Increase y bounds
		// Open greetings popup
		Tool.fire('run.success');
	}
	// Else
	else{
		Tool.fire('hud.lives.dec');
		Tool.fire('hud.combos.reset');
	}
};

Tool.register('game.newrun', function(){
	// Remove old buttons
	var arena = $('#arena');
	arena.empty();
	
	// Compute blue button coordinates
	var xa = Math.floor(Math.random() * xmax);
	var ya = Math.floor(Math.random() * ymax);
	
	// Compute red button coordinates
	var xb = 0;
	var yb = 0;
	do{
		xb = Math.floor(Math.random() * xmax);
		yb = Math.floor(Math.random() * ymax);
	} while(
		(xa==xb && ya==yb) ||
		(Math.abs(xa-xb)==xmax-1 && Math.abs(ya-yb)==ymax-1)
	)
	
	// Compute green button coordinates
	var xc = 0;
	var yc = 0;
	do{
		xc = Math.max(0, xa - xb) + Math.floor(Math.random() * (xmax - Math.abs(xb - xa)));
		
		yc = Math.max(0, ya - yb) + Math.floor(Math.random() * (ymax - Math.abs(yb - ya)));
	} while(
		(xa == xc && ya == yc) ||
		(xb == xc && yb == yc)
	)
	
	// Compute answer button coordinates
	var xd = xc + xb - xa;
	var yd = yc + yb - ya;
	
	// Create buttons
	for(var y=0; y<ymax; y++){
		// Add row container
		var row = $('<div>', { class: 'd-flex flex-row w-100 justify-content-center' });
		
		for(var x=0; x<xmax; x++){
		// Create button
			var button = $('<div>', {
				// UI style
				class: function(){
					var c = 'btn box rounded m-1';
					if(x == xa && y == ya){
						return c + ' btn-secondary border border-dark';
					}
					else if(x == xb && y == yb){
						return c + ' btn-success border border-dark';
					}
					else if(x == xc && y == yc){
						return c + ' btn-primary border border-dark';
					}
					else{
						return c + ' btn-dark border border-dark';
					}
				},
				 // Empty content
				html: '&nbsp;'
			})
			.attr('data-x', x)
			.attr('data-y', y)
			.css('width', 100/xmax + '%')
			// Link click action to button
			.click(function(){
				clickHandler($(this).data('x') == xd && $(this).data('y') == yd);
			});
			// Add button to row
			$(row).append(button);
		}
		// Add row to grid
		$(arena).append(row);
	}
});

// When page is ready
$(document).ready(function(){
	// Start new game
	Tool.fire('game.new');
});
