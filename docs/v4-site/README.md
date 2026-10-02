# Google satellite frame — MAP v4

The first masterplan frame is `public/media/v4/google-site.svg`. It embeds the unchanged Google Maps satellite capture (`google-site-source.jpg`) and adds SVG zoning, bilingual labels, a concept boundary and the proposed road connection. It is a concept comparison for the municipality, not a survey or an approved access design.

## Registration evidence

- Capture date: 2 October 2026. Capture dimensions: 1280 × 720 pixels.
- [Google Maps location](https://www.google.com/maps/@23.6430465,58.1762916,1574m/data=!3m1!1e3).
- SIFT registration of the original user design screenshot to the new capture: 392 candidate matches, 386 RANSAC inliers, 0.411 px inlier RMS residual. The opaque concept parcel was excluded from feature detection.
- `google-registration.json` contains the homography and all inlier pairs. This measures image alignment, not the geospatial accuracy of Google imagery or legal parcel geometry.
- The source-to-world/UTM contract remains the previous imagery registration, clearly identified in `site-coordinate-manifest.json`; it is not silently recalibrated from the new Google screen capture.

## Display and attribution contract

The SVG is 16:10 with `viewBox="210 100 992 620"`. This crops the browser's Russian search UI while keeping the original Google Maps logo and the full original imagery/provider-credit text at the bottom. The source JPEG bytes are unchanged.

Do not mask, fade, obscure or crop the bottom attribution strip. Side/top fading is suitable for integration. Attribution: Google Maps; imagery © Airbus, CNES / Airbus, Maxar Technologies, 2026; map data © 2026. Imagery rights remain with the providers and Google; they are not covered by a repository code licence.

## Pins and camera matching

`public/media/v4/google-site-pins.json` gives normalized pin-tip coordinates for this exact frame. Values are from the displayed SVG top-left, in [0, 1]. IDs: `rides`, `water`, `city`, `parking`, `utility`.

The same original-world anchor must be projected through the Blender camera for the 3D and generated frames. Screen positions from this Google frame must not be copied onto oblique imagery. A generated aerial is illustrative; verify landmarks against its matched model render before claiming exact pin locations.

## Access-road correction

The original source-image point (1035, 164) is the existing northeast road junction visible in the satellite image. Point (945, 383) is the proposed internal arrival roundabout in the user's drawing. They are different features. The overlay connects the existing junction's southwest port to the internal roundabout, then to the parking interface. Road width, legal access, turning geometry and internal parking circulation require design confirmation.

The five area figures (17.5, 9, 5, 4 and 1.5 ha) reproduce the supplied drawing's labels. They are not recalculated or approved measurements; traced polygons and DWG numeric extents differ. The DWG's millimetre unit setting conflicts with the magnitude of the numeric geometry, and its linked aerial underlay was not supplied. Do not present it as a surveyed or cadastral plan.

## Reproduction

Use the isolated image-analysis Python environment with OpenCV and NumPy:

```powershell
python docs/v4-site/register-google.py --design-reference <original-user-screenshot.png> --google-capture public/media/v4/google-site-source.jpg
python docs/v4-site/build-google-overlay.py
```

These scripts analyse image alignment and create SVG annotations. They do not generate or alter Google's imagery. The original user screenshot is retained privately with the project source material.
