function getCoverScale(len,speed,num){
   // console.log(1.5/len*num/10*speed/100)
   //return 1.5/len*num/10*speed/100;
   //return 1/len;
    return 0.08;
}
function getSeg(allNum,count =4) {
    var len = allNum.length;
    var res = [];
    for(var i = 0;i<count;i++){
        var index = parseInt(len*i/count);
        res.push(allNum[index])
    }
    return res;
}
function getStrokeColor(num,type,seg){

    if(type=="normal"){
      if(num>=seg[0] && num <seg[1]){
          return "#646464";
      }
      else if(num>=seg[1] && num< seg[2]){
          return "#808080";
      }
      else if(num >=seg[2] && num < seg[3]){
          return "#c0c0c0";
      }
      else if(num>=seg[3]){
          return "#ffffff";
      }
  }
  else if(type == "highlight"){
      if(num>=seg[0] && num <seg[1]){
          return "#640000";
      }
      else if(num>=seg[1] && num< seg[2]){
          return "#800000";
      }
      else if(num >=seg[2] && num < seg[3]){
          return "#c00000";
      }
      else if(num>=seg[3]){
          return "#ff0000";
      }
  }
  else if(type=="none"){
      return "none"
  }
}

function getNormalize(x,y) {
    var r1 = x/Math.sqrt(x*x+y*y);
    var r2 = y/Math.sqrt(x*x+y*y);
    return [r1,r2]
}
function getColorBySpeed(speed,type) {
    if(type=="normal"){
        if(speed>0 && speed <10){
            return "#646464";
        }
        else if(speed>=10 && speed< 30){
            return "#808080";
        }
        else if(speed >=30 && speed < 70){
            return "#c0c0c0";
        }
        else if(speed>=70){
            return "#ffffff";
        }
    }
    else if(type == "highlight"){
        if(speed>0 && speed <10){
            return "#640000";
        }
        else if(speed>=10 && speed< 30){
            return "#800000";
        }
        else if(speed >=30 && speed < 70){
            return "#c00000";
        }
        else if(speed>=70){
            return "#ff0000";
        }
    }
    else if(type=="none"){
        return "none"
    }
}
export{getCoverScale,getStrokeColor,getNormalize,getColorBySpeed,getSeg}