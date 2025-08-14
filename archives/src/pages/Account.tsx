import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, Heart, Settings, LogOut, ShoppingBag, Clock, MapPin, CreditCard } from "lucide-react";

const Account = () => {
  const [activeTab, setActiveTab] = useState("profile");

  // Mock user data
  const user = {
    name: "Sarah Mitchell",
    email: "sarah.mitchell@email.com",
    phone: "+1 (555) 123-4567",
    memberSince: "January 2023",
    tier: "Gold Member",
    points: 2850,
    address: "123 Wellness Lane, Cape Town, 8001"
  };

  const orders = [
    {
      id: "BB-2024-001",
      date: "March 15, 2024",
      status: "Delivered",
      total: "R 2,450",
      items: 3
    },
    {
      id: "BB-2024-002",
      date: "March 10, 2024",
      status: "In Transit",
      total: "R 1,890",
      items: 2
    },
    {
      id: "BB-2024-003",
      date: "February 28, 2024",
      status: "Delivered",
      total: "R 3,200",
      items: 5
    }
  ];

  const wishlistItems = [
    {
      name: "Immune Boost Pro",
      price: "R 799",
      image: "/placeholder-product.jpg"
    },
    {
      name: "Energy Complex",
      price: "R 649",
      image: "/placeholder-product.jpg"
    },
    {
      name: "Sleep Support",
      price: "R 549",
      image: "/placeholder-product.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-wellness">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
              MY ACCOUNT
            </h1>
            <p className="text-lg font-body text-muted-foreground">
              Welcome back, {user.name}
            </p>
            <div className="mt-6 inline-flex items-center gap-4 bg-muted/80 rounded-lg px-6 py-3">
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-primary">{user.tier}</div>
                <div className="text-xs font-body text-muted-foreground">Member Status</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-secondary">{user.points}</div>
                <div className="text-xs font-body text-muted-foreground">Reward Points</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-muted/50">
              <TabsTrigger value="profile" className="font-heading uppercase text-xs">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="font-heading uppercase text-xs">
                <Package className="w-4 h-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="font-heading uppercase text-xs">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </TabsTrigger>
              <TabsTrigger value="settings" className="font-heading uppercase text-xs">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="max-w-4xl mx-auto border-primary/20">
                <CardHeader>
                  <h2 className="text-2xl font-heading font-bold text-primary">PERSONAL INFORMATION</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-heading uppercase text-xs">Full Name</Label>
                      <Input defaultValue={user.name} className="font-body" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-heading uppercase text-xs">Email Address</Label>
                      <Input defaultValue={user.email} className="font-body" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-heading uppercase text-xs">Phone Number</Label>
                      <Input defaultValue={user.phone} className="font-body" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-heading uppercase text-xs">Member Since</Label>
                      <Input value={user.memberSince} disabled className="font-body bg-muted" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-heading uppercase text-xs">Delivery Address</Label>
                    <Input defaultValue={user.address} className="font-body" />
                  </div>

                  <div className="flex gap-4">
                    <Button className="bg-primary hover:bg-primary/90 font-heading uppercase">
                      Save Changes
                    </Button>
                    <Button variant="outline" className="border-primary text-primary font-heading uppercase">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <div className="max-w-4xl mx-auto space-y-4">
                <h2 className="text-2xl font-heading font-bold text-primary mb-6">ORDER HISTORY</h2>
                {orders.map((order) => (
                  <Card key={order.id} className="border-primary/20 hover:shadow-wellness transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-primary" />
                            <span className="font-heading font-bold text-primary">{order.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="font-body">{order.date}</span>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <div className="font-heading font-bold text-xl text-primary">{order.total}</div>
                          <div className="text-sm font-body text-muted-foreground">{order.items} items</div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-heading uppercase ${
                            order.status === 'Delivered' 
                              ? 'bg-secondary/20 text-secondary' 
                              : 'bg-accent/20 text-accent'
                          }`}>
                            {order.status}
                          </span>
                          <Button variant="outline" size="sm" className="font-heading uppercase">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="space-y-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-heading font-bold text-primary mb-6">MY WISHLIST</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {wishlistItems.map((item, index) => (
                    <Card key={index} className="border-primary/20 hover:shadow-wellness transition-all group">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                          <div className="w-20 h-20 bg-primary/10 rounded-full" />
                        </div>
                        <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xl font-heading font-bold text-primary">{item.price}</span>
                          <Button size="sm" className="bg-primary hover:bg-primary/90 font-heading uppercase">
                            <ShoppingBag className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="border-primary/20">
                  <CardHeader>
                    <h2 className="text-2xl font-heading font-bold text-primary">ACCOUNT SETTINGS</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h3 className="font-heading font-bold text-foreground">Email Notifications</h3>
                          <p className="text-sm font-body text-muted-foreground">
                            Receive updates about orders and promotions
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="font-heading uppercase">
                          Manage
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h3 className="font-heading font-bold text-foreground">Payment Methods</h3>
                          <p className="text-sm font-body text-muted-foreground">
                            Manage your saved payment methods
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="font-heading uppercase">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h3 className="font-heading font-bold text-foreground">Delivery Addresses</h3>
                          <p className="text-sm font-body text-muted-foreground">
                            Manage your delivery addresses
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="font-heading uppercase">
                          <MapPin className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-border">
                      <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-white font-heading uppercase">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Account;
