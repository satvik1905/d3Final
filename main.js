"use strict";

let svgWidth = 1200;
let svgHeight = 800;
let margin = 55;

let width = 860;
let height = 500;

/* Configuration variables: margins */
let leftMargin = 80;
let rightMargin = 25;
let topMargin = 150;
let bottomMargin = 60;

/* Defining a variable for the slider value and an array containing allowed set of time values */

let currentTimeSliderValue = 8;
let allowedSetOfTimeValues = [8, 13, 18, 23];

/* Creating a tooltip element */

let toolTip = d3
  .select("body")
  .append("toolTip")
  .attr("class", "tooltip")
  .style("opacity", 0);

/* Creating a basic SVG visualization with a rectangular background 
    and a group element that can be used to add other graphical elements such as shapes, lines, and text.
*/

let svg = d3
  .select("#canvas")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

svg
  .append("rect")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .attr("fill", "none")
  .attr("stroke", "black");

let viz = svg
  .append("g")
  .attr("transform", `translate(${leftMargin},${topMargin})`);

/* Adding global variables */
let data,
  xAxis,
  yAxis,
  xScale,
  yScale,
  xAxisLabel,
  yAxisLabel,
  radius,
  color,
  times,
  dataInitial,
  circles,
  timeLabel;

/* 
  Async function is a function that uses the D3.js library to fetch JSON data from a file named "data.json" and then 
  invokes a function named buildVisualization with the returned data as an argument.
*/

(async function () {
  data = await d3.json("data.json").then(buildVisualization);
})();

/*
    buildVisualization takes a data parameter as input. The purpose of this function 
    is to build a visualization using the provided data.
*/

function buildVisualization(data) {
  let renderData = organizeData(data);
  buildScales(renderData);
  drawVisualization(renderData, svg);
  return data;
}

/***** This function is to build the x and y scale. Using scale Linear to build both the axis.
 * .*****/

function buildScales(data) {
  xScale = d3
    .scaleLinear()
    .domain([0, 15])
    .range([leftMargin, svgWidth - rightMargin - 200]);

  yScale = d3
    .scaleLinear()
    .domain([0, 5])
    .range([svgHeight - bottomMargin, topMargin + 20]);
}

/**** Organizing the data ****/

function organizeData(data) {
  let organized = [];

  data.sort(function (a, b) {
    if (b.energy > a.energy) {
      return 1;
    }
    return -1;
  });
  return data;

  return organized;
}

