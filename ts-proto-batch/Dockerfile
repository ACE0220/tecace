FROM arm64v8/debian:stable-slim

RUN mkdir /home/env && chmod -R 777 /home/env
COPY docker-build.sh /home/env
RUN chmod -R 777 /home/env/docker-build.sh && /home/env/docker-build.sh

RUN mkdir /home/data
WORKDIR /home/data
VOLUME [ "/home/data" ]
CMD ts-pb gen -i protos -o dist