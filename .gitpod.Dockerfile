FROM jsii/superchain:1-buster-slim-node14

ARG AWS_CLI_V2_URL='https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip'

USER root:root
# install jq wget
RUN apt-get update && apt-get install -y jq wget

RUN mv $(which aws) /usr/local/bin/awscliv1 && \
  curl "${AWS_CLI_V2_URL}" -o "/tmp/awscliv2.zip" && \
  unzip /tmp/awscliv2.zip -d /tmp && \
  /tmp/aws/install

USER superchain:superchain