/**
 * mapLayout.js
 * @author Congcong Huang
 * #date 2017-11-12
 */



//import L from 'leaflet'
//import 'leaflet-echarts'
//import '../../public/javascripts/echarts.source.js'
//import echarts from 'echarts'
//var echarts = require('echarts');
//import  {drag} from '../events/dragNode'
import L from "./map"
import {sortline} from "../processData/processData"
import {getWidth,getDisWidth} from "../calculate/calculateEdge"
import {getRadius} from "../calculate/calculateCircle"
import {getSegmentColor} from "../calculate/calculateColor"
import {makeParticles,makeParticle,getgridW,getgridH,getgrid,getValue,getNum,getDirection} from "../Animator/animator"
import {getCoverScale,getNormalize,getStrokeColor,getColorBySpeed,getSeg} from "../Animator/animatorCtrl"
import{getPathSegment,getCtrlPoint,getPath,getSplinePoints,getSegmentList,getTmpPoints,getMaxSpeed,cutPath,getInfo} from "../processTree/processTree"
import{maps} from "../init/mapVueInit"
import{getAngle} from "../directionCluster/directionFunction"
import {getGridID,parseFormatGID} from "./process"
import HeatmapOverlay from "heatmap.js/plugins/leaflet-heatmap/leaflet-heatmap.js"
import {getODTripFlow} from "../services/ODMap"
import {getDotsCluster} from "../services/dotsCluster"
import {getFamousEnterprise} from "../services/famousEnterprise"
class mapview{
    constructor(id,svg) {
        let self = this;
        this.mapid = id;
        this.ddnodeLayer = null;
        this.node = null;
        this.latLngNodes = [];
        if(svg == "svg"){
            this.map = new L.map(id,{
                zoomControl:false,
            }).setView([39.9, 116.37], 11);
            L.svg({clickable:true}).addTo(self.map);

        }
        else{
            this.map = new L.map(id,{

                zoomControl:false,
                renderer: L.canvas()
            }).setView([39.9, 116.3], 11);
            L.canvas({clickable:true}).addTo(self.map)

        }

        this.baseLayers = {
            'normal': L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox.light',
                accessToken: 'pk.eyJ1IjoiaGNjMjI2IiwiYSI6ImNqOTlucndyYTB2OWMycXFtOTJyYnR3eTIifQ.yHWmhPWtxqseKfBZfpRvWA'
            }),
            'dark': L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox.dark',
                accessToken: 'pk.eyJ1IjoiaGNjMjI2IiwiYSI6ImNqOTlucndyYTB2OWMycXFtOTJyYnR3eTIifQ.yHWmhPWtxqseKfBZfpRvWA'
            }),
            "高德地图": L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
                subdomains: "1234"
            }),
            '高德影像': L.layerGroup([L.tileLayer('http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
                subdomains: "1234"
            }), L.tileLayer('http://t{s}.tianditu.cn/DataServer?T=cta_w&X={x}&Y={y}&L={z}', {
                subdomains: "1234"
            })]),
            'GeoQ灰色底图': L.tileLayer('http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}').addTo(self.map)
        };
        /*this.control = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.light',
            zoomControl:false,
            accessToken: 'pk.eyJ1IjoiaGNjMjI2IiwiYSI6ImNqOTlucndyYTB2OWMycXFtOTJyYnR3eTIifQ.yHWmhPWtxqseKfBZfpRvWA'
        }).addTo(self.map);*/

        this.zoomControl = L.control.zoom({
            position:'bottomright'
        });
        this.allLatLngNodes = [];
        this.maxStepLen = 0;
        self.map.addControl(this.zoomControl);
        this.addSelectLayer();
        this.layercontrol = L.control.layers(self.baseLayers).addTo(self.map);

        //var overlay;
       /* this.overlay = new L.echartsLayer(self.map, echarts);
        //console.log(overlay);
        var chartsContainer=this.overlay.getEchartsContainer();
        //console.log(chartsContainer);

        this.myChart=this.overlay.initECharts(chartsContainer);*/
    }
    /*latLngToLayerPoint(x){
        this.map.latLngToLayerPoint(x);
    }
*/
    drawBoundary(data){
        let self = this;
        L.geoJSON(data,{
            style:function (feature) {
                return {color:'red',
                    weight:1,
                    fillColor:'grey'
                };
            }
        }).addTo(self.map);
    }
        //$.getJSON('/data/beijingBoundary.json',function (data) {
            //  boundaryDrawing(data);


    //using leaflet-echarts
   /* drawMigration(dt,lines,lines1){
        //console.log(datasets)
        console.log(dt.nodes)
console.log(lines);
console.log(lines1);
        let self = this;
       // this.datasets = datasets;
        //console.log(self.map);

        //console.log(myChart);

        window.onresize = this.myChart.onresize;


        var option = {
            color: ['gold','aqua','lime'],
            title : {
                //text: '模拟迁徙',
                //subtext:'数据纯属虚构',
                x:'center',
                textStyle : {
                    color: '#fff'
                }
            },
            tooltip : {
                trigger: 'item',
                formatter: '{b}'
            },
            legend: {
                orient: 'vertical',
                x:'left',
                data:['in', 'out'],
                selectedMode: 'single',
                selected:{
                    'out' : false
                },
                textStyle : {
                    color: '#fff'
                }
            },
            toolbox: {
                show : true,
                orient : 'vertical',
                x: 'right',
                y: 'center',
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            dataRange: {
                min : 0,
                max : 10,
                calculable : true,
                color: ['#ff3333', 'orange', 'yellow','lime','#8d9eeb'],
                textStyle:{
                    color:'#fff'
                }
            },
            series : [
                {
                    name: "in",
                    type: 'map',
                    mapType: 'none',
                    data: [],
                    markLine: {
                        smooth: true,
                        effect: {
                            show: true,
                            scaleSize: 1,
                            period: 30,
                            color: "#fff",
                            shadowBlur: 10
                        },
                        itemStyle: {
                            normal: {
                                borderWidth:1,
                                lineStyle: {
                                    type: 'solid',
                                    shadowBlur: 10
                                }
                            }
                        },
                        data: []
                    },
                    markPoint: {
                        symbol: 'emptyCircle',
                        symbolSize: function (v) {
                            return 2 + v / 10
                        },
                        effect: {
                            show: true,
                            shadowBlur: 0
                        },
                        itemStyle: {
                            normal: {
                                label: {show: false}
                            },
                            emphasis: {
                                label: {
                                    position: 'top'
                                }
                            }
                        },
                        data: []
                    },
                    geoCoord: {}
                },
                {
                    name: "out",
                    type: 'map',
                    mapType: 'none',
                    data: [],
                    markLine: {
                        smooth: true,
                        effect: {
                            show: true,
                            scaleSize: 1,
                            period: 30,
                            color: "#fff",
                            shadowBlur: 10
                        },
                        itemStyle: {
                            normal: {
                                borderWidth:1,
                                lineStyle: {
                                    type: 'solid',
                                    shadowBlur: 10
                                }
                            }
                        },
                        data: []
                    },
                    markPoint: {
                        symbol: 'emptyCircle',
                        symbolSize: function (v) {
                            return 2 + v / 10
                        },
                        effect: {
                            show: true,
                            shadowBlur: 0
                        },
                        itemStyle: {
                            normal: {
                                label: {show: false}
                            },
                            emphasis: {
                                label: {
                                    position: 'top'
                                }
                            }
                        },
                        data: []
                    },
                    geoCoord: {}
                }
            ]
        };

        var dt_len = dt.nodes.length;
        var nodes = dt.nodes;
        for(var i = 0; i<dt_len; i++){
            //var geoCoords = {}
            var id = nodes[i].id.toString()
            console.log(id);
            option.series[0].geoCoord[id] = [nodes[i].x,nodes[i].y]
            option.series[1].geoCoord[id] = [nodes[i].x,nodes[i].y]
        }
        console.log(option.series[0].geoCoord[0])
        //option.series[0].goeCoord = geoCoords;
        console.log(option.series[0].geoCoord)
        option.series[0].markPoint.data = dt.nodes.map(function (t) {
            //var coor = [t.x, t.y]
            //console.log(coor);

                return {
                    name: t.id.toString(),
                    value:t.stay_record_num/4000
                }
        });
        option.series[1].markPoint.data = dt.nodes.map(function (t) {
            //var coor = [t.x, t.y]
            //console.log(coor);

            return {
                name: t.id.toString(),
                value:t.stay_record_num/4000
            }
        });
        console.log(option.series[0].markPoint.data);
        option.series[0].markLine.data = lines.map(function (line) {
            //var start = [line.from_x,line.from_y];
            //var end = [line.to_x,line.to_y];
            //console.log(start);
            //console.log(end);
            /!*return [{
                geoCoord:start
            }, {
                geoCoord: end
            }]*!/
                return [{
                        name:line.from_nid.toString()
                        },
                        {
                            name:line.to_nid.toString(), value:line.travel_record_num/2
                        }]
        })
        option.series[1].markLine.data = lines1.map(function (line) {
            return [{
                name:line.from_nid.toString()
            },
                {
                    name:line.to_nid.toString(), value:line.travel_record_num/2
                }]
        })
        console.log(option.series[0].markLine.data);
        console.log(option.series[1].markLine.data);
        this.overlay.setOption(option,true);
    }
*/


    //using leaflet circle and leaflet-curve
   /* drawMigration(dt,lines,lines1){
        let self = this;
        var nodes = dt.nodes;
        $.each(nodes,function (i,node) {
            //console.log(item.c);
            L.circle([node.y,node.x], node.stay_device_num/5, {
                color: '#8d9eeb',
                fillColor: '#1750a7',
                fillOpacity: 0.5
            }).addTo(self.map).bindPopup(node.stay_device_num.toString());
        });
        $.each(lines,function (i,item) {
            // console.log(item.c);
            let qlng = (item.from_x+item.to_x)/2+(item.from_y-item.to_y)/6;
            let qlat = (item.from_y+item.to_y)/2+(item.to_x-item.from_x)/6;
            L.curve([
                'M',[item.from_y,item.from_x],
                'Q',[qlat,qlng],[item.to_y,item.to_x]
            ], {color:'#6da6fd',
                weight:item.travel_device_num,
                id:item.eid
            }).addTo(self.map).bindPopup(item.travel_device_num.toString());
        });

    }*/


    //using d3 draw forcelayout fail!
    /*drawMigration(graph,lines,lines1){

        let self = this;
        var initZoom = self.map.getZoom();
        let svgid = `graphSVG`
        //let svg = d3.select("#"+self.map.id).select("svg");
        //console.log(svg)
          //let   g= svg.append("g").attr("class", "leaflet-zoom-hide");
       let g = d3.select(self.map.getPanes().overlayPane).select("svg").select("g");
            //g = svg.append("g").attr("class", "leaflet-zoom-hide");

// console.log('vmin', vmin, 'vmax', vmax);
        function projectPoint(x, y) {
            let self = this;
            let point = self.map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }
        let transform = d3.geoTransform({point: self.projectPoint}),
            path = d3.geoPath().projection(transform);

        var simulation = d3.forceSimulation()
            .force("link",d3.forceLink().id(function (d) {
                return d.id;
            }))
            .force("charge",d3.forceManyBody())
            .force("center",d3.forceCenter());

            simulation.nodes(graph.nodes)
                .on("tick", ticked);
            let len = lines.length;
            graph.links=[];
            for(var i = 0;i <len; i++){
                let link = {};
                link.source = lines[i].from_nid;
                link.target = lines[i].to_nid;
                graph.links.push(link);
            }
            console.log(graph.links);
            simulation.force("link")
                .links(graph.links);


            var node = g.selectAll("circle")
                .data(graph.nodes)
                .enter().append("circle")
                /!*.attr("cx",function (d) {
                    console.log(d.x);
                    return self.map.latLngToLayerPoint(new L.LatLng(d.y, d.x)).x;
                })
                .attr("cy",function (d) {
                    console.log(d.y);
                    return self.map.latLngToLayerPoint(new L.LatLng(d.y, d.x)).y;
                })
                .attr("r",function (d) {
                    return d.stay_record_num/500/initZoom;
                })*!/
                .attr("fill",function (d) {
                    return "blue";
                });

           var link=g.selectAll("line")
                .data(graph.links)
                .enter().append("line")
                .attr("stroke","red");

        self.map.on("viewreset", reset);
        self.map.on("zoomstart",function(){
                g.style('display','none');
            });

        self.map.on("zoomend",function() {
                reset();
            });
            reset();

            function reset() {
                console.log("reset!")
                var curZoom = self.map.getZoom();
                var newmap = self.map;
                g.style('display','block');
                node.attr("transform",function (d) {

                    var pos = newmap.latLngToLayerPoint(new L.LatLng(d.y,d.x));
                    console.log(pos);
                    return "translate("+pos.x+","+pos.y+")";
                    })
               /!*node.attr("cx",function (d) {
                   return self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x)).x
               })
                   .attr("cy",function (d) {
                       return self.map.latLngToLayerPoint(new L.LatLng(d.y, d.x)).y
                   })*!/
                    .attr("r",function (d) {
                        return curZoom*d.stay_record_num/500/initZoom;
                    });

                link.attr("x1",function (d) {
                    return self.map.latLngToLayerPoint(new L.LatLng(d.source.y, d.source.x)).x;
                })
                    .attr("y1",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.source.y, d.source.x)).y;
                    })
                    .attr("x2",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.target.y, d.target.x)).x;
                    })
                    .attr("y2",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.target.y, d.target.x)).y;
                    });

            }


            function ticked() {
                /!* link
                     .attr("x1",function (d) {
                     return d.source.x;
                 })
                     .attr("y1",function (d) {
                         return d.source.y;
                     })
                     .attr("x2",function (d) {
                         return d.target.x;
                     })
                     .attr("y2",function (d) {
                         return d.target.y;
                 });

                 node.attr("cx",function (d) {
                     return d.x;
                 })
                     .attr("cy",function (d) {
                         return d.y;
                     })*!/
            }
    }*/


    //draw line
  /*  drawMigration1(graph,lines,lines1){

        let self = this;
        var initZoom = self.map.getZoom();
        let svgid = `graphSVG`
        //let svg = d3.select("#"+self.map.id).select("svg");
        //console.log(svg)
        //let   g= svg.append("g").attr("class", "leaflet-zoom-hide");
        d3.select(self.map.getPanes().overlayPane).select("svg").selectAll("g").selectAll("line").remove();
        let g = d3.select(self.map.getPanes().overlayPane).select("svg").select("g");
        //g = svg.append("g").attr("class", "leaflet-zoom-hide");


        function projectPoint(x, y) {
            let self = this;
            let point = self.map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }
        let transform = d3.geoTransform({point: self.projectPoint}),
            path = d3.geoPath().projection(transform);
        var range = d3.extent(lines,function (d) {
            return d.travel_device_num;
        })
        var min = range[0];
        var max = range[1];
        console.log(range)


      /!*  var node = g.selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            /!*.attr("cx",function (d) {
                console.log(d.x);
                return self.map.latLngToLayerPoint(new L.LatLng(d.y, d.x)).x;
            })
            .attr("cy",function (d) {
                console.log(d.y);
                return self.map.latLngToLayerPoint(new L.LatLng(d.y, d.x)).y;
            })
            .attr("r",function (d) {
                return d.stay_record_num/800/initZoom;
            })*!/
            .attr("fill",function (d) {
                return "blue";
            });*!/

        var link=g.selectAll("line")
            .data(lines)
            .enter().append("line")
            .attr("stroke","white")
            .attr("stroke-width",function(d){
               /!* console.log(d.travel_device_num)
                return getWidth(d.travel_device_num,min,max)*!/
               return 1;
            })
            /!*.attr("x1",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
            })
            .attr("y1",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
            })
            .attr("x2",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).x;
            })
            .attr("y2",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).y;
            });*!/

        self.map.on("viewreset", reset);
        self.map.on("zoomstart",function(){
            g.style('display','none');
        });

        self.map.on("zoomend",function() {
            reset();
        });
        reset();

        function reset() {
            console.log("reset!")
            var curZoom = self.map.getZoom();
            var newmap = self.map;
            g.style('display','block');
          /!*  node.attr("transform",function (d) {

                var pos = newmap.latLngToLayerPoint(new L.LatLng(d.y,d.x));
                console.log(pos);
                return "translate("+pos.x+","+pos.y+")";
            })
            /!*node.attr("cx",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x)).x
            })
                .attr("cy",function (d) {
                    return self.map.latLngToLayerPoint(new L.LatLng(d.y, d.x)).y
                })*!/
                .attr("r",function (d) {
                    return curZoom*d.stay_record_num/800/initZoom;
                })
                .style("opacity","0.3");*!/

            link.transition()
                .duration(50)
                .on("start",slide)

                /!*.attr("x1",function (d) {
                    return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                })
                .attr("y1",function (d) {
                    return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                })
                .attr("x2",function (d) {
                    return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).x;
                })
                .attr("y2",function (d) {
                    return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).y;
                });*!/

            function slide() {
                d3.active(this)
                    .attr("x1",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                    })
                    .attr("y1",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                    })
                    .attr("x2",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                    })
                    .attr("y2",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                    })
                    .transition()
                    .duration(8000)
                    .attr("x1",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                    })
                    .attr("y1",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                    })
                    .attr("x2",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).x;
                    })
                    .attr("y2",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).y;
                    })
                    .transition()
                    .duration(1000)
                    .on("start",slide)
            }

        }




        function ticked() {
            /!* link
                 .attr("x1",function (d) {
                 return d.source.x;
             })
                 .attr("y1",function (d) {
                     return d.source.y;
                 })
                 .attr("x2",function (d) {
                     return d.target.x;
                 })
                 .attr("y2",function (d) {
                     return d.target.y;
             });

             node.attr("cx",function (d) {
                 return d.x;
             })
                 .attr("cy",function (d) {
                     return d.y;
                 })*!/
        }
    }*/


    //draw curve
    /*drawMigration(graph,lines,lines1){
        let self = this;
        if(this.ddnodeLayer!= null){
            this.ddnodeLayer.remove();
        }

        var initZoom = self.map.getZoom();
        console.log(self.map);
        let svgid = `graphSVG`
        //let svg = d3.select("#"+self.map.id).select("svg");
        //console.log(svg)
        //let   g= svg.append("g").attr("class", "leaflet-zoom-hide");
        let g = d3.select(self.map.getPanes().overlayPane).select("svg").select("g");
        //g = svg.append("g").attr("class", "leaflet-zoom-hide");
        console.log(g)
        let nodeG = g.append("g").attr("class","node-layer");
        let edgeG = g.append("g").attr("class","edge-in-layer");
        let edgeG1 = g.append("g").attr("class","edge-out-layer").style("display","none");

        let arrowG = g.append("g").attr("class","arrow-in-layer");
        let arrowG1 = g.append("g").attr("class","arrow-out-layer").style("display","none");

console.log(nodeG)

        g.selectAll(".node").remove();
        g.selectAll(".edge").remove();
        g.selectAll(".arrow").remove();
        function pathData(point1,point2) {
            var x1,y1,x2,y2,r1,r2,dis;
            var xc,yc;
            x1 = point1.x;
            y1 = point1.y;
            x2 = point2.x;
            y2 = point2.y;
            xc=(x1+x2)/2+(y1-y2)/8;
            yc=(y1+y2)/2+(x2-x1)/8;
            return [
                'M', x1, ' ', y1,
                'Q', xc, ' ', yc,' ',x2, ' ', y2
            ].join('');
        }
        function firstpathData(point1,point2) {
            var x1,y1,x2,y2,r1,r2,dis;
            var xc,yc;
            x1 = point1.x;
            y1 = point1.y;
            x2 = point2.x;
            y2 = point2.y;
            xc=(x1+x2)/2+(y1-y2)/8;
            yc=(y1+y2)/2+(x2-x1)/8;
            return [
                'M', x1, ' ', y1,
                'L', xc, ' ', yc
            ].join('');
        }
        function qBerzier(p0,p1,p2,t){
            var x = (1 - t) * (1 - t) * p0.x + 2 * t * (1 - t) * p1.x + t * t * p2.x;
            var y = (1 - t) * (1 - t) * p0.y + 2 * t * (1 - t) * p1.y + t * t * p2.y;
            var midpoint={
                x:x,
                y:y
            }
            return midpoint;
        }
        function arrowData(point1,point2) {
            var slopy,cosy,siny,x1,x2,y1,y2;
            var Par=10.0;
            x1 = point1.x;
            y1 = point1.y;
            x2 = point2.x;
            y2 = point2.y;
            var xc=(x1+x2)/2+(y1-y2)/8;
            var yc=(y1+y2)/2+(x2-x1)/8;
            var p1={x:xc,y:yc};
            var midPoint=qBerzier(point1,p1,point2,0.5)
            slopy=Math.atan2((y1-y2),(x1-x2));
            cosy=Math.cos(slopy);
            siny=Math.sin(slopy);
            return [
                'M', midPoint.x, ' ', midPoint.y,
                'L', (Number(midPoint.x)+Number(Par*cosy-(Par/2.0*siny))*initZoom/10), ' ', Number(midPoint.y)+Number(Par*siny+(Par/2.0*cosy))*initZoom/10,
                'M', Number(midPoint.x)+Number(Par*cosy+Par/2.0*siny)*initZoom/10, ' ', Number(midPoint.y)-Number(Par/2.0*cosy-Par*siny)*initZoom/10,
                'L', midPoint.x, ' ', midPoint.y,
            ].join('');
        }
        function projectPoint(x, y) {
            let self = this;
            let point = self.map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }
        function getColor(h,s,l) {
            var colors=[204,204];
            //var colors=204;
            var sRange=[1,0];
            var lRange=[0.8,0.3];
            var sScale=d3.scaleLinear()
                .domain([0,1])
                .range(sRange);
            var lScale=d3.scaleLinear()
                .domain([0,1])
                .range(lRange);
            var value='hsl('+colors[h]+','+(sScale(s)*100)+'%,'+(lScale(l)*100)+'%)';
            return value
        }
        function getRadius(num,min,max) {
            return (num-min)/(max-min)*10 +2;
        }
        let transform = d3.geoTransform({point: self.projectPoint}),
            path = d3.geoPath().projection(transform);
        var nums = []
        graph.nodes.forEach(function (d) {
            nums.push(d.stay_device_num);
        })
        var min = d3.min(nums);
        var max = d3.max(nums)

        let node = nodeG.selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("fill",function (d) {
                if(d.stay_device_num <= 0){
                    return 'none';
                }
                /!*return getColor(1,0.5,(d.stay_device_num-min)/(max-min));*!/
                return "steelblue"
            })
            .attr("class","node")
            .attr("id",function (d) {
                return "node_"+d.id
            });

        let link1=edgeG1.selectAll("path")
            .data(lines1)
            .enter().append("path")
            .attr("stroke","black")
            .style("fill",'none')
            .attr("class","edge")
            .attr("opacity","0.5");

        let link=edgeG.selectAll("path")
            .data(lines)
            .enter().append("path")
            .attr("stroke","red")
            .style("fill",'none')
            .attr("class","edge")
            .attr("opacity","0.5")
            .attr("id",function (d) {
                return "link_"+d.eid;
            });

        let arrow1 = arrowG1.selectAll("path")
            .data(lines1)
            .enter()
            .append("path")
            .attr("class","arrow")
            .style("stroke","black")
            .style("fill","none")
            .style("opacity","0.5");

        let arrow = arrowG.selectAll("path")
            .data(lines)
            .enter()
            .append("path")
            .attr("class","arrow")
            .style("stroke","red")
            .style("fill","none")
            .style("opacity","0.5")
            .attr("id",function (d) {
                return "arrow_"+d.eid;
            });

        self.map.on("viewreset", reset);
        self.map.on("zoomstart",function(){
            g.style('display','none');
        });

        self.map.on("zoomend",function() {
            reset();
        });
        reset();

        function reset() {
            console.log("reset!")
            var curZoom = self.map.getZoom();
            g.style('display','block');
            node.attr("transform",function (d) {

                var pos = self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x));

                return "translate("+pos.x+","+pos.y+")";
                })
                .attr("r",function (d) {
                    /!*return curZoom*d.stay_record_num/800/initZoom;*!/
                    if(d.stay_device_num <= 0 ){
                        return 0;
                    }
                    var r = getRadius(d.stay_device_num,min,max)
                    return curZoom*r/initZoom;
                })
                .style("opacity","0.8");

            link1.attr("d",function (d) {
                //console.log(d.from_nid)
                var point1 =  self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x));
                var point2 =  self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x))
                //console.log(point2);
                return pathData(point1, point2);
            })
                .attr("stroke-width",function(d){
                    if(d.travel_device_num<=0){
                        return 0;
                    }
                    if(curZoom*d.travel_device_num/initZoom>10)
                        return 10;
                    return curZoom*d.travel_device_num/initZoom;
                })



            arrow1.attr("d",function (d) {
                var point1 =  self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x));
                var point2 =  self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x))

                return arrowData(point1, point2);
           })
                .attr("stroke-width",function (d) {
                    if(d.travel_device_num<=0){
                        return 0;
                    }
                    if(curZoom*d.travel_device_num/initZoom>10)
                        return 5;
                    return curZoom*d.travel_device_num/initZoom/2;
                });

            link.attr("d",function (d) {
                var point1 =  self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x));
                var point2 =  self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x))
                //console.log(point1)
                return pathData(point1, point2);
                })
                .attr("stroke-width",function(d){
                    if(d.travel_device_num<=0){
                        return 0;
                    }
                    if(curZoom*d.travel_device_num/initZoom>10)
                        return 10;
                return curZoom*d.travel_device_num/initZoom;
                });

                //.attr("marker-end","url(#arrow)");
            arrow.attr("d",function (d) {
                var point1 =  self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x));
                var point2 =  self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x))
                return arrowData(point1, point2);
            })
                .attr("stroke-width",function (d) {
                    if(d.travel_device_num<=0){
                        return 0;
                    }
                    if(curZoom*d.travel_device_num/initZoom>10)
                        return 5;
                    return curZoom*d.travel_device_num/initZoom/2;
                });
        }

        this.nodeLayer = nodeG;
        this.edgeInLayer = edgeG;
        this.edgeOutLayer = edgeG1;
        this.arrowInLayer = arrowG;
        this.arrowOutLayer = arrowG1;
        this.node = node;
        this.link = link;
        this.arrow = arrow;
        this.link1 = link1;
        this.arrow1 = arrow1;
        function ticked() {
        }
    }*/


