import { Button } from '@/components/ui/button';
import { ChefHat, Clock } from 'lucide-react';
import heroImage from '@/assets/hero-food.jpg';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-primary mb-8">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Delicious Indian food spread"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
      </div>
      
      <div className="relative z-10 px-8 py-12 md:py-16 max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="w-8 h-8 text-primary-foreground" />
          <span className="text-primary-foreground/80 font-medium">Cloud Kitchen</span>
        </div>
        
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
          Sharav's Kitchen
        </h1>
        <p className="text-xl text-primary-foreground/90 mb-2">
          Fresh flavours, happy faces.
        </p>
        <p className="text-primary-foreground/70 mb-8 max-w-md">
          Hot & wholesome meals delivered from our cloud kitchen to your table. Order quick, eat happy.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button variant="hero" size="lg">
            <Clock className="w-5 h-5" />
            Order Now — Fresh in 20
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Explore Menu
          </Button>
        </div>
      </div>
    </section>
  );
};
