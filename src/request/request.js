import{maps} from "../init/mapVueInit"
import{map,clock} from "../init"
function request() {
    maps.aniCurHour += 1;
    var curHourId = maps.aniCurHour;

    getData(curHourId);


}
function getData(curHourId) {
    var seedNum = maps.seedNum/100;
    var angle = maps.newOptionData[1].init;
    var seedStrength = maps.newOptionData[2].init;
    var treeWidth = 1;
    var direction = maps.fromOrTo;
    var spaceInterval = 200;
    var jumpLen = maps.newOptionData[0].init;
    var gridDirNum = maps.newOptionData[7].init;
    var timeSegId = curHourId+maps.daySelect*24;
    var seedUnit = maps.seedUnit.init;

    if(seedUnit =="Dir") {
        seedUnit = "basic"
    }
    else {
        seedUnit ="grid"
    }
    var url ="http://192.168.1.42:3000/api/treeMap?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId;
    console.log(url) ;

    map[0].allLatLngNodes = [];
    map[0].lastLen = 0;
    maps.fade = false;
    $.ajax({
        url:url ,
        type: 'GET',
        contentType: "application/json",
        dataType: 'jsonp',
        async:false,
        success: function (data) {
            var res;
            console.log(data);
            if(curHourId<23){
                request()
                // setTimeout(request,1000);
            }
            else{
                maps.aniCurHour =-1
            }
            if(direction=="from"){
                res = data.res.to;
            }
            else if(direction == "to"){
                res = data.res.from;
            }
            else if(direction == "all"){
                res = data.res.from;
                data.res.to.forEach(function (d) {
                    res.push(d)
                })
            }
            res.forEach(function (tree) {
                var path = [];
                var drawedSet = new Set()
                map[0].generate(tree,path,drawedSet)
            })
            showClock((maps.aniCurHour+12)%24);
            map[0].drawStayPath(maps.newOptionData);

        }

    })
}

function showClock(index) {
    for (var i = 0; i < 24; i++) {
        var flag = false;
            if (index == i) {
                flag = true;
                //console.log(g.select('#big-path' + d.toString()).style("opacity"))
                clock.clock.select('#big-path' + index).style("opacity", '1');
                //console.log(g.select('#big-path' + d.toString()).style("opacity"))

            }
        if (!flag) {
            clock.clock.select('#big-path' + i.toString()).style("opacity", '0');
        }
    }
}

function requestAm() {
    maps.aniCurDay += 1;
    var curdayId = maps.aniCurDay;

    getDataAm(curdayId);
}

function getDataAm(aniCurDay) {
    var seedNum = maps.seedNum/100;
    var angle = maps.newOptionData[1].init;
    var seedStrength = maps.newOptionData[2].init;
    var treeWidth = 1;
    var direction = maps.fromOrTo;
    var spaceInterval = 200;
    var jumpLen = maps.newOptionData[0].init;
    var gridDirNum = maps.newOptionData[7].init;
    var timeSegId = 7+aniCurDay*24+4000;
    var seedUnit = maps.seedUnit.init;

    if(seedUnit =="Dir") {
        seedUnit = "basic"
    }
    else {
        seedUnit ="grid"
    }
    var url ="http://192.168.1.42:3000/api/treeMap?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId;
    console.log(url) ;

    map[0].allLatLngNodes = [];
    map[0].lastLen = 0;
    maps.fade = false;
    $.ajax({
        url:url ,
        type: 'GET',
        contentType: "application/json",
        dataType: 'jsonp',
        async:false,
        success: function (data) {
            var res;
            console.log(data);

            if(direction=="from"){
                res = data.res.to;
            }
            else if(direction == "to"){
                res = data.res.from;
            }
            else if(direction == "all"){
                res = data.res.from;
                data.res.to.forEach(function (d) {
                    res.push(d)
                })
            }
            res.forEach(function (tree) {
                var path = [];
                var drawedSet = new Set()
                map[0].generate(tree,path,drawedSet)
            })
            d3.selectAll("rect").attr("fill",function (d,i) {
                if((i-1)==aniCurDay){
                    return "#ED5858"
                }
                return "grey"
            })
            map[0].drawStayPath(maps.newOptionData);
            console.log(maps.aniCurDay)
            if(aniCurDay<5){
                requestAm()
                // setTimeout(request,1000);
            }
            else{
                maps.aniCurDay =-1
                maps.animateAm = "pause"
            }

        }

    })
}
function showRect(aniCurDay) {
   d3.selectAll("rect").attr("fill",function (d,i) {
       if(i==aniCurDay){
           return "#ED5858"
       }
       return "grey"
   })
}

export{request,requestAm}