#!/bin/bash

echo What should the version be?
read VERSION
echo $VERSION

sudo docker build -t edydocker93511/twitter:$VERSION .
sudo docker push edydocker93511/twitter:$VERSION
ssh root@139.59.79.136 "docker pull edydocker93511/twitter:$VERSION && docker tag edydocker93511/twitter:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"
