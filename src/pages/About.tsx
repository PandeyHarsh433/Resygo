
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold">
            About <span className="text-cinema-gold">Resygo</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Our story, mission, and culinary philosophy
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-4 font-serif text-2xl font-bold">Our Story</h2>
            <p className="mb-6 text-muted-foreground">
              Founded in 2020, Resygo began with a vision to create immersive dining experiences
              inspired by the world of cinema. Our team of passionate chefs and film enthusiasts came together
              to craft a unique restaurant concept that celebrates the art of storytelling through food.
            </p>
            <p className="mb-6 text-muted-foreground">
              Each dish tells a story, each meal is a scene, and every dining experience is a memorable part of your
              personal narrative. We've created a space where culinary innovation meets theatrical presentation,
              engaging all your senses in a truly cinematic experience.
            </p>

            <Card className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Restaurant interior"
                className="aspect-video w-full object-cover"
              />
            </Card>
          </div>

          <div>
            <h2 className="mb-4 font-serif text-2xl font-bold">Our Philosophy</h2>
            <p className="mb-6 text-muted-foreground">
              At Resygo, we believe dining should be more than just eating—it should be an experience
              that engages all your senses and creates lasting memories. Our culinary philosophy centers around
              three core principles:
            </p>

            <div className="mb-6 space-y-4">
              <div>
                <h3 className="font-medium text-cinema-gold">Artistry in Presentation</h3>
                <p className="text-muted-foreground">
                  Every plate is a canvas, every dish a work of art designed to captivate before the first bite.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-cinema-gold">Storytelling Through Taste</h3>
                <p className="text-muted-foreground">
                  Our menu tells stories through flavor combinations that evoke emotions and create memorable narratives.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-cinema-gold">Sustainable Excellence</h3>
                <p className="text-muted-foreground">
                  We source the finest sustainable ingredients, supporting local producers and seasonal harvests.
                </p>
              </div>
            </div>

            <Card className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Chef team"
                className="aspect-video w-full object-cover"
              />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
