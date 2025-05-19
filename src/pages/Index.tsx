
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturedItems from '@/components/home/FeaturedItems';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import Layout from '@/components/layout/Layout';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedItems />
      <TestimonialsSection />
    </Layout>
  );
};

export default Index;
