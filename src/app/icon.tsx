import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 20,
          background: '#544541', // Deep Brown (Brand Color)
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fffaeb',      // Ivory (Brand Color)
          borderRadius: '2px',   // Slight rounding for elegance
          fontFamily: 'serif',   // Editorial feel
        }}
      >
        L
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
