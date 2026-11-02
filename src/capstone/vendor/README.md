# js-aruco2 2.0.0

Vendored from the published npm package `js-aruco2@2.0.0`:

- https://cdn.jsdelivr.net/npm/js-aruco2@2.0.0/src/aruco.js
- https://cdn.jsdelivr.net/npm/js-aruco2@2.0.0/src/cv.js
- https://cdn.jsdelivr.net/npm/js-aruco2@2.0.0/LICENSE.txt

Source: https://github.com/damianofalcioni/js-aruco2

Only the module wrapper was changed: `this.AR` / `this.CV` and CommonJS
`require('./cv')` became ES module imports/exports. Detector algorithms and
dictionary codewords are unchanged. Copyright notices and upstream license
text are preserved. The browser bundles this locally, with no runtime CDN
dependency or external video processing.

The app selects ARUCO_MIP_36h12 (250 IDs), with the library's strict `< 3`
Hamming-distance acceptance threshold (at most two bit errors).
