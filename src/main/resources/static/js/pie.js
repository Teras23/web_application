var makePie = function(data, div) {
    var width = 360;
    var height = 360;
    var radius = Math.min(width, height) / 2;
    var donutWidth = 75;

    var legendRectSize = 18;
    var legendSpacing = 4;

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select('#' + div)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' +
            (width / 2) + ',' + (height / 2) + ')');

    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function (d) {
            return d[1];
        })
        .sort(null);

    var path = svg.selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill',
            function (d, i) {
                return color(d.data[0]);
            }
        );

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform',
            function (d, i) {
                var height = legendRectSize + legendSpacing;
                var offset = height * color.domain().length / 2;
                var horz = -2 * legendRectSize;
                var vert = i * height - offset;
                return 'translate(' + horz + ',' + vert + ')';
            });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function (d) {
            return d;
        });
};
