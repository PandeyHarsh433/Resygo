
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
}

const MenuManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('categories');
  const [loading, setLoading] = useState<boolean>(true);
  
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    image_url: ''
  });
  
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category_id: '',
    is_available: true,
    is_featured: false
  });
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchCategories(), fetchMenuItems()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    setCategories(data || []);
  };

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');
    
    if (error) throw error;
    setMenuItems(data || []);
  };

  // Category operations
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({
        title: 'Missing information',
        description: 'Category name is required',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('menu_categories')
        .insert({
          name: newCategory.name,
          description: newCategory.description || null,
          image_url: newCategory.image_url || null
        });
      
      if (error) throw error;
      
      await fetchCategories();
      setNewCategory({ name: '', description: '', image_url: '' });
      setIsCategoryDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Category added successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name) {
      toast({
        title: 'Missing information',
        description: 'Category name is required',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('menu_categories')
        .update({
          name: editingCategory.name,
          description: editingCategory.description,
          image_url: editingCategory.image_url
        })
        .eq('id', editingCategory.id);
      
      if (error) throw error;
      
      await fetchCategories();
      setEditingCategory(null);
      setIsCategoryDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Category updated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all menu items in this category.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      await Promise.all([fetchCategories(), fetchMenuItems()]);
      
      toast({
        title: 'Success',
        description: 'Category deleted successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Menu item operations
  const handleAddMenuItem = async () => {
    if (!newMenuItem.name || !newMenuItem.category_id || !newMenuItem.price) {
      toast({
        title: 'Missing information',
        description: 'Name, category and price are required',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('menu_items')
        .insert({
          name: newMenuItem.name,
          category_id: newMenuItem.category_id,
          description: newMenuItem.description || null,
          price: newMenuItem.price,
          image_url: newMenuItem.image_url || null,
          is_available: newMenuItem.is_available,
          is_featured: newMenuItem.is_featured
        });
      
      if (error) throw error;
      
      await fetchMenuItems();
      setNewMenuItem({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category_id: '',
        is_available: true,
        is_featured: false
      });
      setIsMenuItemDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Menu item added successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMenuItem = async () => {
    if (!editingMenuItem || !editingMenuItem.name || !editingMenuItem.category_id || !editingMenuItem.price) {
      toast({
        title: 'Missing information',
        description: 'Name, category and price are required',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: editingMenuItem.name,
          description: editingMenuItem.description,
          price: editingMenuItem.price,
          image_url: editingMenuItem.image_url,
          category_id: editingMenuItem.category_id,
          is_available: editingMenuItem.is_available,
          is_featured: editingMenuItem.is_featured
        })
        .eq('id', editingMenuItem.id);
      
      if (error) throw error;
      
      await fetchMenuItems();
      setEditingMenuItem(null);
      setIsMenuItemDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Menu item updated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      await fetchMenuItems();
      
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cinema-gold" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Menu Management</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
          </TabsList>
          
          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Menu Categories</CardTitle>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setEditingCategory(null);
                        setNewCategory({ name: '', description: '', image_url: '' });
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="category-name">Name</Label>
                        <Input
                          id="category-name"
                          value={editingCategory ? editingCategory.name : newCategory.name}
                          onChange={(e) => {
                            if (editingCategory) {
                              setEditingCategory({ ...editingCategory, name: e.target.value });
                            } else {
                              setNewCategory({ ...newCategory, name: e.target.value });
                            }
                          }}
                          placeholder="Category name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category-description">Description</Label>
                        <Textarea
                          id="category-description"
                          value={editingCategory ? editingCategory.description || '' : newCategory.description || ''}
                          onChange={(e) => {
                            if (editingCategory) {
                              setEditingCategory({ ...editingCategory, description: e.target.value });
                            } else {
                              setNewCategory({ ...newCategory, description: e.target.value });
                            }
                          }}
                          placeholder="Category description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category-image">Image URL</Label>
                        <Input
                          id="category-image"
                          value={editingCategory ? editingCategory.image_url || '' : newCategory.image_url || ''}
                          onChange={(e) => {
                            if (editingCategory) {
                              setEditingCategory({ ...editingCategory, image_url: e.target.value });
                            } else {
                              setNewCategory({ ...newCategory, image_url: e.target.value });
                            }
                          }}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          editingCategory ? 'Update' : 'Add'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.length === 0 ? (
                    <p className="text-center text-muted-foreground">No categories found</p>
                  ) : (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left font-medium">Name</th>
                            <th className="p-3 text-left font-medium">Description</th>
                            <th className="p-3 text-right font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category) => (
                            <tr key={category.id} className="border-b">
                              <td className="p-3">{category.name}</td>
                              <td className="p-3">{category.description || 'No description'}</td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingCategory(category);
                                      setIsCategoryDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteCategory(category.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Menu Items Tab */}
          <TabsContent value="items">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Menu Items</CardTitle>
                <Dialog open={isMenuItemDialogOpen} onOpenChange={setIsMenuItemDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setEditingMenuItem(null);
                        setNewMenuItem({
                          name: '',
                          description: '',
                          price: 0,
                          image_url: '',
                          category_id: categories.length > 0 ? categories[0].id : '',
                          is_available: true,
                          is_featured: false
                        });
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Menu Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-name">Name</Label>
                        <Input
                          id="item-name"
                          value={editingMenuItem ? editingMenuItem.name : newMenuItem.name}
                          onChange={(e) => {
                            if (editingMenuItem) {
                              setEditingMenuItem({ ...editingMenuItem, name: e.target.value });
                            } else {
                              setNewMenuItem({ ...newMenuItem, name: e.target.value });
                            }
                          }}
                          placeholder="Item name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="item-category">Category</Label>
                        <Select
                          value={editingMenuItem ? editingMenuItem.category_id : newMenuItem.category_id}
                          onValueChange={(value) => {
                            if (editingMenuItem) {
                              setEditingMenuItem({ ...editingMenuItem, category_id: value });
                            } else {
                              setNewMenuItem({ ...newMenuItem, category_id: value });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="item-price">Price ($)</Label>
                        <Input
                          id="item-price"
                          type="number"
                          step="0.01"
                          value={editingMenuItem ? editingMenuItem.price : newMenuItem.price}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (editingMenuItem) {
                              setEditingMenuItem({ ...editingMenuItem, price: value });
                            } else {
                              setNewMenuItem({ ...newMenuItem, price: value });
                            }
                          }}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="item-description">Description</Label>
                        <Textarea
                          id="item-description"
                          value={editingMenuItem ? editingMenuItem.description || '' : newMenuItem.description || ''}
                          onChange={(e) => {
                            if (editingMenuItem) {
                              setEditingMenuItem({ ...editingMenuItem, description: e.target.value });
                            } else {
                              setNewMenuItem({ ...newMenuItem, description: e.target.value });
                            }
                          }}
                          placeholder="Item description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="item-image">Image URL</Label>
                        <Input
                          id="item-image"
                          value={editingMenuItem ? editingMenuItem.image_url || '' : newMenuItem.image_url || ''}
                          onChange={(e) => {
                            if (editingMenuItem) {
                              setEditingMenuItem({ ...editingMenuItem, image_url: e.target.value });
                            } else {
                              setNewMenuItem({ ...newMenuItem, image_url: e.target.value });
                            }
                          }}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="flex space-x-8">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="item-available"
                            checked={editingMenuItem ? editingMenuItem.is_available : newMenuItem.is_available}
                            onCheckedChange={(checked) => {
                              if (editingMenuItem) {
                                setEditingMenuItem({ ...editingMenuItem, is_available: checked });
                              } else {
                                setNewMenuItem({ ...newMenuItem, is_available: checked });
                              }
                            }}
                          />
                          <Label htmlFor="item-available">Available</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="item-featured"
                            checked={editingMenuItem ? editingMenuItem.is_featured : newMenuItem.is_featured}
                            onCheckedChange={(checked) => {
                              if (editingMenuItem) {
                                setEditingMenuItem({ ...editingMenuItem, is_featured: checked });
                              } else {
                                setNewMenuItem({ ...newMenuItem, is_featured: checked });
                              }
                            }}
                          />
                          <Label htmlFor="item-featured">Featured</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsMenuItemDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={editingMenuItem ? handleUpdateMenuItem : handleAddMenuItem}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          editingMenuItem ? 'Update' : 'Add'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {menuItems.length === 0 ? (
                    <p className="text-center text-muted-foreground">No menu items found</p>
                  ) : (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left font-medium">Name</th>
                            <th className="p-3 text-left font-medium">Category</th>
                            <th className="p-3 text-right font-medium">Price</th>
                            <th className="p-3 text-center font-medium">Available</th>
                            <th className="p-3 text-center font-medium">Featured</th>
                            <th className="p-3 text-right font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {menuItems.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="p-3">{item.name}</td>
                              <td className="p-3">{getCategoryName(item.category_id)}</td>
                              <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                              <td className="p-3 text-center">
                                {item.is_available ? (
                                  <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                    No
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {item.is_featured ? (
                                  <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                                    No
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingMenuItem(item);
                                      setIsMenuItemDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteMenuItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default MenuManagement;