/**** function drawVisualization(data, drawing) *****
 /***** This function will create the axis and their labels on the canvas.
 
1. xAxis and yAxis are used to label the axes.

2. xAxisLabel and yAxisLabel is to label the x and y axis respectively. X axis contents steps and Y axis contains Energy Levels

3. The color variable is used to create a color scale that consistently maps the same category values in the data array to the same color from the d3.schemeTableau10 color scheme. 
  This scale can be used to color-code elements in a visualization based on their category.

  
*****/
function drawVisualization(data, drawing) {
  /* Learned about how to create the axis code from Prof Jay Taylor-Laird from Class 7 materials
   */
  let xAxis = svg
    .append("g")
    .classed("key", true)
    .attr("transform", `translate(0, ${svgHeight - bottomMargin})`)
    .call(d3.axisBottom().scale(xScale));

  let yAxis = svg
    .append("g")
    .classed("key", true)
    .attr("transform", `translate(${leftMargin}, 0)`)
    .call(d3.axisLeft().scale(yScale));

  xAxisLabel = svg
    .append("text")
    .attr("class", "axisLabel")
    .attr("x", svgWidth / 2)
    .attr("y", svgHeight - bottomMargin / 4)
    .style("text-anchor", "middle")
    .text("Amount of steps I walk (in thousands)");

  yAxisLabel = svg
    .append("text")
    .attr("class", "axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("x", -svgHeight / 2)
    .attr("y", leftMargin / 4)
    .style("text-anchor", "middle")
    .text("My Energy Levels (0= Lazy and 5= Energetic");

  color = d3
    .scaleOrdinal() // they will consistently return the same value for the same thing.
    .domain(
      data.map(function (d) {
        return d.category;
      })
    )
    .range(d3.schemeTableau10);

  //adding legend
  let legend = svg.append("g").attr("transform", `translate(1050,100)`);

  legend
    .append("rect")
    .attr("width", 180)
    .attr("height", 170)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("x", -35)
    .attr("y", -15);

  legend
    .append("rect")
    .attr("width", 150)
    .attr("height", 150)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("x", -20)
    .attr("y", 180);

  let categories = color.domain();
  let circleRadius = 10;
  let circleSpacing = 25;
  let legendOffset = 20;

  // Draw circles and labels for each category
  let legendItems = legend
    .selectAll("g")
    .data(categories)
    .join("g")
    .attr(
      "transform",
      function (d, i) {
        return `translate(0, ${i * circleSpacing + legendOffset})`;
      }
      /* sets the transform attribute of each <g> element to a translation that moves the 
      group down by a distance that depends on the index of the category within the categories array. The circleSpacing and legendOffset 
      variables are used to determine the exact distance between each <g> element. */
    );

  let categoryData = {
    0: "0 - 499",
    1: "501 - 999",
    2: "1000 - 1499",
    3: "1500 - 1999",
    4: "2000 - 2400",
  };

  // Adding a title to the Calorie legend

  legend
    .append("text")
    .attr("x", -20)
    .attr("y", 10)
    .attr("text-anchor", "start")
    .style("font-size", "15px")
    .text("Calorie Consumed (Kcal)")
    .style("text-decoration", "underline");

  legend
    .append("text")
    .attr("x", -225)
    .attr("y", -35)
    .attr("text-anchor", "start")
    .style("font-size", "15px")
    .text("Click on the circles in the Calorie legend to highlight them")
    .style("text-decoration", "underline");

  /* Below code is appending a circle to a group of legend items
    An event listener is added to the circle which triggers a function which selects and manipulates 
     cother elements in the visualization. 
     So basically, when we click on the circle, it reduces the opacity of all other circles to 0.1 and then increases 
     the opacity of circle with id = #c to 1. Here e is a variable which represents the index of current legend item
     Finally, opacity of all legend circles is reduced to 0.1 except for the clicked circle, whose opacity is set to 1
     */

  legendItems
    .append("circle")
    .attr("id", "legendCircle")
    .attr("fill", color)
    .attr("opacity", 0.75)
    .attr("cx", circleRadius)
    .attr("cy", circleRadius)
    .attr("r", circleRadius)
    .on("click", function (event, e) {
      d3.selectAll(".circle").attr("opacity", 0.1);
      d3.selectAll("#c" + e).attr("opacity", 0.7);
      d3.selectAll("#legendCircle").attr("opacity", 0.1);
      d3.select(this).attr("opacity", 1);
    });

  // Adding text to all the circles in the Calorie legend
  legendItems
    .append("text")
    .text(function (d) {
      return categoryData[d];
    })
    .attr("x", circleRadius * 2.5)
    .attr("y", circleRadius * 1.5)
    .attr("font-size", 19);

  //legend for what each circle size denotes
  // Define the legend data
  let legendData = [
    { label: "4.0", radius: 25 },

    { label: "0.25", radius: 1 },
  ];

  legend
    .append("text")
    .attr("x", 0)
    .attr("y", 210)
    .attr("text-anchor", "start")
    .style("font-size", "15px")
    .text("Water Level (Litres)")
    .style("text-decoration", "underline");

  // Create a group element for the legend
  let legendAll = legend
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + 25 + "," + 250 + ")");

  // Create a circle for each legend item
  legendAll
    .selectAll("circle")
    .data(legendData)
    .enter()
    .append("circle")
    .attr("cx", 0)
    .attr("cy", function (d, i) {
      return i * 50;
    })
    .attr("r", function (d) {
      return d.radius;
    })
    .style("fill", "grey")
    .attr("stroke", "none");

  // Create a text label for each legend item
  legendAll
    .selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("font-size", 20)
    .attr("x", 30)
    .attr("y", function (d, i) {
      return i * 50;
    })
    .attr("dy", "0.35em")
    .text(function (d) {
      return d.label;
    });

  plotPoints(data, svg);
}

/**** function plotPoints(data, drawing) *****
 /***** This function will create the visualisation elemnts on the canvas.
 
1. Radius is created to help with the sizing of the circles. 

2. The following function when called, will create the circles on the canvas. 

3. The timeLabel variable will display the current time of the data on the visualization.

*****/

