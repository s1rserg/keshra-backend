import { Body, Controller, Delete, Param, ParseIntPipe, Post } from '@nestjs/common';

import { ActiveUser } from '@common/types';
import { RequestUser } from '@common/decorators/active-user.decorator';

import { CreateReactionDto } from './dto/create-reaction.dto';
import { ReactionService } from './services/reaction.service';

@Controller('reactions')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  async toggle(@RequestUser() user: ActiveUser, @Body() dto: CreateReactionDto) {
    return this.reactionService.toggle(dto, user.id);
  }

  @Delete(':messageId')
  async remove(
    @RequestUser() user: ActiveUser,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    return this.reactionService.remove(messageId, user.id);
  }
}
