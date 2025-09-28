#!/bin/bash

docker stop rmu-api-npcs

docker rm rmu-api-npcs

docker rmi labcabrera/rmu-api-npcs:latest

docker build -t labcabrera/rmu-api-npcs:latest .

docker run -d -p 3008:3008 --network rmu-network --name rmu-api-npcs -h rmu-api-npcs \
  -e PORT='3008' \
  -e RMU_MONGO_NPCS_URI='mongodb://admin:admin@rmu-mongo:27017/rmu-npcs?authSource=admin' \
  -e RMU_IAM_TOKEN_URI='http://rmu-keycloak:8080/realms/rmu-local/protocol/openid-connect/token' \
  -e RMU_IAM_JWK_URI='http://rmu-keycloak:8080/realms/rmu-local/protocol/openid-connect/certs' \
  -e RMU_IAM_CLIENT_ID=rmu-client \
  -e RMU_IAM_CLIENT_SECRET=1tUzPc24SYJMPpX37g2eymEoS9C3Ttzw \
  -e RMU_KAFKA_BROKERS=rmu-kafka-broker:9092 \
  -e RMU_KAFKA_CLIENT_ID=rmu-api-npcs \
  labcabrera/rmu-api-npcs:latest

docker logs -f rmu-api-npcs
