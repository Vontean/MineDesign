/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var PlatformRateLimiterResolvedValue: Dynamic;
var TokenBucket: Dynamic;
var externalLinkLimiter: Dynamic;
function errorMessage(error?: Dynamic): Dynamic {
  return error instanceof Error ? error.message : String(error);
}
export {
  errorMessage,
  externalLinkLimiter,
  PlatformRateLimiterResolvedValue,
  TokenBucket,
};
export function installPlatformRateLimiter(): () => void {
  return () => {
    PlatformRateLimiterResolvedValue = 2 * 1024 * 1024;
    TokenBucket = class {
      constructor(input: Dynamic, options: Dynamic) {
        this.cap = input;
        this.refillPerSec = options;
        this.tokens = input;
      }
      cap: Dynamic;
      refillPerSec: Dynamic;
      tokens: Dynamic;
      last: Dynamic = performance.now();
      take(): Dynamic {
        let value: Dynamic = performance.now();
        this.tokens = Math.min(
          this.cap,
          this.tokens + ((value - this.last) / 1e3) * this.refillPerSec,
        );
        this.last = value;
        return this.tokens < 1 ? false : ((this.tokens -= 1), true);
      }
    };
    externalLinkLimiter = new TokenBucket(1, 1);
  };
}