function plotPoints(data, drawing) {
  times = d3.extent(data, function (d) {
    return d.time;
  });
  console.log(currentTimeSliderValue, times);
  dataInitial = data.filter(function (d) {
    return d.time === currentTimeSliderValue;
  });

  radius = d3
    .scaleSqrt()
    .domain(
      d3.extent(data, function (d) {
        return d.water;
      })
    )
    .range([1, 30]);

  circles = svg
    .selectAll(".circle")
    .data(
      data.filter(function (d) {
        return d.time === currentTimeSliderValue;
      })
    )
    .join("circle")
    .attr("class", "circle")
    .attr("id", function (d) {
      return "c" + d.category;
    })
    .attr("opacity", 0.75)
    .attr("fill", function (d) {
      return color(d.category);
    })
    .attr("cx", function (d) {
      return xScale(d.steps);
    })
    .attr("cy", function (d) {
      return yScale(d.energy);
    })
    .attr("r", function (d) {
      return radius(d.water);
    })
    .on("mouseover", function (event, d) {
      return toolTip
        .style("opacity", 0.9)
        .style("left", event.pageX + 3 + "px") //X coordinate of the mouse pointer relative to the whole document.
        .style("top", event.pageY + 5 + "px")
        .html(
          "<ul><li> Amount of Steps Walked (x): " +
            d.steps +
            " " +
            "thousands" +
            "<li>Energy Level (y): " +
            d.energy +
            "<li>Amount of Water: " +
            d.water +
            " " +
            "litres" +
            "<li>Calorie Consumption: " +
            d.calorie +
            " " +
            "kCal" +
            "<li>Date: " +
            d.date +
            " " +
            "2023" +
            "<li>Time: " +
            d.time
        );
    })
    .on("mouseout", function (d) {
      toolTip.transition().duration(500).style("opacity", 0); //hide the tooltips
    });

  timeLabel = svg
    .append("text")
    .attr("class", "year")
    .attr("x", width - rightMargin - 90)
    .attr("y", height + topMargin + 70)
    .attr("fill", "#ccc")
    .attr("font-family", "Helvetica Neue, Arial")
    .attr("font-weight", 500)
    .attr("font-size", 80)
    .attr("id", "time1")
    .text("Time:" + " " + currentTimeSliderValue + ":00");
}

/****
 *  selecting an HTML element with an id of "rangeSlider" and adding an event listener to it for the "input" event.
    When the "input" event is triggered, it will call the "update" function with the parsed integer value of the current value of the range slider.
 */

d3.select("#rangeSlider").on("input", function () {
  update(parseInt(this.value));
});

let myTimer;

d3.select("#start").on("click", changeData);

/* Learned about the start and stop functionality from Stack Overflow:  https://stackoverflow.com/questions/34934577/html-range-slider-with-play-pause-loop
 Understood the code and modified it a bit to make it work with my visualization.
 */

function changeData() {
  clearInterval(myTimer); //clears any existing interval set by myTimer
  myTimer = setInterval(async function () {
    //sets a new interval
    let b = d3.select("#rangeSlider"); //selects the range slider element with the given id and assigns it to a variable
    let t = (+b.property("value") + 1) % (+b.property("max") + 1); // calculates a new value for the range slider by adding 1 to currenvt value
    currentTimeSliderValue = parseInt(b.property("value")); // assigns current value of range slider to currentTimeSliderValue variable
    if (t == 0) {
      t = +b.property("min"); // checks if new value of range slider is 0, if it is means that new value should be set to minimum value
    }
    b.property("value", t); //sets value of range slider to new t

    update(currentTimeSliderValue); // updates the visualization based on new value
  }, 1000); // repeatedly executes given function every second
}

/* Checks if the current Slider value consists in the allowed set of time values array (declared at the start)
 If yes, then the circles are drawn again
 */

function update(currentTimeSliderValue) {
  if (allowedSetOfTimeValues.includes(currentTimeSliderValue)) {
    // Update the circle positions based on the new data with animation
    circles
      .data(
        data.filter(function (d) {
          return d.time === currentTimeSliderValue;
        })
      )
      .transition()
      .duration(1000)
      .attr("id", function (d) {
        return "c" + d.category;
      })
      .attr("fill", function (d) {
        return color(d.category);
      })
      .attr("cx", function (d) {
        return xScale(d.steps);
      })
      .attr("cy", function (d) {
        return yScale(d.energy);
      })
      .attr("r", function (d) {
        return radius(d.water);
      })
      .attr("opacity", 0.7);

    timeLabel.text("Time:" + " " + currentTimeSliderValue + ":00");

    d3.selectAll("#legendCircle").attr("opacity", 1);
  }
}

function stopButton() {
  clearInterval(myTimer);
}

d3.select("#stop").on("click", stopButton);
