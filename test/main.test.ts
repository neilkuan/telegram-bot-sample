import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { MyStack } from '../src/main';

test('Snapshot', () => {
  const app = new App({
    context: {
      api_key: 'mock',
    },
  });
  const stack = new MyStack(app, 'test', {
    default_vpc: false,
  });
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
          'Fn::Sub': '${AWS::AccountId}.dkr.ecr.${AWS::Region}.${AWS::URLSuffix}/cdk-hnb659fds-container-assets-${AWS::AccountId}-${AWS::Region}:b724f9f037b2895decc80bb2939ebf58baad0942a9258c9acfb5fe5414855b69',
        },
        LogConfiguration: {
          LogDriver: 'awslogs',
          Options: {
            'awslogs-group': {
              Ref: 'tasksbotLogGroup3C870F6F',
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