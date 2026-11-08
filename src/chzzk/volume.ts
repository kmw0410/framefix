export function createVolumeInitializer() {
  let routeKey: string | undefined;
  let deadline = 0;
  let settledAt = 0;
  let done = false;
  return {
    reset() { routeKey = undefined; },
    stop() { done = true; },
    apply(video: Pick<HTMLVideoElement, 'volume'>, route: string, enabled: boolean, controlsReady = true, now = Date.now()) {
      if (routeKey !== route) {
        routeKey = route; deadline = 0; settledAt = 0; done = false;
      }
      if (!enabled || !controlsReady || done) return false;
      if (!deadline) deadline = now + 8000;
      if (now >= deadline) { done = true; return false; }
      if (video.volume >= 0.999) {
        if (!settledAt) settledAt = now;
        if (now - settledAt >= 2000) done = true;
        return false;
      }
      settledAt = 0;
      video.volume = 1;
      return true;
    }
  };
}
