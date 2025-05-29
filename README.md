# route Management System

A NestJS-based fleet management system with route optimization capabilities.

## Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your OpenRouteService API key:
```
OPENROUTE_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
```

3. Build the project:
```bash
npm run build
```

## Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api
```

## Available Endpoints

### Vehicle Management
- GET `/delivery/vehicle/1/current-location` - Get vehicle location
- PUT `/delivery/vehicle/1/location` - Update vehicle location

### Route Optimization
- GET `/delivery/optimize/1` - Optimize route for a single vehicle
- GET `/delivery/optimize-multi` - Optimize routes for multiple vehicles
- GET `/delivery/directions` - Get turn-by-turn directions between two points

### Order Management
- PUT `/delivery/status/2` - Update order status

## Using the Directions Service

The fleet management system now includes turn-by-turn directions using OpenRouteService. This provides:

1. Turn-by-turn navigation instructions
2. More accurate travel time and distance calculations
3. Real-world route planning

To use this functionality:

1. Sign up for a free API key at [OpenRouteService](https://openrouteservice.org/)
2. Add your API key to the `.env` file
3. The system will automatically use the API for all route optimizations

### Example API request for directions:

```
GET /delivery/directions?startLat=13.4966&startLng=39.4753&endLat=13.5100&endLng=39.4800
```

This will return detailed turn-by-turn directions between the two coordinates.

## Testing

Run the test suite:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Project Structure

```
src/
├── controllers/     # API endpoints
├── services/       # Business logic
├── models/         # Data models
└── main.ts         # Application entry point
```

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
