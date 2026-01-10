
export type SerialStitchCallback = (stitchType: string) => void;

export class SerialService {
  private port: any | null = null;
  private reader: ReadableStreamDefaultReader | null = null;
  private keepReading: boolean = true;

  async requestPort(): Promise<boolean> {
    try {
      if (!('serial' in navigator)) {
        alert("Web Serial API not supported in this browser. Use Chrome or Edge.");
        return false;
      }
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      return true;
    } catch (err) {
      console.error("Serial Connection Error:", err);
      return false;
    }
  }

  async startListening(onStitchReceived: SerialStitchCallback) {
    if (!this.port) return;
    
    this.keepReading = true;
    const decoder = new TextDecoder();
    
    while (this.port.readable && this.keepReading) {
      this.reader = this.port.readable.getReader();
      try {
        let buffer = "";
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          buffer += chunk;
          
          // Split by newline and process commands
          if (buffer.includes('\n')) {
            const lines = buffer.split('\n');
            buffer = lines.pop() || ""; // Keep last partial segment
            
            lines.forEach(line => {
              const command = line.trim().toLowerCase();
              if (command) {
                onStitchReceived(command);
              }
            });
          }
        }
      } catch (error) {
        console.error("Serial Read Error:", error);
      } finally {
        this.reader.releaseLock();
      }
    }
  }

  async disconnect() {
    this.keepReading = false;
    if (this.reader) {
      await this.reader.cancel();
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
  }
}

export const serialService = new SerialService();
