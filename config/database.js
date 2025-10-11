import mongoose from 'mongoose';
import Redis from 'ioredis';
import config from './index.js';
import logger from '../src/utils/logger.js';

export class DatabaseManager {
  constructor() {
    this.mongodb = null;
    this.redis = null;
  }

  async connectMongoDB() {
    try {
      this.mongodb = await mongoose.connect(config.mongodb.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000
      });
      logger.info('MongoDB connected successfully');
      return this.mongodb;
    } catch (error) {
      logger.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  async connectRedis() {
    try {
      this.redis = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });

      this.redis.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        logger.error('Redis connection error:', error);
      });

      return this.redis;
    } catch (error) {
      logger.error('Redis connection failed:', error);
      throw error;
    }
  }

  async connectAll() {
    await Promise.all([
      this.connectMongoDB(),
      this.connectRedis()
    ]);
    logger.info('All databases connected');
  }

  async disconnect() {
    if (this.mongodb) {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected');
    }
    if (this.redis) {
      await this.redis.quit();
      logger.info('Redis disconnected');
    }
  }

  getRedis() {
    return this.redis;
  }

  getMongoDB() {
    return this.mongodb;
  }
}

export default new DatabaseManager();
