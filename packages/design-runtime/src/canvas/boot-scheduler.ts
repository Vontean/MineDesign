/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var defaultArtboardBootEnvironment: Dynamic;
var ArtboardBootScheduler: Dynamic;
var artboardBootScheduler: Dynamic;
function artboardBootClock(): Dynamic {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}
export {
  artboardBootClock,
  artboardBootScheduler,
  ArtboardBootScheduler,
  defaultArtboardBootEnvironment,
};
export function installCanvasBootScheduler(): () => void {
  return () => {
    defaultArtboardBootEnvironment = {
      busySince: (): Dynamic => null,
      rank: (): Dynamic => 0,
    };
    ArtboardBootScheduler = class {
      env: Dynamic = defaultArtboardBootEnvironment;
      waiting: Dynamic = [];
      booting: Dynamic = new Map();
      timer: Dynamic = null;
      booted: Dynamic = 0;
      configure(environment: Dynamic): Dynamic {
        this.env = environment ?? defaultArtboardBootEnvironment;
        environment === null && (this.booted = 0);
      }
      request(file: Dynamic, grant: Dynamic): Dynamic {
        this.drop(file);
        this.waiting = this.waiting.filter(
          (waitingItem?: Dynamic): Dynamic => waitingItem.file !== file,
        );
        let state: Dynamic = {
          file: file,
          grant: grant,
        };
        this.env.rank(file) < 0
          ? this.start(state)
          : (this.waiting.push(state), this.pump());
        return (): Dynamic => {
          let waitingIndex: Dynamic = this.waiting.indexOf(state);
          waitingIndex >= 0 && this.waiting.splice(waitingIndex, 1);
        };
      }
      done(file: Dynamic): Dynamic {
        let length: Dynamic = this.waiting.length;
        this.waiting = this.waiting.filter(
          (waitingItem?: Dynamic): Dynamic => waitingItem.file !== file,
        );
        (this.drop(file) || this.waiting.length !== length) && this.pump();
      }
      expedite(file: Dynamic): Dynamic {
        let waitingIndex: Dynamic = this.waiting.findIndex(
          (waitingItem?: Dynamic): Dynamic => waitingItem.file === file,
        );
        waitingIndex >= 0 && this.start(this.waiting.splice(waitingIndex, 1)[0]);
      }
      get inFlight(): Dynamic {
        return this.booting.size;
      }
      drop(file: Dynamic): Dynamic {
        let entry: Dynamic = this.booting.get(file);
        return entry === undefined
          ? false
          : (clearTimeout(entry),
            this.booting.delete(file),
            (this.booted += 1),
            true);
      }
      start(waitingItem: Dynamic): Dynamic {
        this.booting.set(
          waitingItem.file,
          setTimeout((): Dynamic => this.done(waitingItem.file), 2500),
        );
        waitingItem.grant();
      }
      pump(): Dynamic {
        this.timer != null && (clearTimeout(this.timer), (this.timer = null));
        let busySince: Dynamic = this.env.busySince(),
          isUserBusy: Dynamic =
            this.booted > 0 &&
            busySince != null &&
            artboardBootClock() - busySince < 2e3;
        for (; !isUserBusy && this.waiting.length > 0 && this.booting.size < 1; )
          this.start(this.next());
        isUserBusy &&
          this.waiting.length > 0 &&
          (this.timer = setTimeout((): Dynamic => this.pump(), 120));
      }
      next(): Dynamic {
        let index: Dynamic = 0,
          bestRank: Dynamic = this.env.rank(this.waiting[0].file);
        for (let count: Dynamic = 1; count < this.waiting.length; count++) {
          let rank: Dynamic = this.env.rank(this.waiting[count].file);
          rank < bestRank && ((index = count), (bestRank = rank));
        }
        return this.waiting.splice(index, 1)[0];
      }
    };
    artboardBootScheduler = new ArtboardBootScheduler();
  };
}
