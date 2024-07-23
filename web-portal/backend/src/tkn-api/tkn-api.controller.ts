import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../decorator/public.decorator';

@Controller('tkn/v1')
@Public()
export class TknApiController {
    @Get('hello-world')
    getHelloWorld() {
      return { message: 'Hello World' };
    }

    @Get(':ticker/metadata')
    getTickerMetaData(@Param('ticker') ticker: string) {
      return { message: `Ticker metadata ${ticker}` };
    }

    @Get(':ticker/balance')
    getTokenBalance(@Param('ticker') ticker: string, @Query('network') network: string, @Query('address') address: string) {
      return { message: `${ticker} balance on ${network} for ${address}` };
    }

    @Get(':ticker/price')
    getPriceData(@Param('ticker') ticker: string, @Query('network') network: string) {
      return { message: `${ticker} price on ${network}` };
    }
}
