$(function(){
    function pageLoad(){
        var testData = window.testData(['Search', 'Referral', 'Direct', 'Organic'],
                25),// just 25 points, since there are lots of charts
            pieSelect = d3.select("#sources-chart-pie"),
            pieFooter = d3.select("#data-chart-footer"),
            stackedChart,
            lineChart,
            pieChart,
            barChart;

		var testData2 = window.testData(['Search', 'Referral'],
                25),// just 25 points, since there are lots of charts
            pieSelect = d3.select("#sources-chart-pie"),
            pieFooter = d3.select("#data-chart-footer"),
            stackedChart,
            lineChart,
            pieChart,
            barChart;	
			
        function pieChartUpdate(d){
            d.disabled = !d.disabled;
            d3.select(this)
                .classed("disabled", d.disabled);
            if (!pieChart.pie.values()(testData).filter(function(d) { return !d.disabled }).length) {
                pieChart.pie.values()(testData).map(function(d) {
                    d.disabled = false;
                    return d;
                });
                pieFooter.selectAll('.control').classed('disabled', false);
            }
            d3.select("#sources-chart-pie svg").transition().call(pieChart);
        }

        // test Data.
        //use if needed
        function sinAndCos() {
            var sin = [],
                cos = [];

            for (var i = 0; i < 100; i++) {
                sin.push({x: i, y: i % 10 == 5 ? null : Math.sin(i/10) }); //the nulls are to show how defined works
                cos.push({x: i, y: .5 * Math.cos(i/10)});
            }

            return [
                {
                    area: true,
                    values: sin,
                    key: "Sine Wave"
                },
                {
                    values: cos,
                    key: "Cosine Wave"
                }
            ];
        }

        nv.addGraph(function() {

            /*
             * we need to display total amount of visits for some period
             * calculating it
             * pie chart uses y-property by default, so setting sum there.
             */
            for (var i = 0; i < testData.length; i++){
                testData[i].y = Math.floor(d3.sum(testData[i].values, function(d){
                    return d.y;
                }))
            }

            var chart = nv.models.pieChartTotal()
                .x(function(d) {return d.key })
                .margin({top: 0, right: 20, bottom: 20, left: 20})
                .values(function(d) {return d })
                .color(COLOR_VALUES)
                .showLabels(false)
                .showLegend(false)
                .tooltipContent(function(key, y, e, graph) {
                    return '<h4>' + key + '</h4>' +
                        '<p>' +  y + '</p>'
                })
                .total(function(count){
                    return "<div class='visits'>" + count + "<br/> visits </div>"
                })
                .donut(true);
            chart.pie.margin({top: 10, bottom: -20});

            var sum = d3.sum(testData, function(d){
                return d.y;
            });
            pieFooter
                .append("div")
                .classed("controls", true)
                .selectAll("div")
                .data(testData)
                .enter().append("div")
                .classed("control", true)
                .style("border-top", function(d, i){
                    return "3px solid " + COLOR_VALUES[i];
                })
                .html(function(d) {
                    return "<div class='key'>" + d.key + "</div>"
                        + "<div class='value'>" + Math.floor(100 * d.y / sum) + "%</div>";
                })
                .on('click', function(d) {
                    pieChartUpdate.apply(this, [d]);
                    setTimeout(function() {
                        stackedChart.update();
                        lineChart.update();
                        barChart.update();
                    }, 100);
                });

            d3.select("#sources-chart-pie svg")
                .datum([testData])
                .transition(500).call(chart);
            PjaxApp.onResize(chart.update);

            pieChart = chart;

            return chart;
        });

        nv.addGraph(function(){
            var chart = nv.models.multiBarChart()
                .margin({left: 30, bottom: 20, right: 0})
                .color(keyColor)
                .controlsColor([$white, $white, $white])
                .showLegend(false);

            chart.yAxis
                .showMaxMin(false)
                .ticks(0)
                .tickFormat(d3.format(',.f'));

            chart.xAxis
                .showMaxMin(false)
                .tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)) });

            d3.select('#sources-chart-bar svg')
                .datum(testData)
                .transition().duration(500).call(chart);

            PjaxApp.onResize(chart.update);

            barChart = chart;

            return chart;
        });

        nv.addGraph(function() {
            var chart = nv.models.stackedAreaChart()
                .margin({left: 0})
                .color(keyColor)
                .showControls(false)
                .showLegend(false)
                .style("stream")
                .controlsColor([$textColor, $textColor, $textColor]);

            chart.yAxis
                .showMaxMin(false)
                .tickFormat(d3.format(',f'));

            chart.xAxis
                .showMaxMin(false)
                .tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)) });

            d3.select("#sources-chart-stacked svg")
                .datum(testData)
                .transition().duration(500).call(chart);
            PjaxApp.onResize(chart.update);

            chart.stacked.dispatch.on('areaClick.updateExamples', function(e) {
                setTimeout(function() {
                    lineChart.update();
                    pieChart.update();
                    barChart.update();

                    pieSelect.selectAll('.control').classed("disabled", function(d){
                        return d.disabled;
                    });
                }, 100);
            });

            stackedChart = chart;

            return chart;
        });

		 nv.addGraph(function() {
            var chart = nv.models.lineChart()
                .margin({top: 0, bottom: 65, left: 75, right: 0})
                .showLegend(false);
                //.color(keyColor);

            chart.yAxis
                .showMaxMin(false)
                .axisLabel('Plagas x Cama')
                .tickFormat(d3.format(',.f'));

            chart.xAxis
                .showMaxMin(false)
                //.axisLabel('Dias')
                //.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)) });
                .tickFormat(d3.format(',.r'));


            //just to make it look different
            //testData2[0].area = true;
            var myData = Formula2();

            d3.select('#sources-chart-line2 svg')
                //.datum(sinAndCos())
                .datum(myData)
                .transition().duration(500)
                .call(chart);

            PjaxApp.onResize(chart.update);
            lineChart = chart;

            return chart;
        });

        nv.addGraph(function() {
            var chart = nv.models.lineChart()
                .margin({top: 0, bottom: 65, left: 75, right: 0})
                .showLegend(false);
                //.color(keyColor);

            chart.yAxis
                .showMaxMin(false)
                .axisLabel('Flor')
                .tickFormat(d3.format(',f'));

            chart.xAxis
                .showMaxMin(false)
                //.axisLabel('Dias')
                //.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)) });
                .tickFormat(d3.format(',.r'));


            //just to make it look different
            //testData2[0].area = true;
            var myData = Formula3();

            d3.select('#sources-chart-line3 svg')
                //.datum(sinAndCos())
                .datum(myData)
                .transition().duration(500)
                .call(chart);

            PjaxApp.onResize(chart.update);
            lineChart = chart;

            return chart;
        });

        nv.addGraph(function() {
            var chart = nv.models.lineChart()
                .margin({top: 0, bottom: 65, left: 75, right: 0})
                .showLegend(false);
                //.color(keyColor);

            chart.yAxis
                .showMaxMin(false)
                .axisLabel('Trabajadores')
                .tickFormat(d3.format(',f'));

            chart.xAxis
                .showMaxMin(false)
                //.axisLabel('Dias')
                //.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)) });
                .tickFormat(d3.format(',.r'));


            //just to make it look different
            //testData2[0].area = true;
            var myData = Formula4();

            d3.select('#sources-chart-line4 svg')
                //.datum(sinAndCos())
                .datum(myData)
                .transition().duration(500)
                .call(chart);

            PjaxApp.onResize(chart.update);
            lineChart = chart;

            return chart;
        });

        function getData() {
            var arr = [],
                theDate = new Date(2012, 1, 1, 0, 0, 0, 0),
                previous = Math.floor(Math.random() * 100);
            for (var x = 0; x < 30; x++) {
                var newY = previous + Math.floor(Math.random() * 5 - 2);
                previous = newY;
                arr.push({x: new Date(theDate.getTime()), y: newY});
                theDate.setDate(theDate.getDate() + 1);
            }
            return arr;
        }

    }

    pageLoad();

    PjaxApp.onPageLoad(pageLoad);
});
dias=[31,29,31,30,31,30,31,31,30,31,30,31];
function saber(mes,anio){
ultimo=0;
if (mes==1){
fecha=new Date(anio,1,29)
vermes=fecha.getMonth();
if(vermes!=mes){ultimo=28}
}
if(ultimo==0){ultimo=dias[mes]}
return ultimo;
}
function Formula2() {
  var sin = [],sin2 = [],
      cos = [];
var base = 120;
var objetivo = 160;
var real = 142;
  var ultimidia = saber(11,2016);
  //alert(ultimidia);
  for (var i = 1; i <= ultimidia; i++) {
    var fechaaux = i+'/11/2016';
    //alert(fechaaux);
    sin.push({x: i, y: base*(i/4)});
    sin2.push({x: i, y: objetivo*(i/2)});
    cos.push({x: i, y: real*(i/2)});
  }

  //Line chart data should be sent as an array of series objects.
  return [
    {
      values: cos,
      key: 'Real',
      color: '#F8FC73',
      area: true
    },
    {
      values: sin2,
      key: 'Objetivo',
      color: '#1FD100'
    },
    {
      values: sin,
      key: 'Base',
      color: '#DE0813'
    }
  ];
}
function Formula3() {
  var sin = [],sin2 = [],
      cos = [];
var base = 1500;
var objetivo = 1800;
var real = 1192
  var ultimidia = saber(11,2016);
  //alert(ultimidia);
  for (var i = 1; i <= ultimidia; i++) {
    var fechaaux = i+'/11/2016';
    //alert(fechaaux);
    sin.push({x: i, y: base*(i/4)});
    sin2.push({x: i, y: objetivo*(i/2)});
    cos.push({x: i, y: real*(i/5)});
  }

  //Line chart data should be sent as an array of series objects.
  return [
    {
      values: cos,
      key: 'Real',
      color: '#F8FC73',
      area: true
    },
    {
      values: sin2,
      key: 'Objetivo',
      color: '#1FD100'
    },
    {
      values: sin,
      key: 'Base',
      color: '#DE0813'
    }
  ];
}
function Formula4() {
  var sin = [],sin2 = [],
      cos = [];
var base = 0.50;
var objetivo = 2.00;
var real = 1.22
  var ultimidia = saber(11,2016);
  //alert(ultimidia);
  for (var i = 1; i <= ultimidia; i++) {
    var fechaaux = i+'/11/2016';
    //alert(fechaaux);
    sin.push({x: i, y: base*(i/4)});
    sin2.push({x: i, y: objetivo*(i/5)});
    cos.push({x: i, y: real*(i/4)});
  }

  //Line chart data should be sent as an array of series objects.
  return [
    {
      values: cos,
      key: 'Real',
      color: '#F8FC73',
      area: true
    },
    {
      values: sin2,
      key: 'Objetivo',
      color: '#1FD100'
    },
    {
      values: sin,
      key: 'Base',
      color: '#DE0813'
    }
  ];
}