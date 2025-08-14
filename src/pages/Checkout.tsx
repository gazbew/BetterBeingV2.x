import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  ShoppingBag, CreditCard, Truck, CheckCircle,
  Lock, ArrowLeft, ArrowRight, AlertCircle,
  Gift, Tag, Shield, Clock, MapPin, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import ErrorBoundary from "./node_modules/@kombai/react-error-boundary";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_');

interface CheckoutStep {
  id: number;
  name: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: React.ReactNode;
}

// Step 1: Shipping Information Component
const ShippingStep: React.FC<{
  shippingData: ShippingAddress;
  onUpdate: (data: ShippingAddress) => void;
  onNext: () => void;
}> = ({ shippingData, onUpdate, onNext }) => {
  const { user } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveAddress, setSaveAddress] = useState(true);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!shippingData.firstName) newErrors.firstName = 'First name is required';
    if (!shippingData.lastName) newErrors.lastName = 'Last name is required';
    if (!shippingData.email) newErrors.email = 'Email is required';
    if (!shippingData.phone) newErrors.phone = 'Phone number is required';
    if (!shippingData.address) newErrors.address = 'Address is required';
    if (!shippingData.city) newErrors.city = 'City is required';
    if (!shippingData.province) newErrors.province = 'Province is required';
    if (!shippingData.postalCode) newErrors.postalCode = 'Postal code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Shipping Information</h2>
        <p className="text-muted-foreground mb-6">
          Enter your shipping address where you'd like your order delivered.
        </p>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={shippingData.firstName}
                onChange={(e) => onUpdate({ ...shippingData, firstName: e.target.value })}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={shippingData.lastName}
                onChange={(e) => onUpdate({ ...shippingData, lastName: e.target.value })}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={shippingData.email}
                onChange={(e) => onUpdate({ ...shippingData, email: e.target.value })}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={shippingData.phone}
                onChange={(e) => onUpdate({ ...shippingData, phone: e.target.value })}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={shippingData.address}
              onChange={(e) => onUpdate({ ...shippingData, address: e.target.value })}
              placeholder="123 Main Street"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">{errors.address}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="address2">Apartment, Suite, etc. (Optional)</Label>
            <Input
              id="address2"
              value={shippingData.address2}
              onChange={(e) => onUpdate({ ...shippingData, address2: e.target.value })}
              placeholder="Apt 4B"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={shippingData.city}
                onChange={(e) => onUpdate({ ...shippingData, city: e.target.value })}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-500 mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <Label htmlFor="province">Province *</Label>
              <Input
                id="province"
                value={shippingData.province}
                onChange={(e) => onUpdate({ ...shippingData, province: e.target.value })}
                className={errors.province ? 'border-red-500' : ''}
              />
              {errors.province && (
                <p className="text-sm text-red-500 mt-1">{errors.province}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                value={shippingData.postalCode}
                onChange={(e) => onUpdate({ ...shippingData, postalCode: e.target.value })}
                className={errors.postalCode ? 'border-red-500' : ''}
              />
              {errors.postalCode && (
                <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>
              )}
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={shippingData.country}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox 
                id="saveAddress"
                checked={saveAddress}
                onCheckedChange={(checked) => setSaveAddress(checked as boolean)}
              />
              <Label htmlFor="saveAddress" className="text-sm font-normal">
                Save this address for future orders
              </Label>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>
        <Button type="submit">
          Continue to Shipping
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
};

// Step 2: Shipping Method Component
const ShippingMethodStep: React.FC<{
  selectedMethod: string;
  onSelect: (method: string) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ selectedMethod, onSelect, onNext, onBack }) => {
  const shippingMethods: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Delivered in 5-7 business days',
      price: 50,
      estimatedDays: '5-7 days',
      icon: <Truck className="w-5 h-5" />
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Delivered in 2-3 business days',
      price: 150,
      estimatedDays: '2-3 days',
      icon: <Clock className="w-5 h-5" />
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Delivered next business day',
      price: 300,
      estimatedDays: '1 day',
      icon: <Clock className="w-5 h-5 text-red-500" />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Shipping Method</h2>
        <p className="text-muted-foreground mb-6">
          Choose your preferred shipping method for this order.
        </p>
      </div>

      <RadioGroup value={selectedMethod} onValueChange={onSelect}>
        {shippingMethods.map((method) => (
          <Card 
            key={method.id}
            className={cn(
              "cursor-pointer transition-all",
              selectedMethod === method.id && "border-primary ring-2 ring-primary ring-opacity-20"
            )}
            onClick={() => onSelect(method.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={method.id} id={method.id} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {method.icon}
                      <Label htmlFor={method.id} className="font-semibold cursor-pointer">
                        {method.name}
                      </Label>
                    </div>
                    <span className="font-bold text-lg">R{method.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                  <Badge variant="secondary" className="mt-2">
                    Estimated delivery: {method.estimatedDays}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>

      <Alert>
        <Truck className="h-4 w-4" />
        <AlertDescription>
          Free shipping available on orders over R500. Your order qualifies!
        </AlertDescription>
      </Alert>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!selectedMethod}>
          Continue to Payment
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Step 3: Payment Component
const PaymentStep: React.FC<{
  onNext: () => void;
  onBack: () => void;
  clientSecret: string;
}> = ({ onNext, onBack, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [billingAddressSame, setBillingAddressSame] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    setPaymentError(null);

    // Development mode bypass for testing
    if (import.meta.env.DEV || !clientSecret) {
      console.log('Development mode: Simulating successful payment');
      setTimeout(() => {
        setIsProcessing(false);
        onNext();
      }, 2000); // Simulate processing time
      return;
    }

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      setPaymentError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onNext();
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Payment Information</h2>
        <p className="text-muted-foreground mb-6">
          Enter your payment details to complete your order.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Credit or Debit Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Card Numbers for Development */}
          <Alert className="bg-blue-50 border-blue-200">
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold text-blue-900">Test Card Numbers (Development Only):</div>
                <div className="text-sm text-blue-800 space-y-1">
                  <div><strong>Visa:</strong> 4242 4242 4242 4242</div>
                  <div><strong>Mastercard:</strong> 5555 5555 5555 4444</div>
                  <div><strong>American Express:</strong> 3782 822463 10005</div>
                  <div><strong>CVV:</strong> Any 3-4 digits | <strong>Expiry:</strong> Any future date</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="p-3 border rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>

          {paymentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="billingAddressSame"
              checked={billingAddressSame}
              onCheckedChange={(checked) => setBillingAddressSame(checked as boolean)}
            />
            <Label htmlFor="billingAddressSame" className="text-sm font-normal">
              Billing address same as shipping address
            </Label>
          </div>

          {!billingAddressSame && (
            <Alert>
              <AlertDescription>
                Billing address form would appear here
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>PCI Compliant</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="w-4 h-4" />
          <span>Verified Merchant</span>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? (
            <>Processing...</>
          ) : (
            <>
              Complete Order
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Step 4: Order Review Component
const OrderReviewStep: React.FC<{
  shippingData: ShippingAddress;
  shippingMethod: string;
  onConfirm: () => void;
  onBack: () => void;
}> = ({ shippingData, shippingMethod, onConfirm, onBack }) => {
  const { cart } = useCart();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Review Your Order</h2>
        <p className="text-muted-foreground mb-6">
          Please review your order details before completing your purchase.
        </p>
      </div>

      {/* Shipping Address Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{shippingData.firstName} {shippingData.lastName}</p>
          <p className="text-sm text-muted-foreground">
            {shippingData.address}<br />
            {shippingData.address2 && <>{shippingData.address2}<br /></>}
            {shippingData.city}, {shippingData.province} {shippingData.postalCode}<br />
            {shippingData.country}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {shippingData.email} • {shippingData.phone}
          </p>
        </CardContent>
      </Card>

      {/* Order Items Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart?.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center gap-3">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-semibold">R{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onConfirm}>
          Place Order
          <CheckCircle className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Main Checkout Component
const CheckoutContent: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [clientSecret, setClientSecret] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  
  const [shippingData, setShippingData] = useState<ShippingAddress>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    address2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa',
  });
  
  const [shippingMethod, setShippingMethod] = useState('standard');

  const steps: CheckoutStep[] = [
    { id: 1, name: 'Shipping', icon: <Truck className="w-4 h-4" />, completed: currentStep > 1 },
    { id: 2, name: 'Delivery', icon: <Clock className="w-4 h-4" />, completed: currentStep > 2 },
    { id: 3, name: 'Payment', icon: <CreditCard className="w-4 h-4" />, completed: currentStep > 3 },
    { id: 4, name: 'Review', icon: <CheckCircle className="w-4 h-4" />, completed: currentStep > 4 },
  ];

  // Calculate totals
  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shippingCost = shippingMethod === 'standard' ? 50 : shippingMethod === 'express' ? 150 : 300;
  const finalShipping = subtotal > 500 ? 0 : shippingCost;
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + finalShipping + tax - discount;

  // Create payment intent
  useEffect(() => {
    if (currentStep === 3) {
      fetch(`${import.meta.env.VITE_API_URL}/checkout/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100) }), // Convert to cents
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [currentStep, total]);

  const handleApplyPromo = () => {
    // Validate promo code
    if (promoCode.toUpperCase() === 'WELLNESS10') {
      setDiscount(subtotal * 0.1);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        items: cart?.items,
        shipping: shippingData,
        shippingMethod,
        subtotal,
        shippingCost: finalShipping,
        tax,
        discount,
        total,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (error) {
      console.error('Order placement failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  step.completed ? "bg-primary text-white" :
                  currentStep === step.id ? "bg-primary text-white" :
                  "bg-gray-200 text-gray-400"
                )}>
                  {step.completed ? <CheckCircle className="w-5 h-5" /> : step.icon}
                </div>
                <div className="ml-2">
                  <p className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-20 h-1 mx-4",
                    step.completed ? "bg-primary" : "bg-gray-200"
                  )} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {currentStep === 1 && (
                  <ShippingStep
                    shippingData={shippingData}
                    onUpdate={setShippingData}
                    onNext={() => setCurrentStep(2)}
                  />
                )}
                {currentStep === 2 && (
                  <ShippingMethodStep
                    selectedMethod={shippingMethod}
                    onSelect={setShippingMethod}
                    onNext={() => setCurrentStep(3)}
                    onBack={() => setCurrentStep(1)}
                  />
                )}
                {currentStep === 3 && (
                  <PaymentStep
                    onNext={() => setCurrentStep(4)}
                    onBack={() => setCurrentStep(2)}
                    clientSecret={clientSecret}
                  />
                )}
                {currentStep === 4 && (
                  <OrderReviewStep
                    shippingData={shippingData}
                    shippingMethod={shippingMethod}
                    onConfirm={handlePlaceOrder}
                    onBack={() => setCurrentStep(3)}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate flex-1">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-medium">R{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Promo Code */}
                <div className="space-y-2">
                  <Label htmlFor="promoCode">Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promoCode"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleApplyPromo}
                    >
                      Apply
                    </Button>
                  </div>
                  {discount > 0 && (
                    <p className="text-sm text-green-600">
                      Promo applied! You saved R{discount.toFixed(2)}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {finalShipping === 0 ? (
                        <Badge variant="secondary" className="text-xs">FREE</Badge>
                      ) : (
                        `R${finalShipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (VAT 15%)</span>
                    <span>R{tax.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-R{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Gift className="w-4 h-4" />
                    <span>Free returns within 30 days</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Tag className="w-4 h-4" />
                    <span>Lowest price guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap with Stripe Elements
const Checkout: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  );
};

export default Checkout;
