import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { UtilsService } from './utils.service';

@Controller('utils')
@UseGuards(AuthGuard)
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @Get('endpoints')
  async getChains() {
    // @note: This action checks validity of provided key
    const validation = await this.utilsService.getChains();
    return validation;
  }

  @Get('ruletypes')
  async getRuleTypes() {
    const ruleTypes = await this.utilsService.getRuleTypes();
    return ruleTypes;
  }

  @Get('price/:chainId/:tokenAddress')
  async getTokenPrice(
    @Param('chainId') chainId: string,
    @Param('tokenAddress') tokenAddress: string,
  ) {
    // @note: this action returns price in usd for provided token address and chain id
    const price = await this.utilsService.getTokenPrice(chainId, tokenAddress);
    return price;
  }

  @Get('tokens/:chainId')
  async getTokenList(@Param('chainId') chainId: string) {
    // @note: this action returns popular tokens by chainId
    const tokens = await this.utilsService.getTokenList(chainId);
    return tokens;
  }
}
