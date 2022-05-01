import * as path from 'path';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';

export interface MyStackProps extends StackProps {
  default_vpc?: boolean;
}

export class MyStack extends Stack {
  private vpc :ec2.IVpc;
  constructor(scope: Construct, id: string, props?: MyStackProps) {
    super(scope, id, props);
    if (props?.default_vpc) {
      this.vpc = ec2.Vpc.fromLookup(this, 'vpc', { isDefault: true });
    } else {
      this.vpc = new ec2.Vpc(this, 'newVpc');
    }

    const cluster = new ecs.Cluster(this, 'cluster', {
      // use default vpc put fargate service in public subnet
      vpc: this.vpc,
      enableFargateCapacityProviders: true,
    });
    const tasks = new ecs.FargateTaskDefinition(this, 'tasks', {
      cpu: 256,
      memoryLimitMiB: 512,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });
    const apiKey = this.node.tryGetContext('api_key') ?? `${process.env.API_KEY}` ?? 'mock';

    tasks.addContainer('bot', {
      image: ecs.AssetImage.fromAsset(path.join(__dirname, '../bot')),
      containerName: 'bot',
      environment: {
        API_KEY: apiKey,
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'bot',
      }),
    });

    const botsvc = new ecs.FargateService(this, 'botsvc', {
      taskDefinition: tasks,
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
    });

    botsvc.node.addDependency(this.node.tryFindChild('cluster') as ecs.CfnClusterCapacityProviderAssociations);
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();