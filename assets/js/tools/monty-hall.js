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

// Doors
var doors = [1,2,3];

// Auto-simulation
var autoRun = false;
// Auto-simulation choice
var autoSimulationChoice = 'conserve';
// Auto-simulation speed
var autoSimulationSpeed = 0;
// Auto-simulation run count
var autoSimulationNb = 1000;
// Auto realtime display
var autoDisplay = true;

// Charts
var resultsChart = null;
var historyChart = null;

var decimalPlaces = 1;

function freqAsPercent(){
	return (Math.round(Math.pow(10, 2 + decimalPlaces)*session.freq) / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces) + ' %';
}

function displayResults(callback){
	var promiseTable = new Promise(function(callback) {
		$('#won').text(session.won != null ? session.won : '-');
		$('#count').text(session.nb != null ? session.nb : '-');
		$('#freq').text(session.freq != null ? session.freq.toFixed(2 + decimalPlaces) + ' (' + freqAsPercent() + ')' : '-');
		callback();
	});
	var promiseCharts = new Promise(function(callback){
		// Display results
		var autoChartDisplay = !autoRun || autoDisplay || simulationIndex == 0 || simulationIndex == autoSimulationNb;
		if(session.nb > 0)
			resultsChart.series[0].setData([{ name: 'Parties gagnées', y: session.freq  }, { name: 'Parties perdues', y: 1 - session.freq }], autoChartDisplay, false, false);
		historyChart.series[0].addPoint([session.nb, session.freq], autoChartDisplay, false, false);
		callback();
	});
	var promiseProgress = new Promise(function(callback) {
		if(autoRun && autoDisplay || simulationIndex == 0 || simulationIndex == autoSimulationNb){
			$('#auto-progress')
			.attr('aria-valuenow', simulationIndex)
			.css("width", (100*simulationIndex / autoSimulationNb) + '%')
			.text(Math.round((100*simulationIndex / autoSimulationNb)) + '%');
		}
		
		if(autoDisplay || simulationIndex == 0 || simulationIndex == autoSimulationNb){
			$('#auto-progress').show();
			$('#auto-progress-working').hide();
		}
		else{
			$('#auto-progress').hide();
			$('#auto-progress-working').show();
		}
		
		callback();
	});
	
	promiseTable
	.then(promiseCharts)
	.then(promiseProgress)
	.then(function(){
		callback();
	});
}

function startSession(){
	// Init session
	session = {
		won: 0,
		nb: 0,
		freq: null
	};
	simulationIndex = 0;
	resultsChart.series[0].setData([]);
	historyChart.series[0].setData([]);
	displayResults(function(){
		startRun();
	});
	startRun();
}

function getDoorContainer(doorIndex){
	return $('#doors .front-back').eq(doorIndex - 1);
}

function getDoorButton(doorIndex, sideClass){
	return getDoorContainer(doorIndex).find('.' + sideClass + ' button');
}

function getDoorLabel(doorIndex){
	return $('#doors span').eq(doorIndex - 1); 
}

function flipFrontBack(frontBack, frontSide){
	if(frontSide){
		$(frontBack).css('transform', 'rotateY(0deg)');
	}
	else{
		$(frontBack).css('transform', 'rotateY(-180deg)');
	}
}

function updateButton(button, colorClass, svgId){
	// Clean
	$(button).removeClass('bg-main bg-primary bg-danger bg-success');
	$(button).find('.svg').removeClass('question-mark sportive-car goat bg-main bg-primary bg-danger bg-success');
	$(button).parent().removeClass('shadow-container-main shadow-container-primary shadow-container-danger shadow-container-success');
	// Update
	$(button).addClass('bg-' + colorClass);
	$(button).find('.svg').addClass(svgId);
	$(button).parent().addClass('shadow-container-' + colorClass);
	
	if($(button).parent().hasClass('front-side')){
		$(button).find('.svg').addClass('bg-' + colorClass);
	}
	else{
		$(button).removeClass('bg-body bg-primary bg-danger bg-success').addClass('bg-' + colorClass);
		$(button).find('.svg').addClass('bg-white');
	}
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
		
		for(var index = 1; index <= 3; index++){
			var container = getDoorContainer(index);
			var frontButton = getDoorButton(index, 'front-side');
			var backButton = getDoorButton(index, 'back-side');
			
			updateButton(frontButton, 'main', 'question-mark');
			updateButton(backButton, 'main', 'question-mark');
			flipFrontBack(container, true);
		}
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
	
	// Wrong door
	var otherDoors = doors.filter(door => door != doorIndex && door != correctDoor);
	wrongDoor = otherDoors[Math.floor(Math.random() * otherDoors.length)];
	
	// Update UI
	if(!autoRun){
		// Selected door
		var selectedContainer = getDoorContainer(selectedDoor);
		var selectedButton = getDoorButton(selectedDoor, 'front-side');
		
		updateButton($(selectedButton), 'primary', 'question-mark');
		
		var wrongContainer = getDoorContainer(wrongDoor);
		var wrongButton = getDoorButton(wrongDoor, 'back-side');
		
		updateButton($(wrongButton), 'danger', 'goat');
		$(wrongButton).attr('disabled', true);
		flipFrontBack($(wrongContainer));
		
		// Alt door
		var altDoor = doors.filter(door => door != selectedDoor && door != wrongDoor);
		
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
		if(autoSimulationChoice == 'conserve'){
			choice = selectedDoor;
		}
		if(autoSimulationChoice == 'change'){
			choice = doors.filter(door => door != selectedDoor && door != wrongDoor)[0];
		}
		handleStep1Choice(choice);
	}
};

