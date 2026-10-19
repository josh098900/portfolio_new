// The London Sky wallpaper: colours for the sky over London at a given moment,
// worked out from the sun's real position. No API needed.
//
// skyVars is also inlined into the pre-paint script with toString(), so it must
// stay self-contained: no imports and nothing from outside the function.

/** CSS custom properties describing the sky over London at `time` (ms since 1970). */
export function skyVars(time: number): Record<string, string> {
  var rad = Math.PI / 180;
  var lat = 51.5074 * rad;
  var lon = -0.1278;

  // Sun position (a standard low-precision solar formula, good to a fraction of a degree).
  var days = time / 86400000 - 10957.5;
  var anomaly = (357.529 + 0.98560028 * days) * rad;
  var meanLon = 280.459 + 0.98564736 * days;
  var eclipticLon = (meanLon + 1.915 * Math.sin(anomaly) + 0.02 * Math.sin(2 * anomaly)) * rad;
  var tilt = (23.439 - 0.00000036 * days) * rad;
  var declination = Math.asin(Math.sin(tilt) * Math.sin(eclipticLon));
  var ascension = Math.atan2(Math.cos(tilt) * Math.sin(eclipticLon), Math.cos(eclipticLon));
  var siderealDeg = (((280.46061837 + 360.98564736629 * days + lon) % 360) + 360) % 360;
  var hourAngle = siderealDeg * rad - ascension;
  var elevation = Math.asin(Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle)) / rad;
  var azimuth = (Math.atan2(-Math.sin(hourAngle), Math.tan(declination) * Math.cos(lat) - Math.sin(lat) * Math.cos(hourAngle)) / rad + 360) % 360;

  // Sky colours by sun elevation: top of the sky, middle, horizon, star brightness.
  var stops: [number, string, string, string, number][] = [
    [-90, "03050d", "070b1c", "0d1330", 0.95],
    [-18, "040819", "0a1230", "141c44", 0.9],
    [-12, "0a1236", "1b2456", "3a3470", 0.55],
    [-6, "17265e", "3d3f86", "c0607a", 0.2],
    [-2, "26447f", "7d6aa6", "f08a5d", 0.05],
    [2, "3a68b0", "c98fa0", "ffb36b", 0],
    [8, "4f8fd8", "9cc3ea", "ffe0b0", 0],
    [20, "3f8de0", "86bdf0", "d7ecfb", 0],
    [90, "2f7fdb", "6fb1ef", "bfe1fa", 0],
  ];
  var i = 0;
  while (i < stops.length - 2 && elevation > stops[i + 1][0]) i++;
  var a = stops[i], b = stops[i + 1];
  var t = Math.min(1, Math.max(0, (elevation - a[0]) / (b[0] - a[0])));
  function mix(from: string, to: string) {
    var out = [0, 2, 4].map(function (o) {
      var x = parseInt(from.slice(o, o + 2), 16), y = parseInt(to.slice(o, o + 2), 16);
      return Math.round(x + (y - x) * t);
    });
    return out;
  }
  function css(c: number[]) { return "rgb(" + c.join(" ") + ")"; }
  var top = mix(a[1], b[1]), mid = mix(a[2], b[2]), horizon = mix(a[3], b[3]);
  var stars = a[4] + (b[4] - a[4]) * t;

  // Is the upper sky dark? Then menu bar text goes white.
  var light = (0.2126 * top[0] + 0.7152 * top[1] + 0.0722 * top[2] + 0.2126 * mid[0] + 0.7152 * mid[1] + 0.0722 * mid[2]) / 2;
  var dark = light < 120;

  // The sun crosses from east (left) to west (right), and sets below the skyline.
  var sunX = Math.min(95, Math.max(5, ((azimuth - 70) / 220) * 100));
  var sunY = Math.min(110, Math.max(8, 86 - elevation * 1.6));
  var low = Math.max(0, Math.min(1, 1 - elevation / 15));
  var sunAlpha = Math.max(0, Math.min(1, (elevation + 3) / 4));
  var core = low > 0.6 ? "255 196 120" : "255 246 220";

  return {
    "--sky-top": css(top),
    "--sky-mid": css(mid),
    "--sky-horizon": css(horizon),
    "--sky-stars": "rgb(255 255 255 / " + stars.toFixed(2) + ")",
    "--sun-x": sunX.toFixed(1) + "%",
    "--sun-y": sunY.toFixed(1) + "%",
    "--sun-core": "rgb(" + core + " / " + sunAlpha.toFixed(2) + ")",
    "--sun-glow": "rgb(255 " + Math.round(200 - low * 60) + " " + Math.round(140 - low * 60) + " / " + (sunAlpha * (0.25 + low * 0.35)).toFixed(2) + ")",
    "--sky-text": dark ? "#fff" : "#1d1d1f",
    "--sky-logo-text": dark ? "#1d1d1f" : "#fff",
    "--city-lights": Math.max(0, Math.min(1, (2 - elevation) / 8)).toFixed(2),
    "--sun-elevation": elevation.toFixed(1),
  };
}
