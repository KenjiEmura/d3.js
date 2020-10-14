/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

var animationSpeed = 80;
var transitionSpeed = 80;

var yearIndex = 0;
var country = 0;
var maxRadius = 10;
var margin = { left:150, right:20, top:20, bottom:150 };
var width = 600 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var interval;
var formattedData = 0;



// GROUPS <g> -------------------------------------------------------

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom);
var mainGroup = svg.append("g")
	.attr("name", "Main Group")
	.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
var continentsLabelsGroup = svg.append("g")
	.attr("name", "Continents Label")
	.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");



//TOOLTIP---------------------------------------------------------

var tip = d3.tip().attr('class', 'd3-tip')
	.html( d => {
		var text = "<strong style='color: red'>Country:</strong> <span style='color: white'>" + d.country + "</span><br>";
		text += "<strong style='color: red'>Continent:</strong> <span style='color: white'>" + d.continent + "</span><br>";
		text += "<strong style='color: red'>Life Expectancy:</strong> <span style='color: white'>" + d3.format(".2f")(d.life_exp) + "</span><br>";
		text += "<strong style='color: red'>GDP Per Capita:</strong> <span style='color: white'>" + d3.format("$,.0f")(d.income) + "</span><br>";
		text += "<strong style='color: red'>Population:</strong> <span style='color: white'>" + d3.format(",.0f")(d.population) + "</span><br>";
		return text;
	})
svg.call(tip);




// SCALES---------------------------------------------------------
var x = d3.scaleLog() // Scale for X axis
    .base(10)
    .domain([160, 150000])
    .range([0, width]);
var y = d3.scaleLinear() // Scale for Y axis
    .domain([0, 90])
    .range([height, 0]);
var radiusScale = d3.scaleLinear() // Scale for the radius of the circles
    .range([25*Math.PI, 1500*Math.PI])
    .domain([2000, 1400000000]);
// Color scale for the continents
var continent =	d3.scaleOrdinal(d3.schemeCategory10);




// LABELS-------------------------------------------------------

// Year Label
var yearLabel = continentsLabelsGroup.append("text")
.attr("y", height - 15)
.attr("x", width - 2)
    .attr("font-size", "30px")
    .attr("text-anchor", "end");
// X Axis
var xAxisGroup = mainGroup.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + height + ")");
var xAxisCall = d3.axisBottom(x)
	.tickValues([400, 4000, 40000])
    .tickFormat(d3.format("$,"));
xAxisGroup.call(xAxisCall);
// Y Axis
var yAxisGroup = mainGroup.append("g")
    .attr("class", "y axis");
var yAxisCall = d3.axisLeft(y)
    .ticks(8)
    .tickFormat( d => { return (d + " years"); });
yAxisGroup.call(yAxisCall);
// X Axis Title
mainGroup.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("GDP Per Capita ($)");
// Y Axis Title
mainGroup.append("text")
    .attr("y", -60)
    .attr("x", -(height / 2))
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
	.text("Life Expectation");
	




// DATA LOAD-------------------------------------------------

d3.json("data/data.json").then( rawdata => {
	// console.log(rawdata);

	formattedData = sorting(rawdata, "p"); // We sort the array of information

    // Continent Legend
    var yAxisShift = 0;
    var listOfContinents = Array.from(new Set(formattedData[0].map( d => { return d.continent })));
    for (let i = 0; i < listOfContinents.length; i++) {
        continentsLabelsGroup.append("circle")
            .attr("cy", height*(3/5) + yAxisShift)
            .attr("cx", width - 10)
            .attr("r", 6)
            .attr("fill", continent(listOfContinents[i]));
        continentsLabelsGroup.append("text")
            .attr("y", height*(3/5) + yAxisShift + 5)
            .attr("x", width - 20)
            .attr("font-size", "12px")
			.attr("text-anchor", "end")
			.style("text-transform", "capitalize")
            .text( listOfContinents[i] );
		yAxisShift += 20;
	}

	
	//CALL OF THE UPDATE FUNCTION
	update(formattedData[0]); // First Visualization

}).catch(error => {console.log(error);})






//CONTROLS AND BUTTONS-------------------------------------

$("#play-button")
    .on("click", () => {
		var button = $("#play-button");
        if (button.text() == "Play"){
            button.text("Pause");
            interval = setInterval(step, animationSpeed);            
        }
        else {
            button.text("Play");
            clearInterval(interval);
        }
	});


$("#reset-button")
	.on("click", () => {
		yearIndex = 0;
		clearInterval(interval);
		$("#play-button").text("Play");
		update(formattedData[0]);
	});

