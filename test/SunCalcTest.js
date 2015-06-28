/**
 * Created by daniel on 6/27/15.
 */

describe('A suite', function() {
    var testMe;
    var fhLat =  50.128742;
    var fhLong = 8.69162;
    var date = new Date("2015-03-25T12:32:33"); //solar noon of the day!

    beforeEach(function() {
        testMe = true;
    });


    /*
    * Test Karma, Jasmine and SunCalc configuration
    * */
    it('should be true (verify karma setup)', function() {
        expect(testMe).toBe(true);
    });

    it('should be able to call SunCalc class', function() {
        expect(SunCalc.getMoonIllumination(new Date())).toBeDefined();
    });


    /*
    * SuncalcClass tests
     */
    it('shoulf be able to convert for z coordinate', function() {
        expect(SunCalcCartesian.getZ(date, fhLat, fhLong))
            .toBe(93.5343201047733);
        //converts a z coordinate of the solar noon an compares to
        // a coordinate of a later time (should be greater!)
        expect(SunCalcCartesian.getZ(date, fhLat, fhLong))
            .toBeGreaterThan(SunCalcCartesian.getZ(new Date("2015-03-25T12:33:00"), fhLat, fhLong));
    });

    it('should be able to convert for y coordinate', function() {
        expect(SunCalcCartesian.getY(date, fhLat, fhLong))
            .toBe(82.92328584797322);
        //converts a y coordinate of the solar noon an compares to
        // a coordinate of a later time (should be greater!)
        expect(SunCalcCartesian.getY(date, fhLat, fhLong))
            .toBeGreaterThan(SunCalcCartesian.getY(new Date("2015-03-25T12:33:00"), fhLat, fhLong));
    });

    it('should be able to convert for x coordinate', function (){
        expect(SunCalcCartesian.getX(date, fhLat, fhLong))
            .toBe(0.24418581680350293);
        //converts a x coordinate of the solar noon an compares to
        // a coordinate of a later time (should be greater!)
        expect(SunCalcCartesian.getX(date, fhLat, fhLong))
            .toBeGreaterThan(SunCalcCartesian.getX(new Date("2015-03-25T12:31:00"), fhLat, fhLong));
    });

    it('should be able to convert to cartesian coordinates (x,y,z)', function() {
        expect(SunCalcCartesian.getAll(date, fhLat, fhLong).x)
            .toBe(0.24418581680350293);
        expect(SunCalcCartesian.getAll(date, fhLat, fhLong).y)
            .toBe(82.92328584797322);
        expect(SunCalcCartesian.getAll(date, fhLat, fhLong).z)
            .toBe(93.5343201047733);
    });

});
