function getGridID(lat,lng,LngSPLIT=0.0064, LatSPLIT=0.005, locs={
    north: 41.0500,
    south: 39.4570,
    west: 115.4220,
    east: 117.5000
}) {
    var LNGNUM = parseInt( (locs.east - locs.west) / LngSPLIT + 1 );
    var lngind = parseInt( ((lng - locs.west) / LngSPLIT ));
    var latind = parseInt( ((lat - locs.south) / LatSPLIT ));

    return {
        gid: lngind + latind * LNGNUM,
        lngind: lngind,
        latind: latind
    }
}

function  parseFormatGID(id, direction='n', LngSPLIT=0.0064, LatSPLIT=0.005, locs={
    north: 41.0500,
    south: 39.4570,
    west: 115.4220,
    east: 117.5000,
}){

var id = parseInt(id)
var LNGNUM = parseInt((locs.east - locs.west) / LngSPLIT + 1)

var latind = parseInt(id / LNGNUM);
var lngind = id - latind * LNGNUM;

var lat = (locs.south + latind * LatSPLIT);
var lng = (locs.west + lngind * LngSPLIT);
var lngcen = (lng + LngSPLIT/2.0);
var latcen = (lat + LatSPLIT/2.0);
var dlineDict = {
    n: lat + LatSPLIT,
    s: lat,
    e: lng + LngSPLIT,
    w: lng
}

return {
    'lat': latcen,
    'lng': lngcen,
    'nid': id,
    'pid': -1,
    'y': latind,
    'x': lngind
}
}

export {getGridID,parseFormatGID}