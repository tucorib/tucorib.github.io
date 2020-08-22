// Session
var session = null;
// Step
var step = null;
// Selected door
var selectedDoor = null;
// Correct door
var correctDoor = null;
// Wrong door
var wrongDoor = null;
// Simulation index
var simulationIndex = 0;

// Auto-simulation
var autoRun = false;
// Auto-simulation spped
var autoSimulationSpeed = 0;
// Auto-simulation run count
var autoSimulationNb = 1000;
// Auto realtime display
var autoDisplay = true;

// Charts
var keepChart = null;
var changeChart = null;

var decimalPlaces = 6;

function displayResults(callback){
	var promiseTables = new Promise (function (callback) {
		if(!autoRun || autoDisplay || simulationIndex == 0 || simulationIndex == 2*autoSimulationNb){
		    $('#keep-won').text(session.keep.won);
			$('#keep-nb').text(session.keep.nb);
			$('#keep-freq').text(session.keep.freq ? session.keep.freq.toPrecision(decimalPlaces) : '-');				
			$('#change-won').text(session.change.won);
			$('#change-nb').text(session.change.nb);
			$('#change-freq').text(session.change.freq ? session.change.freq.toPrecision(decimalPlaces) : '-');
		}
		
	   callback();
	});
	var promiseCharts = new Promise(function(callback) {
		if(simulationIndex == 0 || simulationIndex == 2*autoSimulationNb){
			keepChart.redraw({
				complete: function(){
					changeChart.redraw({
						complete: function(){
							callback();
						}
					});
				}
			});
		}
		else
			callback();
	});
	var promiseProgress = new Promise(function(callback) {
		if(autoRun && autoDisplay || simulationIndex == 0 || simulationIndex == 2*autoSimulationNb){
			$('#auto-progress')
			.attr('aria-valuenow', simulationIndex)
			.css("width", (100*simulationIndex / (2*autoSimulationNb)) + '%')
			.text(Math.round((100*simulationIndex / (2*autoSimulationNb))) + '%');
		}
		
		if(autoDisplay || simulationIndex == 0 || simulationIndex == 2*autoSimulationNb){
			$('#auto-progress').show();
			$('#auto-progress-working').hide();
		}
		else{
			$('#auto-progress').hide();
			$('#auto-progress-working').show();
		}
		
		callback();
	});
	
	promiseTables
	.then(promiseProgress)
	.then(promiseCharts)
	.then(function(){
		callback();
	});
}

function startSession(){
	// Init session
	session = {
		keep: {
			won: 0,
			nb: 0,
			freq: null
		},
		change: {
			won: 0,
			nb: 0,
			freq: null
		},
	};
	simulationIndex = 0;
	keepChart.series[0].setData([]);
	changeChart.series[0].setData([]);
	displayResults(function(){
		startRun();
	});
	startRun();
}

function startRun(){
	// Init step
	step = 0;
	// Init correct door
	correctDoor = Math.ceil(Math.random() * 3);
	wrongDoor = null;
	
	// Update UI
	if(!autoRun){
		// Update rules
		$('#rules').carousel(0);
		// Activate buttons
		$('#btn-door-1').attr('disabled', false).removeClass('btn-info btn-danger btn-success').addClass('btn-secondary');
		$('#btn-door-2').attr('disabled', false).removeClass('btn-info btn-danger btn-success').addClass('btn-secondary');
		$('#btn-door-3').attr('disabled', false).removeClass('btn-info btn-danger btn-success').addClass('btn-secondary');
		// Reset doors
		$('#img-door-1').attr('src', '/assets/tool/img/door-closed.png');
		$('#img-door-2').attr('src', '/assets/tool/img/door-closed.png');
		$('#img-door-3').attr('src', '/assets/tool/img/door-closed.png');
	}
	
	if(autoRun){
		var choice = Math.ceil(Math.random() * 3);
		handleStep0Choice(Math.ceil(Math.random() * 3));
	}
}

function selectDoor(doorIndex){
	if(step == 0){
		handleStep0Choice(doorIndex);
	}
	else if(step == 1){
		handleStep1Choice(doorIndex);
	}
}

function handleStep0Choice(doorIndex){
	// Select door
	selectedDoor = doorIndex;
	
	// Mark wrong door
	var otherDoors = [1,2,3].filter(door => door != doorIndex && door != correctDoor);
	wrongDoor = otherDoors[Math.floor(Math.random() * otherDoors.length)];
	
	// Update UI
	if(!autoRun){
		$('#btn-door-' + selectedDoor)
		.removeClass('btn-secondary')
		.addClass('btn-info');
		
		$('#btn-door-' + wrongDoor)
		.attr('disabled', true)
		.removeClass('btn-secondary')
		.addClass('btn-danger');
		
		// Open wrong door
		$('#img-door-' + wrongDoor).attr('src', '/assets/tool/img/door-opened-goat.png');
		
		// Get alternate door
		var altDoor = [1,2,3].filter(door => door != selectedDoor && door != wrongDoor);
	
		// Update rules
		$('.step-1-selected-door').text(selectedDoor);
		$('.step-1-wrong-door').text(wrongDoor);
		$('.step-1-alt-door').text(altDoor);
		$('#rules').carousel('next');
	}
	
	// Next step
	step = 1;
	
	if(autoRun){
		var choice = null;
		if(simulationIndex % 2 == 0){
			choice = selectedDoor;
		}
		else{
			choice = [1,2,3].filter(door => door != selectedDoor && door != wrongDoor)[0];
		}
		handleStep1Choice(choice);
	}
};

