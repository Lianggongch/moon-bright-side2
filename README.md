# The Moon - Live

A beautiful, real-time moon tracking web application that displays moon phase, moonrise/moonset times, and moon position using your device's compass.

## Features

- 🌙 **Real-time Moon Phase**: Shows current moon illumination percentage and phase name
- 🧭 **Compass Navigation**: Interactive compass dial that rotates with your device orientation
- 📍 **Location-based**: Automatically detects your location for accurate moon calculations
- ⏰ **Moonrise/Moonset Times**: Displays past and upcoming moon events with countdown
- 🎯 **Moon Direction**: Red pointer indicates the real-world direction of the moon

## Usage

1. Open `index.html` in a modern mobile browser (or desktop browser for testing)
2. Allow location access when prompted
3. Allow device orientation access (iOS may require a tap to enable)
4. Rotate your device to see the compass dial rotate accordingly

## Technical Details

- Pure HTML/CSS/JavaScript (no build step required)
- Uses [SunCalc](https://github.com/mourner/suncalc) library for astronomical calculations
- Uses OpenStreetMap Nominatim API for reverse geocoding
- Responsive design optimized for mobile devices
- Supports iOS safe area insets for notched devices

## Browser Compatibility

- iOS Safari 13+ (requires user interaction for device orientation)
- Android Chrome (latest)
- Desktop browsers (for testing, compass will not rotate without device orientation)

## Deployment

This is a static site that can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

Simply upload the `index.html` file and it will work!

## License

MIT License
