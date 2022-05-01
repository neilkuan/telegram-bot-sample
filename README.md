# Telegram bot example deploy via AWS CDK

## Init export `API_KEY` in your shell 
```bash
export API_KEY=1234456789:xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

# Local testing
```bash
$ cd bot

$ python -m venv venv

$ source venv/bin/activate

(venv)$ python index.py 
```


# Deploy to AWS Cloud
## To Install
```bash
yarn
```

## To Diff
```bash
npx cdk diff
```

## To Deploy
```bash
npx cdk deploy
```

## To Destory
```bash
npx cdk destroy
```