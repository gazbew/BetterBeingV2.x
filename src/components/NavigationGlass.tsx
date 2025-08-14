import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Stack,
  TextField,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  InputAdornment
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  ShoppingCart,
  FavoriteBorder,
  Person,
  Nature,
  KeyboardArrowDown,
  Close
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const GlassAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&.scrolled': {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    '& .MuiTypography-root': {
      color: theme.palette.text.primary
    },
    '& .MuiIconButton-root': {
      color: theme.palette.text.primary
    }
  }
}));

const Logo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  textDecoration: 'none',
  color: 'inherit'
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, #7BA05B)`,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(193, 88, 27, 0.3)'
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: 'white',
  fontWeight: 500,
  textTransform: 'none',
  padding: theme.spacing(1, 2),
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-1px)'
  },
  '&.active': {
    background: 'rgba(255, 255, 255, 0.2)',
    fontWeight: 600
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
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
      border: `2px solid #7BA05B`
    }
  },
  '& .MuiInputBase-input::placeholder': {
    color: 'rgba(255, 255, 255, 0.7)'
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-1px)'
  }
}));

export const NavigationGlass = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Wellness', path: '/wellness' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const mobileDrawerContent = (
    <Box sx={{ pt: 2, background: `linear-gradient(135deg, ${theme.palette.primary.main}F0, #7BA05BE0)`, height: '100%' }}>
      <Box sx={{ px: 2, pb: 2 }}>
        <Logo component={Link} to="/" onClick={() => setMobileOpen(false)}>
          <LogoIcon>
            <Nature sx={{ color: 'white', fontSize: '1.5rem' }} />
          </LogoIcon>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
            Better Being
          </Typography>
        </Logo>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.label}
            component={Link}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              color: 'white',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: 400
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <GlassAppBar 
        position="fixed" 
        elevation={0}
        className={scrolled ? 'scrolled' : ''}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          {/* Logo */}
          <Logo component={Link} to="/">
            <LogoIcon>
              <Nature sx={{ color: 'white', fontSize: '1.5rem' }} />
            </LogoIcon>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: scrolled ? 'text.primary' : 'white',
                transition: 'color 0.3s ease'
              }}
            >
              Better Being
            </Typography>
          </Logo>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Stack direction="row" spacing={1} alignItems="center">
              {navigationItems.map((item) => (
                <NavButton
                  key={item.label}
                  component={Link}
                  to={item.path}
                >
                  {item.label}
                </NavButton>
              ))}
            </Stack>
          )}

          {/* Search & Actions */}
          <Stack direction="row" spacing={2} alignItems="center">
            {!isMobile && (
              <Box component="form" onSubmit={handleSearch}>
                <SearchField
                  size="small"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'rgba(255,255,255,0.7)' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ width: 250 }}
                />
              </Box>
            )}

            <ActionButton>
              <Badge badgeContent={0} color="error">
                <FavoriteBorder />
              </Badge>
            </ActionButton>

            <ActionButton>
              <Badge badgeContent={0} color="error">
                <ShoppingCart />
              </Badge>
            </ActionButton>

            <ActionButton>
              <Person />
            </ActionButton>

            {isMobile && (
              <IconButton
                color="inherit"
                onClick={handleDrawerToggle}
                sx={{ color: scrolled ? 'text.primary' : 'white' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Stack>
        </Toolbar>
      </GlassAppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            border: 'none'
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white'
            }}
          >
            <Close />
          </IconButton>
          {mobileDrawerContent}
        </Box>
      </Drawer>
    </>
  );
};