# Excelsior Cleaning Services Website

This is a bilingual (Spanish/English) landing page for Excelsior Cleaning Services in Bucaramanga, Colombia.

## Image Requirements

Please add the following images to the `images` directory:

1. Hero Image (1920x1080px)
   - Filename: `hero.jpg`
   - Requirements: High-quality image showing professional cleaning services

2. Service Cards (800x600px)
   - `residential.jpg`: Residential cleaning services
   - `commercial.jpg`: Commercial cleaning services
   - `office.jpg`: Office cleaning services
   - `special.jpg`: Special cleaning services

3. WhatsApp QR Code (300x300px)
   - Filename: `whatsapp-qr.png`
   - Generate at: https://www.qr-code-generator.com/
   - Link to: https://wa.me/573011652120

## Deployment Instructions

1. **Netlify Deployment:**
   - Create a Netlify account at https://www.netlify.com
   - Connect your GitHub repository
   - Deploy from the main branch
   - Configure build settings (not required for static site)

2. **Domain Setup:**
   - Purchase domain from preferred registrar
   - Add custom domain in Netlify settings
   - Update DNS settings at registrar:
     * Add CNAME record pointing to Netlify's servers
     * Follow Netlify's DNS instructions for proper setup

3. **SSL Certificate:**
   - Enable Netlify's free SSL certificate
   - Force HTTPS in domain settings

## Content Updates

To update website content:

1. **Text Changes:**
   - Open `index.html`
   - Locate the text you want to change
   - Update both Spanish (`data-es`) and English (`data-en`) attributes

2. **Image Replacement:**
   - Prepare new image according to size requirements
   - Place in `images` directory with correct filename
   - Ensure image is optimized for web

## Testing Checklist

- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness
- [ ] Language toggle functionality
- [ ] Navigation menu (desktop and mobile)
- [ ] WhatsApp integration
- [ ] Contact information accuracy
- [ ] Image loading and optimization
- [ ] SSL certificate
- [ ] Page load speed
- [ ] SEO meta tags

## SEO Optimization

The website includes:
- Relevant meta tags
- Proper heading structure
- Alt text for images
- Mobile-friendly design
- Fast loading times
- Local business schema
- Bilingual content support

## Support

For technical support or questions, please contact the development team.
