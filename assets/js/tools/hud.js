Tool.Hud = {
	score: $('.hud').data('score'),
	combos: $('.hud').data('combos'),
	lives: $('.hud').data('lives'),
	
	defaults: {
		score: $('.hud').data('score'),
		combos: $('.hud').data('combos'),
		lives: $('.hud').data('lives')
	},
	
	effects: {
		'game.hit': function(){
			$('.hud .lives .life:visible').toArray().filter(l => Tool.Hud.lives <= parseFloat($(l).attr('data-life'))).map(l => $(l).toggle('explode'));
		},
		'game.heal': function(){
			$('.hud .lives .life:not(:visible)').toArray().filter(l => Tool.Hud.lives > parseFloat($(l).data('life'))).map(l => $(l).toggle('explode'));
		},
		'hud.score': function(){
			$('.hud .score').text(Tool.Hud.score);
		},
		'hud.combos': function(){
			$('.hud .combos').text(Tool.Hud.combos);
		},
		'run.success': function(){
			$('#modal-greetings').modal('show');
		},
		'game.over': function(){
			$('#modal-gameover').modal('show');
		}
	}
};

// TODO bind theme

Tool.register('hud.score.add', function(score){ Tool.Hud.score += score; Tool.Hud.effects['hud.score'](); });
Tool.register('hud.score.set', function(score){ Tool.Hud.score = score; Tool.Hud.effects['hud.score'](); });
Tool.register('hud.score.reset', function(){ Tool.Hud.score = Tool.Hud.defaults.score; Tool.Hud.effects['hud.score'](); });
Tool.register('hud.combos.add', function(combos){ Tool.Hud.combos += combos; Tool.Hud.effects['hud.combos'](); });
Tool.register('hud.combos.inc', function(){ Tool.Hud.combos += 1; Tool.Hud.effects['hud.combos'](); });
Tool.register('hud.combos.set', function(combos){ Tool.Hud.combos = combos; Tool.Hud.effects['hud.combos'](); });
Tool.register('hud.combos.reset', function(){ Tool.Hud.combos = Tool.Hud.defaults.combos; Tool.Hud.effects['hud.combos'](); });
Tool.register('hud.lives.dec', function(){ Tool.Hud.lives -= 1; Tool.fire('game.hit'); if(Tool.Hud.lives == 0){ Tool.fire('game.over'); }});
Tool.register('hud.lives.reset', function(){ Tool.Hud.lives = Tool.Hud.defaults.lives; Tool.fire('game.heal'); });
Tool.register('hud.reset', function(){ 
	Tool.fire('hud.score.reset');
	Tool.fire('hud.combos.reset');
	Tool.fire('hud.lives.reset');
});
Tool.register('game.hit', function(){
	Tool.Hud.effects['game.hit']();
});
Tool.register('game.heal', function(){
	Tool.Hud.effects['game.heal']();
});
Tool.register('run.success', function(){
	Tool.Hud.effects['run.success']();
});
Tool.register('game.over', function(){
	Tool.Hud.effects['game.over']();
});