function handleStep1Choice(doorIndex){
	var autoChartDisplay = !autoRun || autoDisplay;
	
	// Update session & rules
	if(doorIndex == selectedDoor){
		session.keep.nb += 1;
		if(doorIndex == correctDoor){
			session.keep.won += 1;
		}
		session.keep.freq = session.keep.won / session.keep.nb;
		keepChart.series[0].addPoint([session.keep.nb, session.keep.freq], autoChartDisplay, false, false);
	}
	else{
		session.change.nb += 1;
		if(doorIndex == correctDoor){
			session.change.won += 1;
		}
		session.change.freq = session.change.won / session.change.nb;
		changeChart.series[0].addPoint([session.change.nb, session.change.freq], autoChartDisplay, false, false);
	}
	
	// Update UI
	if(!autoRun){
		$('#btn-door-' + selectedDoor)
		.removeClass('btn-info');
		
		if(doorIndex == correctDoor)
			$('#btn-door-' + doorIndex)
			.removeClass('btn-secondary')
			.addClass('btn-success');
		else{
			$('#btn-door-' + doorIndex)
			.removeClass('btn-secondary')
			.addClass('btn-info');
			$('#btn-door-' + correctDoor)
			.removeClass('btn-secondary')
			.addClass('btn-success');
		}
		$('#btn-door-1').attr('disabled', true);
		$('#btn-door-2').attr('disabled', true);
		$('#btn-door-3').attr('disabled', true);
		
		if(doorIndex == correctDoor){
			$('#step-2-label').text('Vous avez gagné!');
		}
		else{
			$('#step-2-label').text('Vous avez perdu...');
		}
		
		$('#rules').carousel('next');
		
		// Show doors
		$('#img-door-' + correctDoor).attr('src', '/assets/tool/img/door-opened-car.png');
		if(doorIndex != correctDoor)
			$('#img-door-' + selectedDoor).attr('src', '/assets/tool/img/door-opened-goat.png');
	}
	
	simulationIndex += 1;
	displayResults(function(){
		if(autoRun){
			if(simulationIndex < 2*autoSimulationNb){
				setTimeout(function(){
					startRun();
				}, autoSimulationSpeed);
			}
			else{
				$('#btn-auto').trigger('click');
				$('#auto-progress').removeClass('progress-bar-striped progress-bar-animated');
			}
		}
	});
};

$(document).ready(function(){
	// Init sliders
	$("#auto-count")
	.on('input', function(slideEvt) {
		var value = parseInt($(slideEvt.target).val());
		autoSimulationNb = value;
		$("#auto-count-value").text(value);
		$('#auto-progress').attr('aria-valuemax', 2*value);
	})
	.val(autoSimulationNb)
	.trigger('input');
	// Init toggle auto run
	$('#btn-auto').click(function(event){
		autoRun = !autoRun;
		if(autoRun){
			$(this).removeClass('btn-success').addClass('btn-danger').text('Stop');
			$('#auto-progress').addClass('progress-bar-striped progress-bar-animated');
			startSession();
		}
		else{
			$(this).removeClass('btn-danger').addClass('btn-primary').text('Lancer');
			$('#auto-progress').removeClass('progress-bar-striped progress-bar-animated');
		}
	});
	// Init realtime display
	$('#auto-display').click(function(event){
		autoDisplay = !autoDisplay;
		if(autoDisplay){
			$('#auto-progress').show();
			$('#auto-progress-working').hide();
		}
		else if(autoRun){
			$('#auto-progress').hide();
			$('#auto-progress-working').show();
		}
	});
	$('#auto-display').prop('checked', autoDisplay);
	
	// Init charts
	keepChart = Highcharts.chart('keep-chart', {
		chart: {
		    animation: false,
		    zoomType: 'x'
		},
		plotOptions: {
		    series: {
				animation: false
	    	}
	  	},
	    title: null,
        xAxis: {
        	title: {
        		text: "Nombre d'essais"
        	},
        	type: 'linear'
        },
        yAxis: {
        	title: {
        		text: "Fréquence"
        	},
        	type: 'linear',
        	min: 0,
        	max: 1,
        },
        legend: {
			enabled: false,
		},
        series: [{
            name: 'Fréquence',
            data: []
        }]
    });
    changeChart = Highcharts.chart('change-chart', {
		chart: {
		    animation: false,
		    zoomType: 'y'
		},
		plotOptions: {
		    series: {
				animation: false
	    	}
	  	},
	    title: null,
        xAxis: {
        	title: {
        		text: "Nombre d'essais"
        	},
        	type: 'linear'
        },
        yAxis: {
        	title: {
        		text: "Fréquence"
        	},
        	type: 'linear',
        	min: 0,
        	max: 1,
        },
        legend: {
			enabled: false,
		},
		series: [{
            name: 'Fréquence',
            data: []
        }]
    });

	startSession();
});