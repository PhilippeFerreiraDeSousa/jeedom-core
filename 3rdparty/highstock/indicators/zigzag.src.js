/**
 * @license  Highcharts JS v7.0.0 (2018-12-11)
 *
 * Indicator series type for Highstock
 *
 * (c) 2010-2018 Kacper Madej
 *
 * License: www.highcharts.com/license
 */
'use strict';
(function (factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = factory;
	} else if (typeof define === 'function' && define.amd) {
		define(function () {
			return factory;
		});
	} else {
		factory(typeof Highcharts !== 'undefined' ? Highcharts : undefined);
	}
}(function (Highcharts) {
	(function (H) {
		/* *
		 *
		 *  (c) 2010-2018 Kacper Madej
		 *
		 *  License: www.highcharts.com/license
		 *
		 * */



		var seriesType = H.seriesType,
		    UNDEFINED;

		/**
		 * The Zig Zag series type.
		 *
		 * @private
		 * @class
		 * @name Highcharts.seriesTypes.zigzag
		 *
		 * @augments Highcharts.Series
		 */
		seriesType('zigzag', 'sma',
		    /**
		     * Zig Zag indicator.
		     *
		     * This series requires `linkedTo` option to be set.
		     *
		     * @sample stock/indicators/zigzag
		     *         Zig Zag indicator
		     *
		     * @extends      plotOptions.sma
		     * @since        6.0.0
		     * @product      highstock
		     * @optionparent plotOptions.zigzag
		     */
		    {
		        /**
		         * @excluding index, period
		         */
		        params: {
		            /**
		             * The point index which indicator calculations will base - low
		             * value.
		             *
		             * For example using OHLC data, index=2 means the indicator will be
		             * calculated using Low values.
		             */
		            lowIndex: 2,
		            /**
		             * The point index which indicator calculations will base - high
		             * value.
		             *
		             * For example using OHLC data, index=1 means the indicator will be
		             * calculated using High values.
		             */
		            highIndex: 1,
		            /**
		             * The threshold for the value change.
		             *
		             * For example deviation=1 means the indicator will ignore all price
		             * movements less than 1%.
		             */
		            deviation: 1
		        }
		    },
		    /**
		     * @lends Highcharts.Series#
		     */
		    {
		        nameComponents: ['deviation'],
		        nameSuffixes: ['%'],
		        nameBase: 'Zig Zag',
		        getValues: function (series, params) {
		            var lowIndex = params.lowIndex,
		                highIndex = params.highIndex,
		                deviation = params.deviation / 100,
		                deviations = {
		                    'low': 1 + deviation,
		                    'high': 1 - deviation
		                },
		                xVal = series.xData,
		                yVal = series.yData,
		                yValLen = yVal ? yVal.length : 0,
		                Zigzag = [],
		                xData = [],
		                yData = [],
		                i, j,
		                ZigzagPoint,
		                firstZigzagLow,
		                firstZigzagHigh,
		                directionUp,
		                zigZagLen,
		                exitLoop = false,
		                yIndex = false;

		            // Exit if not enught points or no low or high values
		            if (
		                xVal.length <= 1 ||
		                (
		                    yValLen &&
		                    (
		                        yVal[0][lowIndex] === UNDEFINED ||
		                        yVal[0][highIndex] === UNDEFINED
		                    )
		                )
		            ) {
		                return false;
		            }

		            // Set first zigzag point candidate
		            firstZigzagLow = yVal[0][lowIndex];
		            firstZigzagHigh = yVal[0][highIndex];

		            // Search for a second zigzag point candidate,
		            // this will also set first zigzag point
		            for (i = 1; i < yValLen; i++) {
		                // requried change to go down
		                if (yVal[i][lowIndex] <= firstZigzagHigh * deviations.high) {
		                    Zigzag.push([xVal[0], firstZigzagHigh]);
		                    // second zigzag point candidate
		                    ZigzagPoint = [xVal[i], yVal[i][lowIndex]];
		                    // next line will be going up
		                    directionUp = true;
		                    exitLoop = true;

		                    // requried change to go up
		                } else if (
		                    yVal[i][highIndex] >= firstZigzagLow * deviations.low
		                ) {
		                    Zigzag.push([xVal[0], firstZigzagLow]);
		                    // second zigzag point candidate
		                    ZigzagPoint = [xVal[i], yVal[i][highIndex]];
		                    // next line will be going down
		                    directionUp = false;
		                    exitLoop = true;

		                }
		                if (exitLoop) {
		                    xData.push(Zigzag[0][0]);
		                    yData.push(Zigzag[0][1]);
		                    j = i++;
		                    i = yValLen;
		                }
		            }

		            // Search for next zigzags
		            for (i = j; i < yValLen; i++) {
		                if (directionUp) { // next line up

		                    // lower when going down -> change zigzag candidate
		                    if (yVal[i][lowIndex] <= ZigzagPoint[1]) {
		                        ZigzagPoint = [xVal[i], yVal[i][lowIndex]];
		                    }

		                    // requried change to go down -> new zigzagpoint and
		                    // direction change
		                    if (yVal[i][highIndex] >= ZigzagPoint[1] * deviations.low) {
		                        yIndex = highIndex;
		                    }

		                } else { // next line down

		                    // higher when going up -> change zigzag candidate
		                    if (yVal[i][highIndex] >= ZigzagPoint[1]) {
		                        ZigzagPoint = [xVal[i], yVal[i][highIndex]];
		                    }

		                    // requried change to go down -> new zigzagpoint and
		                    // direction change
		                    if (yVal[i][lowIndex] <= ZigzagPoint[1] * deviations.high) {
		                        yIndex = lowIndex;
		                    }
		                }
		                if (yIndex !== false) { // new zigzag point and direction change
		                    Zigzag.push(ZigzagPoint);
		                    xData.push(ZigzagPoint[0]);
		                    yData.push(ZigzagPoint[1]);
		                    ZigzagPoint = [xVal[i], yVal[i][yIndex]];
		                    directionUp = !directionUp;

		                    yIndex = false;
		                }
		            }

		            zigZagLen = Zigzag.length;

		            // no zigzag for last point
		            if (
		                zigZagLen !== 0 &&
		                Zigzag[zigZagLen - 1][0] < xVal[yValLen - 1]
		            ) {
		                // set last point from zigzag candidate
		                Zigzag.push(ZigzagPoint);
		                xData.push(ZigzagPoint[0]);
		                yData.push(ZigzagPoint[1]);
		            }
		            return {
		                values: Zigzag,
		                xData: xData,
		                yData: yData
		            };
		        }
		    }
		);

		/**
		 * A `Zig Zag` series. If the [type](#series.zigzag.type) option is not
		 * specified, it is inherited from [chart.type](#chart.type).
		 *
		 * @extends   series,plotOptions.zigzag
		 * @since     6.0.0
		 * @product   highstock
		 * @excluding dataParser, dataURL
		 * @apioption series.zigzag
		 */

	}(Highcharts));
	return (function () {


	}());
}));
