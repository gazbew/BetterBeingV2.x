import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Button, Stack, Container, Chip } from '@mui/material';
import { ArrowForward, Star, AutoAwesome, PlayArrow } from '@mui/icons-material';

const HeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}CC 0%, 
    ${theme.palette.primary.light}AA 35%, 
    #7BA05B88 100%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(https://images.unsplash.com/photo-1571838081649-888aca731232?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHx3ZWxsbmVzcyUyMG5hdHVyZSUyMG1lZGl0YXRpb24lMjBoZWFsdGh5JTIwbGlmZXN0eWxlfGVufDB8MHx8Z3JlZW58MTc1NTE1Mjc2NHww&ixlib=rb-4.1.0&q=85)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: 0.3,
    zIndex: 1
  }
}));

const GlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '24px',
  padding: theme.spacing(3, 4),
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  position: 'relative',
  zIndex: 3
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: `linear-gradient(45deg, #7BA05B66, ${theme.palette.primary.light}44)`,
  filter: 'blur(1px)',
  zIndex: 2,
  animation: 'float 6s ease-in-out infinite'
}));

const StatsCard = styled(GlassCard)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  textAlign: 'center',
  minWidth: '120px'
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  fontWeight: 600,
  borderRadius: '50px',
  textTransform: 'none',
  boxShadow: '0 10px 30px rgba(193, 88, 27, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 40px rgba(193, 88, 27, 0.6)',
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
  }
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  color: theme.palette.common.white,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  fontWeight: 500,
  borderRadius: '50px',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.25)',
    transform: 'translateY(-1px)'
  }
}));

const ScrollIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(4),
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 3,
  animation: 'bounce-gentle 2s infinite'
}));

export const HeroSectionEnhanced = () => {
  const floatingElements = [
    { size: 60, top: '15%', left: '10%', delay: 0 },
    { size: 40, top: '25%', right: '15%', delay: 0.5 },
    { size: 80, bottom: '20%', left: '8%', delay: 1 },
    { size: 30, top: '60%', right: '20%', delay: 1.5 },
    { size: 50, bottom: '30%', right: '10%', delay: 2 }
  ];

  const stats = [
    { value: '50,000+', label: 'Lives Transformed' },
    { value: '100%', label: 'Natural Products' },
    { value: '24/7', label: 'Expert Support' }
  ];

  return (
    <HeroContainer>
      {/* Floating Elements */}
      {floatingElements.map((element, index) => (
        <FloatingElement
          key={index}
          sx={{
            width: element.size,
            height: element.size,
            top: element.top,
            left: element.left,
            right: element.right,
            bottom: element.bottom,
            animationDelay: `${element.delay}s`
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          {/* Brand Badge */}
          <Chip
            icon={<Star sx={{ color: 'primary.main' }} />}
            label="Better Being - Natural Wellness"
            sx={{
              background: 'rgba(193, 88, 27, 0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1px solid rgba(193, 88, 27, 0.3)',
              fontSize: '0.9rem',
              fontWeight: 500,
              py: 1,
              px: 2
            }}
            deleteIcon={<AutoAwesome sx={{ color: 'primary.main' }} />}
            onDelete={() => {}}
          />

          {/* Main Headline */}
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
                fontWeight: 700,
                color: 'white',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                lineHeight: 1.1,
                mb: 2
              }}
            >
              Better Being
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme => theme.palette.primary.main}, #7BA05B)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none'
              }}
            >
              Natural Wellness
            </Typography>
          </Box>

          {/* Subheadline */}
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '800px',
              lineHeight: 1.6,
              fontWeight: 400,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            Discover premium natural products and expert wisdom that will revolutionize your health, 
            elevate your energy, and unlock your body's incredible potential for transformation.
          </Typography>

          {/* Stats */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3}
            justifyContent="center"
            alignItems="center"
          >
            {stats.map((stat, index) => (
              <StatsCard key={stat.label}>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#7BA05B',
                    fontWeight: 700,
                    mb: 0.5
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.8rem'
                  }}
                >
                  {stat.label}
                </Typography>
              </StatsCard>
            ))}
          </Stack>

          {/* CTA Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3}
            justifyContent="center"
            alignItems="center"
          >
            <PrimaryButton
              size="large"
              endIcon={<ArrowForward />}
            >
              Shop Better Being Products
            </PrimaryButton>
            <SecondaryButton
              size="large"
              startIcon={<PlayArrow />}
            >
              Watch Our Story
            </SecondaryButton>
          </Stack>

          {/* Trust Indicators */}
          <GlassCard sx={{ mt: 4 }}>
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={3}
              alignItems="center"
              justifyContent="center"
              divider={<Box sx={{ width: '1px', height: '20px', bgcolor: 'rgba(255,255,255,0.3)', display: { xs: 'none', md: 'block' } }} />}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Stack direction="row" spacing={0.5}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} sx={{ color: '#7BA05B', fontSize: '1rem' }} />
                  ))}
                </Stack>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  4.9/5 from 12,000+ reviews
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Free shipping worldwide
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                30-day money-back guarantee
              </Typography>
            </Stack>
          </GlassCard>
        </Stack>
      </Container>

      {/* Scroll Indicator */}
      <ScrollIndicator>
        <Box
          sx={{
            width: 24,
            height: 40,
            border: '2px solid rgba(255,255,255,0.5)',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            pt: 1
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 8,
              bgcolor: '#7BA05B',
              borderRadius: '2px'
            }}
          />
        </Box>
      </ScrollIndicator>
    </HeroContainer>
  );
};