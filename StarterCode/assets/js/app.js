// @TODO: YOUR CODE HERE!


//define margins and area for graph

var width = parseInt(d3.select("#scatter").style("width"));
var height = width - width / 4;
var margin = 20;
var labelArea = 110; // space for placing words
// padding for the text at the bottom and left axes
var tPadBot = 40;
var tPadLeft = 40;

// Create the actual canvas for the graph
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Set the radius for each circle that will appear in the graph.

var circRadius;
function crGet() {
  if (width <= 530) {
    circRadius = 7;
  }
  else {
    circRadius = 14;
  }
}
crGet();

// definie labels

// create a group element to nest our x_axis labels.
svg.append("g").attr("class", "xText");

// create variable that hold text to allows  selecting the group element.
var xText = d3.select(".xText");

// create function that can add transform function to xText and to put it at the bottom of chart

function xTextRefresh() {
  xText.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) + //change the location of the label group when the width of window changes.
      ", " +
      (height - margin - tPadBot) +
      ")"
  );
}
xTextRefresh();

// use xText object create from the above to append  text SVG files.

// 1. Poverty
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");

// 2. Age
xText
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");

// // B) Left Axis

// define  the variables to enable the  transform attributes more readable.
var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

//  add a second label group, this time for the axis left of the chart(Y-axis)
svg.append("g").attr("class", "yText");

var yText = d3.select(".yText");

// like above create function that can add transform function to YText and to put it at the left of chart
function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
  );
}
yTextRefresh();

// 1. Smokes
yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

// 2. Lack of Healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

// Load the data source csv and  real data manipulation will be perform below

d3.csv("assets/data/data.csv").then(function(data) {
  // Visualize the data
  visualize(data);
});

// create visualization function that will mainipuale all the element from our csv data