$("#date-slider").slider({
	max: 2014,
	min: 1800,
	step: 1,
	slide: (event, ui) => {
		yearIndex = ui.value - 1800;
		update(formattedData[yearIndex]);
	}
})



var continentSelector = $("#continent-select")
	continentSelector.on("change", () => {
		update(formattedData[yearIndex]);
	})


$("#speed")
	.on("keyup change click focus", () => {
	clearInterval(interval);
	if ($("#speed").val() >= 1000) {
		animationSpeed = 1000;
		transitionSpeed = animationSpeed;
	} else if ($("#speed").val() >= 10) {
		animationSpeed = $("#speed").val();
		transitionSpeed = animationSpeed;
	} else if ($("#speed").val() < 10) {
		animationSpeed = 10;
		transitionSpeed = animationSpeed;
	} else {
		animationSpeed = 100;
		transitionSpeed = animationSpeed;
	}
	$("#play-button").text("Play");
})

	
$("#yearInput")
	.on("keyup change click focus", () => {
			inputUpdate();
	})

function inputUpdate() {
	if ($("#yearInput").val() >= 1800 && $("#yearInput").val() <= 2014) {
		yearIndex = $("#yearInput").val() - 1800;
	} else if ($("#yearInput").val() < 1800) {
		yearIndex = 214;
	} else {
		yearIndex = 0;
	}
	clearInterval(interval);
	$("#play-button").text("Play");
	update(formattedData[yearIndex]);
}



//CALL THE UPDATE FUNCTION----------------------------------
function step() {
	yearIndex = (yearIndex < 214) ? yearIndex + 1 : yearIndex = 0;
	update(formattedData[yearIndex]);
}




// UPDATE FUNCTION------------------------------------------
function update(data) {
	
	width = window.innerWidth - margin.left - margin.right;

	data = data.filter( (d) => {
		if (continentSelector.val() == "all") { return true; }
		else { return d.continent == continentSelector.val(); }
	})

	var t = d3.transition().duration(transitionSpeed); // We set our transitions duration

	// JOIN: Load the new data
	var circles = mainGroup.selectAll("circle")
	.data(data, d => { return d.country; });
	
	// EXIT: Delete old elements not present in new data but on screen
	circles.exit()
	.attr("class", "exit")
	.remove();
	
	// ENTER information on the data but not on the screen
	circles.enter()
	.append("circle")
	.attr("class", "enter")
	.attr("name", d => { return d.country; })
	.attr("fill", d => { return continent(d.continent); })
	.on("mouseover", tip.show)
	.on("mouseout", tip.hide)
	.merge(circles)
		.transition(t)
		.attr("cx", d => { 	return x(d.income);	})
		.attr("cy", d => { 	return y(d.life_exp); })
		.attr("r", d => { return Math.sqrt(radiusScale(d.population) / Math.PI) });
	
	yearLabel.text("Year: " + (yearIndex + 1800) );
	$("#yearInput").val(yearIndex + 1800);
	$("#speed").val(animationSpeed);
	$("#date-slider").slider("value", yearIndex + 1800)
}



//FORMATT AND ARRANGE DATA----------------------------------
function sorting(data, typeOfSorting) { // This function will sort the data by continent (c), name of country (n), income (i), life expectation (l) or population (p)
	
	var sortBy;
	var isChar // Flag variable to check if we are going to sort using a number or a character

	switch (typeOfSorting) {
		case "c":
			sortBy = "continent";	isChar = true;break;
		case "n":
			sortBy = "country";		isChar = true;break;
		case "i":
			sortBy = "income";		isChar = false;break;
		case "l":
			sortBy = "life_exp";	isChar = false;break;
		case "p":
			sortBy = "population";	isChar = false;break;
		default:
			return "No hubo coincidencias";break;
	}
	
	data.forEach( year => {
		year.countries.sort((a, b) => {
			if (isChar) {
				if ( a[sortBy].toLowerCase() < b[sortBy].toLowerCase() ) {
					return -1;
				} else if ( a[sortBy].toLowerCase() > b[sortBy].toLowerCase() ) {
					return 1;
				} else {
					return 0;
				}
			} else if (!isChar) {
				if ( a[sortBy] > b[sortBy] ) {
					return -1;
				} else if ( a[sortBy] < b[sortBy] ) {
					return 1;
				} else {
					return 0;
				}
			}
		})
	});

	var formattedData = data.map( year => {
        return year['countries'].filter( country => {
            var filter = (country.income && country.life_exp);
            return filter;
        })
	});

	return formattedData;
};