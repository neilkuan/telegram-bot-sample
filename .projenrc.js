const { awscdk, github } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.22.0',
  defaultReleaseBranch: 'main',
  name: 'telegram-bot-sample',
  gitignore: ['venv', '.env', 'cdk.context.json', 'a.py'],
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve'],
      projenCredentials: github.GithubCredentials.fromPersonalAccessToken({
        secret: 'AUTO_MACHINE_TOKEN',
      }),
    },
  },
  autoApproveOptions: {
    secret: 'PROJEN_GITHUB_TOKEN',
    allowedUsernames: ['auto-machine', 'neilkuan'],
  },
  deps: [
    'cdk-pipelines-github',
  ],
  minNodeVersion: '14.17.0',
  workflowBootstrapSteps: [
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
project.synth();