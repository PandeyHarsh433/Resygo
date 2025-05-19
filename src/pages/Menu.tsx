import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import Layout from '@/components/layout/Layout';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  category_id: string;
}

const Menu = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const { addItem } = useCart();
  const tabsListRef = useRef<HTMLDivElement>(null);

  // Scroll tab control
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsListRef.current) {
      const container = tabsListRef.current;
      const scrollAmount = 200;

      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }

      // Update scroll buttons visibility after scrolling
      updateScrollButtonsVisibility();
    }
  };

  // Check if scroll buttons should be visible
  const updateScrollButtonsVisibility = () => {
    if (tabsListRef.current) {
      const container = tabsListRef.current;

      // Show left button if scrolled to the right
      setShowLeftScroll(container.scrollLeft > 0);

      // Show right button if there's more content to scroll
      setShowRightScroll(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('menu_categories')
          .select('*')
          .order('name');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);

        // Set active category to first one if exists
        if (categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].id);
        }

        // Fetch menu items
        const { data: itemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)
          .order('name');

        if (itemsError) throw itemsError;
        setMenuItems(itemsData);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add scroll event listener to tabs container
  useEffect(() => {
    const tabsContainer = tabsListRef.current;

    if (tabsContainer) {
      updateScrollButtonsVisibility();
      tabsContainer.addEventListener('scroll', updateScrollButtonsVisibility);

      // Initial check for scroll buttons
      setTimeout(updateScrollButtonsVisibility, 100);

      // Create resize observer to update button visibility on resize
      const resizeObserver = new ResizeObserver(() => {
        updateScrollButtonsVisibility();
      });

      resizeObserver.observe(tabsContainer);

      return () => {
        tabsContainer.removeEventListener('scroll', updateScrollButtonsVisibility);
        resizeObserver.disconnect();
      };
    }
  }, [categories]);

  // Filter menu items by active category
  const filteredItems = activeCategory
    ? menuItems.filter(item => item.category_id === activeCategory)
    : menuItems;

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cinema-gold" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold">
            Our <span className="text-cinema-gold">Menu</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Explore our curated selection of culinary delights
          </p>
        </div>

        <Tabs value={activeCategory || ""} onValueChange={setActiveCategory} className="w-full">
          <div className="relative mb-8">
            {/* Scroll indicators with animated opacity */}
            {showLeftScroll && (
              <div className="absolute left-0 top-0 z-10 flex h-full items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/90 shadow-md transition-all hover:bg-background"
                  onClick={() => scrollTabs('left')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="pointer-events-none absolute left-8 h-full w-8"></div>
              </div>
            )}

            <div className="overflow-hidden">
              <TabsList
                ref={tabsListRef}
                className="scrollbar-hide flex w-full justify-start overflow-x-auto px-4 py-1 md:justify-center"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="m-1 whitespace-nowrap rounded-full px-6 py-1.5 transition-all data-[state=active]:bg-cinema-gold data-[state=active]:text-white"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {showRightScroll && (
              <div className="absolute right-0 top-0 z-10 flex h-full items-center">
                <div className="pointer-events-none absolute right-8 h-full w-8"></div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/90 shadow-md transition-all hover:bg-background"
                  onClick={() => scrollTabs('right')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden transition-transform hover:scale-[1.02]">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1546241072-48010ad2862c'}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-4 flex justify-between">
                        <h3 className="font-serif text-xl font-bold">{item.name}</h3>
                        <span className="font-medium text-cinema-gold">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                      <Button
                        className="w-full bg-cinema-gold hover:bg-cinema-gold/90 text-white"
                        onClick={() => addItem({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image_url: item.image_url
                        })}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No items available in this category.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Menu;