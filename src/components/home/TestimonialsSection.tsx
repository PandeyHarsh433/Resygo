
import React from 'react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    role: 'Food Critic',
    quote: 'A truly immersive dining experience that transports you to another world. The attention to detail is remarkable.',
    rating: 5
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Regular Customer',
    quote: "I've been coming here for years and the quality has never wavered. The seasonal menu keeps things exciting.",
    rating: 5
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    role: 'Food Blogger',
    quote: 'The ambiance perfectly complements the innovative menu. Every dish feels like a scene from a beautiful film.',
    rating: 4
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 cinema-gradient cinema-grain text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Guest <span className="text-cinema-gold">Reviews</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Hear what our guests have to say about their cinematic dining experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="p-6 rounded-lg cinema-card backdrop-blur-sm"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-cinema-gold' : 'text-gray-500'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              
              <p className="text-gray-200 italic mb-6">"{testimonial.quote}"</p>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-cinema-gold flex items-center justify-center text-cinema-dark font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
