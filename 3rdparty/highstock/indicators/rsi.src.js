/**
 * @license  Highcharts JS v7.0.0 (2018-12-11)
 *
 * Indicator series type for Highstock
 *
 * (c) 2010-2018 Paweł Fus
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
		 *  License: www.highcharts.com/license
		 *
		 * */



		var isArray = H.isArray;

		// Utils:
		function toFixed(a, n) {
		    return parseFloat(a.toFixed(n));
		}

		/**
		 * The RSI series type.
		 *
		 * @private
		 * @class
		 * @name Highcharts.seriesTypes.rsi
		 *
		 * @augments Highcharts.Series
		 */
		H.seriesType('rsi', 'sma',
		    /**
		     * Relative strength index (RSI) technical indicator. This series
		     * requires the `linkedTo` option to be set and should be loaded after
		     * the `stock/indicators/indicators.js` file.
		     *
		     * @sample stock/indicators/rsi
		     *         RSI indicator
		     *
		     * @extends      plotOptions.sma
		     * @since        6.0.0
		     * @product      highstock
		     * @optionparent plotOptions.rsi
		     */
		    {
		        /**
		         * @excluding index
		         */
		        params: {
		            period: 14,
		            /**
		             * Number of maximum decimals that are used in RSI calculations.
		             */
		            decimals: 4
		        }
		    },
		    /**
		     * @lends Highcharts.Series#
		     */
		    {
		        getValues: function (series, params) {
		            var period = params.period,
		                xVal = series.xData,
		                yVal = series.yData,
		                yValLen = yVal ? yVal.length : 0,
		                decimals = params.decimals,
		                // RSI starts calculations from the second point
		                // Cause we need to calculate change between two points
		                range = 1,
		                RSI = [],
		                xData = [],
		                yData = [],
		                index = 3,
		                gain = 0,
		                loss = 0,
		                RSIPoint, change, avgGain, avgLoss, i;

		            // RSI requires close value
		            if (
		                (xVal.length < period) || !isArray(yVal[0]) ||
		                yVal[0].length !== 4
		            ) {
		                return false;
		            }

		            // Calculate changes for first N points
		            while (range < period) {
		                change = toFixed(
		                    yVal[range][index] - yVal[range - 1][index],
		                    decimals
		                );

		                if (change > 0) {
		                    gain += change;
		                } else {
		                    loss += Math.abs(change);
		                }

		                range++;
		            }

		            // Average for first n-1 points:
		            avgGain = toFixed(gain / (period - 1), decimals);
		            avgLoss = toFixed(loss / (period - 1), decimals);

		            for (i = range; i < yValLen; i++) {
		                change = toFixed(yVal[i][index] - yVal[i - 1][index], decimals);

		                if (change > 0) {
		                    gain = change;
		                    loss = 0;
		                } else {
		                    gain = 0;
		                    loss = Math.abs(change);
		                }

		                // Calculate smoothed averages, RS, RSI values:
		                avgGain = toFixed(
		                    (avgGain * (period - 1) + gain) / period,
		                    decimals
		                );
		                avgLoss = toFixed(
		                    (avgLoss * (period - 1) + loss) / period,
		                    decimals
		                );
		                // If average-loss is equal zero, then by definition RSI is set
		                // to 100:
		                if (avgLoss === 0) {
		                    RSIPoint = 100;
		                // If average-gain is equal zero, then by definition RSI is set
		                // to 0:
		                } else if (avgGain === 0) {
		                    RSIPoint = 0;
		                } else {
		                    RSIPoint = toFixed(
		                        100 - (100 / (1 + (avgGain / avgLoss))),
		                        decimals
		                    );
		                }

		                RSI.push([xVal[i], RSIPoint]);
		                xData.push(xVal[i]);
		                yData.push(RSIPoint);
		            }

		            return {
		                values: RSI,
		                xData: xData,
		                yData: yData
		            };
		        }
		    }
		);

		/**
		 * A `RSI` series. If the [type](#series.rsi.type) option is not
		 * specified, it is inherited from [chart.type](#chart.type).
		 *
		 * @extends   series,plotOptions.rsi
		 * @since     6.0.0
		 * @product   highstock
		 * @excluding dataParser, dataURL
		 * @apioption series.rsi
		 */

	}(Highcharts));
	return (function () {


	}());
}));
