// --- Initial values
var minxmax = 3; // Start x bounds
var	minymax = 3; // Start y bounds
var xmax = minxmax; // x bounds
var	ymax = minymax; // y bounds
var maxlives = 3; // Start max lives
var score = 0; // Score
var combos = 0; // Combos
var lives = maxlives; // Lives

// Launch new game
var newGame = function(){
	// Reset values
	score = 0;
	combos = 0;
	xmax = minxmax;
	ymax = minymax;
	lives = maxlives;
	// Update UI
	$('.score').text(score);
	$('.combos').text(combos);
	$('.life').show();
	// New run
	newRun();
};

// Launch new run
var newRun = function(){
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
	
	// Button click action
	var clickHandler = function(x,y){
		// If click on solution
		if(x == xd && y == yd){
			combos += 1; // Increase combos counter
			score += Math.floor(combos*xmax*ymax*lives/maxlives); // Increase score
			xmax +=1; // Increase x bounds
			ymax +=1; // Increase y bounds
			// Update UI
			$('.score').text(score);
			$('.combos').text(combos);
			// Open greetings popup
			$('#modal-right').modal('show');
		}
		// Else
		else{
			lives -= 1; // Remove life
			combos = 0;// Reinitialize combos
			// Update UI						
			$('.life[data-life='+lives+']').toggle( "explode" );
			$('.combos').text(combos);
			// If no more life
			if(lives == 0){
				$('#modal-wrong').modal('show'); // Open game over popup
			}
			else{
				$(arena).effect( "shake" ); // Shake buttons
			}
		}
	};
	
	// Create buttons
	for(var y=0; y<ymax; y++){
		// Add row container
		var row = $('<div>', { class: 'd-flex flex-row w-100 justify-content-center' });
		
		for(var x=0; x<xmax; x++){
		// Create button
			var button = $('<div>', {
				// UI style
				class: function(){
					var c = 'm-1 box rounded';
					if(x == xa && y == ya){
						return c + ' btn-primary'; // blue
					}
					else if(x == xb && y == yb){
						return c + ' btn-danger'; // red
					}
					else if(x == xc && y == yc){
						return c + ' btn-success'; // green
					}
					else{
						return c + ' btn-dark'; // gray
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
				clickHandler($(this).data('x'),$(this).data('y'));
			});
			// Add button to row
			$(row).append(button);
		}
		// Add row to grid
		$(arena).append(row);
	}
};
// When page is ready
$(document).ready(function(){
	// Create lives images
	for(var i=0; i<maxlives; i++){
		$('<img>', {
			src: '/assets/img/pixel-heart.png',
			class: 'life',
			width: '40px',
			height: '40px'
		})
		.attr('data-life', maxlives-i)
		.appendTo($('#lives'));
	}
	// Start new game
	newGame();
});

// Easter egg :)
console.log(
`        .-"-.
      .'=^=^='.
     /=^=^=^=^=\\
    :^= HAPPY =^;
    |^ EASTER! ^|
    :^=^=^=^=^=^:
     \=^=^=^=^=/
      \`.=^=^=.'
\`~~~\`
`);