function handleStep1Choice(doorIndex){
	// Select door
	var confirmDoor = doorIndex;
	
	// Update session
	if(autoRun){
		session.nb += 1;
		if(confirmDoor == correctDoor){
			session.won += 1;
		}
		session.freq = session.won / session.nb;
	}
	
	// Update UI
	if(!autoRun){
		// Confirm button
		var confirmContainer = getDoorContainer(confirmDoor);
		var confirmButton = getDoorButton(confirmDoor, 'back-side');
		
		// Alternate door
		var altDoor = doors.filter(door => door != confirmDoor && door != wrongDoor);

		var altContainer = getDoorContainer(altDoor);
		var altButton = getDoorButton(altDoor, 'back-side');
		
		if(confirmDoor == correctDoor){
			updateButton($(confirmButton), 'success', 'sportive-car');
			updateButton($(altButton), 'danger', 'goat');
		}
		else{
			updateButton($(confirmButton), 'danger', 'goat');
			updateButton($(altButton), 'success', 'sportive-car');
		}
		flipFrontBack($(altContainer));
		flipFrontBack($(confirmContainer));
		
		if(confirmDoor == correctDoor){
			$('#step-2-label').text('Vous avez gagné !');
		}
		else{
			$('#step-2-label').text('Vous avez perdu...');
		}
		
		$('#rules').carousel('next');
	}
	
	if(autoRun){
		simulationIndex += 1;
		displayResults(function(){
			if(simulationIndex < autoSimulationNb){
				setTimeout(function(){
					startRun();
				}, autoSimulationSpeed);
			}
			else{
				$('#btn-auto').trigger('click');
				$('#auto-progress').removeClass('progress-bar-striped progress-bar-animated');
			}
		});
	}
};

$(document).ready(function(){
	// Init choice
	$('input[name=choice]').change(function(){
		autoSimulationChoice = $(this).val();
		if(autoSimulationChoice == 'conserve')
			$('#exp-choice').html('Conserver le choix');
		if(autoSimulationChoice == 'change')
			$('#exp-choice').html('Changer de choix');
	});
	// Init slider
	$("#auto-count")
	.on('input', function(slideEvt) {
		autoSimulationNb = parseInt($(slideEvt.target).val());
		$('#auto-progress').attr('aria-valuemax', autoSimulationNb);	
	})
	.val(autoSimulationNb);
	// Init toggle auto run
	$('#btn-auto').click(function(event){
		autoRun = !autoRun;
		if(autoRun){
			$(this).removeClass('btn-success').addClass('btn-danger').text('Stop');
			$('#auto-progress').addClass('progress-bar-striped progress-bar-animated');
			startSession();
		}
		else{
			$(this).removeClass('btn-danger').addClass('btn-primary').text('Démarrer');
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
	resultsChart = Highcharts.chart('results-chart', {
		chart: {
		      type: 'pie'
		},
		title: null,
		tooltip: {
			enabled: false
		},
		plotOptions: {
			pie: {
	            dataLabels: {
	                distance: -60,
	                enabled: true,
	                format: '{point.percentage:.' + decimalPlaces + 'f} %',
                    style: {
                    	fontSize: '12pt',
                    	textOutline: 0
                    }
	            },
	            showInLegend: true
	        }
	  	},
        series: [{
            name: 'Fréquence',
            data: []
          }]
    });
	historyChart = Highcharts.chart('history-chart', {
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
			enabled: false
		},
        series: [
        	{
	            name: 'Fréquence des parties gagnées',
	            data: []
	        }
    	]
    });

	startSession();
});