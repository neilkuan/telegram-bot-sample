const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.22.0',
  defaultReleaseBranch: 'main',
  name: 'telegram-bot-sample',
  gitignore: ['venv', '.env', 'cdk.context.json', 'a.py'],
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve'],
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['neilkuan'],
  },
  deps: [
    'cdk-pipelines-github',
  ],
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