const axios = require('axios');
const {searchSymbol, getDailyTimeSeries} = require('./alphaVantageService');
const { ALPHA_VANTAGE_KEY } = require('../env');
const ALPHAV = 'https://www.alphavantage.co/query';

jest.mock('axios');

describe('alphaVantageService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('searchSymbol', () => {
        test('should return data from API response', async () => {
            const mockResponse = {
                data: {
                    bestMatches: [
                        {
                            "1. symbol": "AAPL", "2. name": "Apple Inc."
                        }
                    ]
                }
            }
            axios.get.mockResolvedValue(mockResponse)
            const result = await searchSymbol('AAPL')
            expect(result).toEqual(mockResponse.data)
        })

        test('AlphaVantage should return with correct URl and params', async () => {
            axios.get.mockResolvedValue({data: {} })
            const result = await searchSymbol('TSLA');

            expect(axios.get).toHaveBeenCalledWith(
                'https://www.alphavantage.co/query',
                {
                    params: {
                        function: 'SYMBOL_SEARCH',
                        keywords: 'TSLA',
                        apikey: ALPHA_VANTAGE_KEY
                    }
                }
            )
        })

        test('should throw error on network failure', async () => {
            axios.get.mockRejectedValue(new Error('Network Error'));
            await expect(searchSymbol('TSLA')).rejects.toThrow('Network Error');
        });
    })

    describe('getDailyTimeSeries', () => {
        test('should use default outputsize of compact', async () => {
            axios.get.mockResolvedValue( { data: {} });
            await getDailyTimeSeries('AAPL');
            expect(axios.get).toHaveBeenCalledWith(
                'https://www.alphavantage.co/query',
                {
                    params:{
                        function: 'TIME_SERIES_DAILY',
                        symbol: 'AAPL',
                        apikey: ALPHA_VANTAGE_KEY,
                        outputsize: 'compact'
                    }
                }
            )
        });
        
        test('should call API with correct symbol and outputsize', async () => {
            axios.get.mockResolvedValue({ data: {} })
            await getDailyTimeSeries('MSFT', 'full') 
            expect(axios.get).toHaveBeenCalledWith(
                'https://www.alphavantage.co/query',
                {
                    params:{
                        function: 'TIME_SERIES_DAILY',
                        symbol: 'MSFT',
                        apikey: ALPHA_VANTAGE_KEY,
                        outputsize: 'full'
                    }
                }
            )
        });

        test('should throw error on network failure', async () => {
            axios.get.mockRejectedValue(new Error('Network Error'));
            await expect(getDailyTimeSeries('MSFT')).rejects.toThrow('Network Error');
        });

    })
})