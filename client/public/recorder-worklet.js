class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(0);
    this.batchSize = 960; // 40ms @ 24kHz
    this.silenceThreshold = 0.002;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0];

    // append samples
    const newBuffer = new Float32Array(this.buffer.length + channelData.length);
    newBuffer.set(this.buffer, 0);
    newBuffer.set(channelData, this.buffer.length);
    this.buffer = newBuffer;

    while (this.buffer.length >= this.batchSize) {
      // compute energy
      let energy = 0;
      for (let i = 0; i < this.batchSize; i++) {
        energy += Math.abs(this.buffer[i]);
      }

      const isSilent = energy / this.batchSize <= this.silenceThreshold;

      if (isSilent) {
        // 🔥 send silence marker
        // When the chunk is silent, we don't send the whole chunk (for optimization)
        this.port.postMessage("_");
      } else {
        const pcm16 = new Int16Array(this.batchSize);
        for (let i = 0; i < this.batchSize; i++) {
          let s = Math.max(-1, Math.min(1, this.buffer[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
      }

      // drop exactly 40ms
      this.buffer = this.buffer.slice(this.batchSize);
    }

    return true;
  }
}

registerProcessor("recorder-worklet", RecorderProcessor);
