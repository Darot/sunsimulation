/**
 * Created by daniel on 6/27/15.
 */

describe('A suite', function() {
    var testMe;

    beforeEach(function() {
        testMe = true;
    });

    it('should be true (verify karma setup)', function() {
        expect(testMe).toBe(true);
    });

    it('should be able to call SunCalc class', function() {
        SunCalc.getMoonIllumination(new Date());
    })

});
