import { App } from 'aws-cdk-lib';
import { ShellStep } from 'aws-cdk-lib/pipelines';
import { GitHubWorkflow, DockerCredential } from 'cdk-pipelines-github';
import { MyStage } from './stage';

const app = new App();
const account = '807885433112';
const region = 'us-east-1';
const pipeline = new GitHubWorkflow(app, 'Pipeline', {
  synth: new ShellStep('Build', {
    commands: [
      'yarn install',
      'yarn build',
      'git diff --exit-code', // <-- this will fail the build if the workflow is not up-to-date
    ],
  }),
  dockerCredentials: [
    DockerCredential.ecr('807885433112.dkr.ecr.us-east-1.amazonaws.com'),
  ],
  publishAssetsAuthRegion: 'us-east-1',
  preBuildSteps: [
    {
      name: 'Authenticate Via GitHub Secrets',
      uses: 'aws-actions/configure-aws-credentials@v1',
      with: {
        'aws-region': 'us-east-1',
        'role-skip-session-tagging': true,
        'aws-access-key-id': '${{ secrets.AWS_ACCESS_KEY_ID }}',
        'aws-secret-access-key': '${{ secrets.AWS_SECRET_ACCESS_KEY }}',
      },
    },
  ],
});

const env = {
  account,
  region,
};

const stage = new MyStage(app, 'stage', { env });
pipeline.addStage(stage);

app.synth();