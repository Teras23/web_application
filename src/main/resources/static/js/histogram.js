var makeHistogram = function(newdata) {
    var bin_count = newdata.length;
    var width = 960;
    var height = 500;

    var timeParser = d3.timeParse("%Q");

    var maxdate = d3.max(newdata, function (x) {
        console.log(x[0]);
        console.log(timeParser(x[0]));
        return timeParser(x[0])
    });
    var mindate = d3.min(newdata, function (x) {
        return timeParser(x[0])
    });

//number formatting
    var formatCount = d3.format(",.0f");

    var svg = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    var margin = {top: 10, right: 30, bottom: 30, left: 30};
    var width = +svg.attr("width") - margin.left - margin.right;
    var height = +svg.attr("height") - margin.top - margin.bottom;
//make g, child of svg and moved to margin
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//var x = d3.scaleLinear() //scaleTime
//    .rangeRound([0, width]); //set the graphing mapping range (x values) to 0-width

    var x = d3.scaleTime()
        .domain([mindate, maxdate]) //[new Date(2018, 1, 1), new Date(2018, 2, 2)]
        .range([0, width]);

    var hist = d3.histogram()
        .value(function (d) {
            console.log(d);
            return timeParser(d[0]);
        })
        // .domain(x.domain())
        .thresholds(x.ticks(bin_count));

// var bins = d3.histogram()
//     .domain(x.domain())
//     .thresholds(x.ticks(bin_count)) // set the number of bins to an appropriate number close to bin_count
//     (newdata);

    var bins = hist(newdata);

    console.log("Bins: " + bins);

    function getY(b) {
        if (b.length > 0)
            return b[0][1];
        else
            return 0;
    }

    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function (d) { //advanced max function
            console.log("f");
            console.log(d);
            return getY(d);
        })])
        .rangeRound([height, 0]);

    var bar = g.selectAll(".bar")
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function (d) {
            console.log("translate(" + x(d.x0) + "," + y(d.length) + ")");
            return "translate(" + x(d.x0) + "," + y(getY(d)) + ")";
        });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0))
        .attr("height", function (d) {
            return height - y(getY(d));
        });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
        .attr("text-anchor", "middle")
        .text(function (d) {
            return formatCount(getY(d));
        });

    var bottomScaleGenerator = d3.axisBottom(x);
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(bottomScaleGenerator);
};


