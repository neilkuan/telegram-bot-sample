FROM --platform=X86_64 public.ecr.aws/docker/library/python:3.9.12-alpine3.14
WORKDIR /app
COPY . .
RUN pip3 install -r requirements.txt
ENTRYPOINT [ "python3" ]
CMD [ "index.py" ]
