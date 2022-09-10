import { axisLeft as d3AxisLeft } from 'd3-axis';
import { axisLeft as d3AxisBottom } from 'd3-axis';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { select as d3Select } from 'd3-selection';
import { line as d3Line } from 'd3-shape';
import { csv as d3Csv } from 'd3-fetch';
import 'd3-transition';

export default function() {
	//layout variables
  	var margin = {top: 30, right: 80, bottom: 70, left: 100};
	var height = 500;
	var width = 2200;
	var innerWidth = width - margin.left - margin.right;
	var innerHeight = height - margin.top - margin.bottom;
			
	//data keys for drawing
	var highlightKey = "";

	//methods
	var updateLayout = null;
	var updateData = null;
	var updateKeys = null;

	//data stores
	var data = [];
	var xKey = "";
	var xFormat = function(d){
		return d;
	};

	var xValues = data.map(item => xFormat(item[xKey]));
	var xRegions = xValues.reduce((acc, d) => {
		acc[d] = d in acc ? acc[d] + 1 : 1;
		return acc;
	}, {});
	var grabKey = function(d){
		return importantKeys.indexOf(xFormat(d[xKey])) >= 0 ? xFormat(d[xKey]) : "other";
	}
	var importantKeys = Object.keys(xRegions)
		.sort((a, b) => xRegions[b] - xRegions[a]).slice(0, 9);
	var xAxisPlacement = function(d,i){
				var key = grabKey(d);
				var xValue = key;
				var xAxisOffset = getXAxisOffset(xValue);
				var reducedX = i / importantKeys.length;

				return x(xAxisOffset + reducedX);
			}
	var getXAxisOffset = function(d){
		var xAxisOffset = (importantKeys.indexOf(d) / importantKeys.length) * data.length;
		return xAxisOffset;
	}

	if(importantKeys.length < Object.keys(xRegions).length){
		importantKeys.push("other");
	}

	function chaos(selection){
		selection.each(function () {
			//parent DOM variables
			var dom = d3Select(this);
			var svg = dom.append('svg');
			var shapes = svg.append('g').attr('class', 'shapes');
			var labels = svg.append('g').attr('class', 'labels');
			var lines = shapes.selectAll('g.line-shape').data(data);
			var xLabels = labels.selectAll('g.label').data(importantKeys);
			var linesEnter = lines.enter().append('g');
			var labelsEnter = xLabels.enter().append('g').attr('class', 'label');
			var glowFilter = linesEnter.append('defs');

			//axis related variables
			var x = null;
			var y = null;
			var xAxis = null;
			var yAxis = null;
			var xAxisGroup = null;
			var yAxisGroup = null;

			//line related variables
			var line = null;
			var area = null;
			var filterMerge = null;
			var name = null;

			//svg setup
			svg.attr('width', '100%')
			  .attr('height', '100%')
			  .attr('viewBox', '0 0 '+width+' '+height)
			  .attr('preserveAspectRatio', 'xMidYMid');



			//axis and scale creation
			x = d3ScaleLinear()
			  .range([margin.left, innerWidth]);
			y = d3ScaleLinear()
			  .range([innerHeight, margin.top]);

			x.domain([0, data.length]);
			y.domain([0, 1]);

			xAxis = d3AxisBottom().scale(x);
			yAxis = d3AxisLeft().scale(y);

			xAxisGroup = svg.append('g')
			  .attr('class', 'x axis')
			  .attr('transform', 'translate(0,' + innerHeight + ')')
			  .call(xAxis);
			yAxisGroup = svg.append('g')
			  .attr('class', 'y axis')
			  .attr('transform', 'translate('+ margin.left +',0)')
			  .call(yAxis);

			//svg shape creation
			shapes.attr('class', 'shapes');

			// Define Group Attributes
			linesEnter
				.attr('class', 'line-shape');

			// Define Path Group Styling
			glowFilter.append("filter")
		        .attr("id", "glow")
		        .attr("height", "10")
		        .attr("width", "10").attr("x", "-5").attr("y", "-5");
			glowFilter.append("feGaussianBlur")
				.attr("stdDeviation", 4)
				.attr("result", "coloredBlur");

			filterMerge = glowFilter.append("feMerge");
			filterMerge.append("feMergeNode")
				.attr("in", "coloredBlur");
			filterMerge.append("feMergeNode")
				.attr("in", "SourceGraphic");


			// Build Graph Paths
			linesEnter.append('line')
				.attr('class', function(d){
					return grabKey(d) === highlightKey ? 'line highlight' : 'line';
				})
				.attr("x1", function(d){
					var random = x(data.length * Math.random());
					var center = width / 2;
					return grabKey(d) === highlightKey ? center : random;
				})
				.attr("x2", xAxisPlacement)
				.attr("y1", 0)
				.attr("y2", innerHeight);
			linesEnter.append('circle')
				.attr('class', 'line-point')
				.attr('r', 1)
				.attr("cy", innerHeight)
				.attr("cx", xAxisPlacement);

			labelsEnter.on('mouseover', function(evt, d){
				updateHighlight(d);
			});
			labelsEnter.append("rect")
				.attr('class', 'label-background')
				.attr('x', d => x(getXAxisOffset(d)))
				.attr('y', innerHeight)
				.attr('height', margin.bottom)
				.attr('width', innerWidth / importantKeys.length);
			labelsEnter.append("text")
				.attr('class', 'label-text')
				.attr('x', d => x(getXAxisOffset(d)) + ((innerWidth / importantKeys.length) / 2))
				.attr('y', innerHeight + (margin.bottom/2))
				.attr('dominant-baseline', 'middle')
				.attr('text-anchor', 'middle')
				.text(d => d);

			function updateHighlight(key){
				var oldKey = highlightKey;
				highlightKey = key;
				shapes.selectAll('line.line')
					.attr('class', function(d){
						var cls = grabKey(d) === highlightKey ? 'line highlight' : 'line';
						return cls;
					})
					.transition()
					.attr("x1", function(d){
						var random = x(data.length * Math.random());
						var center = width / 2;
						var currentX1 = d3Select(this).attr("x1");
						var lineKey = grabKey(d);
						return lineKey === highlightKey ? 
								width / 2 : lineKey === oldKey ? 
								random : currentX1;
					});

				return highlightKey;
			}

			function updateKey(key, value, format){
				var oldKey = highlightKey;
				var updateLabels = null;
				var updateBG = null;
				var updateText = null;
				var updateExit = null;
				var enterLabels = null;

				var updateShapes = null;
				var updateLines = null;
				var updatePoints = null;
				var shapesExit = null;
				var enterLines = null;

				updateLabels = labels.selectAll('g.label').data(xValues);
				updateBG = update.select('.label-background');
				updateText = update.select('.label-text');
				updateExit = update.exit();

				updateShapes = labels.selectAll('g.line-shape').data(data);
				updateLines = updateShapes.select('line.line');
				updatePoints = updateShapes.select('circle.line-point');
				shapesExit = updateShapes.exit();

				enterLines = updateLabels.enter().append('g').attr('class', 'line-shape');

				enterLines.append('line')
					.attr('class', function(d){
						return grabKey(d) === highlightKey ? 'line highlight' : 'line';
					})
					.attr("x1", function(d){
						var random = x(data.length * Math.random());
						var center = width / 2;
						return grabKey(d) === highlightKey ? center : random;
					})
					.attr("x2", xAxisPlacement)
					.attr("y1", 0)
					.attr("y2", innerHeight);
				enterLines.append('circle')
					.attr('class', 'line-point')
					.attr('r', 1)
					.attr("cy", innerHeight)
					.attr("cx", xAxisPlacement);

				updateLines
					.attr('class', function(d){
						return grabKey(d) === highlightKey ? 'line highlight' : 'line';
					})
					.transition(duration)
					.attr("x1", function(d){
						var random = x(data.length * Math.random());
						var center = width / 2;
						return grabKey(d) === highlightKey ? center : random;
					})
					.attr("x2", xAxisPlacement);

				updatePoints
					.attr("cx", xAxisPlacement);

				shapesExit.remove();

				// ENTER new elements present in new data.
				enterLabels = updateLabels.enter().append('g').attr('class', 'label');

				enterLabels.on('mouseover', function(evt, d){
					updateHighlight(d);
				});	
		
				enterLabels.append("rect")
					.attr('class', 'label-background')
					.attr('x', d => x(getXAxisOffset(d)))
					.attr('y', innerHeight)
					.attr('height', margin.bottom)
					.attr('width', innerWidth / importantKeys.length);
				enterLabels.append("text")
					.attr('class', 'label-text')
					.attr('x', d => x(getXAxisOffset(d)) + ((innerWidth / importantKeys.length) / 2))
					.attr('y', innerHeight + (margin.bottom/2))
					.attr('dominant-baseline', 'middle')
					.attr('text-anchor', 'middle')
					.text(d => d);

				// UPDATE old elements present in new data.
				updateLabels.on('mouseover', function(evt, d){
					updateHighlight(d);
				});

				// Define Path Group Styling
				updateBG.attr('class', 'label-background')
					.attr('x', d => x(getXAxisOffset(d)))
					.attr('y', innerHeight)
					.attr('height', margin.bottom)
					.attr('width', innerWidth / importantKeys.length);
				updateText.attr('class', 'label-text')
					.attr('x', d => x(getXAxisOffset(d)) + ((innerWidth / importantKeys.length) / 2))
					.attr('y', innerHeight + (margin.bottom/2))
					.attr('dominant-baseline', 'middle')
					.attr('text-anchor', 'middle')
					.text(d => {
					return d
					});
				
				updateExit.remove();
				
			}

		});
	}

  	chaos.layout = function(value) {
		if (!arguments.length) return {height:height,width:width,margin:margin};
		height = value.height || height;
		width = value.width || width;
		margin = value.margin || margin;
		innerWidth = width - margin.left - margin.right;
		innerHeight = height - margin.top - margin.bottom;
		if (typeof updateLayout === 'function') updateLayout();
		return chaos;
	};
	
  	chaos.data = function(value) {
		if (!arguments.length) return data;
		data = value;
		if (typeof updateData === 'function') updateData();
		return chaos;
	};
	
	chaos.key = function(key, value, format) {
		if (!arguments.length) return {highlightKey,xKey,xFormat,xValues,xRegions,importantKeys};

		highlightKey = value;
		xKey = key;
		xFormat = format;
		
		xValues = data.map(item => xFormat(item[xKey]));
		xRegions = xValues.reduce((acc, d) => {
			acc[d] = d in acc ? acc[d] + 1 : 1;
			return acc;
		}, {});
		importantKeys = Object.keys(xRegions)
			.sort((a, b) => xRegions[b] - xRegions[a])
			.slice(0, 9);

		if(importantKeys.length < Object.keys(xRegions).length){
			importantKeys.push("other");
		}

		if (typeof updateKey === 'function') updateKey(key, value, format);
		return chaos;
	};

	return chaos;
};