// using wind map and canvas
   /* drawMigration(graph,lines,lines1){

        let self = this;
        var initZoom = self.map.getZoom();
        let svgid = `graphSVG`
        //d3.select(self.map.getPanes().overlayPane).select("canvas");
        //let canvas = d3.select(self.map.getPanes().overlayPane).select("canvas");
        let canvas = d3.select(self.map.getPanes().overlayPane).select("canvas");
        console.log(canvas)
        var ctx = canvas.node().getContext("2d");
        //g = svg.append("g").attr("class", "leaflet-zoom-hide");


        function projectPoint(x, y) {
            let self = this;
            let point = self.map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }
        let transform = d3.geoTransform({point: self.projectPoint}),
            path = d3.geoPath().projection(transform);
        var range = d3.extent(lines,function (d) {
            return d.travel_device_num;
        })
        var min = range[0];
        var max = range[1];
        console.log(range)
        function qBerzier(p0,p1,p2,t){
            var x = (1 - t) * (1 - t) * p0.x + 2 * t * (1 - t) * p1.x + t * t * p2.x;
            var y = (1 - t) * (1 - t) * p0.y + 2 * t * (1 - t) * p1.y + t * t * p2.y;
            return [x,y];
        }

        //let animator = new Animator(null)
        let particles = makeParticles(2000,self.map,canvas);
        console.log(particles);
        let w = getgridW(0.05);
        let h = getgridH(0.05);
        console.log(w)
        console.log(h)
        var field = [];
        var Vector = function(x, y,num) {
            this.x = x;
            this.y = y;
            this.num = num
        }
        for(var  i = 0;i<h;i++){
            field[i]=[];
            for(var j = 0;j<w;j++){
                var p = new Vector(0,0,0)
                for(var k =0;k<lines.length;k++){
                    p.x = 0;
                    p.y = 0;
                    p.num = 0;
                    if(lines[k].to_nid === i*w+j ){
                       console.log(i*w+j)
                        var frompoint = self.map.latLngToLayerPoint(new L.LatLng(lines[k].from_y, lines[k].from_x));
                        var topoint = self.map.latLngToLayerPoint(new L.LatLng(lines[k].to_y, lines[k].to_x));

                        /!*p.x = topoint.x - frompoint.x;
                        p.y = topoint.y - frompoint.y*!/
                        p.x = lines[k].to_x - lines[k].from_x;
                        p.y = lines[k].to_y - lines[k].from_y;
                        p.num = lines[k].travel_device_num;
                       /!* var p = [topoint.x - frompoint.x,topoint.y - frompoint.y]*!/
                        field[i][j] = p;
                        console.log(p)
                        console.log(field[i][j])
                        break;
                    }
                }
                if(p.x===0 && p.y === 0){
                   /!* console.log(j)*!/
                    field[i][j] = p;
                }

            }
        }
        console.log(field);
     /!*
        /!*var link=g.selectAll("line")
            .data(lines)
            .enter().append("line")
            .attr("stroke","white")
            .attr("stroke-width",function(d){
                console.log(d.travel_device_num)
                return getWidth(d.travel_device_num,min,max)
            })*!/
        /!*.attr("x1",function (d) {
            return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
        })
        .attr("y1",function (d) {
            return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
        })
        .attr("x2",function (d) {
            return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).x;
        })
        .attr("y2",function (d) {
            return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).y;
        });*!/

        /!*self.map.on("viewreset", reset);
        self.map.on("zoomstart",function(){
            canvas.style('display','none');
        });

        self.map.on("zoomend",function() {
            reset();
        });*!/
        var c = -1;
        self.map.on("moveend",function () {
            c = 0;
            loop(40);
        })
        /!*reset();*!/
        function loop(opt_millis){
            /!*if(c>150){
                return;
            }*!/
            var millis = opt_millis || 20;
            var self = this;
            function go() {
                var start = new Date();
                c = c+1;
                reset();
                var time = new Date() - start;
                setTimeout(go, Math.max(10, millis - time));
            }
            go();
           /!* c=c+1;
            reset();
            setTimeout(loop,10)*!/
        };
        loop(40);
        function reset() {
            console.log("reset!")
            var curZoom = self.map.getZoom();
            var newmap = self.map;
            canvas.style('display','block');
            var x0 = 115.4220;
            var y0 = 39.4570;
            var x1 = 117.5000;
            var y1 = 41.0500;
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
               if (p.age > 0 && p.x >= x0 && p.x < x1 && p.y >= y0 && p.y < y1 ) {
                    var a = getValue(p.x, p.y,field);
                    //console.log(num);
                    //console.log(a)
                    p.x +=  a.x/100;
                    p.y +=  a.y/100;
                    p.age--;
                   particles[i] = p;
                } else {
                    particles[i] = makeParticle(self.map,canvas);
                }
            }

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                if ( p.x < x0 || p.x > x1 || p.y < y0 && p.y > y1 ) {
                    p.age = -2;
                    continue;
                }
                var proj = self.map.latLngToLayerPoint(new L.LatLng(p.y, p.x));
               /!* if (proj.x < 0 || proj.y < 0 || proj.x > canvas.width || proj.y > canvas.height) {

                    p.age = -2;
                    continue;
                }*!/
                if (c===1) {
                    ctx.fillStyle =  "rgb(15,25,49)";
                } else {
                    ctx.fillStyle = "rgba(15,25,49,0.02)";
                }
                var num = getNum(p.x,p.y,field);
                if(num == 0){
                    p.age = -2;
                    continue;
                }
                if(num>0 && num <5){
                    ctx.strokeStyle = "#666666";
                }
                else if(num>=5 && num< 10){
                    ctx.strokeStyle = "#a0a0a0";
                }
               else if(num >=10 && num < 20){
                    ctx.strokeStyle = "#c4c4c4";
                }
               else if(num >= 20 && num < 30){
                    ctx.strokeStyle = "#dddddd";
                }
               else if(num>=30){
                    ctx.strokeStyle = "#ffffff";
                }
                if(p.oldY == proj.y && p.oldX == proj.x){
                   p.age = -2;
                }
                //console.log(ctx.strokeStyle)

                //var topoint = self.map.latLngToLayerPoint(new L.LatLng(lines[k].to_y, lines[k].to_x));
                /!*if (proj.x < 0 || proj.y < 0 || proj.x > w || proj.y > h) {
                    p.age = -2;
                }*!/
                if (p.oldX != -1) {
                    /!*var wind = get;
                    console.log(wind)
                    var s = wind.length() / this.maxLength;
                    console.log(s)
                    var c = 90 + Math.round(350 * s); // was 400
                    if (c > 255) {
                        c = 255;
                    }*!/

                    ctx.beginPath();
                    ctx.moveTo(proj.x, proj.y);
                    // g.strokeStyle = this.colors[255-c];
                    ctx.lineTo(p.oldX,  p.oldY);
                    /!*console.log(proj.x)
                    console.log(proj.y)
                    console.log(p.oldX)
                    console.log(p.oldY)*!/
                    ctx.stroke();
                }
                p.oldX = proj.x;
                p.oldY = proj.y;
            }

           /!* for(var i = 0; i<lines.length;i++){
                var points= [];
                var line = lines[i]
                var frompoint = self.map.latLngToLayerPoint(new L.LatLng(line.from_y, line.from_x));
                var topoint = self.map.latLngToLayerPoint(new L.LatLng(line.to_y, line.to_x));
                var contropoint = {}
                contropoint.x = (frompoint.x+topoint.x)/2+(frompoint.y-topoint.y)/8;
                contropoint.y =  (frompoint.y+topoint.y)/2+(topoint.x-frompoint.x)/8;
                for(var t = 0.00;t<= 1 ;t=t+0.01){
                    var point = [];
                    point = qBerzier(frompoint,contropoint,topoint,t);
                    points.push(point);
                }
                lines[i].points = points;
               // console.log(lines[i])
            }*!/

        /!*    for(var i = 0 ; i<lines.length;i++){
                //console.log(i)
                var line = lines[i];
                /!*var frompoint = self.map.latLngToLayerPoint(new L.LatLng(line.from_y, line.from_x));
                var topoint = self.map.latLngToLayerPoint(new L.LatLng(line.to_y, line.to_x));
                var old = frompoint;
                var p = topoint;
                if(c%2 === 1){
                   old.x = frompoint.x;
                   old.y = frompoint.y;
                   p.x = (frompoint.x+topoint.x)/2+(frompoint.y-topoint.y)/8;
                    p.y = (frompoint.y+topoint.y)/2+(topoint.x-frompoint.x)/8;
                }
                else {
                    old.x = (frompoint.x+topoint.x)/2+(frompoint.y-topoint.y)/8;
                    old.y = (frompoint.y+topoint.y)/2+(topoint.x-frompoint.x)/8;
                    p.x = topoint.x;
                    p.y = topoint.y;
                }*!/
                ctx.strokeStyle = "white"
                ctx.lineWidth = getWidth(line.travel_device_num,min,max)
                ctx.beginPath();
                ctx.moveTo(lines[i].points[c][0],lines[i].points[c][1]);
                ctx.lineTo(lines[i].points[c+1][0],lines[i].points[c+1][1]);
               /!* ctx.moveTo(lines[i].points[c+1][0],lines[i].points[c+1][1]);
                ctx.lineTo(lines[i].points[c][0],lines[i].points[c][1]);
                *!/
               ctx.stroke()
            }*!/
            /!*  node.attr("transform",function (d) {

                  var pos = newmap.latLngToLayerPoint(new L.LatLng(d.y,d.x));
                  console.log(pos);
                  return "translate("+pos.x+","+pos.y+")";
              })
              /!*node.attr("cx",function (d) {
                  return self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x)).x
              })
                  .attr("cy",function (d) {
                      return self.map.latLngToLayerPoint(new L.LatLng(d.y, d.x)).y
                  })*!/
                  .attr("r",function (d) {
                      return curZoom*d.stay_record_num/800/initZoom;
                  })
                  .style("opacity","0.3");*!/

           /!* link.transition()
                .duration(50)
                .on("start",slide)*!/

            /!*.attr("x1",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
            })
            .attr("y1",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
            })
            .attr("x2",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).x;
            })
            .attr("y2",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).y;
            });*!/

           /!* function slide() {
                d3.active(this)
                    .attr("x1",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                    })
                    .attr("y1",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                    })
                    .attr("x2",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                    })
                    .attr("y2",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                    })
                    .transition()
                    .duration(8000)
                    .attr("x1",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                    })
                    .attr("y1",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                    })
                    .attr("x2",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).x;
                    })
                    .attr("y2",function (d) {
                        return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).y;
                    })
                    .transition()
                    .duration(1000)
                    .on("start",slide)
            }*!/

        }




        function ticked() {
            /!* link
                 .attr("x1",function (d) {
                 return d.source.x;
             })
                 .attr("y1",function (d) {
                     return d.source.y;
                 })
                 .attr("x2",function (d) {
                     return d.target.x;
                 })
                 .attr("y2",function (d) {
                     return d.target.y;
             });

             node.attr("cx",function (d) {
                 return d.x;
             })
                 .attr("cy",function (d) {
                     return d.y;
                 })*!/
        }
    }*/


    //using wind map and real data
     drawMigration(dt){
        var lines = dt.edges;
        console.log(lines)
         let self = this;
         var initZoom = self.map.getZoom();
         let svgid = `graphSVG`
         //d3.select(self.map.getPanes().overlayPane).select("canvas");
         //let canvas = d3.select(self.map.getPanes().overlayPane).select("canvas");
         let canvas = d3.select(self.map.getPanes().overlayPane).select("canvas");
         console.log(canvas)
         var ctx = canvas.node().getContext("2d");
         //g = svg.append("g").attr("class", "leaflet-zoom-hide");


         function projectPoint(x, y) {
             let self = this;
             let point = self.map.latLngToLayerPoint(new L.LatLng(y, x));
             this.stream.point(point.x, point.y);
         }
         let transform = d3.geoTransform({point: self.projectPoint}),
             path = d3.geoPath().projection(transform);
         var range = d3.extent(lines,function (d) {
             return d.num;
         })
         var min = range[0];
         var max = range[1];
         console.log(range)
         function qBerzier(p0,p1,p2,t){
             var x = (1 - t) * (1 - t) * p0.x + 2 * t * (1 - t) * p1.x + t * t * p2.x;
             var y = (1 - t) * (1 - t) * p0.y + 2 * t * (1 - t) * p1.y + t * t * p2.y;
             return [x,y];
         }

         //let animator = new Animator(null)
         var particles = makeParticles(500,self.map,canvas,lines);
         //var tmp = particles;
         console.log(particles);
         let w = getgridW(0.005);
         let h = getgridH(0.005);
         console.log(w)
         console.log(h)
         var field = [];
         var Vector = function(x, y,num) {
             this.x = x;
             this.y = y;
             this.num = num
         }
        /* for(var  i = 0;i<h;i++){
             field[i]=[];
             for(var j = 0;j<w;j++){
                 var p = new Vector(0,0,0)
                 for(var k =0;k<lines.length;k++){
                     p.x = 0;
                     p.y = 0;
                     p.num = 0;
                     if(lines[k].to_nid === i*w+j ){
                        console.log(i*w+j)
                         var frompoint = self.map.latLngToLayerPoint(new L.LatLng(lines[k].from_y, lines[k].from_x));
                         var topoint = self.map.latLngToLayerPoint(new L.LatLng(lines[k].to_y, lines[k].to_x));

                         /!*p.x = topoint.x - frompoint.x;
                         p.y = topoint.y - frompoint.y*!/
                         p.x = lines[k].to_x - lines[k].from_x;
                         p.y = lines[k].to_y - lines[k].from_y;
                         p.num = lines[k].travel_device_num;
                        /!* var p = [topoint.x - frompoint.x,topoint.y - frompoint.y]*!/
                         field[i][j] = p;
                         console.log(p)
                         console.log(field[i][j])
                         break;
                     }
                 }
                 if(p.x===0 && p.y === 0){
                    /!* console.log(j)*!/
                     field[i][j] = p;
                 }

             }
         }
         console.log(field);*/

         /*self.map.on("viewreset", reset);
         self.map.on("zoomstart",function(){
             canvas.style('display','none');
         });

         self.map.on("zoomend",function() {
             reset();
         });*/
         var c = -1;
         var lastX = 0;
         var lastY = 0;
         var a = {};
         self.map.on("moveend",function () {
             c = -1;
             particles = makeParticles(500,self.map,canvas,lines);
             lastX = 0;
             lastY = 0;
             console.log(particles);
             loop();
         })

         /*reset();*/
         function loop(){
             /*if(c>150){
                 return;
             }*/
             c=c+1;
             reset();
             setTimeout(loop,1000)
         };
         loop();

         function reset() {
            console.log("reset!")
             var curZoom = self.map.getZoom();
             var newmap = self.map;
             canvas.style('display','block');
             var x0 = 115.4220;
             var y0 = 39.4570;
             var x1 = 117.5000;
             var y1 = 41.0500;
             //console.log(c)

             for (var i = 0; i < particles.length; i++) {
                 var p = particles[i];
                 //console.log(p)
                if (p.age > 0 && p.x >= x0 && p.x < x1 && p.y >= y0 && p.y < y1 ) {

                    if(c === 0){

                        /*a.x = p.dx;
                        a.y = p.dy;
                        console.log(a)
                        var before = getgrid(p.x,p.y)
                        p.x +=  a.x*0.0025*1.0001;
                        p.y +=  a.y*0.0025*1.0001;
                        var after = getgrid(p.x,p.y)
                        console.log(before)
                        console.log(after)
                        p.age--;
                        console.log(p)
                        particles[i] = p;*/
                        p.lastX = p.dx;
                        p.lastY = p.dy;
                        particles[i] = p;
                    }
                    else if(c >= 1){
                        /*console.log(p)
                        console.log(lastX)
                        console.log(lastY)*/
                        if(c%5 === 1){
                            a = getDirection(p,p.lastX,p.lastY,lines);
                            p.a = a;
                            //console.log(a);
                        }
                        //a = getDirection(p,lastX,lastY,lines);
                        p.x = p.x + p.a.x/5;
                        p.y =p.y + p.a.y/5;
                        p.age--;
                        p.num = p.a.num;
                        p.lastX = p.a.dx;
                        p.lastY = p.a.dy;
                        particles[i] = p;

                    }

                 } else {
                     //particles[i] = makeParticle(self.map,canvas);
                 }
             }

             for (var i = 0; i < particles.length; i++) {
                 var p = particles[i];
                 if ( p.x < x0 || p.x > x1 || p.y < y0 && p.y > y1 ) {
                     p.age = -2;
                     continue;
                 }
                 //console.log(p)
                 var proj = self.map.latLngToLayerPoint(new L.LatLng(p.y, p.x));
                /* if (proj.x < 0 || proj.y < 0 || proj.x > canvas.width || proj.y > canvas.height) {

                     p.age = -2;
                     continue;
                 }*/
                 if (c===0) {
                     ctx.fillStyle =  "rgb(15,25,49)";
                 } else {
                     ctx.fillStyle = "rgba(15,25,49,0.02)";
                 }
                 var num = p.num;
                 if(num == 0){
                     p.age = -2;
                     continue;
                 }
                 if(num>0 && num <5){
                     ctx.strokeStyle = "#666666";
                 }
                 else if(num>=5 && num< 10){
                     ctx.strokeStyle = "#a0a0a0";
                 }
                else if(num >=10 && num < 30){
                     ctx.strokeStyle = "#c4c4c4";
                 }
                else if(num >= 30 && num < 50){
                     ctx.strokeStyle = "#dddddd";
                 }
                else if(num>=50){
                     ctx.strokeStyle = "#ffffff";
                 }
                 if(p.oldY == proj.y && p.oldX == proj.x){
                    p.age = -2;
                 }
                 //console.log(ctx.strokeStyle)

                 //var topoint = self.map.latLngToLayerPoint(new L.LatLng(lines[k].to_y, lines[k].to_x));
                 /*if (proj.x < 0 || proj.y < 0 || proj.x > w || proj.y > h) {
                     p.age = -2;
                 }*/
                 if (p.oldX != -1) {
                     /*var wind = get;
                     console.log(wind)
                     var s = wind.length() / this.maxLength;
                     console.log(s)
                     var c = 90 + Math.round(350 * s); // was 400
                     if (c > 255) {
                         c = 255;
                     }*/

                     ctx.beginPath();
                     ctx.moveTo(proj.x, proj.y);
                     // g.strokeStyle = this.colors[255-c];
                     ctx.lineTo(p.oldX,  p.oldY);
                     ctx.stroke();
                 }
                 p.oldX = proj.x;
                 p.oldY = proj.y;
             }

            /* for(var i = 0; i<lines.length;i++){
                 var points= [];
                 var line = lines[i]
                 var frompoint = self.map.latLngToLayerPoint(new L.LatLng(line.from_y, line.from_x));
                 var topoint = self.map.latLngToLayerPoint(new L.LatLng(line.to_y, line.to_x));
                 var contropoint = {}
                 contropoint.x = (frompoint.x+topoint.x)/2+(frompoint.y-topoint.y)/8;
                 contropoint.y =  (frompoint.y+topoint.y)/2+(topoint.x-frompoint.x)/8;
                 for(var t = 0.00;t<= 1 ;t=t+0.01){
                     var point = [];
                     point = qBerzier(frompoint,contropoint,topoint,t);
                     points.push(point);
                 }
                 lines[i].points = points;
                // console.log(lines[i])
             }*/

         /*    for(var i = 0 ; i<lines.length;i++){
                 //console.log(i)
                 var line = lines[i];
                 /!*var frompoint = self.map.latLngToLayerPoint(new L.LatLng(line.from_y, line.from_x));
                 var topoint = self.map.latLngToLayerPoint(new L.LatLng(line.to_y, line.to_x));
                 var old = frompoint;
                 var p = topoint;
                 if(c%2 === 1){
                    old.x = frompoint.x;
                    old.y = frompoint.y;
                    p.x = (frompoint.x+topoint.x)/2+(frompoint.y-topoint.y)/8;
                     p.y = (frompoint.y+topoint.y)/2+(topoint.x-frompoint.x)/8;
                 }
                 else {
                     old.x = (frompoint.x+topoint.x)/2+(frompoint.y-topoint.y)/8;
                     old.y = (frompoint.y+topoint.y)/2+(topoint.x-frompoint.x)/8;
                     p.x = topoint.x;
                     p.y = topoint.y;
                 }*!/
                 ctx.strokeStyle = "white"
                 ctx.lineWidth = getWidth(line.travel_device_num,min,max)
                 ctx.beginPath();
                 ctx.moveTo(lines[i].points[c][0],lines[i].points[c][1]);
                 ctx.lineTo(lines[i].points[c+1][0],lines[i].points[c+1][1]);
                /!* ctx.moveTo(lines[i].points[c+1][0],lines[i].points[c+1][1]);
                 ctx.lineTo(lines[i].points[c][0],lines[i].points[c][1]);
                 *!/
                ctx.stroke()
             }*/
             /*  node.attr("transform",function (d) {

                   var pos = newmap.latLngToLayerPoint(new L.LatLng(d.y,d.x));
                   console.log(pos);
                   return "translate("+pos.x+","+pos.y+")";
               })
               /!*node.attr("cx",function (d) {
                   return self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x)).x
               })
                   .attr("cy",function (d) {
                       return self.map.latLngToLayerPoint(new L.LatLng(d.y, d.x)).y
                   })*!/
                   .attr("r",function (d) {
                       return curZoom*d.stay_record_num/800/initZoom;
                   })
                   .style("opacity","0.3");*/

            /* link.transition()
                 .duration(50)
                 .on("start",slide)*/

             /*.attr("x1",function (d) {
                 return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
             })
             .attr("y1",function (d) {
                 return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
             })
             .attr("x2",function (d) {
                 return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).x;
             })
             .attr("y2",function (d) {
                 return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).y;
             });*/

            /* function slide() {
                 d3.active(this)
                     .attr("x1",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                     })
                     .attr("y1",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                     })
                     .attr("x2",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                     })
                     .attr("y2",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                     })
                     .transition()
                     .duration(8000)
                     .attr("x1",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                     })
                     .attr("y1",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                     })
                     .attr("x2",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).x;
                     })
                     .attr("y2",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).y;
                     })
                     .transition()
                     .duration(1000)
                     .on("start",slide)
             }*/

         }




         /*function ticked() {
             link
                  .attr("x1",function (d) {
                  return d.source.x;
              })
                  .attr("y1",function (d) {
                      return d.source.y;
                  })
                  .attr("x2",function (d) {
                      return d.target.x;
                  })
                  .attr("y2",function (d) {
                      return d.target.y;
              });

              node.attr("cx",function (d) {
                  return d.x;
              })
                  .attr("cy",function (d) {
                      return d.y;
                  })
         }*/
     }


    drawMigration2(dt,maxParticleLength,directionNum,particleNum,flag){
        var lines = dt.edges;
        this.lines = lines;
        console.log(lines)
        let self = this;
        //L.canvas().remove();
        var initZoom = self.map.getZoom();
        let svgid = `graphSVG`
        d3.select(self.map.getPanes().overlayPane).select("canvas").remove()
        //var map = new mapview("map0")
        L.canvas({clickable:true}).addTo(self.map)
        let canvas = d3.select(self.map.getPanes().overlayPane).select("canvas");
        console.log(canvas)
        var ctx = canvas.node().getContext("2d");
        this.ctx = ctx;

        function projectPoint(x, y) {
            let self = this;
            let point = self.map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }
        let transform = d3.geoTransform({point: self.projectPoint}),
            path = d3.geoPath().projection(transform);
        var range = d3.extent(lines,function (d) {
            return d.num;
        })
        var min = range[0];
        var max = range[1];
        console.log(range)

        var linesDict = [];
        var particles = [];
        //let animator = new Animator(null)
        $.getJSON('/data/allTrip.json',function (dt) {
            console.log("get")
            var trips = dt.edges;
            trips.forEach(function (trip) {
                var key = getgrid(trip.lng,trip.lat)
                key = key.a+"_"+key.b;
                if(!linesDict.hasOwnProperty( key )){
                    var v = [];
                    v.push(trip)
                    linesDict[key] = v;
                }
                else{
                    var v = linesDict[key];
                    v.push(trip)
                    linesDict[key] = v;
                }
            })
            console.log(linesDict)
            particles = makeParticles(500,self.map,canvas,lines,maxParticleLength,directionNum,particleNum,linesDict);
            loop();
            //var tmp = particles;
        })

        let w = getgridW(0.005);
        let h = getgridH(0.005);
        console.log(w)
        console.log(h)
        var c = -1;
        var lastX = 0;
        var lastY = 0;
        var a = {};
        self.map.on("moveend",function () {
            c = -1;
            console.log(lines)
            console.log(particleNum)
           // particles = makeParticles(500,self.map,canvas,lines,maxParticleLength,directionNum,particleNum);
            lastX = 0;
            lastY = 0;
            console.log(particles);
            //setTimeout(loop,10000)
            loop();
        })

        /*reset();*/
        function loop(){
            /*if(c>150){
                return;
            }*/
            c=c+1;
            reset();
            if(flag){
                setTimeout(loop,500)
            }
           else {
                setTimeout(loop,0.01)
            }
        };


        function reset() {
            // console.log("reset!")
            var curZoom = self.map.getZoom();
            var newmap = self.map;
            canvas.style('display','block');
            var x0 = 115.4220;
            var y0 = 39.4570;
            var x1 = 117.5000;
            var y1 = 41.0500;
            //console.log(c)

           /* for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                //console.log(p)
                if (p.age > 0 && p.x >= x0 && p.x < x1 && p.y >= y0 && p.y < y1 ) {

                    if(c === 0){

                        /!*a.x = p.dx;
                        a.y = p.dy;
                        console.log(a)
                        var before = getgrid(p.x,p.y)
                        p.x +=  a.x*0.0025*1.0001;
                        p.y +=  a.y*0.0025*1.0001;
                        var after = getgrid(p.x,p.y)
                        console.log(before)
                        console.log(after)
                        p.age--;
                        console.log(p)
                        particles[i] = p;*!/
                        p.lastX = p.dx;
                        p.lastY = p.dy;
                        particles[i] = p;
                    }
                    else if(c >= 1){
                        /!*console.log(p)
                        console.log(lastX)
                        console.log(lastY)*!/
                        if(c%5 === 1){
                            a = getDirection(p,p.lastX,p.lastY,lines);
                            p.a = a;
                            //console.log(a);
                        }
                       // a = getDirection(p,p.lastX,p.lastY,lines);
                        p.x = p.x + p.a.x/5;
                        p.y =p.y + p.a.y/5;
                        p.age--;
                        p.num = p.a.num;
                        p.lastX = p.a.dx;
                        p.lastY = p.a.dy;
                        particles[i] = p;

                    }

                } else {
                    //particles[i] = makeParticle(self.map,canvas);
                }
            }
*/
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
              /*  if ( p.x < x0 || p.x > x1 || p.y < y0 && p.y > y1 ) {
                    p.age = -2;
                    continue;
                }*/
                ctx.strokeStyle = "#c4c4c4";
                //console.log(p)
                if (c===0) {
                    ctx.fillStyle =  "rgb(15,25,49)";
                } else {
                    ctx.fillStyle = "rgba(15,25,49,0.02)";
                }
                for(var j = 0; j<p.length;j++){
                    var pp = p[j]
                    for(var k = 0; k<pp.length;k++){
                        if(c < pp.length-1){
                            //console.log(pp[k])
                            var num = pp[c+1].num;
                            if(num == 0){
                                p.age = -2;
                                continue;
                            }
                            if(num>0 && num <5){
                                ctx.strokeStyle = "#666666";
                            }
                            else if(num>=5 && num< 10){
                                ctx.strokeStyle = "#a0a0a0";
                            }
                            else if(num >=10 && num < 30){
                                ctx.strokeStyle = "#c4c4c4";
                            }
                            else if(num >= 30 && num < 50){
                                ctx.strokeStyle = "#dddddd";
                            }
                            else if(num>=50){
                                ctx.strokeStyle = "#ffffff";
                            }
                            var proj = self.map.latLngToLayerPoint(new L.LatLng(pp[c].lat, pp[c].lng));
                            var newProj = self.map.latLngToLayerPoint(new L.LatLng(pp[c+1].lat, pp[c+1].lng));
                            ctx.beginPath();
                            ctx.moveTo(proj.x, proj.y);
                            /* console.log(proj.x);
                             console.log(proj.y);
                             console.log(p.oldX)
                             console.log(p.oldY)*/
                            // g.strokeStyle = this.colors[255-c];
                            ctx.lineTo(newProj.x, newProj.y);
                            ctx.stroke();
                        }
                    }

                    }
                /* if (proj.x < 0 || proj.y < 0 || proj.x > canvas.width || proj.y > canvas.height) {

                     p.age = -2;
                     continue;
                 }*/


              /*  if(p.oldY == proj.y && p.oldX == proj.x){
                    p.age = -2;
                }*/
                //console.log(ctx.strokeStyle)

                //var topoint = self.map.latLngToLayerPoint(new L.LatLng(lines[k].to_y, lines[k].to_x));
                /*if (proj.x < 0 || proj.y < 0 || proj.x > w || proj.y > h) {
                    p.age = -2;
                }*/
               /* if (p.oldX != -1) {
                    /!*var wind = get;
                    console.log(wind)
                    var s = wind.length() / this.maxLength;
                    console.log(s)
                    var c = 90 + Math.round(350 * s); // was 400
                    if (c > 255) {
                        c = 255;
                    }*!/


                }*/
               /* p.oldX = proj.x;
                p.oldY = proj.y;*/
            }

            /* for(var i = 0; i<lines.length;i++){
                 var points= [];
                 var line = lines[i]
                 var frompoint = self.map.latLngToLayerPoint(new L.LatLng(line.from_y, line.from_x));
                 var topoint = self.map.latLngToLayerPoint(new L.LatLng(line.to_y, line.to_x));
                 var contropoint = {}
                 contropoint.x = (frompoint.x+topoint.x)/2+(frompoint.y-topoint.y)/8;
                 contropoint.y =  (frompoint.y+topoint.y)/2+(topoint.x-frompoint.x)/8;
                 for(var t = 0.00;t<= 1 ;t=t+0.01){
                     var point = [];
                     point = qBerzier(frompoint,contropoint,topoint,t);
                     points.push(point);
                 }
                 lines[i].points = points;
                // console.log(lines[i])
             }*/

            /*    for(var i = 0 ; i<lines.length;i++){
                    //console.log(i)
                    var line = lines[i];
                    /!*var frompoint = self.map.latLngToLayerPoint(new L.LatLng(line.from_y, line.from_x));
                    var topoint = self.map.latLngToLayerPoint(new L.LatLng(line.to_y, line.to_x));
                    var old = frompoint;
                    var p = topoint;
                    if(c%2 === 1){
                       old.x = frompoint.x;
                       old.y = frompoint.y;
                       p.x = (frompoint.x+topoint.x)/2+(frompoint.y-topoint.y)/8;
                        p.y = (frompoint.y+topoint.y)/2+(topoint.x-frompoint.x)/8;
                    }
                    else {
                        old.x = (frompoint.x+topoint.x)/2+(frompoint.y-topoint.y)/8;
                        old.y = (frompoint.y+topoint.y)/2+(topoint.x-frompoint.x)/8;
                        p.x = topoint.x;
                        p.y = topoint.y;
                    }*!/
                    ctx.strokeStyle = "white"
                    ctx.lineWidth = getWidth(line.travel_device_num,min,max)
                    ctx.beginPath();
                    ctx.moveTo(lines[i].points[c][0],lines[i].points[c][1]);
                    ctx.lineTo(lines[i].points[c+1][0],lines[i].points[c+1][1]);
                   /!* ctx.moveTo(lines[i].points[c+1][0],lines[i].points[c+1][1]);
                    ctx.lineTo(lines[i].points[c][0],lines[i].points[c][1]);
                    *!/
                   ctx.stroke()
                }*/
            /*  node.attr("transform",function (d) {

                  var pos = newmap.latLngToLayerPoint(new L.LatLng(d.y,d.x));
                  console.log(pos);
                  return "translate("+pos.x+","+pos.y+")";
              })
              /!*node.attr("cx",function (d) {
                  return self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x)).x
              })
                  .attr("cy",function (d) {
                      return self.map.latLngToLayerPoint(new L.LatLng(d.y, d.x)).y
                  })*!/
                  .attr("r",function (d) {
                      return curZoom*d.stay_record_num/800/initZoom;
                  })
                  .style("opacity","0.3");*/

            /* link.transition()
                 .duration(50)
                 .on("start",slide)*/

            /*.attr("x1",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
            })
            .attr("y1",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
            })
            .attr("x2",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).x;
            })
            .attr("y2",function (d) {
                return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).y;
            });*/

            /* function slide() {
                 d3.active(this)
                     .attr("x1",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                     })
                     .attr("y1",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                     })
                     .attr("x2",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                     })
                     .attr("y2",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                     })
                     .transition()
                     .duration(8000)
                     .attr("x1",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).x;
                     })
                     .attr("y1",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x)).y;
                     })
                     .attr("x2",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).x;
                     })
                     .attr("y2",function (d) {
                         return self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x)).y;
                     })
                     .transition()
                     .duration(1000)
                     .on("start",slide)
             }*/

        }




        /*function ticked() {
            link
                 .attr("x1",function (d) {
                 return d.source.x;
             })
                 .attr("y1",function (d) {
                     return d.source.y;
                 })
                 .attr("x2",function (d) {
                     return d.target.x;
                 })
                 .attr("y2",function (d) {
                     return d.target.y;
             });

             node.attr("cx",function (d) {
                 return d.x;
             })
                 .attr("cy",function (d) {
                     return d.y;
                 })
        }*/
    }
    generate(tree,path,drawedSet){
       // console.log("generate")
        this.latLngNodes = [];


        if(this.pertreeNodes && this.pertreeNodes.length!=0){

            //console.log(this.pertreeNodes);
            this.allLatLngNodes.push([].concat(this.pertreeNodes))
        }
       /* console.log("maxSteplen is " + this.maxStepLen)
        console.log(this.allLatLngNodes)*/
        this.pertreeNodes = [];
        this.drawTree(tree,path,drawedSet)

    }
    drawTree(tree,path,drawedSet){
        let self = this;
        this.tree = tree;
        //console.log(tree);
        if(tree.children){
            if(tree.children.length>1){
                alert("found tree")
            }
            path.push(tree.root.lng,tree.root.lat)
            if(tree.root.num){
                path.push(tree.root.num)
            }
            else{
                path.push(0)
            }
            path.push(tree.root.speed)
            var max = 0;
            var index = 0;
            for(var i = 0 ; i < tree.children.length ; i++){
                var subTree = tree.children[i] ;
                if(subTree.root.num > max && subTree.root.num != 0){
                    max = subTree.root.num;
                    index = i;
                }
            }

            this.drawTree(tree.children[index],path,drawedSet)
            tree.children[index].root.num = 0;
            drawedSet.add(path)
            path = []
            for(var j = 0 ; j <tree.children.length ; j++){
                if(tree.children[j].root.num != 0 ){
                    this.drawTree(tree,path,drawedSet)
                }
            }
        }
        else{
            path.push(tree.root.lng,tree.root.lat,tree.root.num,tree.root.speed)
           // console.log(path)
            this.drawSpline(path,drawedSet)
            return ;
        }

    }
    drawSpline(points,drawedSet) {
        //console.log(this.tree)
        var perLatLngNodes = [];
        let self = this;
        let g = d3.select(self.map.getPanes().overlayPane).select("svg").select("g")
            .style("fill", "none")
            .style("stroke", "white")
        /* var that = this;
         var initZoom = self.map.getZoom();

         self.map.on("viewreset", reset);
         self.map.on("zoomstart", function () {
            // g.style('display', 'none');
             g.selectAll("path").remove()

         });

         self.map.on("zoomend", function () {
             console.log(that);
             g.selectAll("path").remove()
             that.latLngNodes.forEach(function (t,j) {
                 t.forEach(function (d) {
                     var p = self.map.latLngToLayerPoint(new L.LatLng(d.lat,d.lng));
                     d.x = p.x;
                     d.y = p.y;
                 })

                 var pathSegment = getPathSegment(g,t);
                 pathSegment = getSegmentList(pathSegment,t)
                 function  draw(d,i) {
                      let segment = g
                     .append("path")
                     .each(function () {
                         console.log(d)
                         var t = d3.select(this);
                         t.attr("d",d.d)
                         var pathLength=t.node().getTotalLength();
                         t.style("stroke-width",1)
                             .style('stroke-dasharray', function () {
                                 return pathLength;
                             })
                             .style('stroke-dashoffset', function () {
                                 return pathLength;
                             })
                             .style("animation","dash 2s linear forwards")
                             .attr("d",d.d)
                             .style("fill","none")
                             .style("stroke",function () {
                                 return getSegmentColor(d.num)
                             })
                             .style("stroke-width","1")
                             .style("opacity",function () {
                                 if(j != 0 && i === 0){
                                     return 0;
                                 }
                                 else{
                                     return 1;
                                 }
                             })
                     })
                 }
                /!* let segment = g.selectAll("whatever")
                     .data(pathSegment)
                     .enter()
                     .append("path")
                     .each(function (d,i) {
                         console.log(d)
                         var t = d3.select(this);
                         t.attr("d",pathSegment[i].d)
                         var pathLength=t.node().getTotalLength();
                         t.style("stroke-width",1)
                             .style('stroke-dasharray', function () {
                                 return pathLength;
                             })
                             .style('stroke-dashoffset', function () {
                                 return pathLength;
                             })
                             .style("animation","dash 5s linear forwards")
                             .attr("d",pathSegment[i].d)
                             .style("fill","none")
                             .style("stroke",function (d) {
                                 return getSegmentColor(pathSegment[i].num)
                             })
                             .style("stroke-width","1")
                             .style("opacity",function (d) {
                                 if(j != 0 && i === 0){
                                     return 0;
                                 }
                                 else{
                                     return 1;
                                 }
                             })
                     })*!/

                 var index = 0 ;
                 function loop1() {
                     if(index >= pathSegment.length){
                         return ;
                     }
                     draw(pathSegment[index],index)
                     index = index +1;
                     setTimeout(loop1,2000)

                 }
                 loop1();
                  /!*   .each(function (d,i) {
                         console.log(d)
                         var gg = d3.select(this);
                         gg.attr("d",pathSegment[i].d)
                             .style("fill","none")
                             .style("stroke",function (d) {
                                 return getSegmentColor(pathSegment[i].num)
                             })
                             .style("opacity",function (d) {
                                 if(j != 0  && i === 0 ){
                                     return 0;
                                 }
                                 else{
                                     return 1;
                                 }
                             })
                     })*!/
             })
         });*/
        reset();

        function reset() {

           /* var curZoom = self.map.getZoom();
            g.style('display', 'block');*/
            var newPoints = [];
            for (var i = 0; i < points.length; i = i + 4) {
                var point = self.map.latLngToLayerPoint(new L.LatLng(points[i + 1], points[i]));
                newPoints.push(point.x)
                newPoints.push(point.y)
                newPoints.push(points[i+2]);
                newPoints.push(points[i+3]);
            }

            var pathNodesList = []
            if (drawedSet.size != 0) {
                var newSet = new Set();
                drawedSet.forEach(function (e) {
                    var s = [];
                    for (var i = 0; i < e.length; i = i + 4) {
                        var point = self.map.latLngToLayerPoint(new L.LatLng(e[i + 1], e[i]));
                        s.push(point.x)
                        s.push(point.y)
                        s.push(e[i+2])
                        s.push(e[i+3])
                    }
                    newSet.add(s);
                })
                newPoints = getSplinePoints(newPoints,newSet,g,);
                //console.log(newPoints)
            }
            //console.log(newPoints)
            for (var i = 0; i < newPoints.length; i = i + 4) {
                //var point = self.map.latLngToLayerPoint(new L.LatLng(points[i+1], points[i]));
                var point = {}
                point.x = newPoints[i]
                point.y = newPoints[i + 1]
                var latlng = self.map.layerPointToLatLng(point);
                latlng.num = newPoints[i + 2];
                latlng.speed = newPoints[i + 3];
                point.num = newPoints[i + 2];
                point.speed = newPoints[i + 3];
                if(perLatLngNodes.length > 0 && (latlng.lat != perLatLngNodes[perLatLngNodes.length-1].lat || latlng.lng != perLatLngNodes[perLatLngNodes.length-1].lng ))
                {
                    perLatLngNodes.push(latlng)
                }
                else if(perLatLngNodes.length == 0 ){
                    perLatLngNodes.push(latlng)
                }
                pathNodesList.push(point)

            }



           /* var pathSegment = getPathSegment(g,pathNodesList);
            pathSegment = getSegmentList(pathSegment,pathNodesList)

            function draw(d){
                let segment = g
                    .append("path")
                    .each(function () {
                        var t = d3.select(this);
                        t.attr("d",d.d)
                        var pathLength=t.node().getTotalLength();
                        t.style("stroke-width",1)
                            .style('stroke-dasharray', function () {
                                return pathLength;
                            })
                            .style('stroke-dashoffset', function () {
                                return pathLength;
                            })
                            .style("animation","dash 1s linear forwards")
                            .attr("d",d.d)
                            .style("fill","none")
                            .style("stroke",function () {
                                return getSegmentColor(d.num)
                            })
                            .style("stroke-width","1")
                            .style("opacity",function () {
                                if(drawedSet.size != 0 && i === 0){
                                    return 0;
                                }
                                else{
                                    return 1;
                                }
                            })
                    })
            }
            var index = 0 ;
            function loop1() {
                if(index >= pathSegment.length){
                    return ;
                }
                draw(pathSegment[index])
                setTimeout(loop1,3000)
                index = index +1;
            }
            loop1();*/
            /*for(var i = 0;i<pathSegment.length;i++){
                setTimeout(draw(pathSegment[i]),5000)
            }*/
           /* let segment = g.selectAll("whatever")
                .data(pathSegment)
                .enter()
                .append("path")
                .each(function (d,i) {
                    console.log(d)
                    var t = d3.select(this);
                t.attr("d",pathSegment[i].d)
                    var pathLength=t.node().getTotalLength();
                    t.style("stroke-width",1)
                        .style('stroke-dasharray', function () {
                        return pathLength;
                            })
                        .style('stroke-dashoffset', function () {
                        return pathLength;
                    })
                        .transition()
                        .duration(0)
                        .delay(5*i)
                        .style("animation","dash 5s linear forwards")
                        .attr("d",pathSegment[i].d)
                        .style("fill","none")
                        .style("stroke",function (d) {
                            return getSegmentColor(pathSegment[i].num)
                        })
                        .style("stroke-width","1")
                        .style("opacity",function (d) {
                            if(drawedSet.size != 0 && i === 0){
                                return 0;
                            }
                            else{
                                return 1;
                            }
                        })
                })*/


    }

    if(!this.mainPath){
        this.mainPath = perLatLngNodes;
    }
    if(perLatLngNodes.length>1){
        this.latLngNodes.push(perLatLngNodes);
        this.pertreeNodes.push(perLatLngNodes);
    }
        if(perLatLngNodes.length >this.maxStepLen){
            this.maxStepLen = perLatLngNodes.length;
        }
        //console.log(this.latLngNodes)

    }
    drawAnimationTree() {
        let self = this;
        var maxStepLen = this.maxStepLen;
        var allLatLngNodes = this.allLatLngNodes;
        var that = this;
        var ll = this.latLngNodes;
        let g = d3.select(self.map.getPanes().overlayPane).select("svg").select("g")
            .style("fill", "none")
            .style("stroke", "white")
        self.map.on("viewreset", reset);
        self.map.on("zoomstart", function () {
            // g.style('display', 'none');
            g.selectAll("path").remove()
        });

        self.map.on("zoomend", function () {
            //console.log("zoomend")
            //console.log(that.allLatLngNodes)
            g.selectAll("path").remove()
            function draw(nodesLists,index,mainPath) {
                nodesLists.forEach(function (d) {
                    d.forEach(function (pp) {
                        var p = self.map.latLngToLayerPoint(new L.LatLng(pp.lat, pp.lng));
                        pp.x = p.x;
                        pp.y = p.y;
                    })

                    var pathSegment = getPathSegment(g, d);
                    pathSegment = getSegmentList(pathSegment, d ,mainPath)

                    let segment = g.selectAll("whatever")
                        .data(pathSegment)
                        .enter()
                        .append("path")
                        .each(function (d,i) {
                            //console.log(d)
                            var t = d3.select(this);
                            if(index === pathSegment[i].level){
                                //console.log(pathSegment[i].d)
                                t.attr("d",pathSegment[i].d)
                                var pathLength=t.node().getTotalLength();
                                t.style("stroke-width",1)
                                    .style('stroke-dasharray', function () {
                                        return pathLength;
                                    })
                                    .style('stroke-dashoffset', function () {
                                        return pathLength;
                                    })
                                    .style("animation","dash 3s linear forwards")
                                    .attr("d",pathSegment[i].d)
                                    .style("fill","none")
                                    .style("stroke",function (d) {
                                        return getSegmentColor(pathSegment[i].num)
                                    })
                                    .style("stroke-width","1")
                                    .style("opacity",function (d) {
                                        if( index != 0 && i === 0){
                                            return 0;
                                        }
                                        else{
                                            return 1;
                                        }
                                    })
                            }
                            else {
                                t.remove();
                            }

                        })
                })

            }
           /* var index = 0;

            function loop1() {
                if (index >= that.latLngNodes.length) {
                    return;
                }
                that.latLngNodes.forEach(function (latLngNodes) {
                    draw(latLngNodes,index,latLngNodes)
                })
                index = index + 1;
                setTimeout(loop1, 600)

            }
            loop1();*/
          /* that.latLngNodes.forEach(function (latLngNodes) {
               var index = 0;

               function loop1() {
                   if (index >= latLngNodes.length) {
                       return;
                   }
                   draw(latLngNodes,index,latLngNodes)
                   /!*that.allLatLngNodes.forEach(function (latLngNodes) {
                       draw(latLngNodes,index,latLngNodes)
                   })*!/
                   index = index + 1;
                   setTimeout(loop1, 600)

               }
               loop1();

           })*/
                //draw(that.allLatLngNodes[i],index,that.allLatLngNodes[i])

            var index = 0;

            function loop1() {
                if (index >= maxStepLen) {
                    return;
                }
                for(var i = 0;i<that.allLatLngNodes.length;i++)
                {

                    draw(that.allLatLngNodes[i],index,that.allLatLngNodes[i])
                }
                /*that.allLatLngNodes.forEach(function (latLngNodes) {
                    draw(latLngNodes,index,latLngNodes)
                })*/
                index = index + 1;
                setTimeout(loop1, 3000)

            }

            loop1();
        })
        reset();
        function reset() {
            /*g.selectAll("path").remove()*/
            function draw(nodesLists,index,mainPath) {
                nodesLists.forEach(function (d) {
                    d.forEach(function (pp) {
                        var p = self.map.latLngToLayerPoint(new L.LatLng(pp.lat, pp.lng));
                        pp.x = p.x;
                        pp.y = p.y;
                    })

                    var pathSegment = getPathSegment(g, d);
                    pathSegment = getSegmentList(pathSegment, d ,mainPath)
                    console.log(pathSegment)
                    let segment = g.selectAll("whatever")
                        .data(pathSegment)
                        .enter()
                        .append("path")
                        .each(function (d,i) {
                           // console.log(d)
                            var t = d3.select(this);
                            if(index === pathSegment[i].level && !pathSegment[i].isDrawed){
                                //console.log(index)
                                console.log("draw path")
                                console.log(pathSegment[i].d)
                                pathSegment[i].isDrawed = true;
                                t.attr("d",pathSegment[i].d)
                                var pathLength=t.node().getTotalLength();
                                t.style("stroke-width",1)
                                    .style('stroke-dasharray', function () {
                                        return pathLength;
                                    })
                                    .style('stroke-dashoffset', function () {
                                        return pathLength;
                                    })
                                    .style("animation","dash 3s linear forwards")
                                    .attr("d",pathSegment[i].d)
                                    .style("fill","none")
                                    .style("stroke",function (d) {
                                        return getSegmentColor(pathSegment[i].num)
                                    })
                                    .style("stroke-width","1")
                                    .style("opacity",function (d) {
                                        return 1;
                                       /* if( index != 0 && i === 0){
                                            return 0;
                                        }
                                        else{
                                            return 1;
                                        }*/
                                    })
                            }
                            else {
                                t.remove();
                            }
                        })
                })

            }
          /*  var maxLen = 0;
            var newN = [].concat(that.allLatLngNodes);
            for(var k = 0;k<newN.length;k++){
                if(newN[k].length > maxLen){
                    maxLen = newN[k].length;
                    console.log("max len is "+maxLen)
                }
            }
*/
                var index = 0;

                function loop1() {
                   // console.log(that.latLngNodes)
                   /* if (index >= that.latLngNodes.length) {
                        return;
                    }
                    draw(that.latLngNodes,index,that.latLngNodes)*/
                    if (index >= maxStepLen) {
                        return;
                    }
                    for (var n = 0 ;n <allLatLngNodes.length;n++){
                        var latLngNodes = allLatLngNodes[n];
                        console.log(latLngNodes)

                            draw(latLngNodes,index,latLngNodes);

                    }
                    /*allLatLngNodes.forEach(function (latLngNodes) {
                        console.log(index)
                        console.log(latLngNodes)
                        draw(latLngNodes,index,latLngNodes)
                    })*/
                    index = index + 1;
                    setTimeout(loop1, 3000)

                }

                loop1();
        }

    }
    drawLoopTree(optiondata,bounds){
        let self = this;
        var that= this;
       var curViewBounds = self.map.getBounds();
        this.optionData = optiondata;
        var loopTime = optiondata[6].init;
        var minTrajLen = optiondata[4].init;
        //var minTotalFlow = optiondata[5].init;
        var minSpeed = optiondata[5].init;
        var maxSpeed = optiondata[9].init;
        let g = d3.select(self.map.getPanes().overlayPane).select("svg").select("g")
            .style("fill", "none")
            .style("stroke", "white")
        var allLatLngNodes = this.allLatLngNodes ;

        var allParticles = [];
        if(bounds){
            this.bounds = bounds;
        }
       var allspeed = [];
        /* var fso;
        try {
            fso=new ActiveXObject("Scripting.FileSystemObject");
        } catch (e) {
            alert("当前浏览器不支持");
            return;
        }
        var f1 = fso.createtextfile("C:\\1.txt",true);
        f1.write(allspeed)*/
        var gridSpeed = [];
        var allNum = [];
        allLatLngNodes.forEach(function (latLngNodes) {
            latLngNodes.forEach(function (d) {
                d.forEach(function (pp,i) {
                    var gridID = getGridID(pp.lat,pp.lng).gid;
                    var lat = parseFormatGID(gridID).lat;
                    var lng = parseFormatGID(gridID).lng;
                    var speed;
                    var num;
                    if(i==0){
                        speed = d[i+1].speed;
                        num = d[i+1].num;
                    }
                    else {
                        speed = pp.speed;
                        num = pp.num;
                    }
                    var f = false;
                    gridSpeed.forEach(function (t) {
                        if(gridID==t.gridID){
                            f = true;
                            t.speeds.push({speed:speed,num:num})
                        }
                    })
                    if(!f){
                        gridSpeed.push({
                            gridID:gridID,
                            lat:lat,
                            lng:lng,
                            speeds:[{speed:speed,num:num}]
                        })
                    }
                    var p = self.map.latLngToLayerPoint(new L.LatLng(pp.lat, pp.lng));
                    pp.x = p.x;
                    pp.y = p.y;
                    if(pp.speed!=0){
                        allspeed.push(pp.speed);
                    }
                    if(pp.num != 0){
                        allNum.push(pp.num)
                    }
                })
                var trajLen = getInfo(d)[0];
                var totalFlow = getInfo(d)[1];
                var averageSpeed = getInfo(d)[2]*3.6;
                var dlen = d.length;
               // var ss = getCtrlPoint(g,d,self.map)
                if(trajLen >= minTrajLen  && averageSpeed>= minSpeed && averageSpeed <= maxSpeed){
                    if(bounds){
                       for(var k = 0;k<bounds.length;k++){
                           var bound = bounds[k];
                           var northEast = bound._northEast;
                           var southWest = bound._southWest;
                           if((d[0].lat > southWest.lat && d[0].lat < northEast.lat &&
                                   d[0].lng > southWest.lng && d[0].lng  < northEast.lng) ||(d[dlen-1].lat > southWest.lat && d[dlen-1].lat < northEast.lat &&
                                   d[dlen-1].lng > southWest.lng && d[dlen-1].lng  < northEast.lng)){
                               var ss = getTmpPoints(g,d,self.map,loopTime)
                               allParticles.push(ss);
                               break;
                           }
                       }

                    }
                    else {
                       /* var northEast = curViewBounds._northEast;
                        var southWest = curViewBounds._southWest;
                        if((d[0].lat > southWest.lat && d[0].lat < northEast.lat &&
                                d[0].lng > southWest.lng && d[0].lng  < northEast.lng) ||(d[dlen-1].lat > southWest.lat && d[dlen-1].lat < northEast.lat &&
                                d[dlen-1].lng > southWest.lng && d[dlen-1].lng  < northEast.lng)){
                            var ss = getTmpPoints(g,d,self.map,loopTime)
                            allParticles.push(ss);
                        }*/
                        var ss = getTmpPoints(g,d,self.map,loopTime)
                      //  console.log(ss)
                        allParticles.push(ss);
                    }

                }
             /*   for (var i = 0; i < pp.length - 1; i++) {
                    var node = pp[i];
                    if(node.label && node.label == "curve"){
                        var point = {};
                        point.x = parseFloat(node.cp1x);
                        point.y = parseFloat(node.cp1y);
                        console.log(point)
                        var latlng = self.map.layerPointToLatLng(point);
                        console.log(latlng)
                        node.cp1Lat = latlng.lat;
                        node.cp1Lng = latlng.lng;
                        var point1 = {};
                        point1.x = parseFloat(node.cp2x);
                        point1.y = parseFloat(node.cp2y);
                        var latlng2 = self.map.layerPointToLatLng(point1);
                        node.cp2Lat = latlng2.lat;
                        node.cp2Lng = latlng2.lng;
                    }


                }
              */
             //console.log(pp)
                //var pathSegment = getPathSegment(g, d);
                //pathSegment = getSegmentList(pathSegment, d, mainPath)

            })
        })
        gridSpeed.forEach(function (t) {
            var totalnum = 0;
            t.speeds.forEach(function (t2) {
                totalnum += t2.num;
            })
            t.count = 0;
            t.speeds.forEach(function (t2) {
                t.count += t2.speed*t2.num/totalnum;
            })
        })
        function comp(x,y) {
            if(x>y){
                return 1;
            }
            else if(x<y){
                return -1;
            }
            else {
                return 0;
            }
        }
        allNum.sort(comp);
        //console.log(allNum)
        var seg  = getSeg(allNum);
        this.seg = seg;
        //console.log(seg)
        this.gridSpeed = gridSpeed;
        this.allParticles = [].concat(allParticles);
        // console.log(gridSpeed)
        // console.log(bounds)
        // console.log(allLatLngNodes);
        // console.log(allParticles);
        d3.select(self.map.getPanes().overlayPane).select("canvas").remove();
        L.canvas({clickable:true}).addTo(self.map);
        let canvas = d3.select(self.map.getPanes().overlayPane).select("canvas").attr("id","canvas")
        this.canvas= canvas;
       // console.log(canvas)
        var ctx = canvas.node().getContext("2d");
        this.ctx = ctx;
        var cvs = document.getElementById("canvas")
        //console.log(cvs)
        cvs.addEventListener("mouseip",detect);
        var zoomflag = false;
        function detect(event) {
            console.log("detect")
            var x = event.clientX-cvs.getBoundingClientRect().left;
            var y = event.clientY.cvs.getBoundingClientRect().top;


        }
        self.map.on("viewreset", function () {
            console.log("viewreset")
            if(maps.status=="play"){
                loop(10);
            }
            else{
                that.drawStayPath(optiondata);
            }

        });
     /*   self.map.on("click",function (ev) {
            console.log(ev)
            var point = self.map.latLngToLayerPoint(ev.latlng);
            d3.select(".tooltip").html("lat:"+ev.latlng.lat  + "<br />" +
                "lng:"+ev.latlng.lng+"<br />")
                .style("left", (point.x) + "px")
                .style("top", (point.y) + "px")
                .style("opacity",1.0);
        })*/
        self.map.on("zoomstart", function () {
           canvas.attr("height",canvas.attr("height"))
            // g.style('display', 'none');
           // g.selectAll("path").remove()
           // canvas.style("dispa")
        });
        self.map.on("zoomend", function (){
            console.log("dynamic map zoom")
            if(maps.status == "pause"){
                    that.drawStayPath(optiondata);
            }
            else{
                c = -1;
                for(var i = 0 ; i < allParticles.length;i++){
                    currents[i] = 0;
                }
                ctx.clearRect(0,0,canvas.attr("width"),canvas.attr("height"))
                zoomflag =true;
                curViewBounds = self.map.getBounds();
               var newParticles = [];
               that.allParticles.forEach(function (perList) {
                   var dlen = perList.length;
                   var northEast = curViewBounds._northEast;
                   var southWest = curViewBounds._southWest;
                   if(((perList[0].lat > southWest.lat && perList[0].lat < northEast.lat &&
                           perList[0].lng > southWest.lng && perList[0].lng  < northEast.lng) ||(perList[dlen-1].lat > southWest.lat && perList[dlen-1].lat < northEast.lat &&
                           perList[dlen-1].lng > southWest.lng && perList[dlen-1].lng  < northEast.lng))){
                       //console.log("filter")
                       newParticles.push(perList);
                   }
               })
                allParticles = newParticles;

                console.log(curViewBounds)
            }

            //canvas.attr("height",canvas.attr("height"))
            //setTimeout(loop(2000),10)
        })
        self.map.on("moveend", function (){
            console.log("dynamic map zoom")
            if(maps.status == "pause"){
                that.drawStayPath(optiondata);
            }
            else{
                c = -1;
                for(var i = 0 ; i < allParticles.length;i++){
                    currents[i] = 0;
                }
                ctx.clearRect(0,0,canvas.attr("width"),canvas.attr("height"))
                zoomflag =true;
                curViewBounds = self.map.getBounds();
                var newParticles = [];
                that.allParticles.forEach(function (perList) {
                    var dlen = perList.length;
                    var northEast = curViewBounds._northEast;
                    var southWest = curViewBounds._southWest;
                    if(((perList[0].lat > southWest.lat && perList[0].lat < northEast.lat &&
                            perList[0].lng > southWest.lng && perList[0].lng  < northEast.lng) ||(perList[dlen-1].lat > southWest.lat && perList[dlen-1].lat < northEast.lat &&
                            perList[dlen-1].lng > southWest.lng && perList[dlen-1].lng  < northEast.lng))){
                        //console.log("filter")
                        newParticles.push(perList);
                    }
                })
                allParticles = newParticles;

                console.log(curViewBounds)
            }

            //canvas.attr("height",canvas.attr("height"))
            //setTimeout(loop(2000),10)
        })
        var c=-1;
        var currents = []
        for(var i = 0 ; i < allParticles.length;i++){
            currents[i] = 0;
        }
        function stop() {
            maps.animate = "pause"
            maps.fade = false;
        }
        var stepLoop = 10;
        function loop(){
            c=c+1;
            if(maps.status=="play"){
               reset() ;
            }
            else{
                ctx.clearRect(0,0,canvas.attr("width"),canvas.attr("height"))
                //self.map.off()
                //that.drawStayPath(optiondata)
                return ;
            }
            setTimeout(loop,30)
        };
        loop();

        function reset() {
            /*if(maps.animate == "play"){
                setTimeout(stop,150000)
            }*/
            allParticles.forEach(function (particles) {
                particles.forEach(function (p) {
                    var point = self.map.latLngToLayerPoint(new L.LatLng(p.lat,p.lng))
                    p.x = point.x;
                    p.y = point.y
                })
            })
            var w = canvas.attr("width");
            var h = canvas.attr("height");

            if(c == 0){
                ctx.fillStyle = 'rgba(4,27,46)'
            }
            else{
                ctx.fillStyle = 'rgba(4,27,46,0.04)'
            }

            for(var i = 0 ; i < allParticles.length;i++){
                var perList = allParticles[i];

                var start;
                var end;
                var f;
                //f为当前所绘制的下标 找到当前应当绘制的点
                if(c+1>= perList.length && currents[i]+1<perList.length){
                    //currents[i] = 0
                    f = currents[i]
                    //console.log(currents[i])
                    start = perList[currents[i]];
                    end =perList[currents[i]+1];
                }
                else if(currents[i]+1 >= perList.length ){
                    currents[i] = 0
                    f = currents[i];
                    //console.log(currents[i])
                    start = perList[currents[i]];
                    end =perList[currents[i]+1];
                    //解决路径太短动画效果不明显的问题
                   /* if( currents[i]>perList.length*2){
                        currents[i] = 0
                        f = currents[i];
                        //console.log(currents[i])
                        start = perList[currents[i]];
                        end =perList[currents[i]+1];
                    }
                    else{
                        //第一次画的时候只对前面路径覆盖
                        if(c+1<=perList.length){
                            for(var j = 0; j< perList.length-1;j++){
                                if(j<=f){
                                    //console.log(f)
                                    var speed = perList[j+1].speed;
                                    var num = perList[j+1].num;
                                    var coverScale = getCoverScale(perList.length,speed,num)
                                    ctx.strokeStyle= 'rgba(0,25,46,'+coverScale+')'
                                    ctx.lineWidth = .75;
                                    ctx.beginPath();
                                    ctx.moveTo(perList[j].x, perList[j].y);
                                    ctx.lineTo(perList[j+1].x,perList[j+1].y)
                                    ctx.stroke();
                                }
                            }
                        }
                        //第一次以后画，对所有路径都覆盖
                        else{
                            for(var j = 0; j< perList.length-1;j++){
                                var speed = perList[j+1].speed;
                                var num = perList[j+1].num;
                                var coverScale = getCoverScale(perList.length,speed,num);
                                ctx.strokeStyle= 'rgba(0,25,46,'+coverScale+')'
                                //ctx.strokeStyle= 'rgba(4,27,46,0.04)'
                                ctx.lineWidth = .75;
                                ctx.beginPath();
                                ctx.moveTo(perList[j].x, perList[j].y);
                                ctx.lineTo(perList[j+1].x,perList[j+1].y)
                                ctx.stroke();
                            }
                        }
                        currents[i] = currents[i] + 1;
                        continue;
                    }*/

                }
                else{
                    f = c;
                    start = perList[c]
                    end = perList[c+1];
                }

                //第一次画只覆盖之前的路径
                if(c+1<=perList.length){
                    for(var j = 0; j< perList.length-1;j++){
                        if(j<=f){
                            //console.log(f)
                            var speed = perList[j+1].speed;
                            var num = perList[j+1].num;
                            var coverScale = getCoverScale(perList.length,speed,num)
                            ctx.strokeStyle= 'rgba(0,25,46,'+coverScale+')'
                            ctx.lineWidth = 1.5;
                            ctx.beginPath();
                            ctx.moveTo(perList[j].x, perList[j].y);
                            ctx.lineTo(perList[j+1].x,perList[j+1].y)
                            ctx.stroke();
                        }
                    }
                }
                //第一次循环之后画，覆盖所有路径
               else{
                    for(var j = 0; j< perList.length-1;j++){
                        var speed = perList[j+1].speed;
                        var num = perList[j+1].num;
                        var coverScale = getCoverScale(perList.length,speed,num);
                        ctx.strokeStyle= 'rgba(40,40,40,'+coverScale+')'
                        //ctx.strokeStyle= 'rgba(4,27,46,0.04)'
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(perList[j].x, perList[j].y);
                        ctx.lineTo(perList[j+1].x,perList[j+1].y)
                        ctx.stroke();
                    }
                }
                if(!end.hasOwnProperty("num") || !end.hasOwnProperty("speed")){
                    console.log(perList)
                    console.log(currents[i])
                    console.log(f)
                    console.log(c)
                }
                var num = end.num;
                var speed = end.speed*3.6;
                //ctx.fillStyle =  "rgb(15,25,49)";
                var type = "normal";
                if(maps.direction.length!=0){
                    var p1 = perList[0];
                    var p2 = perList[1];
                    var x = p2.lng - p1.lng;
                    var y = p2.lat -p1.lat;
                    let tmp = getNormalize(x,y);
                    x = tmp[0];
                    y = tmp[1];
                    var dir = getAngle(0,1,x,y,true);
                    type = "none"
                    maps.direction.forEach(function (t) {
                        if(dir >= t[0] && dir<= t[1]){
                            type = "highlight"
                        }
                    })

                }


                if(!maps.fade){

                    if(maps.strokeType == "speed"){
                        ctx.strokeStyle = getColorBySpeed(speed,type)
                    }
                   else{
                        ctx.strokeStyle = getStrokeColor(num,type,seg);
                    }
                    currents[i] = currents[i] + 1;
                    ctx.lineWidth = 1.5;
                    // console.log(start)
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    // ctx.fillStyle =  "rgb(15,25,49)";
                    // ctx.strokeStyle = "#ffffff";
                    ctx.lineTo(end.x,end.y)
                    ctx.stroke();
                    if(currents[i]-1>=stepLoop){
                        var k =currents[i]-1;
                       //console.log("redraw")
                        while(k>=0){
                            num = perList[k+1].num;
                            //ctx.strokeStyle = getStrokeColor(num,type);
                            speed = perList[k+1].speed*3.6;
                            if(maps.strokeType == "speed"){
                                ctx.strokeStyle = getColorBySpeed(speed,type)
                            }
                            else{
                                ctx.strokeStyle = getStrokeColor(num,type,seg);
                            }
                            ctx.lineWidth = 1.5;
                            // console.log(start)
                            ctx.beginPath();
                            ctx.moveTo(perList[k].x, perList[k].y);
                            // ctx.fillStyle =  "rgb(15,25,49)";
                            // ctx.strokeStyle = "#ffffff";
                            ctx.lineTo(perList[k+1].x,perList[k+1].y)
                            ctx.stroke();
                            k = k - stepLoop;
                        }
                        if(c>perList.length){
                            var k =currents[i]-1+stepLoop;
                            //console.log("redraw")
                            while(k<perList.length-1){
                                num = perList[k+1].num;
                                //ctx.strokeStyle = getStrokeColor(num,type);
                                speed = perList[k+1].speed*3.6;
                                if(maps.strokeType == "speed"){
                                    ctx.strokeStyle = getColorBySpeed(speed,type)
                                }
                                else{
                                    ctx.strokeStyle = getStrokeColor(num,type,seg);
                                }
                                ctx.lineWidth = 1.5;
                                // console.log(start)
                                ctx.beginPath();
                                ctx.moveTo(perList[k].x, perList[k].y);
                                // ctx.fillStyle =  "rgb(15,25,49)";
                                // ctx.strokeStyle = "#ffffff";
                                ctx.lineTo(perList[k+1].x,perList[k+1].y)
                                ctx.stroke();
                                k = k + stepLoop;
                            }
                        }
                    }
                }
                else if(maps.fade){
                    if(i>that.lastLen){
                        if(maps.strokeType== "speed"){
                            ctx.strokeStyle = getColorBySpeed(speed,type)
                        }
                        else{
                            ctx.strokeStyle = getStrokeColor(num,type,seg);
                        }
                        //ctx.strokeStyle = getStrokeColor(num,type);
                        currents[i] = currents[i] + 1;
                        ctx.lineWidth = 1.5;
                        // console.log(start)
                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                        // ctx.fillStyle =  "rgb(15,25,49)";
                        // ctx.strokeStyle = "#ffffff";
                        ctx.lineTo(end.x,end.y)
                        ctx.stroke();

                    }
                    else if(i<=that.lastLen && currents[i] < perList.length-1 && currents[i]>0){
                        //ctx.strokeStyle = getStrokeColor(num,type);
                        if(maps.strokeType == "speed"){
                            ctx.strokeStyle = getColorBySpeed(speed,type)
                        }
                        else{
                            ctx.strokeStyle = getStrokeColor(num,type,seg);
                        }
                        currents[i] = currents[i] + 1;
                        ctx.lineWidth = 1.5;
                        // console.log(start)
                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                        // ctx.fillStyle =  "rgb(15,25,49)";
                        // ctx.strokeStyle = "#ffffff";
                        ctx.lineTo(end.x,end.y)
                        ctx.stroke();
                    }
                    /* else if(i>that.lastLen){
                         ctx.strokeStyle = getStrokeColor(num,type);
                         currents[i] = currents[i] + 1;
                         ctx.lineWidth = .75;
                         // console.log(start)
                         ctx.beginPath();
                         ctx.moveTo(start.x, start.y);
                         // ctx.fillStyle =  "rgb(15,25,49)";
                         // ctx.strokeStyle = "#ffffff";
                         ctx.lineTo(end.x,end.y)
                         ctx.stroke();
                     }*/

                }

            }
        }

    }
    drawStayPath(optiondata){
        var self = this;
        var seg = this.seg
        this.optionData = optiondata;
        var loopTime = optiondata[6].init;
        var minTrajLen = optiondata[4].init;
       // var minTotalFlow = optiondata[5].init;
        var minSpeed = optiondata[5].init;
        let g = d3.select(self.map.getPanes().overlayPane).select("svg").select("g")
        var allLatLngNodes = this.allLatLngNodes ;
        var allParticles = [];
        allLatLngNodes.forEach(function (latLngNodes) {
            latLngNodes.forEach(function (d) {
                d.forEach(function (pp) {
                    var p = self.map.latLngToLayerPoint(new L.LatLng(pp.lat, pp.lng));
                    pp.x = p.x;
                    pp.y = p.y;
                })
                var trajLen = getInfo(d)[0];
                var totalFlow = getInfo(d)[1];
                var averageSpeed = getInfo(d)[2]
                // var ss = getCtrlPoint(g,d,self.map)
                if(trajLen >= minTrajLen  && averageSpeed>= minSpeed){
                        var ss = getTmpPoints(g,d,self.map,loopTime)
                        allParticles.push(ss);

                }
            })
        })
        d3.select(self.map.getPanes().overlayPane).select("canvas").remove();
        L.canvas({clickable:true}).addTo(self.map);
        var canvas = d3.select(self.map.getPanes().overlayPane).select("canvas").attr("id","canvas")
        console.log(canvas)
        var ctx = canvas.node().getContext("2d");
       // self.map.fire();
        self.map.on("viewreset", reset);
       /* self.map.on("click",function (ev) {
            console.log(ev)
            console.log("ev")
            var point = self.map.latLngToLayerPoint(ev.latlng);
            d3.select(".tooltip").html("lat:"+ev.latlng.lat  + "<br />" +
                "lng:"+ev.latlng.lng+"<br />")
                .style("left", (point.x) + "px")
                .style("top", (point.y) + "px")
                .style("opacity",1.0);
        })*/
        self.map.on("zoomstart", function () {
           canvas.attr("height",canvas.attr("height"))
        });
        self.map.on("zoomend",function () {
            console.log("staymapZoom")
            reset();
        })
        reset();

        function reset() {
            console.log("stayreset")
            console.log(allParticles)
            allParticles.forEach(function (particles) {
                particles.forEach(function (p) {
                    var point = self.map.latLngToLayerPoint(new L.LatLng(p.lat,p.lng))
                    p.x = point.x;
                    p.y = point.y
                })
            })

          for(var i = 0 ; i < allParticles.length;i++) {
              var perList = allParticles[i];
              for (var j = 0; j < perList.length - 1; j++) {
                  var start = perList[j];
                  var end = perList[j + 1];
                  //console.log(start);
                  var type = "normal";
                  var num = perList[j + 1].num;
                  var speed = perList[j+1].speed;
                  if(maps.strokeType == "speed"){
                      ctx.strokeStyle = getColorBySpeed(speed,type)
                  }
                  else{
                      ctx.strokeStyle = getStrokeColor(num,type,seg);
                  }

                 // console.log(ctx.strokeStyle);
                  ctx.lineWidth = 1.5;
                  // console.log(start)
                  ctx.beginPath();
                  ctx.moveTo(start.x, start.y);
                  // ctx.fillStyle =  "rgb(15,25,49)";
                  // ctx.strokeStyle = "#ffffff";
                  ctx.lineTo(end.x, end.y)
                  var m = 30;
                  while (m--){
                      ctx.lineTo(start.x, start.y)
                      ctx.lineTo(end.x, end.y)
                  }
                  ctx.stroke();
              }
          }
        }
        }
    addHeatMap(type,data){
        console.log(data)
        console.log(maps.heatNum)

        if(this.negHeatLayer){
            this.map.removeLayer(this.negHeatLayer)
        }
        if(this.heatmapLayer){
            this.map.removeLayer(this.heatmapLayer)
        }
        var that = this;
        var heatdata = [];
        var posHeatData = [];
        var negHeatData = []
        var num = 0 ;
        function compareData(x,y) {
            if (x[3] < y[3] ) {
                return 1;
            } else if (x[3] > y[3]) {
                return -1;
            } else {
                return 0;
            }
        }
       /* if(type=="density"){
            data.sort(compareData)
        }*/
        var maxNum = 0;
        var minNum = 0;
        var heatpro = maps.heatNum;
        if(type == "hourly" || type == "daily"){
            heatpro = maps.anomalyNum;
        }
        if(type == "none"){
            return ;
        }
        else if(type == "speed") {
            heatdata = this.gridSpeed;
            heatdata.forEach(function (t) {
                if(t.count>70){
                    t.count = 0;
                }
            })
            /*this.allLatLngNodes.forEach(function (latLngNodes) {
                latLngNodes.forEach(function (d) {
                    for(var i=0;i<d.length;i++){
                        var pp = d[i];
                        var point;
                        if(i<d.length-1){
                            point = {lat:pp.lat,lng:pp.lng,count:d[i+1].speed}
                        }
                         else {
                            point = {lat:pp.lat,lng:pp.lng,count:pp.speed}
                        }
                        heatdata.push(point)
                    }
                })
            })*/
        }
        else if(type =="Pop."){
            var dtNoZero = [];
            data.forEach(function (t) {
                if(t[3]!=0){
                    num++;
                    dtNoZero.push(t)
                }
            })
            dtNoZero.sort(compareData)
            var len = num/100*heatpro;
            console.log(len)
            for(var i=0;i<len;i++){
                var pp = dtNoZero[i];
                var point;
                if(pp[3]!=0){
                    if(i<data.length-1){
                        point = {lat:pp[2],lng:pp[1],count:pp[3]}
                    }
                    heatdata.push(point)
                }

            }
            posHeatData = heatdata ;

        }
        else if(type == "Mov."){
            //src,to 不一起排序
            console.log(data)
            data.to.forEach(function (pp) {
                if(pp[3]!=0){
                    var point = {lat:pp[2],lng:pp[1],count:pp[3]};
                    posHeatData.push(point)
                }

            })
            data.from.forEach(function (pp) {
                if(pp[3]!=0){
                    var point = {lat:pp[2],lng:pp[1],count:pp[3]};
                    negHeatData.push(point)
                }

            })

            var plen = parseInt((posHeatData.length)*heatpro/100);
            console.log(plen)
            posHeatData = posHeatData.slice(0,plen);
            negHeatData = negHeatData.slice(0,plen)
        }
        else if(type == "hourly" || type == "daily"){
            var ft = maps.fromOrTo;
            /*if(ft=="from"){
                heatdata = data.from;
            }
            else if(ft =="to"){
                heatdata = data.to;
            }*/
            heatdata = data.from;
            var maxAnomaly = 0
          heatdata.forEach(function (t) {
          if(t[3]>0){
              var point = {lat:t[2],lng:t[1],count:t[3]};
              posHeatData.push(point)
              if(t[3]>maxAnomaly){
                  maxAnomaly = t[3]
              }
          }
          else if(t[3]<0){
              var point = {lat:t[2],lng:t[1],count:0-t[3]};
              negHeatData.push(point)
              if(0-t[3]>maxAnomaly){
                  maxAnomaly = 0-t[3]
              }
          }
          })
            posHeatData = posHeatData.filter( t => {
                return t.count > maxAnomaly*(1-heatpro/100)
            })

            negHeatData = negHeatData.filter( t => {
                return t.count > maxAnomaly*(1-heatpro/100)
            })
            // //posHeatData.sort(comparedata)
            // negHeatData.sort(comparedata)
            console.log("pos len is"+posHeatData.length)
            console.log("neg len is"+negHeatData.length)
            //   var plen = parseInt((posHeatData.length+negHeatData.length)*heatpro/100/2);
            //   console.log(plen)
            //   posHeatData = posHeatData.slice(0,plen);
            //  // var nlen = parseInt((negHeatData.length)*heatpro/100);
            //   negHeatData = negHeatData.slice(0,plen)


        }
        console.log("llllll")
        function comparedata (x, y) {//比较函数
            if (x.count < y.count ) {
                return 1;
            } else if (x.count > y.count) {
                return -1;
            } else {
                return 0;
            }
        }
        console.log(heatdata)
        if(type=="speed"){
            maxNum = 20;
            minNum = 2;
            var len = parseInt(heatdata.length*heatpro/100);
            heatdata.sort(comparedata)
            heatdata = heatdata.slice(0,len);
            posHeatData = heatdata;

        }
        console.log(heatdata)
        console.log(maxNum)
        console.log(maps.radius)

        var negMax;
        var negMin
        if(type != "speed"){
            if(type=="Mov." || type == "hourly" || type == "daily"){
                maxNum = d3.max(posHeatData,function (d) {
                    return d[3];
                })
                minNum = d3.min(posHeatData,function (d) {
                    return d[3];
                })
                negMax = d3.max(negHeatData,function (d) {
                    return d[3];
                })
                negMin = d3.min(negHeatData,function (d) {
                    return d[3];
                })
            }
            else{
                maxNum = d3.max(data,function (d) {
                    return d[3];
                })
                minNum = d3.min(data,function (d) {
                    return d[3];
                })
            }

        }

        console.log(posHeatData);
        console.log(negHeatData);
        var testData = {
            max: maxNum,
            min:0,
            data: posHeatData
        };

        var cfg = {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            // if scaleRadius is false it will be the constant radius used in pixels
            "radius": maps.radius/1000,
            "maxOpacity": .7,
            "minOpacity":.02,
            // scales the radius based on map zoom
            "scaleRadius": true,
            "gradient":{
                '0': 'rgba(255,128,128,1)',
                '1': 'rgba(255,0,0,1)'
            },
            // if set to false the heatmap uses the global maximum for colorization
            // if activated: uses the data maximum within the current map boundaries
            //   (there will always be a red spot with useLocalExtremas true)
            "useLocalExtrema": true,
            // which field name in your data represents the latitude - default "lat"
            latField: 'lat',
            // which field name in your data represents the longitude - default "lng"
            lngField: 'lng',
            // which field name in your data represents the data value - default "value"
            valueField: 'count'
        };


        var heatmapLayer = new HeatmapOverlay(cfg);
        console.log(heatmapLayer)
        this.map.addLayer(heatmapLayer)
        heatmapLayer.setData(testData);
        this.heatmapLayer = heatmapLayer;
        if(type == "Mov." || type == "hourly" || type == "daily"){
             var negtestData = {
          max: maxNum,
          min:0,
          data: negHeatData
            };

      var negcfg = {
          // radius should be small ONLY if scaleRadius is true (or small radius is intended)
          // if scaleRadius is false it will be the constant radius used in pixels
          "radius": maps.radius/1000,
          "maxOpacity": .5,
          "minOpacity": .02,
          // scales the radius based on map zoom
          "scaleRadius": true,
          "gradient":{
              '0': 'rgba(128,128,255,1)',
              '1': 'rgba(0,0,255,1)'
          },
          // if set to false the heatmap uses the global maximum for colorization
          // if activated: uses the data maximum within the current map boundaries
          //   (there will always be a red spot with useLocalExtremas true)
          "useLocalExtrema": true,
          // which field name in your data represents the latitude - default "lat"
          latField: 'lat',
          // which field name in your data represents the longitude - default "lng"
          lngField: 'lng',
          // which field name in your data represents the data value - default "value"
          valueField: 'count'
      };

      var negheatmapLayer = new HeatmapOverlay(negcfg);
      console.log(negheatmapLayer)
      this.map.addLayer(negheatmapLayer)
      negheatmapLayer.setData(negtestData);
      this.negHeatLayer = negheatmapLayer;
        }

    }
    invalidateSize(){
        this.map.invalidateSize();
    }
    changeFlow(flag){
        console.log(flag)
        if(flag =="in"){
            this.edgeOutLayer.style("display","none");
            this.arrowOutLayer.style("display","none");
            this.edgeInLayer.style("display","block");
            this.arrowInLayer.style("display","block");
            /*d3.select(".edge-out-layer").style("dispaly","none");
            d3.select(".arrow-out-layer").style("dispaly","none");
            d3.select(".edge-in-layer").style("dispaly","block");
            d3.select(".arrow-in-layer").style("dispaly","block");*/

        }
        else if(flag =="out"){
            this.edgeInLayer.style("display","none");
            this.arrowInLayer.style("display","none");
            this.edgeOutLayer.style("display","block");
            this.arrowOutLayer.style("display","block");
            /*d3.select(".edge-in-layer").style("dispaly","none");
            d3.select(".arrow-in-layer").style("dispaly","none");
            d3.select(".edge-out-layer").style("dispaly","block");
            d3.select(".arrow-out-layer").style("dispaly","block");*/

        }
    }
    changeFill(flag){
        var data = this.data;
        var bdData = this.bdData;
        let self = this;
        var num=[];
        console.log(flag)
        /*if(this.ddnodeLayer){
            console.log("removedd")
            this.map.removeLayer(this.ddnodeLayer);
        }*/
        if(data.nodes.length === 0 || data.nodes[1].stay_device_num === 0){
            console.log("nodes is null")
            this.ddnodeLayer = L.geoJSON(bdData,{
                style:function (feature) {
                    return {color:'grey',
                        weight:1,
                        fillColor:'none'
                    };
                }
            }).addTo(self.map);
            return ;
        }
        function getColor(h,s,l) {
            var colors=[204,204];
            //var colors=204;
            var sRange=[1,0];
            var lRange=[0.9,0.4];
            var sScale=d3.scaleLinear()
                .domain([0,1])
                .range(sRange);
            var lScale=d3.scaleLinear()
                .domain([0,1])
                .range(lRange);
            var value='hsl('+colors[h]+','+(sScale(s)*100)+'%,'+(lScale(l)*100)+'%)';
            return value
        }
        console.log(data);
       /* data.nodes.forEach(function (t) {
            num.push(t.stay_device_num);
            num.push(t.in);
            num.push(t.out);
            num.push(t.all);
        })*/
        if(flag == "stay"){
            data.nodes.forEach(function (t) {
                num.push(t.stay_device_num);
            })
        }
        if(flag == "in"){
            data.nodes.forEach(function (t) {
                num.push(t.in);
            })
        }
        if(flag == "out"){
            data.nodes.forEach(function (t) {
                num.push(t.out);
            })
        }
        if(flag == "all"){
            data.nodes.forEach(function (t) {
                num.push(t.all);
            })
        }

        console.log(num);
        var min = d3.min(num);
        var max = d3.max(num);
        console.log(min)
        console.log(max)
        let features =bdData.features;
        features.forEach(function (feature,index) {
            for(var i=0;i<data.nodes.length;i++){
                var  node = data.nodes[i];
                if(node.x == bdData.features[index].properties.cp[0]
                    && node.y == bdData.features[index].properties.cp[1]){
                    if(flag == "stay"){
                        bdData.features[index].properties.num = node.stay_device_num;
                        bdData.features[index].properties.color = getColor(1,0.5,(node.stay_device_num-min)/(max-min));
                    }
                    if(flag == "in"){
                        bdData.features[index].properties.num = node.in;
                        bdData.features[index].properties.color = getColor(1,0.5,(node.in-min)/(max-min));
                    }
                    if(flag == "out"){
                        bdData.features[index].properties.num = node.out;
                        bdData.features[index].properties.color = getColor(1,0.5,(node.out-min)/(max-min));
                    }
                    if(flag == "all"){
                        bdData.features[index].properties.num = node.all;
                        bdData.features[index].properties.color = getColor(1,0.5,(node.all-min)/(max-min));
                    }
                    }
            }
        });
console.log(d3.select(self.map.getPanes().overlayPane).select("svg").select("g").selectAll(".leaflet-interactive"));
        d3.select(self.map.getPanes().overlayPane).select("svg").select("g").selectAll(".leaflet-interactive")
            .each(function (d,i) {
                d3.select(this).attr("fill",function (d1) {
                    return bdData.features[i].properties.color;
                });
            })


        /*this.ddnodeLayer = L.geoJSON(bdData,{
            style:function (feature) {
                console.log(feature.properties.color)
                return {color:'grey',
                    weight:1,
                    fillColor:feature.properties.color
                };
            }
        }).addTo(self.map);*/
    }
    changeCluster(flag){
        if(flag == "dsType"){
            this.com_bignode.each(function (d) {
                var com_bz = d3.select(this);
                //console.log(d.all)
                com_bz.select(".arc").select("path").style("fill",function () {
                    if(d.outer >= com_z){
                        return d.color
                    }
                    else {
                        return "none"
                    }
                })
            })
        }
        if(flag == "msType"){
            this.com_bignode.each(function (d) {
                var com_bz = d3.select(this);
                //console.log(d.all)
                com_bz.select(".arc").select("path").style("fill",function () {
                    if(d.outer >= com_z){
                        return d.mscolor
                    }
                    else {
                        return "none"
                    }
                })
            })
        }
    }
    changeFilter(radius, stayfilter, stayinfilter,stayoutfilter,edgefilter,comEdgefilter,filter){
        let visual_nodes = [];
        function deg2rad(deg) {
            return deg * (Math.PI/180)
        }

        var z = this.sort_lines[edgefilter];
        var com_z = this.com_sort_lines[comEdgefilter];
        console.log(com_z)
        function getDistance(lon1,lat1,lon2,lat2) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2-lat1);  // deg2rad below
            var dLon = deg2rad(lon2-lon1);
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c; // Distance in km
            return d;

            /*var p = 0.017453292519943295;    // Math.PI / 180
            var c = Math.cos;
            var a = 0.5 - c((lat2 - latitude) * p)/2 +
                c(latitude * p) * c(lat2 * p) *
                (1 - c((long2 - longitude) * p))/2;
            return 12742 * Math.asin(Math.sqrt(a));*/

           /* let R = 6371; // 地球半径
            latitude = latitude * Math.PI / 180.0;
            lat2 = lat2 * Math.PI / 180.0;
            let a = latitude - lat2;
            let b = (longitude - long2) * Math.PI / 180.0;
            let  d;
            let sa2, sb2;
            sa2 = Math.sin(a / 2.0);
            sb2 = Math.sin(b / 2.0);
            d = 2 * R * Math.asin(
                Math.sqrt(sa2 * sa2 + Math.cos(latitude)
                    * Math.cos(lat2) * sb2 * sb2));
            return d;*/
        }
       /* this.node.attr("display",function (d) {
            let distance = getDistance(d.y,d.x,39.975,116.345)
            console.log(distance)
            if(d.id==438){
                return "block";
            }
            else if(distance > radius || d.stay_device_num < stayfilter ||
            d.in < stayinfilter || d.out < stayoutfilter){
                visual_nodes.push(d.id);
                return "none"
            }
            else {
                return "block"
            }
        });*/
        console.log(this.sort_lines);
        console.log(this.com_sort_lines)
        console.log(edgefilter);
        console.log(z)
        this.link.attr("display",function (d) {
            if( d.width < z){
                return "none"
            }
            else {
                return "block"
            }
        });
        this.arrow.attr("display",function (d) {
            if( d.width < z){
                return "none"
            }
            else {
                return "block"
            }
        });

        /*this.bignode.each(function (d) {
            var bz = d3.select(this);

            bz.select(".arc").select("path").style("fill",function () {
                if(d.self >= z){
                    return "red"
                }
                else {

                    return "white"
                }
            })
        });*/
        this.com_bignode.each(function (d) {
            var com_bz = d3.select(this);
            //console.log(d.all)
            com_bz.select(".arc").select("path").style("fill",function () {
                if(d.outer >= com_z){
                    if(filter == "dsType"){
                        return d.color
                    }
                    else if(filter == "msType"){
                        return d.mscolor;
                    }
                }
                else {
                    return "none"
                }
            })
        })
       /* this.ddnode.attr("fill",function (d) {
            //console.log(d);
            if(d.stay_device_num >= z){
                return "grey"
            }
            else {
                return "white"
            }
        })*/

        this.com_node.attr("fill",function (d) {
            if(d.innerRadius >= com_z){
                return "black"
            }
            else {
                return "none"
            }
        })


        /*this.com_link.attr("display",function (d) {
            if( d.travel_device_num < com_z){
                return "none"
            }
            else {
                return "block"
            }
        });
        this.com_arrow.attr("display",function (d) {
            if( d.travel_device_num < com_z){
                return "none"
            }
            else {
                return "block"
            }
        });*/
 /*       this.link.attr("display",function (d) {
            let distance = getDistance(d.from_y,d.from_x,39.975,116.345);
            if(distance>radius || d.travel_record_num < edgefilter){
                return "none"
            }
            else {
                return "block"
            }
        });
        this.arrow.attr("display",function (d) {
            let distance = getDistance(d.from_y,d.from_x,39.975,116.345);
            if(distance>radius || d.travel_record_num < edgefilter){
                return "none"
            }
            else {
                return "block"
            }
        });*/

       /* this.link1.attr("display",function (d) {
            let distance = getDistance(d.to_y,d.to_x,39.975,116.345);
            if(distance>radius || d.travel_record_num < edgefilter){
                return "none"
            }
            else {
                return "block"
            }
        });
        this.arrow1.attr("display",function (d) {
            let distance = getDistance(d.to_y,d.to_x,39.975,116.345);
            if(distance>radius || d.travel_record_num < edgefilter ){
                return "none"
            }
            else {
                return "block"
            }
        });*/

    }
    changeVisualRadius(radius){
        let visual_nodes = [];
        function getDistance(longitude,latitude,long2,lat2) {
            let R = 6371; // 地球半径
            latitude = latitude * Math.PI / 180.0;
            lat2 = lat2 * Math.PI / 180.0;
            let a = latitude - lat2;
            let b = (longitude - long2) * Math.PI / 180.0;
            let  d;
            let sa2, sb2;
            sa2 = Math.sin(a / 2.0);
            sb2 = Math.sin(b / 2.0);
            d = 2 * R * Math.asin(
                Math.sqrt(sa2 * sa2 + Math.cos(latitude)
                    * Math.cos(lat2) * sb2 * sb2));
            return d;
        }
        this.node.attr("display",function (d) {
            let distance = getDistance(d.y,d.x,39.975,116.345)
            console.log(distance)
            if(d.id==438){
                return "block";
            }
            else if(distance>radius){
                visual_nodes.push(d.id);
                return "none"
            }
            else {

                return "block"
            }
        });
        console.log(visual_nodes)
        this.link.attr("display",function (d) {
            let distance = getDistance(d.from_y,d.from_x,39.975,116.345);
            if(distance>radius){
                return "none"
            }
            else {
                return "block"
            }
            });
        this.arrow.attr("display",function (d) {
            let distance = getDistance(d.from_y,d.from_x,39.975,116.345);
            if(distance>radius){
                return "none"
            }
            else {
                return "block"
            }
        });

        this.link1.attr("display",function (d) {
            let distance = getDistance(d.to_y,d.to_x,39.975,116.345);
            if(distance>radius){
                return "none"
            }
            else {
                return "block"
            }
        });
        this.arrow1.attr("display",function (d) {
            let distance = getDistance(d.to_y,d.to_x,39.975,116.345);
            if(distance>radius){
                return "none"
            }
            else {
                return "block"
            }
        });

    }
    changeSFU(stayfilter){
        this.node.attr('display',function (d) {
            if(d.stay_record_num>=stayfilter){
                return 'block'
            }
            else return 'none'
        })
            }
    changeIFU(stayinfilter){
        this.node.attr('display',function (d) {
            if(d.in >= stayinfilter){
                return 'block'
            }
            else return 'none'
        })
    }
    changeOFU(stayoutfilter){
        this.node.attr('display',function (d) {
            if(d.out >= stayoutfilter){
                return 'block'
            }
            else return 'none'
        })
    }
    changeEFU(edgefilter){
        this.link.attr('display',function (d) {
            if(d.travel_record_num>=edgefilter){
                return 'block'
            }
            else return 'none'
        })
        this.arrow.attr('display',function (d) {
             if(d.travel_record_num>=edgefilter){
                    return 'block'
                }
                else return 'none'
        })
    }
    /*removeLayer(layer){
        this.map.removeLayer(layer);
    }*/

    // color each district
    drawDistrict(data,bdData,isRemove){
        let self = this;
        this.data = data;
        this.bdData = bdData;

        var num=[];
        if(isRemove === false){

        }
        else{
            let g = d3.select(self.map.getPanes().overlayPane).select("svg").remove();

        }
       if(this.ddnodeLayer){
            console.log("removedd")
            this.map.removeLayer(this.ddnodeLayer);
        }
        if(data.nodes.length === 0 || data.nodes[1].stay_device_num === 0){
            console.log("nodes is null")
            this.ddnodeLayer = L.geoJSON(bdData,{

                style:function (feature) {
                    return {color:'grey',
                        weight:1,
                        fillColor:'none'
                    };
                }
            }).addTo(self.map);
            return ;
        }

        function getColor(h,s,l) {
            var colors=[204,204];
            //var colors = [0,0];
            //var colors=204;
            var sRange=[1,0];
            var lRange=[0.9,0.4];
            var sScale=d3.scaleLinear()
                .domain([0,1])
                .range(sRange);
            var lScale=d3.scaleLinear()
                .domain([0,1])
                .range(lRange);
            var value='hsl('+colors[h]+','+(sScale(s)*100)+'%,'+(lScale(l)*100)+'%)';
            return value
        }

        data.nodes.forEach(function (t) {
            num.push(t.stay_device_num);
        })
        console.log(num);
        var min = d3.min(num);
        var max = d3.max(num);

        let features =bdData.features;
        features.forEach(function (feature,index) {
            for(var i=0;i<data.nodes.length;i++){
               var  node = data.nodes[i];
                if(node.x == bdData.features[index].properties.cp[0]
                && node.y == bdData.features[index].properties.cp[1]){
                    bdData.features[index].properties.num = node.stay_device_num;
                    bdData.features[index].properties.color = getColor(1,0.5,(node.stay_device_num-min)/(max-min));
                }
            }
             });
        this.ddnodeLayer = L.geoJSON(bdData,{
            interactive:true,
            style:function (feature) {
                return {color:'grey',
                    weight:1,
                    fillColor:feature.properties.color
                };
            }
        }).addTo(self.map);
    }
    drawDisDis(graph,lines){
        let self = this;
        var sort_lines = sortline(lines,graph.nodes);
        this.sort_lines = sort_lines;
        var initZoom = self.map.getZoom();

        let g = d3.select(self.map.getPanes().overlayPane).select("svg").select("g");
        g.select(".node-dd-layer").remove();
        g.select(".edge-dd-layer").remove();
        g.select(".arrow-dd-layer").remove();
        let ddEdgeG = g.append("g").attr("class","edge-dd-layer");
        let ddArrowG = g.append("g").attr("class","arrow-dd-layer");
        let ddnodeG =  g.append("g").attr("class","node-dd-layer");

        /* let ddnodeG = this.ddnodeG;
       let ddEdgeG = this.ddEdgeG;
       let ddArrowG = this.ddArrowG;*/
        var num = [];
        var selfnum = [];
        graph.nodes.forEach(function (t) {
            num.push(t.stay_device_num);
            selfnum.push(t.self);
        })
        var staymin = d3.min(num);
        var staymax = d3.max(num);
        var selfmin = d3.min(selfnum);
        var selfmax = d3.max(selfnum);
        function getColor(h,s,l) {
            var colors=[204,204];
            //var colors = [0,0]
            //var colors=204;
            var sRange=[1,0];
            var lRange=[0.8,0.3];
            var sScale=d3.scaleLinear()
                .domain([0,1])
                .range(sRange);
            var lScale=d3.scaleLinear()
                .domain([0,1])
                .range(lRange);
            var value='hsl('+colors[h]+','+(sScale(s)*100)+'%,'+(lScale(l)*100)+'%)';
            return value
        }
        function getRadius(num,min,max) {
            return (num-min)/(max-min)*10+5;
        }
        g.selectAll(".node").remove();
        g.selectAll(".edge").remove();
        g.selectAll(".arrow").remove();
        function pathData(point1,point2) {
            var x1,y1,x2,y2,r1,r2,dis;
            var xc,yc;
            x1 = point1.x;
            y1 = point1.y;
            x2 = point2.x;
            y2 = point2.y;
            xc=(x1+x2)/2+(y1-y2)/8;
            yc=(y1+y2)/2+(x2-x1)/8;
            return [
                'M', x1, ' ', y1,
                'Q', xc, ' ', yc,' ',x2, ' ', y2
            ].join('');
        }
        function pathToSelf(point1,point2) {
            var x1 = point1.x,
                y1 = point1.y,
                x2 = point2.x,
                y2 = point2.y,
                dx = x2 - x1,
                dy = y2 - y1,
                dr = Math.sqrt(dx * dx + dy * dy),

                // Defaults for normal edge.
                drx = dr,
                dry = dr,
                xRotation = 0, // degrees
                largeArc = 0, // 1 or 0
                sweep = 1; // 1 or 0

            // Self edge.
            if ( x1 === x2 && y1 === y2 ) {
                // Fiddle with this angle to get loop oriented.
                xRotation = -45;

                // Needs to be 1.
                largeArc = 1;

                // Change sweep to change orientation of loop.
                //sweep = 0;

                // Make drx and dry different to get an ellipse
                // instead of a circle.
                drx = 30;
                dry = 20;

                // For whatever reason the arc collapses to a point if the beginning
                // and ending points of the arc are the same, so kludge it.
                x2 = x2 + 1;
                y2 = y2 + 1;
            }

            return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;

        }
        function qBerzier(p0,p1,p2,t){
            var x = (1 - t) * (1 - t) * p0.x + 2 * t * (1 - t) * p1.x + t * t * p2.x;
            var y = (1 - t) * (1 - t) * p0.y + 2 * t * (1 - t) * p1.y + t * t * p2.y;
            var midpoint={
                x:x,
                y:y
            }
            return midpoint;
        }
        function arrowData(point1,point2) {
            var slopy,cosy,siny,x1,x2,y1,y2;
            var Par=10.0;
            x1 = point1.x;
            y1 = point1.y;
            x2 = point2.x;
            y2 = point2.y;
            var xc=(x1+x2)/2+(y1-y2)/8;
            var yc=(y1+y2)/2+(x2-x1)/8;
            var p1={x:xc,y:yc};
            var midPoint=qBerzier(point1,p1,point2,0.5)
            slopy=Math.atan2((y1-y2),(x1-x2));
            cosy=Math.cos(slopy);
            siny=Math.sin(slopy);
            return [
                'M', midPoint.x, ' ', midPoint.y,
                'L', (Number(midPoint.x)+Number(Par*cosy-(Par/2.0*siny))*initZoom/10), ' ', Number(midPoint.y)+Number(Par*siny+(Par/2.0*cosy))*initZoom/10,
                'M', Number(midPoint.x)+Number(Par*cosy+Par/2.0*siny)*initZoom/10, ' ', Number(midPoint.y)-Number(Par/2.0*cosy-Par*siny)*initZoom/10,
                'L', midPoint.x, ' ', midPoint.y,
            ].join('');
        }
        function projectPoint(x, y) {
            let self = this;
            let point = self.map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }
        let transform = d3.geoTransform({point: self.projectPoint}),
            path = d3.geoPath().projection(transform);


        function get_leaflet_offset(){
            var trfm = $(".leaflet-map-pane").css('transform');
            trfm = trfm.split(", ");
            return [parseInt(trfm[4]), parseInt(trfm[5])];

        }

        function dragstarted(d) {
           console.log("start")
            self.map.dragging.disable();
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging",true)
           //d_string = d3.select(this).attr("d");
            //d_string = d_string.substring(d_string.indexOf("m"));

        }

        function dragmove(d) {
            var offset = get_leaflet_offset();
            var size = d3.select(this).attr("r")/2;
            var pt = layer_to_LL(d3.event.sourceEvent.clientX - size - offset[0], d3.event.sourceEvent.clientY - size - offset[1]);
            //d.geometry.coordinates = [pt.lng, pt.lat];
            d.x = pt.lng;
            d.y = pt.lat;
            d3.select(this).classed("dragging", false);
            lines.forEach(function (line) {
                if(line.from_nid == d.id){
                    line.from_x = d.x;
                    line.from_y = d.y;
                }
                if(line.to_nid == d.id){
                    line.to_x = d.x;
                    line.to_y = d.y;
                }
            })
            reset();

           /* d3.select(this).attr("fill","blue")
            d.ax = d3.event.x;
            d.ay = d3.event.y;
            d3.select(this).attr("transform",function () {
                return "translate("+d.ax+","+d.ay+")";
            })*/
        }
        function layer_to_LL(x,y){return self.map.layerPointToLatLng(new L.Point(x,y));}
        function dragended(d) {
            self.map.dragging.enable();
        }


        var drag = d3.drag()
            .on('start', dragstarted)
            .on("drag",dragmove)
            .on("end",dragended);

        let ddnode = ddnodeG.selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("fill",function (d) {
                //return getColor(1,0.5,(d.stay_device_num-min)/(max-min));
                return "grey"
            })
            .attr("class","node")
            .style("cursor","point")
            .attr("id",function (d) {
                return "node_"+d.id
            })
            .on("click",function (d) {
                console.log("click")
            })
            .on("mouseover",function (d) {
                d3.select(".tooltip").html(d.id  + "<br />" +
                    d.stay_device_num)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY-90) + "px")
                    .style("opacity",1.0);
            })
            .call(drag);


        let bignode = ddnodeG.selectAll("node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class","big-node")
            .attr("id",function (d) {
                return "g"+d.id
            })
            .call(drag);

        let ddlink = ddEdgeG.selectAll("path")
            .data(lines)
            .enter().append("path")
            .attr("stroke","red")
            .style("fill","none")
            .attr("class","edge")
            .attr("opacity","0.5")
            .attr("id",function (d) {
                return "link_"+d.eid;
            })
            .on("mouseover",function (d) {
                return d.travel_device_num;
            })

        let ddarrow = ddArrowG.selectAll("path")
            .data(lines)
            .enter()
            .append("path")
            .attr("class","arrow")
            .style("stroke","red")
            .style("fill","none")
            .style("opacity","0.5")
            .attr("id",function (d) {
                return "arrow_"+d.eid;
            });

        self.map.on("viewreset", reset);
        self.map.on("zoomstart",function(){
            g.style('display','none');
        });

        self.map.on("zoomend",function() {
            reset();
        });
        var nums = [];
        lines.forEach(function (line) {
            nums.push(line.travel_device_num);
        })
        console.log(nums);
        var min = d3.min(nums);
        var max = d3.max(nums);
        console.log(min)
        console.log(max)
        reset();

        function reset() {
            console.log("reset!")
            var curZoom = self.map.getZoom();
            console.log(curZoom);
            console.log(initZoom);
            g.style('display', 'block');

           /* bignode.attr("transform",function (d) {

                var pos = self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x));

                return "translate("+pos.x+","+pos.y+")";
            })
                .attr("r",function (d) {
                    //return curZoom*d.stay_record_num/800/initZoom;*!/
                    if(d.self <= 0 ){
                        return 0;
                    }
                    var r = getRadius(d.self,min,max)
                    d.outerRadius = curZoom*r/initZoom.r;
                    return curZoom*r/initZoom;
                })
                .style("opacity","0.8");*/



            ddnode.attr("transform",function (d) {

                var pos = self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x));
                d.pos = pos;
                //映射位置
                return "translate("+pos.x+","+pos.y+")";
            })
                .attr("r",function (d) {
                    //return curZoom*d.stay_record_num/800/initZoom;*!/
                    if(d.stay_device_num <= 0 ){
                        return 0;
                    }
                    var r = getRadius(d.stay_device_num,staymin,staymax)
                    d.innerRadius = curZoom*r/initZoom;
                    return curZoom*r/initZoom;
                })
                .style("opacity","0.8")
                .call(drag);

            bignode.each(function (d,i) {
                var R = getRadius(d.self,selfmin,selfmax);

                //映射位置
                d.outerRadius = curZoom*R/initZoom+d.innerRadius;
                var arcdata = [];
                arcdata.push({
                    "id":d.id,
                    "num":d.self
                })
                var arc = d3.arc()
                    .outerRadius(d.outerRadius)
                    .innerRadius(d.innerRadius)
                    .padAngle(0);

                var pie = d3.pie()
                    .sort(null)
                    .value(function (d1) {
                        return d1.num;
                    });

                var z = d3.select(this);
                z.attr("transform",function () {
                    var pos = self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x));
                    return 'translate(' + pos.x + ',' + pos.y +')';
                })
                var bz=z.selectAll(".arc")
                    .data(pie(arcdata))
                    .enter()
                    .append('g')
                    .attr('class','arc')
                    .attr('id',function (d,i) {
                        //console.log(arc(d));
                        return 'arc'+i;
                    })
                    /*.attr('transform', function () {
                        var pos = self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x));
                        return 'translate(' + pos.x + ',' + pos.y +')';
                    });*/


                bz.append("path")
                    .attr("d",arc )
                    .attr('id',function (d,i) {
                        //console.log(arc(d));
                        return i;
                    })
                    .style("cursor","hand")
                    .style("fill",function(d,i){
                        return "red"
                    })
                    .each(function (d1,i) {
                        d1.arcdata=arcdata;
                    })
                    .style("stroke",function (d,i) {
                        return "red";
                    })
                    .style("stroke-width",'1px')
                    // .style('z-index','200')
                    .style('opacity',function (d,i) {
                        return 1;
                    })
                    .on("click",function (d) {
                        console.log("click")
                    })


            })



            ddlink.attr("d",function (d) {
                var point1 =  self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x));
                var point2 =  self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x))
                // draw path to itself
               /* if(d.from_nid == d.to_nid){
                    return pathToSelf(point1,point2)
                }*/
                //console.log(point1)
                return pathData(point1, point2);
            })
                .attr("stroke-width",function(d){
                    /*if(curZoom == 9){
                        var width = getWidth(d.travel_device_num,min,max);
                        return (curZoom)*width/initZoom/2;
                    }*/
                    if(d.travel_device_num == 0){
                        return 0;
                    }
                    var width = getDisWidth(d.travel_device_num,min,max);
                   // console.log((curZoom+20)*width/initZoom);
                    return (curZoom+20)*width/initZoom;
                   /* if(curZoom*d.travel_device_num/initZoom>10)
                        return 10;
                    return curZoom*d.travel_device_num/initZoom;*/
                });

            //.attr("marker-end","url(#arrow)");
            ddarrow.attr("d",function (d) {
                var point1 =  self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x));
                var point2 =  self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x))
                return arrowData(point1, point2);
            })
                .attr("stroke-width",function (d) {
                    if(d.from_nid == d.to_nid){
                        return 0;
                    }
                    if(d.travel_device_num == 0){
                        return 0;
                    }
                   /* if(curZoom = 9){
                        var width = getWidth(d.travel_device_num,min,max);
                        return (curZoom)*width/initZoom/2;
                    }*/
                    var width = getDisWidth(d.travel_device_num,min,max);
                    return (curZoom+20)*width/initZoom;
                    /*if(curZoom*d.travel_device_num/initZoom>10)
                        return 5;
                    return curZoom*d.travel_device_num/initZoom/2;*/
                });
        }
        this.bignode = bignode;
        this.ddnode = ddnode;
        this.link = ddlink;
        this.arrow = ddarrow;
        this.ddEdgeLayer = ddEdgeG;
        this.ddArrowLayer = ddArrowG;
        this.ddedge = ddlink;
        this.ddarrow = ddarrow;
        }
    drawPoiToDiv(data){
        console.log("drawPoiToDiv")
        let self = this;

        var initZoom = self.map.getZoom();
        var curZoom = self.map.getZoom();
        console.log(self.map);
        let svgid = `graphSVG`
        //let svg = d3.select("#"+self.map.id).select("svg");
        //console.log(svg)
        //let   g= svg.append("g").attr("class", "leaflet-zoom-hide");
        let g = d3.select(self.map.getPanes().overlayPane).select("svg").select("g");
        //g = svg.append("g").attr("class", "leaflet-zoom-hide");
        console.log(g)
        g.select(".node-layer").remove();
        g.select(".edge-in-layer").remove();
        g.select(".edge-out-layer").remove();
        g.select(".arrow-in-layer").remove();
        g.select(".arrow-out-layer").remove();

        let nodeG = g.append("g").attr("class","node-layer");
        let edgeG = g.append("g").attr("class","edge-in-layer");
        let edgeG1 = g.append("g").attr("class","edge-out-layer").style("display","none");

        let arrowG = g.append("g").attr("class","arrow-in-layer");
        let arrowG1 = g.append("g").attr("class","arrow-out-layer").style("display","none");

        console.log(nodeG)

        /*g.selectAll(".node").remove();
        g.selectAll(".edge").remove();
        g.selectAll(".arrow").remove();*/
        function pathData(point1,point2) {
            var x1,y1,x2,y2,r1,r2,dis;
            var xc,yc;
            x1 = point1.x;
            y1 = point1.y;
            x2 = point2.x;
            y2 = point2.y;
            xc=(x1+x2)/2+(y1-y2)/8;
            yc=(y1+y2)/2+(x2-x1)/8;
            return [
                'M', x1, ' ', y1,
                'Q', xc, ' ', yc,' ',x2, ' ', y2
            ].join('');
        }
        function qBerzier(p0,p1,p2,t){
            var x = (1 - t) * (1 - t) * p0.x + 2 * t * (1 - t) * p1.x + t * t * p2.x;
            var y = (1 - t) * (1 - t) * p0.y + 2 * t * (1 - t) * p1.y + t * t * p2.y;
            var midpoint={
                x:x,
                y:y
            }
            return midpoint;
        }
        function arrowData(point1,point2) {
            var slopy,cosy,siny,x1,x2,y1,y2;
            var Par=10.0;
            x1 = point1.x;
            y1 = point1.y;
            x2 = point2.x;
            y2 = point2.y;
            var xc=(x1+x2)/2+(y1-y2)/8;
            var yc=(y1+y2)/2+(x2-x1)/8;
            var p1={x:xc,y:yc};
            var midPoint=qBerzier(point1,p1,point2,0.5)
            slopy=Math.atan2((y1-y2),(x1-x2));
            cosy=Math.cos(slopy);
            siny=Math.sin(slopy);
            return [
                'M', midPoint.x, ' ', midPoint.y,
                'L', (Number(midPoint.x)+Number(Par*cosy-(Par/2.0*siny))*initZoom/10), ' ', Number(midPoint.y)+Number(Par*siny+(Par/2.0*cosy))*initZoom/10,
                'M', Number(midPoint.x)+Number(Par*cosy+Par/2.0*siny)*initZoom/10, ' ', Number(midPoint.y)-Number(Par/2.0*cosy-Par*siny)*initZoom/10,
                'L', midPoint.x, ' ', midPoint.y,
            ].join('');
        }
        function projectPoint(x, y) {
            let self = this;
            let point = self.map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }
        function getColor(h,s,l) {
            var colors=[204,204];
            //var colors=204;
            var sRange=[1,0];
            var lRange=[0.8,0.3];
            var sScale=d3.scaleLinear()
                .domain([0,1])
                .range(sRange);
            var lScale=d3.scaleLinear()
                .domain([0,1])
                .range(lRange);
            var value='hsl('+colors[h]+','+(sScale(s)*100)+'%,'+(lScale(l)*100)+'%)';
            return value
        }
        let transform = d3.geoTransform({point: self.projectPoint}),
            path = d3.geoPath().projection(transform);
        var nums = []
        var allnums = []
        data.nodes[0].forEach(function (d) {
            nums.push(d.stay_device_num);
            allnums.push(d.all);
        })
        var edgenum=[];
        data.edges[0].forEach(function (d) {
            edgenum.push(d.travel_device_num)
        })
        var min = d3.min(edgenum);
        var max = d3.max(edgenum);
        var staymin = d3.min(nums);
        var staymax = d3.max(nums)
        var allmin = d3.min(allnums);
        var allmax = d3.max(allnums)

       /* let node = nodeG.selectAll("circle")
            .data(data.nodes[0])
            .enter().append("circle")
            .attr("fill",function (d) {
                if(d.stay_device_num <= 0){
                    return 'none';
                }
                /!*return getColor(1,0.5,(d.stay_device_num-min)/(max-min));*!/
                return "steelblue"
            })
            .attr("class","node")
            .attr("id",function (d) {
                return "node_"+d.id
            });
*/
       var link = null;
        let com_node = nodeG.selectAll("circle")
            .data(data.nodes[0])
            .enter().append("circle")
            .attr("fill",function (d) {
                //return getColor(1,0.5,(d.stay_device_num-min)/(max-min));
                return "black"
            })
            .attr("class","com-node")
            .style("cursor","point")
            .attr("id",function (d) {
                return "node_"+d.id
            })
            .on("click",function (d) {
                console.log("click")
            })
            .on("mouseover",function (d) {
                console.log(d.edges);
                d3.select(".tooltip").html("name:"+d.name  + "<br />" +
                    "stay:"+d.stay_device_num+"<br />"
                    +"in:"+d.in+"<br />"
                    +"out:"+d.out+"<br />"
                    +"all:"+(d.all)+"<br />")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY-90) + "px")
                    .style("opacity",1.0);
                d.link = edgeG.selectAll("path" +d.id)
                    .data(d.edges)
                    .enter().append("path")
                    .attr("stroke","steelblue")
                    .style("fill",'none')
                    .attr("class","edge")
                    .attr("opacity","0.5")
                    .attr("id",function (d) {
                        return "link_"+d.from_nid;
                    })
                    .attr("d",function (d) {
                        var point1 =  self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x));
                        var point2 =  self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x))
                        //console.log(point1)
                        return pathData(point1, point2);
                    })
                    .attr("stroke-width",function(d){
                        if(d.travel_device_num<=0){
                            return 0;
                        }
                        var width = getWidth(d.travel_device_num,min,max);
                        d.width = (curZoom+20)*width/initZoom;
                        // console.log((curZoom+20)*width/initZoom);
                        return (curZoom+20)*width/initZoom;
                    });
                d.arrow = arrowG.selectAll("path")
                    .data(d.edges)
                    .enter()
                    .append("path")
                    .attr("class","arrow")
                    .style("stroke","steelblue")
                    .style("fill","none")
                    .style("opacity","0.5")
                    .attr("id",function (d) {
                        return "arrow_"+d.eid;
                    })
                    .attr("d",function (d) {
                    var point1 =  self.map.latLngToLayerPoint(new L.LatLng(d.from_y, d.from_x));
                    var point2 =  self.map.latLngToLayerPoint(new L.LatLng(d.to_y, d.to_x))
                    return arrowData(point1, point2);
                })
                    .attr("stroke-width",function (d) {
                        if(d.travel_device_num<=0){
                            return 0;
                        }
                        return d.width;
                    });

            })
            .on("mouseout",function (d) {
                edgeG.selectAll("path").remove();
                arrowG.selectAll("path").remove();
                //d3.select(".tooltip").style("opacity",0);
            })
            


        let com_bignode = nodeG.selectAll("node")
            .data(data.nodes[0])
            .enter().append("g")
            .attr("class","com-big-node")
            .attr("id",function (d) {
                return "g"+d.id
            });


        /*let link1=edgeG1.selectAll("path")
            .data(data.edges[0])
            .enter().append("path")
            .attr("stroke","black")
            .style("fill",'none')
            .attr("class","edge")
            .attr("opacity","0.5");*/

       /* let link=edgeG.selectAll("path")
            .data(data.edges[0])
            .enter().append("path")
            .attr("stroke","steelblue")
            .style("fill",'none')
            .attr("class","edge")
            .attr("opacity","0.5")
            .attr("id",function (d) {
                return "link_"+d.from_nid;
            });*/

       /* let arrow1 = arrowG1.selectAll("path")
            .data(lines1)
            .enter()
            .append("path")
            .attr("class","arrow")
            .style("stroke","black")
            .style("fill","none")
            .style("opacity","0.5");
*/
        /*let arrow = arrowG.selectAll("path")
            .data(data.edges[0])
            .enter()
            .append("path")
            .attr("class","arrow")
            .style("stroke","steelblue")
            .style("fill","none")
            .style("opacity","0.5")
            .attr("id",function (d) {
                return "arrow_"+d.eid;
            });*/
        var a = d3.rgb(0,255,0)
        var b = d3.rgb(255,255,0);
        var computeColor = d3.interpolate(a,b);
        var colors = ["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30","#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419","#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695","#67001f",
"#b2182b",
"#d6604d",
"#f4a582",
"#fddbc7",
"#ffffff",
"#e0e0e0",
"#bababa",
"#878787",
"#4d4d4d",
"#1a1a1a","#8dd3c7",
"#ffffb3",
"#bebada",
"#fb8072",
"#80b1d3",
"#fdb462"]
        self.map.on("viewreset", reset);
        self.map.on("zoomstart",function(){
            g.style('display','none');
        });

        self.map.on("zoomend",function() {
            reset();
        });
        reset();

        function clicked() {
            
        }
        function reset() {
            console.log("reset!")
            curZoom = self.map.getZoom();
            g.style('display','block');

            com_node.attr("transform",function (d,k) {

                var pos = self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x));
                d.pos = pos;
                //映射位置
                return "translate("+pos.x+","+pos.y+")";
            })
                .attr("r",function (d) {
                    //return curZoom*d.stay_record_num/800/initZoom;*!/
                    if(d.stay_device_num <= 0 ){
                        return 0;
                    }
                    var r = getRadius(d.stay_device_num,staymin,staymax)
                    d.innerRadius = r;
                    return curZoom*r/initZoom;
                })
                .style("opacity","0.8")



            com_bignode.each(function (d,k) {

                if(d.all!=0){
                    var R = getRadius(d.all,allmin,allmax);

                    //映射位置
                    d.outer = R;
                    d.outerRadius = curZoom*(R+d.innerRadius)/initZoom;
                    var arcdata = [];
                    //all includes two selfs
                    arcdata.push({
                        "id":d.id,
                        "num":d.all,
                        "dsType":d.dsType,
                        "msType":d.msType
                    })

                    var arc = d3.arc()
                        .outerRadius(d.outerRadius)
                        .innerRadius(d.innerRadius)
                        .padAngle(0);

                    var pie = d3.pie()
                        .sort(null)
                        .value(function (d1) {
                            return d1.num;
                        });

                    var z = d3.select(this);
                    z.attr("transform",function () {
                        var pos = self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x));
                        return 'translate(' + pos.x + ',' + pos.y +')';
                    })
                    var bz=z.selectAll(".arc")
                        .data(pie(arcdata))
                        .enter()
                        .append('g')
                        .attr('class','arc')
                        .attr('id',function (d,i) {
                            //console.log(arc(d));
                            return 'arc'+i;
                        })
                    /*.attr('transform', function () {
                        var pos = self.map.latLngToLayerPoint(new L.LatLng(d.y,d.x));
                        return 'translate(' + pos.x + ',' + pos.y +')';
                    });*/


                    bz.append("path")
                        .attr("d",arc )
                        .attr('id',function (d,i) {
                            //console.log(arc(d));
                            return i;
                        })
                        .style("cursor","hand")
                        .style("fill",function(ds,i){
                            console.log(d.dsType);
                            d.color = colors[d.dsType]
                            d.mscolor = colors[d.msType]
                            //console.log(computeColor((d.dsType-0)/49+0))
                            //return computeColor((d.dsType-0)/49+0)
                            return colors[d.dsType];
                        })
                        .each(function (d1,i) {
                            d1.arcdata=arcdata;
                        })
                        .style("stroke",function (d,i) {
                            return "none";
                        })
                        .style("stroke-width",'0.5px')
                        // .style('z-index','200')
                        .style('opacity',function (d,i) {
                            return 1;
                        })
                        .on("click",function (d) {
                            console.log("click")
                        })
                        .on("click",clicked);

                }


            })

        }

        this.com_node = com_node;
        this.com_bignode = com_bignode;
       // this.com_link = link;
        //this.com_arrow = arrow;
    }
    addSelectLayer(){
       let self = this ;
       var that = this;
        var leafletDraw = require('leaflet-draw');
        var editableLayers = new L.FeatureGroup();
        self.map.addLayer(editableLayers);
        var MyCustomMarker = L.Icon.extend({
            options: {
                shadowUrl: null,
                iconAnchor: new L.Point(12, 12),
                iconSize: new L.Point(24, 24),
                iconUrl: './images'
            }
        });

        var options = {
            position: 'bottomright',
            draw: {
                polyline: {
                    shapeOptions: {
                        color: '#f357a1',
                        weight: 10
                    }
                },
                polygon: {
                    allowIntersection: false, // Restricts shapes to simple polygons
                    drawError: {
                        color: '#e1e100', // Color the shape will turn when intersects
                        message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                    },
                    shapeOptions: {
                        color: '#bada55'
                    }
                },
                circle: false, // Turns off this drawing tool
                rectangle: {
                    shapeOptions: {
                        clickable: false
                    }
                },
                marker: {
                    icon: new MyCustomMarker()
                }
            },
            edit: {
                featureGroup: editableLayers, //REQUIRED!!
                remove: true
            }
        };
       var bounds = [];
        var drawControl = new L.Control.Draw(options);
        self.map.addControl(drawControl);

        self.map.on(L.Draw.Event.CREATED, function (e) {
            var type = e.layerType,
                layer = e.layer;

            if (type === 'marker') {
                layer.bindPopup('A popup!');
            }

            editableLayers.addLayer(layer);
        });
        self.map.on(L.Draw.Event.CREATED, function (e) {
            var type = e.layerType,
                layer = e.layer;
            if (type === 'rectangle') {
                // Do marker specific actions
                console.log(layer.getLatLngs());
               /* if(layer.bounds){
                    layer.bounds.push({
                        _southWest:layer.getLatLngs()[0][0],
                        _northEast:layer.getLatLngs()[0][2]
                    })
                }
                else{
                    layer.bounds=[{
                        _southWest:layer.getLatLngs()[0][0],
                        _northEast:layer.getLatLngs()[0][2]
                    }]
                }*/
                layer.bounds={
                    _southWest:layer.getLatLngs()[0][0],
                    _northEast:layer.getLatLngs()[0][2]
                }
                bounds.push(layer.bounds)
                that.drawLoopTree(that.optionData,bounds)
               /* var bounds = {
                    _southWest:layer.getLatLngs()[0][0],
                    _northEast:layer.getLatLngs()[0][2]
                };
                that.drawLoopTree(that.optionData,bounds);*/

            }
            self.map.addLayer(layer);
        });
        /*self.map.on('draw:edited', function (e) {
            var layers = e.layers;
            layers.eachLayer(function (layer) {
                //do whatever you want; most likely save back to db
                var bounds = {
                    _southWest:layer.getLatLngs()[0][0],
                    _northEast:layer.getLatLngs()[0][2]
                };
                that.drawLoopTree(that.optionData,bounds);
            });
        });*/
        //todo
        self.map.on('draw:edited', function (e) {
            var layers = e.layers;
            //bounds = [];
            layers.eachLayer(function (layer) {
                //do whatever you want; most likely save back to db
                for(var i = 0;i<bounds.length;i++){
                    var t = bounds[i];
                    if(t._northEast.lat == layer.bounds._northEast.lat && t._northEast.lng == layer.bounds._northEast.lng) {
                       bounds[i] = {
                           _southWest:layer.getLatLngs()[0][0],
                           _northEast:layer.getLatLngs()[0][2]
                       }
                    }
                }

               /* bounds.forEach(function (t) {
                    if(t._northEast.lat == layer.bounds._northEast.lat && t._northEast.lng == layer.bounds._northEast.lng){
                        t = {
                            _southWest:layer.getLatLngs()[0][0],
                            _northEast:layer.getLatLngs()[0][2]
                        }
                    }
                })*/
               /* bounds.push({
                    _southWest:layer.getLatLngs()[0][0],
                    _northEast:layer.getLatLngs()[0][2]
                });*/
                layer.bounds={
                    _southWest:layer.getLatLngs()[0][0],
                    _northEast:layer.getLatLngs()[0][2]
                }
console.log(bounds)
               /* var bounds = {
                    _southWest:layer.getLatLngs()[0][0],
                    _northEast:layer.getLatLngs()[0][2]
                };
                that.drawLoopTree(that.optionData,bounds);*/
            });
            that.drawLoopTree(that.optionData,bounds)
        });
        //todo
        self.map.on('draw:deleted ', function (e) {
            var layers = e.layers;
            layers.eachLayer(function (layer) {
                //do whatever you want; most likely save back to db
                /*that.bounds._northEast.lat = 42;
                that.bounds._northEast.lng = 118;
                that.bounds._southWest.lat = 36;
                that.bounds._southWest.lng = 115;*/
                console.log(layer.getLatLngs())
                for(var i = 0;i<bounds.length;i++){
                    var t = bounds[i];
                    if(t._northEast.lat == layer.bounds._northEast.lat && t._northEast.lng == layer.bounds._northEast.lng) {
                        bounds[i] = {
                            _southWest:{
                                lat:36,
                                    lng:115
                            },
                            _northEast:{
                                lat:36,
                                    lng:115
                            }
                        }
                    }
                }
              /*  bounds.forEach(function (t) {
                    if(t._northEast.lat == layer.bounds._northEast.lat && t._northEast.lng == layer.bounds._northEast.lng){
                        t = {
                            _southWest:layer.getLatLngs()[0][0],
                            _northEast:layer.getLatLngs()[0][2]
                        }
                    }
                })*/
                layer.bounds = [{
                    _southWest:{
                        lat:36,
                        lng:115
                    },
                    _northEast:{
                        lat:36,
                        lng:115
                    }
                }]

            });
            var f = false;
            for(var i = 0;i<bounds.length;i++){
                var t = bounds[i];
                if(t._northEast.lat != t._southWest.lat || t._northEast.lng != t._southWest.lng) {
                   f = true;
                }
            }
            if(f){
                that.drawLoopTree(that.optionData,bounds)
            }
            else {
                that.bounds = [{
                    _southWest:{
                        lat:36,
                        lng:115
                    },
                    _northEast:{
                        lat:42,
                        lng:118
                    }
                }]
                console.log(that.bounds)
                that.drawLoopTree(that.optionData)
            }

        });
        // var locationFilter = new L.LocationFilter()
        // console.log(locationFilter)
        // locationFilter.addTo(self.map);
       /* var areaSelect = L.areaSelect({width:200, height:300});
// Read the bouding box


// Get a callback when the bounds change
        areaSelect.on("change", function() {
            console.log("changearea")
            if(that.areaSelect){
                var bounds = areaSelect.getBounds();
                that.drawLoopTree(that.optionData,bounds);
            }
        });
        areaSelect.addTo(self.map);
        this.areaSelect = areaSelect;*/
// Set the dimensions of the box
        //areaSelect.setDimensions({width: 500, height: 500})

    }
    removeSelectLayer(){
        this.areaSelect.remove();
        this.areaSelect = null;
        /*this.bounds._northEast.lat = 42;
        this.bounds._northEast.lng = 118;
        this.bounds._southWest.lat = 36;
        this.bounds._southWest.lng = 115;*/
        this.drawLoopTree(this.optionData)
    }
    drawODMap(){
        let self = this
        let canvas = d3.select(self.map.getPanes().overlayPane).select("canvas").attr("id","canvas")
        this.canvas= canvas;
        var ctx = canvas.node().getContext("2d");
        this.ctx = ctx;
        ctx.clearRect(0,0,canvas.attr("width"),canvas.attr("height"))
        ctx.strokeStyle= 'rgba(0,25,46,0.04)'
        ctx.lineWidth = 0.01;
        getODTripFlow(9).then(function (data) {
            data.forEach(function (t,i) {
                if(i%10===0){
                    ctx.beginPath()
                    let fromPoint = self.map.latLngToLayerPoint(new L.LatLng(t.from.lat,t.from.lng))
                    let toPoint = self.map.latLngToLayerPoint(new L.LatLng(t.to.lat,t.to.lng))
                    ctx.moveTo(fromPoint.x, fromPoint.y);
                    ctx.lineTo(toPoint.x, toPoint.y);
                    ctx.stroke()
                }
            })
        })
    }
    drawDotsCluster(){
        let self = this
        let canvas = d3.select(self.map.getPanes().overlayPane).select("canvas").attr("id","canvas")
        this.canvas= canvas;
        var ctx = canvas.node().getContext("2d");
        this.ctx = ctx;
        ctx.clearRect(0,0,canvas.attr("width"),canvas.attr("height"))

        //ctx.lineWidth = 0.01;
        getDotsCluster(0,'v1',1).then(function (data) {
           data.nodes.forEach(function (t) {
               //console.log(t)
               ctx.beginPath();
               let center = self.map.latLngToLayerPoint(new L.LatLng(t.y,t.x))
               //console.log(center)
               ctx.arc(center.x, center.y, 0.2*self.map.getZoom(), 0, 2*Math.PI)
               ctx.fillStyle= 'rgba(255,0,0,0.4)'
               ctx.fill()
           })
        })
    }
    drawFamousEnterprise(){
        //todo
        let self = this
        let canvas = d3.select(self.map.getPanes().overlayPane).select("canvas").attr("id","canvas")
        this.canvas= canvas;
        var ctx = canvas.node().getContext("2d");
        this.ctx = ctx;
        ctx.clearRect(0,0,canvas.attr("width"),canvas.attr("height"))

        getFamousEnterprise().then(function (data) {
            //console.log()
            JSON.parse(data).poi.forEach(function (t) {
                //console.log(t)
                ctx.beginPath();
                let center = self.map.latLngToLayerPoint(new L.LatLng(t.cp[1],t.cp[0]))
                //console.log(center)
                ctx.arc(center.x, center.y, 0.2*self.map.getZoom(), 0, 2*Math.PI)
                ctx.fillStyle= 'rgba(255,0,0,0.4)'
                ctx.fill()
            })
        })
    }
    }
    //testout

export {mapview}
