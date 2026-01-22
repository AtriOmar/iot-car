class PlaybackWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
    // Use a large circular buffer to avoid reallocations
    this.bufferSize = 48000 * 2; // 2 seconds at 48kHz
    this.buffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
    this.readIndex = 0;
    this.samplesAvailable = 0;
  }

  handleMessage(event) {
    if (event.data === null) {
      // Clear the buffer
      this.writeIndex = 0;
      this.readIndex = 0;
      this.samplesAvailable = 0;
      return;
    }

    const data = event.data;
    for (let i = 0; i < data.length; i++) {
      this.buffer[this.writeIndex] = data[i] / 32768;
      this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
      if (this.samplesAvailable < this.bufferSize) {
        this.samplesAvailable++;
      } else {
        // Buffer overflow - advance read index
        this.readIndex = (this.readIndex + 1) % this.bufferSize;
      }
    }
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];
    const frameSize = channel.length;

    for (let i = 0; i < frameSize; i++) {
      if (this.samplesAvailable > 0) {
        channel[i] = this.buffer[this.readIndex];
        this.readIndex = (this.readIndex + 1) % this.bufferSize;
        this.samplesAvailable--;
      } else {
        // No data available - output silence
        channel[i] = 0;
      }
    }

    return true;
  }
}

registerProcessor("playback-worklet", PlaybackWorklet);
