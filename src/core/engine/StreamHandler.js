import { EventEmitter } from 'events';
import logger from '../../utils/logger.js';

export class StreamHandler extends EventEmitter {
  constructor() {
    super();
    this.activeStreams = new Map();
  }

  createStream(streamId) {
    const stream = {
      id: streamId,
      buffer: '',
      startTime: Date.now(),
      chunks: 0
    };

    this.activeStreams.set(streamId, stream);
    logger.info(`Stream created: ${streamId}`);

    return stream;
  }

  handleChunk(streamId, chunk) {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream) {
      logger.warn(`Stream not found: ${streamId}`);
      return;
    }

    stream.buffer += chunk;
    stream.chunks++;

    this.emit('chunk', { streamId, chunk, buffer: stream.buffer });
  }

  endStream(streamId) {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream) return;

    const duration = Date.now() - stream.startTime;
    
    this.emit('end', {
      streamId,
      buffer: stream.buffer,
      chunks: stream.chunks,
      duration
    });

    this.activeStreams.delete(streamId);
    logger.info(`Stream ended: ${streamId}, Duration: ${duration}ms`);
  }

  getStream(streamId) {
    return this.activeStreams.get(streamId);
  }

  getActiveStreams() {
    return Array.from(this.activeStreams.keys());
  }

  closeAllStreams() {
    for (const streamId of this.activeStreams.keys()) {
      this.endStream(streamId);
    }
  }
}

export default new StreamHandler();
