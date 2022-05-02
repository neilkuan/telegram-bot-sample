import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
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
  Template.fromStack(stack).hasResourceProperties('AWS::ECS::TaskDefinition', {
    ContainerDefinitions: [
      {
        Environment: [
          {
            Name: 'API_KEY',
            Value: 'mock',
          },
        ],
        Essential: true,
        Image: {
          'Fn::Sub': '${AWS::AccountId}.dkr.ecr.${AWS::Region}.${AWS::URLSuffix}/cdk-hnb659fds-container-assets-${AWS::AccountId}-${AWS::Region}:0da5359cdea80d3b12adc229e40367eba9345d77d3b1194200df22651fc20970',
        },
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
  });
});