function visualize(HealthData) {
  var xaxis_data = "poverty";
  var Yaxis_data = "healthcareLow";

  // create addition  variables to store the min and max values of x and y. that can help to alter the value inside the function
  
  var xMin;
  var xMax;
  var yMin;
  var yMax;

  // Append a div to the body to create tooltips
  //  create function to allows us to set up tooltip rules.
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([50, -50])
    .html(function(d) {
      console.log(d)
      // x key
      var X_value;
      // Grab the state name.
      var State_Name = "<div>" + d.state + "</div>";
      // display the y value's key and value.
      var Y_value = "<div>" + Yaxis_data + ": " + d[Yaxis_data] + "%</div>";
      // If the x key is poverty
      if (xaxis_data === "poverty") {
        // Grab the x key and a version of the value formatted to show percentage
        X_value = "<div>" + xaxis_data + ": " + d[xaxis_data] + "%</div>";
      }
      else {
        // Otherwise
        // Grab the x key and a version of the value formatted to include commas after every third digit.
        X_value = "<div>" +
          xaxis_data +
          ": " +
          parseFloat(d[xaxis_data]).toLocaleString("en") + // return float value reppresented by the string argument
          "</div>";
      }
      // Display result.
      return State_Name + X_value + Y_value;
    });
  // Call the toolTip function.
  svg.call(toolTip);


  // Adjust X max and min

  function XAdjustment() {
    //. min will grab the smallest datum from the selected attribute.
    xMin = d3.min(HealthData, function(d) {
      return parseFloat(d[xaxis_data]) * 0.90;
    });

    // .max will grab the largest datum from the selected column.
    xMax = d3.max(HealthData, function(d) {
      return parseFloat(d[xaxis_data]) * 1.10;
    });
  }

  // Adjust the min and max for y
  function YAdjustment() {
    // min will grab the smallest datum from the selected column.
    yMin = d3.min(HealthData, function(d) {
      return parseFloat(d[Yaxis_data]) * 0.90;
    });

    // .max will grab the largest datum from the selected column.
    yMax = d3.max(HealthData, function(d) {
      return parseFloat(d[Yaxis_data]) * 1.10;
    });
  }

  //  change the classes (and appearance) of label text when clicked.
  function labelChange(axis, clickedText) {
    // Switch the currently active to inactive.
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // Switch the text just clicked to active.
    clickedText.classed("inactive", false).classed("active", true);
  }

  //  grab Adjusted min and max values of x and y.
  XAdjustment();
  YAdjustment();

  // create scale with range method by including margin and word area
  // This tells d3 to place our circles in an area starting after the margin and word area.

  var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    // Height is inverses due to how d3 calc's y-axis placement
    .range([height - margin - labelArea, margin]);

  // pass the scales into the axis methods to create the axes.
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // Determine x and y tick counts. and  Save it as a function for easy mobile updates.

  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

  // append the axes in group elements. By calling them,  include  all of the numbers, borders and ticks.
  // The transform attribute specifies where to place the axes.
  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  //  grouping for circles and their labels.
  var theCircles = svg.selectAll("g theCircles").data(HealthData).enter();

  // We append the circles for each row of data (or each state, in this case).
  theCircles
    .append("circle")
    // These attr's specify location, size and class.
    .attr("cx", function(d) {
      return xScale(d[xaxis_data]);
    })
    .attr("cy", function(d) {
      return yScale(d[Yaxis_data]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })

    // Hover rules
    .on('mouseover', function(d) { toolTip.show(d, this); })
    // 
    // .on("mouseover", function(d) {
    //   // Show the tooltip
    //   toolTip.show(d, this);
    //   // Highlight the state circle's border
    // //   d3.select(this).style("stroke", "#323232");
    // })
    .on("mouseout", function(d) {
      // Remove the tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select(this).style("stroke", "#e3e3e3");
    });

   // grab the state abbreviations from our data and place them in the center of our dots.
  theCircles
    .append("text")
    // return the abbreviation to .text, which makes the text the abbreviation.
    .text(function(d) {
      return d.abbr;
    })
    // place the text using our scale.
    .attr("dx", function(d) {
      return xScale(d[xaxis_data]);
    })
    .attr("dy", function(d) {
      // When the size of the text is the radius,add a third of the radius to the height and pushes it into the middle of the circle.
      return yScale(d[Yaxis_data]) + circRadius / 2.0;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")

    // Hover Rules
   
    
    .on('mouseover',
     function(d) {
        toolTip.show(d, this); })
      // Highlight the state circle's border
    //   
    .on("mouseout", function(d) {
      // Remove tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  //  allow the user to click on any label  and display the data it references.

  // Select all axis text and add this d3 click event.
  d3.selectAll(".aText").on("click", function() {
    // Make sure we save a selection of the clicked text,
    // so we can reference it without typing out the invoker each time.
    var SelectedLabel = d3.select(this);

    // We only want to run this on inactive labels
    
    if (SelectedLabel.classed("inactive")) {
      // Grab the name and axis saved in label.
      var axis = SelectedLabel.attr("data-axis");
      var name = SelectedLabel.attr("data-name");

      // When x is the saved axis, execute this:
      if (axis === "x") {
        // Make xaxis_data the same as the data name.
        xaxis_data = name;

        // Change the min and max of the x-axis
        XAdjustment();

        // Update the domain of x.
        xScale.domain([xMin, xMax]);

        //  use a transition when we update the xAxis.

        svg.select(".xAxis").transition().duration(300).call(xAxis);

        // With the axis changed, let's update the location of the state circles.

        d3.selectAll("circle").each(function() {
          // Each state circle gets a transition for it's new attribute. This will lend the circle a motion tween  from it's original spot to the new location.
          d3
            .select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[xaxis_data]);
            })
            .duration(300);
        });

        // We need change the location of the state texts, too.
        d3.selectAll(".stateText").each(function() {
          // We give each state text the same motion tween as the matching circle.
          d3
            .select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[xaxis_data]);
            })
            .duration(300);
        });

        // Finally, change the classes of the last active label and the clicked label.
        labelChange(axis, SelectedLabel);
      }
      else {
        // When y is the saved axis, execute this:
        // Make Yaxis_data the same as the data name.
        Yaxis_data = name;

        // Change the min and max of the y-axis.
        YAdjustment();

        // Update the domain of y.
        yScale.domain([yMin, yMax]);

        // Update Y Axis
        svg.select(".yAxis").transition().duration(300).call(yAxis);

        // With the axis changed, let's update the location of the state circles.
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cy", function(d) {
              return yScale(d[Yaxis_data]);
            })
            .duration(300);
        });

        // We need change the location of the state texts, too.
        d3.selectAll(".stateText").each(function() {
          // We give each state text the same motion tween as the matching circle.
          d3
            .select(this)
            .transition()
            .attr("dy", function(d) {
              return yScale(d[Yaxis_data]) + circRadius / 3;
            })
            .duration(300);
        });

        // Finally, change the classes of the last active label and the clicked label.
        labelChange(axis, SelectedLabel);
      }
    }
  });

  // Part 5: Mobile Responsive
  // =========================
  // resize and redraw the chart according to the dimension of the window.

  d3.select(window).on("resize", resize);

    function resize() {
    // Redefine the width, height and leftTextY (the three variables dependent on the width of the window).
    width = parseInt(d3.select("#scatter").style("width"));
    height = width - width / 3.9;
    leftTextY = (height + labelArea) / 2 - labelArea;

    // Apply the width and height to the svg canvas.
    svg.attr("width", width).attr("height", height);

    // Change the xScale and yScale ranges
    xScale.range([margin + labelArea, width - margin]);
    yScale.range([height - margin - labelArea, margin]);

    // With the scales changes, update the axes (and the height of the x-axis)
    svg
      .select(".xAxis")
      .call(xAxis)
      .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

    svg.select(".yAxis").call(yAxis);

    // Update the ticks on each axis.
    tickCount();

    // Update the labels.
    xTextRefresh();
    yTextRefresh();

    // Update the radius of each circle.
    crGet();

    // With the axis changed, update the location and radius of the state circles.
    d3
      .selectAll("circle")
      .attr("cy", function(d) {
        return yScale(d[Yaxis_data]);
      })
      .attr("cx", function(d) {
        return xScale(d[xaxis_data]);
      })
      .attr("r", function() {
        return circRadius;
      });

    // We need to change the location and size of the state texts, too.
    d3
      .selectAll(".stateText")
      .attr("dy", function(d) {
        return yScale(d[Yaxis_data]) + circRadius / 3.5;
      })
      .attr("dx", function(d) {
        return xScale(d[xaxis_data]);
      })
      .attr("r", circRadius / 3);
  }
}
