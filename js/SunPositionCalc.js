/**
 * Created by daniel on 6/27/15.
 */

var sin = Math.sin;
var cos = Math.cos;

var SunCalcCartesian = {};

SunCalcCartesian.getZ = function (date, lat, lng){
    var spheric = SunCalc.getPosition(date, lat, lng);
    var z =  125 * cos(spheric.altitude) * cos(spheric.azimuth);
    return z;
};

SunCalcCartesian.getX = function (date, lat, lng) {
    var spheric = SunCalc.getPosition(date, lat, lng);
    var x = 125 * cos(spheric.altitude) * sin(spheric.azimuth);
    return x;
};

SunCalcCartesian.getY = function (date, lat, lng) {
    var altitude = SunCalc.getPosition(date, lat, lng).altitude;
    var y = 125 * sin(altitude);
    return y;
};