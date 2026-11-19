// Phone tilt, same approach as Trev's site: how far the phone is tilted from
// the way it's being held, x and y each -1..1, with the resting angle slowly
// re-centring (so holding it at any angle reads as flat and only movement
// shows). iPhone only gives motion after asking from inside a tap: the
// speaker and the menu button call requestMotion(), nothing asks on load.
// Android needs no permission and starts right away.
const RANGE_DEG = 7;
const RECENTER = 0.004;

export const tilt = { x: 0, y: 0, live: false };
let base = null;
let listening = false;
let asked = null;

function onOrient(e) {
  if (e.gamma == null || e.beta == null) return;
  tilt.live = true;
  if (!base) base = { g: e.gamma, b: e.beta };
  base.g += (e.gamma - base.g) * RECENTER;
  base.b += (e.beta - base.b) * RECENTER;
  tilt.x = Math.max(-1, Math.min(1, (e.gamma - base.g) / RANGE_DEG));
  tilt.y = Math.max(-1, Math.min(1, (e.beta - base.b) / RANGE_DEG));
}

function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener("deviceorientation", onOrient, { passive: true });
}

export function requestMotion() {
  const D = typeof window !== "undefined" && window.DeviceOrientationEvent;
  if (!D) return Promise.resolve(false);
  if (typeof D.requestPermission !== "function") {
    listen();
    return Promise.resolve(true);
  }
  if (!asked)
    asked = D.requestPermission()
      .then((r) => {
        if (r === "granted") listen();
        return r === "granted";
      })
      .catch(() => false);
  return asked;
}

if (typeof window !== "undefined") {
  const D = window.DeviceOrientationEvent;
  if (D && typeof D.requestPermission !== "function") listen(); // Android: right away
}
