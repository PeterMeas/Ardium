import "./TradingViewChart.css";
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useState, useRef, useEffect } from "react";

function TradingViewChart({ data }) {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candleSeriesRef = useRef(null);

    // create chart once (mount)
    useEffect(() => {
        if (!chartContainerRef.current) return;
        if (typeof createChart !== 'function') {
            console.error('createChart is not a function. Check lightweight-charts installation/import.');
            return;
        }

        chartRef.current = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth || 800,
            height: 400,
            layout: { background: { color: '#ffffff' }, textColor: '#333' },
        });

        // v5 API: addSeries(SeriesConstructor, options)
        try {
            candleSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350'
            });
            console.log('created candleSeriesRef via addSeries(CandlestickSeries, ...)', !!candleSeriesRef.current);
        } catch (err) {
            console.error('failed to create candlestick series via addSeries:', err);
        }

        return () => {
            try { if (chartRef.current && typeof chartRef.current.remove === 'function') chartRef.current.remove(); }
            catch (err) { console.warn('error removing chart', err); }
            chartRef.current = null;
            candleSeriesRef.current = null;
        };
    }, []); // mount only

    // update series when data changes
    useEffect(() => {
        console.log('TradingViewChart received data prop:', data && data.length);
        if (!candleSeriesRef.current) {
            console.warn('candleSeriesRef not created yet; cannot setData');
            return;
        }

        if (!data) {
            try { candleSeriesRef.current.setData([]); } catch (e) {}
            return;
        }

        // if data is already an OHLC array, convert times to UNIX seconds
        if (Array.isArray(data)) {
            const transformed = data.map(d => ({
                time: (typeof d.time === 'string') ? Math.floor(new Date(d.time).getTime() / 1000) : d.time,
                open: Number(d.open),
                high: Number(d.high),
                low: Number(d.low),
                close: Number(d.close),
            }));
            try {
                candleSeriesRef.current.setData(transformed);
                chartRef.current && chartRef.current.timeScale().fitContent();
            } catch (err) {
                console.error('error calling setData on candleSeriesRef', err);
            }
            return;
        }

        // If backend sent full AlphaVantage object, transform it here
        if (data['Time Series (Daily)']) {
            const alphaVantageData = data['Time Series (Daily)'];
            const formattedData = Object.keys(alphaVantageData).map(date => {
                const dp = alphaVantageData[date];
                return {
                    time: Math.floor(new Date(date).getTime() / 1000),
                    open: parseFloat(dp['1. open']),
                    high: parseFloat(dp['2. high']),
                    low: parseFloat(dp['3. low']),
                    close: parseFloat(dp['4. close']),
                };
            }).sort((a,b) => a.time - b.time);
            try {
                candleSeriesRef.current.setData(formattedData);
                chartRef.current && chartRef.current.timeScale().fitContent();
            } catch (err) {
                console.error('error calling setData on candleSeriesRef', err);
            }
            return;
        }

        try { candleSeriesRef.current.setData([]); } catch (e) {}
    }, [data]);

    return <div ref={chartContainerRef} className="chart-container" />;
}

export default TradingViewChart;