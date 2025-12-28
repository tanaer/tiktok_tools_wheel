export const getThemeColors = (theme: string) => {
  switch (theme) {
    case 'cyberpunk':
      return {
        wheelBorder: '#00f3ff',
        wheelBg: '#050b14', // Deeper dark blue/black
        // Updated Cyberpunk Palette
        // 1. Neon Purple (#7c4dff) -> Text: White
        // 2. Neon Cyan (#00e5ff) -> Text: Black
        // 3. Deep Purple (#4a148c) -> Text: Cyan (#00e5ff) for contrast
        sectorColors: ['#7c4dff', '#00e5ff', '#4a148c'], 
        textColor: ['#ffffff', '#000000', '#00e5ff'], 
        pointerColor: '#ff4081',
        shadowColor: '#00f3ff',
        ringColor: '#0a192f',
        bulbColor: '#00e5ff',
        bulbGlowColor: '#00f3ff',
        socketColor: '#121212'
      };
    case 'festive':
      return {
        wheelBorder: '#ffd700',
        wheelBg: '#800000',
        sectorColors: ['#D32F2F', '#FFD700'],
        textColor: ['#FFD700', '#D32F2F'],
        pointerColor: '#ffd700',
        shadowColor: '#ff0000',
        ringColor: '#6b0000',
        bulbColor: '#FFD54F',
        bulbGlowColor: '#FFEA00',
        socketColor: '#2b2b2b'
      };
    case 'christmas':
      return {
        wheelBorder: '#1a472a',
        wheelBg: '#1a472a',
        sectorColors: ['#1B5E20', '#C62828'], 
        textColor: ['#FFD700', '#FFFFFF'],
        pointerColor: '#c41e3a',
        shadowColor: '#165b33',
        ringColor: '#0f3d23',
        bulbColor: '#FFD54F',
        bulbGlowColor: '#FFF176',
        socketColor: '#3a3a3a'
      };
    case 'flat':
      return {
        wheelBorder: '#ffffff',
        wheelBg: '#f1f2f6',
        // User requested colors for flat theme:
        // #FFDCDC (Light Pink)
        // #FFF2EB (Pale Peach)
        // #FFE8CD (Creamy Orange)
        // #FFD6BA (Light Apricot)
        sectorColors: ['#FFDCDC', '#FFF2EB', '#FFE8CD', '#FFD6BA'], 
        textColor: '#2D336B', // Use Dark Blue from new theme for contrast
        pointerColor: '#ff4757',
        shadowColor: 'rgba(0,0,0,0.05)',
        ringColor: '#ffffff',
        bulbColor: '#FFD700', 
        bulbGlowColor: '#FFE082',
        socketColor: '#dfe4ea'
      };
    case 'warm_gradient':
      return {
        wheelBorder: '#2D336B', // Dark Blue Border
        wheelBg: '#FFF2F2', // Lightest Pink Bg
        // User provided colors:
        // #FFF2F2 (Very Light Pink) -> Maybe too light for sectors? Used as BG.
        // #A9B5DF (Periwinkle Blue)
        // #7886C7 (Soft Purple Blue)
        // #2D336B (Deep Blue)
        sectorColors: ['#A9B5DF', '#7886C7'], // Alternating blues
        textColor: '#ffffff', // White text on blue
        pointerColor: '#2D336B', // Deep Blue Pointer
        shadowColor: 'rgba(45, 51, 107, 0.2)',
        ringColor: '#FFF2F2', // Light Pink Ring
        bulbColor: '#7886C7', // Soft Purple Light
        bulbGlowColor: '#A9B5DF',
        socketColor: '#FFF2F2'
      };
    default:
      return {
        wheelBorder: '#000000',
        wheelBg: '#ffffff',
        sectorColors: ['#333333', '#666666'],
        textColor: '#ffffff',
        pointerColor: '#ff0000',
        shadowColor: '#000000',
        ringColor: '#222222',
        bulbColor: '#FFD54F',
        bulbGlowColor: '#FFE082',
        socketColor: '#2b2b2b'
      };
  }
};
