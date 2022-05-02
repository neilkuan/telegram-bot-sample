import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { TelegramBot } from '../src/telegram-bot';

test('Snapshot', () => {
  const app = new App({
    context: {
      api_key: 'mock',
    },
  });
  const stack = new Stack(app, 'test');
  new TelegramBot(stack, 'TelegramBot', { enable_secret: false });
  Template.fromStack(stack).hasResourceProperties('AWS::ECS::ClusterCapacityProviderAssociations', {
    CapacityProviders: [
      'FARGATE',
      'FARGATE_SPOT',
    ],
  });
  Template.fromStack(stack).hasResourceProperties('AWS::ECS::TaskDefinition', Match.objectLike({
    ContainerDefinitions: [
      {
        Environment: [
          {
            Name: 'API_KEY',
            Value: 'mock',
          },
        ],
        Essential: true,
        LogConfiguration: {
          LogDriver: 'awslogs',
          Options: {
            'awslogs-group': {
              Ref: 'TelegramBottasksbotLogGroupF084D406',
            },
            'awslogs-stream-prefix': 'bot',
            'awslogs-region': {
              Ref: 'AWS::Region',
            },
          },
        },
        Name: 'bot',
      },
    ],
  }),
  );
});