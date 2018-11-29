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
    var url ="http://192.168.1.42:3033/api/treeMap?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId;
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
    var url ="http://192.168.1.42:3033/api/treeMap?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId;
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
function getTreeMap() {
    var seedNum = maps.seedNum/100;
    var angle = maps.newOptionData[1].init;
    var seedStrength = maps.newOptionData[2].init;
    var treeWidth =1;
    var direction = maps.fromOrTo;
    var spaceInterval = 200;
    var jumpLen = maps.newOptionData[0].init;
    var gridDirNum = maps.newOptionData[7].init;
    var timeSegId = maps.timeSegId;
    var seedUnit = maps.seedUnit.init;
    var delta = maps.newOptionData[8].init;
    var speedToShow = maps.speedToShow
    if(seedUnit =="Dir") {
        seedUnit = "basic"
    }
    else {
        seedUnit ="grid"
    }
    var url ="http://192.168.1.42:3033/api/treeMap?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId+"&delta="+delta+"&speedToShow="+speedToShow;
    console.log(url) ;
    return new Promise(function (resolve,reject) {
        $.ajax({
            url:url ,
            type: 'GET',
            contentType: "application/json",
            dataType: 'jsonp',
            async:false,
            success: function (data) {
                //resolve(data);
                var res;
                console.log(data);
                if(direction=="from"){
                    res = data.res.from;
                }
                else if(direction == "to"){
                    res = data.res.to;
                }
                else if(direction == "all"){
                    res = data.res.from;
                    data.res.to.forEach(function (d) {
                        res.push(d)
                    })
                }
                resolve(res)
                /*res.forEach(function (tree) {
                    var path = [];
                    var drawedSet = new Set()
                    map[0].generate(tree,path,drawedSet)
                    //mrequestap[0].drawTree(tree,path,drawedSet)
                })
                // map[0].drawAnimationTree();
                if(maps.status == "play"){
                    map[0].drawLoopTree(maps.newOptionData);

                }
                else{
                    map[0].drawStayPath(maps.newOptionData);

                }*/
                // map[0].addTestLayer();
            }
        })
    })
}

function getAbnormalStatus(curtype){
    var heatType,type;
    if(curtype == "heatType"){
        heatType = maps.heatType;
        type = maps.heatType;
        maps.anomalyType = "none"
    }
    else if(curtype == "anomalyType"){
        heatType = maps.anomalyType;
        type = maps.anomalyType;
        maps.heatType = "none"
    }

    console.log(heatType)

    var timeSegID = maps.timeSegId+maps.daySelect*24;
    if(maps.base!=0){
        timeSegID = maps.base+maps.daySelect*24
    }
    var hourID = timeSegID%24;

    if(heatType=="Mov."){
        type = "flow"
    }
    else if(heatType=="Pop."){
        type = "record"
    }
    else if(heatType=="hourly"){
        type = "ano1";
    }
    else if(heatType == "daily"){
        type = "ano2"
    }
    if(heatType == "none"){
        map[0].addHeatMap("none");
    }
    else if(heatType == "Speed"){
        map[0].addHeatMap("speed")
    }
    else{
        /* if(maps.base != 0 ){
             alert("no data") ;
             maps.heatType = "none";
             maps.anomalyType = "none";
             return;
         }*/
        //mov，density,ano1,ano2
        var url = "http://192.168.1.42:3033/api/abnormalStats?hourID="+hourID+"&timeSegID="+timeSegID+"&type="+type;
        console.log(url)

            $.ajax({
                url:url,
                type: 'GET',
                contentType: "application/json",
                dataType: 'jsonp',
                async:false,
                success: function (data) {
                    if(type == "record"){
                        if(JSON.stringify(data) == "{}"){
                            alert("no data") ;
                            maps.heatType = "none";
                            maps.anomalyType = "none";
                            return;
                        }
                        else if(data.length ==0){
                            alert("no data") ;
                            maps.heatType = "none";
                            maps.anomalyType = "none";
                            return;
                        }
                    }
                    else if(!data.from){
                        alert("no data") ;
                        maps.heatType = "none";
                        maps.anomalyType = "none";
                        return;
                    }
                    var ft = maps.fromOrTo;
                    var res;
                    console.log(data)
                    //resolve(heatType,data)
                    map[0].addHeatMap(heatType,data)
                    /*  if(type=="record"){
                          map[0].addHeatMap(heatType,data)
                      }
                      else {
                          if(ft=="from"){
                              res = data.from;
                          }
                          else if(ft =="to"){
                              res = data.to;
                          }
                          map[0].addHeatMap(heatType,res)
                      }
    */

        }
    })

    }

}



export{request,requestAm,getTreeMap,getAbnormalStatus}