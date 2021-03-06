import * as path from 'path';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface TelegramBotOptions {
  enable_secret: boolean;
}

export class TelegramBot extends Construct {
  private vpc: ec2.IVpc;
  constructor(scope: Construct, id: string, props?: TelegramBotOptions) {
    super(scope, id);

    this.vpc = new ec2.Vpc(this, 'newVpc', {
      natGateways: 0,
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: 'telegramBot-Public-Subnet',
        },
      ],
    });

    const cluster = new ecs.Cluster(this, 'cluster', {
      // use default vpc put fargate service in public subnet
      vpc: this.vpc,
      clusterName: 'telegram-bot',
      enableFargateCapacityProviders: true,
    });
    const tasks = new ecs.FargateTaskDefinition(this, 'tasks', {
      cpu: 256,
      memoryLimitMiB: 512,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    if (props?.enable_secret) {
      tasks.addContainer('bot', {
        image: ecs.AssetImage.fromAsset(path.join(__dirname, '../bot')),
        containerName: 'bot',
        logging: ecs.LogDrivers.awsLogs({
          streamPrefix: 'bot',
        }),
        secrets: {
          API_KEY: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'mysecret', 'telegram/bot/stepn'), 'API_KEY'),
        },
      });
    } else {
      tasks.addContainer('bot', {
        image: ecs.AssetImage.fromAsset(path.join(__dirname, '../bot')),
        containerName: 'bot',
        logging: ecs.LogDrivers.awsLogs({
          streamPrefix: 'bot',
        }),
        environment: {
          API_KEY: this.node.tryGetContext('api_key') ?? `${process.env.API_KEY}` ?? 'mock',
        },
      });
    }

    const botsvc = new ecs.FargateService(this, 'botsvc', {
      taskDefinition: tasks,
      serviceName: 'telegram-bot',
      cluster,
      // use default vpc put fargate service in public subnet.
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      // put fargate service in public subnet need public ip.
      assignPublicIp: true,
      // use FARGATE_SPOT to save money... XD
      capacityProviderStrategies: [{
        capacityProvider: 'FARGATE_SPOT',
        base: 1,
        weight: 1,
      }],
      // source: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html
      // The Fargate Spot capacity provider is not supported for Linux tasks with the ARM64 architecture,
      // Fargate Spot only supports Linux tasks with the X86_64 architecture.
      platformVersion: ecs.FargatePlatformVersion.VERSION1_4,
    });

    botsvc.node.addDependency(this.node.tryFindChild('cluster') as ecs.CfnClusterCapacityProviderAssociations);
  }
}