/** Tracks which iframe navigation belongs to the preview currently mounted by the editor. */
export class PreviewGenerationGate {
  private generation = 0;
  private mounted = 0;
  private consumed = 0;
  private port: MessagePort | null = null;
  private blockedReason: string | null = null;
  private helloWaiters: ((port: MessagePort | null) => void)[] = [];

  hostWillLoad() {
    return ++this.generation;
  }

  generationMounted(generation: number) {
    if (generation !== this.generation) return;
    this.mounted = generation;
    this.port = null;
    this.blockedReason = null;
    this.settleHelloWaiters(null);
  }

  frameRetired() {
    this.generation++;
    this.port = null;
    this.settleHelloWaiters(null);
  }

  helloReceived(port: MessagePort) {
    if (this.blockedReason != null || this.port != null) return "rejected";
    this.port = port;
    this.settleHelloWaiters(port);
    return "accepted";
  }

  waitForHello(timeoutMs = 1500): Promise<MessagePort | null> {
    if (this.port != null) return Promise.resolve(this.port);
    return new Promise((resolve) => {
      const receive = (port: MessagePort | null) => {
        clearTimeout(timer);
        resolve(port);
      };
      const timer = setTimeout(() => {
        const index = this.helloWaiters.indexOf(receive);
        if (index >= 0) this.helloWaiters.splice(index, 1);
        resolve(this.port);
      }, timeoutMs);
      this.helloWaiters.push(receive);
    });
  }

  private settleHelloWaiters(port: MessagePort | null) {
    for (const receive of this.helloWaiters.splice(0)) receive(port);
  }

  frameLoaded(): { kind: "first"; gen: number } | { kind: "foreign" } {
    if (this.blockedReason == null && this.consumed < this.mounted) {
      this.consumed = this.mounted;
      return { kind: "first", gen: this.mounted };
    }
    this.latch("the preview document navigated itself");
    return { kind: "foreign" };
  }

  verdict(generation: number, status: string) {
    if (generation !== this.generation || generation !== this.mounted || status === "alive") return;
    this.latch("the preview stopped answering the editor (replaced by a navigation, or unresponsive for too long)");
  }

  get helloPort() { return this.port; }
  get mountedGeneration() { return this.mounted; }
  get blocked() { return this.blockedReason; }

  private latch(reason: string) {
    if (this.blockedReason == null) this.blockedReason = reason;
  }
}

const defaultGate = new PreviewGenerationGate();
const gates = new WeakMap<HTMLIFrameElement, PreviewGenerationGate>();

export function setPreviewGenerationGate(frame: HTMLIFrameElement, gate: PreviewGenerationGate) {
  gates.set(frame, gate);
}

export function getPreviewGenerationGate(frame?: HTMLIFrameElement | null) {
  return (frame && gates.get(frame)) || defaultGate;
}
