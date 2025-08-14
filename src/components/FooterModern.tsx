import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Container,
  Divider,
  IconButton,
  Chip,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Nature,
  Email,
  Phone,
  LocationOn,
  Facebook,
  Instagram,
  Twitter,
  YouTube,
  Send,
  CheckCircle,
  AccessTime,
  Security,
  LocalShipping,
  Support
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const FooterContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url(https://images.unsplash.com/photo-1658661811609-7c53af4c28ee?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw0fHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMHdlbGxuZXNzJTIwZmxvYXRpbmd8ZW58MHwyfHx8MTc1NTE1Mjc2NHww&ixlib=rb-4.1.0&q=85)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.1,
    zIndex: 0
  }
}));

const NewsletterCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '24px',
  overflow: 'hidden'
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
  }
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-4px)'
  }
}));

const NewsletterInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '25px',
    color: 'white',
    '& fieldset': {
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    '&:hover fieldset': {
      border: '1px solid rgba(255, 255, 255, 0.5)'
    },
    '&.Mui-focused fieldset': {
      border: `2px solid ${theme.palette.accent.main}`
    }
  },
  '& .MuiInputBase-input::placeholder': {
    color: 'rgba(255, 255, 255, 0.7)'
  }
}));

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Wellness Tips', href: '/wellness' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Reviews', href: '/reviews' }
];

const supportLinks = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Shipping Info', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'Track Order', href: '/track' },
  { label: 'Wellness Guide', href: '/wellness-guide' },
  { label: 'Free Consultation', href: '/consultation' }
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Accessibility', href: '/accessibility' }
];

const features = [
  {
    icon: LocalShipping,
    title: 'Free Shipping',
    description: 'Worldwide delivery on all orders'
  },
  {
    icon: Security,
    title: '100% Secure',
    description: 'SSL encrypted & secure payments'
  },
  {
    icon: Support,
    title: '24/7 Support',
    description: 'Expert wellness guidance'
  },
  {
    icon: CheckCircle,
    title: '30-Day Guarantee',
    description: 'Money-back guarantee'
  }
];

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/betterbeing', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/betterbeing', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com/betterbeing', label: 'Twitter' },
  { icon: YouTube, href: 'https://youtube.com/betterbeing', label: 'YouTube' }
];

export const FooterModern = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setShowSuccess(true);
      setEmail('');
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  return (
    <FooterContainer>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Newsletter Section */}
        <Box sx={{ py: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <NewsletterCard>
              <CardContent sx={{ p: 6 }}>
                <Stack spacing={4} alignItems="center" textAlign="center">
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        background: 'linear-gradient(45deg, white, rgba(255,255,255,0.8))',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      Join the Wellness Revolution
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px' }}>
                      Get exclusive wellness tips, early access to new products, and special offers delivered to your inbox.
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={handleNewsletterSubmit} sx={{ width: '100%', maxWidth: '500px' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <NewsletterInput
                        fullWidth
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: 'rgba(255,255,255,0.7)' }} />
                            </InputAdornment>
                          )
                        }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        endIcon={<Send />}
                        sx={{
                          background: `linear-gradient(45deg, ${theme => theme.palette.accent.main}, ${theme => theme.palette.accent.light})`,
                          color: 'white',
                          borderRadius: '25px',
                          px: 4,
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: 'none',
                          minWidth: '140px',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(123, 160, 91, 0.4)'
                          }
                        }}
                      >
                        Subscribe
                      </Button>
                    </Stack>
                  </Box>

                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    No spam. Unsubscribe anytime. Your privacy is protected.
                  </Typography>
                </Stack>
              </CardContent>
            </NewsletterCard>
          </motion.div>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <FeatureCard>
                    <feature.icon sx={{ fontSize: '3rem', color: 'accent.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {feature.description}
                    </Typography>
                  </FeatureCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 6 }} />

        {/* Main Footer Content */}
        <Box sx={{ py: 6 }}>
          <Grid container spacing={6}>
            {/* Company Info */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          background: `linear-gradient(45deg, ${theme => theme.palette.accent.main}, ${theme => theme.palette.accent.light})`,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Nature sx={{ color: 'white', fontSize: '1.8rem' }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          Better Being
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Natural Wellness
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
                      Discover the power of nature with Better Being's premium wellness solutions.
                      Ethically sourced, scientifically formulated for your optimal health.
                    </Typography>
                  </Box>

                  {/* Social Links */}
                  <Stack direction="row" spacing={2}>
                    {socialLinks.map((social, index) => (
                      <motion.div
                        key={social.label}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <SocialButton
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                        >
                          <social.icon />
                        </SocialButton>
                      </motion.div>
                    ))}
                  </Stack>
                </Stack>
              </motion.div>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={2}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Quick Links
                </Typography>
                <Stack spacing={2}>
                  {quickLinks.map((link) => (
                    <Typography
                      key={link.label}
                      component="a"
                      href={link.href}
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: 'accent.main',
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      {link.label}
                    </Typography>
                  ))}
                </Stack>
              </motion.div>
            </Grid>

            {/* Support */}
            <Grid item xs={12} sm={6} md={2}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Support
                </Typography>
                <Stack spacing={2}>
                  {supportLinks.map((link) => (
                    <Typography
                      key={link.label}
                      component="a"
                      href={link.href}
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: 'accent.main',
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      {link.label}
                    </Typography>
                  ))}
                </Stack>
              </motion.div>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Get in Touch
                </Typography>
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Phone sx={{ color: 'accent.main' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      +1 (555) 123-4567
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Email sx={{ color: 'accent.main' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      support@betterbeing.co.za
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <LocationOn sx={{ color: 'accent.main', mt: 0.5 }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      456 Wellness Boulevard<br />
                      Cape Town, 8001<br />
                      South Africa
                    </Typography>
                  </Stack>

                  {/* Business Hours */}
                  <Box
                    sx={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      p: 3,
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <AccessTime sx={{ color: 'accent.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Business Hours
                      </Typography>
                    </Stack>
                    <Stack spacing={1}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Mon - Fri: 8:00 AM - 8:00 PM
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Sat: 9:00 AM - 6:00 PM
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Sun: 10:00 AM - 4:00 PM
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </motion.div>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 4 }} />

        {/* Bottom Bar */}
        <Box sx={{ py: 4 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={3}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              © 2024 Better Being. All rights reserved. Nature's wisdom, your wellness.
            </Typography>
            <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center">
              {legalLinks.map((link) => (
                <Typography
                  key={link.label}
                  component="a"
                  href={link.href}
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: 'accent.main'
                    }
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={5000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Welcome to the Better Being community! Check your email for exclusive wellness tips.
        </Alert>
      </Snackbar>
    </FooterContainer>
  );
};