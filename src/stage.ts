import { App, Stack, Stage, StageProps } from 'aws-cdk-lib';
import { TelegramBot } from './telegram-bot';
export class MyStage extends Stage {
  constructor(scope: App, id: string, props: StageProps = {}) {
    super(scope, id, props);

    const stack = new Stack(this, 'TelegramBotStack');

    new TelegramBot(stack, 'telegramBot', {
      enable_secret: true,
    });

  }
}
