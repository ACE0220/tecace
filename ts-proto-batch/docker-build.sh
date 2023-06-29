#! /usr/bin/env sh

cd ~
mkdir data && cd data
apt update
echo y | apt install sudo vim wget curl unzip
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v

wget https://github.com/protocolbuffers/protobuf/releases/download/v23.1/protoc-23.1-linux-aarch_64.zip
unzip protoc-23.1-linux-aarch_64.zip
cp bin/protoc /usr/local/bin/
cp -r include/google/ /usr/local/include/
npm install -g ts-proto @tecace/ts-proto-batch

