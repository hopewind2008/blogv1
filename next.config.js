/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Vogue and fashion media
      {
        protocol: 'https',
        hostname: 'assets.vogue.com'
      },
      {
        protocol: 'https',
        hostname: 'media.vogue.com'
      },
      {
        protocol: 'https',
        hostname: 'www.vogue.com'
      },
      {
        protocol: 'https',
        hostname: 'vogue.com'
      },
      {
        protocol: 'https',
        hostname: 'hips.hearstapps.com'
      },
      {
        protocol: 'https',
        hostname: 'hmg-prod.s3.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'vader-prod.s3.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: '*.elle.com'
      },
      {
        protocol: 'https',
        hostname: '*.hearstapps.com'
      },
      {
        protocol: 'https',
        hostname: '*.harpersbazaar.com'
      },
      {
        protocol: 'https',
        hostname: '*.cosmopolitan.com'
      },
      
      // Social media
      {
        protocol: 'https',
        hostname: 'i.pinimg.com'
      },
      {
        protocol: 'https',
        hostname: '*.sinaimg.cn'
      },
      {
        protocol: 'https',
        hostname: '*.xiaohongshu.com'
      },
      {
        protocol: 'https',
        hostname: '*.xhscdn.com'
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com'
      },
      
      // Shopping sites
      {
        protocol: 'https',
        hostname: 'static.zara.net'
      },
      {
        protocol: 'https',
        hostname: '*.zara.com'
      },
      {
        protocol: 'https',
        hostname: 'lp2.hm.com'
      },
      {
        protocol: 'https',
        hostname: 'www2.hm.com'
      },
      {
        protocol: 'https',
        hostname: '*.gap.com'
      },
      
      // CDNs and others
      {
        protocol: 'https',
        hostname: '*.cloudinary.com'
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com'
      }
    ]
  }
}

module.exports = nextConfig 