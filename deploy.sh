#!/bin/bash
docker build --no-cache -t muraluni-frontend .

docker stop muraluni-frontend
docker rm muraluni-frontend
docker run -d \
  --name muraluni-frontend \
  -p 3001:3000 \
  --restart unless-stopped \
  muraluni-frontend
