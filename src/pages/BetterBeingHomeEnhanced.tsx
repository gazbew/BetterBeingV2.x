import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import theme from '@/theme';
import { NavigationGlass } from '@/components/NavigationGlass';
import { HeroSectionEnhanced } from '@/components/HeroSectionEnhanced';
import { ProductsInteractive } from '@/components/ProductsInteractive';
import { WellnessJourneyGamified } from '@/components/WellnessJourneyGamified';
import { FooterModern } from '@/components/FooterModern';

const BetterBeingHomeEnhanced = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh' }}>
        <NavigationGlass />
        <HeroSectionEnhanced />
        <ProductsInteractive />
        <WellnessJourneyGamified />
        <FooterModern />
      </Box>
    </ThemeProvider>
  );
};

export default BetterBeingHomeEnhanced;