# Nest Docker-Redis app example
An example of a NestJS application with Docker

## Prerequisites

Install nestJS CLI
```
npm i -g @nestjs/cli
```
## Installation
1. Clone this project
```
git clone https://github.com/renfert/generateToken.git
```
### Run locally
1. Run
```
npm install
```
2. Run
```
npm run start
```
3. Post http://localhost:3000/tokens
4. GET http://localhost:3000/target/[token]
### Run in a container
1. Run 
```
docker-compose up
```

### Run test
npm run test:watch

### Screenshoots
![alt text](https://github.com/renfert/generateToken/blob/master/screenshots/screen1.png?raw=true)
![alt text](https://github.com/renfert/generateToken/blob/master/screenshots/screen2.png?raw=true)
![alt text](https://github.com/renfert/generateToken/blob/master/screenshots/screen3.png?raw=true)
![alt text](https://github.com/renfert/generateToken/blob/master/screenshots/screen4.png?raw=true)
