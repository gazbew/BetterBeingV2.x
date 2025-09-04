#!/usr/bin/env node

/**
 * Better Being Subscription API Demo and Test Script
 * Demonstrates the premium subscription management system functionality
 */

import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:3001';
const JWT_SECRET = 'better-being-wellness-secret-key-2024';

// Test user data
const testUsers = {
  freeUser: {
    id: 'test_user_free',
    email: 'free@betterbeing.com',
    name: 'Free User',
    subscriptionTier: 'free'
  },
  premiumUser: {
    id: 'test_user_premium',
    email: 'premium@betterbeing.com', 
    name: 'Premium User',
    subscriptionTier: 'premium'
  },
  proUser: {
    id: 'test_user_pro',
    email: 'pro@betterbeing.com',
    name: 'Pro User', 
    subscriptionTier: 'pro'
  }
};

// Generate JWT tokens for test users
function generateToken(userData) {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });
}

// Make API request with proper error handling
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
      success: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      success: false
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing API Health...');
  const result = await apiRequest('/health');
  
  if (result.success) {
    console.log('✅ API is healthy');
    console.log(`   Version: ${result.data.version}`);
    console.log(`   Service: ${result.data.service}`);
  } else {
    console.log('❌ API health check failed');
  }
  
  return result.success;
}

async function testSubscriptionPlans() {
  console.log('\n📋 Testing Subscription Plans...');
  const result = await apiRequest('/api/subscriptions/plans');
  
  if (result.success) {
    console.log('✅ Successfully retrieved subscription plans');
    console.log(`   Available plans: ${result.data.data.plans.length}`);
    
    result.data.data.plans.forEach(plan => {
      console.log(`   - ${plan.name}: $${plan.price}/month`);
      console.log(`     Features: ${plan.features.length} items`);
    });
  } else {
    console.log('❌ Failed to retrieve subscription plans');
    console.log(`   Error: ${result.data?.error || result.error}`);
  }
  
  return result.success;
}

async function testCurrentSubscription(user) {
  console.log(`\n👤 Testing Current Subscription for ${user.name}...`);
  const token = generateToken(user);
  
  const result = await apiRequest('/api/subscriptions/current', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (result.success) {
    const subscription = result.data.data.subscription;
    console.log('✅ Successfully retrieved current subscription');
    console.log(`   Tier: ${subscription.tier.name} ($${subscription.tier.price})`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Is Active: ${subscription.isActive}`);
    console.log(`   Is Premium: ${subscription.isPremium}`);
    
    if (subscription.usage) {
      console.log('   Usage Statistics:');
      Object.entries(subscription.usage).forEach(([key, usage]) => {
        if (typeof usage === 'object' && usage.limit) {
          console.log(`     ${key}: ${usage.used}/${usage.limit === 'unlimited' ? '∞' : usage.limit}`);
        }
      });
    }
  } else {
    console.log('❌ Failed to retrieve current subscription');
    console.log(`   Error: ${result.data?.error || result.error}`);
  }
  
  return result.success;
}

async function testSubscriptionCreation(user) {
  console.log(`\n💳 Testing Subscription Creation for ${user.name}...`);
  const token = generateToken(user);
  
  // Test creating a premium subscription with trial
  const subscriptionData = {
    tierId: 'premium',
    billingCycle: 'monthly',
    paymentMethodId: 'pm_test_mock_card',
    trialPeriod: true
  };
  
  const result = await apiRequest('/api/subscriptions/subscribe', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(subscriptionData)
  });
  
  if (result.success) {
    console.log('✅ Successfully created subscription');
    console.log(`   Subscription ID: ${result.data.data.subscription.subscriptionId}`);
    console.log(`   Tier: ${result.data.data.tier.name}`);
    console.log(`   Trial: ${result.data.data.trial ? 'Yes, ' + result.data.data.trial.daysRemaining + ' days' : 'No'}`);
  } else {
    console.log('❌ Failed to create subscription');
    console.log(`   Error: ${result.data?.error || result.error}`);
    if (result.data?.message) {
      console.log(`   Message: ${result.data.message}`);
    }
  }
  
  return result.success;
}

async function testSubscriptionUpgrade(user) {
  console.log(`\n⬆️ Testing Subscription Upgrade for ${user.name}...`);
  const token = generateToken(user);
  
  const upgradeData = {
    tierId: 'pro',
    billingCycle: 'monthly'
  };
  
  const result = await apiRequest('/api/subscriptions/upgrade', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(upgradeData)
  });
  
  if (result.success) {
    console.log('✅ Successfully upgraded subscription');
    console.log(`   From: ${result.data.data.upgrade.from}`);
    console.log(`   To: ${result.data.data.upgrade.to}`);
    console.log(`   Proration: $${result.data.data.upgrade.prorationAmount}`);
    console.log(`   New Features: ${result.data.data.upgrade.newFeatures.length} items`);
  } else {
    console.log('❌ Failed to upgrade subscription');
    console.log(`   Error: ${result.data?.error || result.error}`);
    if (result.data?.message) {
      console.log(`   Message: ${result.data.message}`);
    }
  }
  
  return result.success;
}

async function testPremiumFeatureAccess(user) {
  console.log(`\n🎯 Testing Premium Feature Access for ${user.name}...`);
  const token = generateToken(user);
  
  // Test premium analytics access
  const result = await apiRequest('/api/subscriptions/premium-analytics', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (result.success) {
    console.log('✅ Successfully accessed premium analytics');
    console.log(`   Access Level: ${result.data.data.accessLevel}`);
    console.log(`   Wellness Trends: ${Object.keys(result.data.data.analytics.wellnessTrends).length} metrics`);
    console.log(`   Insights: ${result.data.data.analytics.insights.length} items`);
  } else {
    console.log('❌ Failed to access premium analytics');
    console.log(`   Error: ${result.data?.error || result.error}`);
    console.log(`   Code: ${result.data?.code}`);
    if (result.data?.upgradeUrl) {
      console.log(`   Upgrade URL: ${result.data.upgradeUrl}`);
    }
  }
  
  return result.success;
}

async function testBillingHistory(user) {
  console.log(`\n💰 Testing Billing History for ${user.name}...`);
  const token = generateToken(user);
  
  const result = await apiRequest('/api/subscriptions/billing-history?limit=5', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (result.success) {
    console.log('✅ Successfully retrieved billing history');
    console.log(`   Total Records: ${result.data.data.summary.totalRecords}`);
    console.log(`   Total Amount: $${result.data.data.summary.totalAmount}`);
    
    if (result.data.data.billingHistory.length > 0) {
      console.log('   Recent Transactions:');
      result.data.data.billingHistory.slice(0, 3).forEach(record => {
        console.log(`     - $${record.amount} (${record.status}) - ${record.description}`);
      });
    }
  } else {
    console.log('❌ Failed to retrieve billing history');
    console.log(`   Error: ${result.data?.error || result.error}`);
  }
  
  return result.success;
}

async function testUsageLimits(user) {
  console.log(`\n🚦 Testing Usage Limits for ${user.name}...`);
  const token = generateToken(user);
  
  // Make multiple daily recommendation requests to test limits
  let successCount = 0;
  let limitHit = false;
  
  for (let i = 1; i <= 5; i++) {
    const result = await apiRequest('/api/recommendations/daily?mood=3&energy=2', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (result.success) {
      successCount++;
      console.log(`   ✅ Request ${i}: Success`);
      
      if (result.data.usageRemaining !== undefined) {
        console.log(`      Usage remaining: ${result.data.usageRemaining}`);
      }
    } else {
      if (result.data?.code === 'USAGE_LIMIT_EXCEEDED') {
        limitHit = true;
        console.log(`   🚫 Request ${i}: Usage limit exceeded`);
        console.log(`      Limit: ${result.data.limit.used}/${result.data.limit.limit}`);
        break;
      } else {
        console.log(`   ❌ Request ${i}: ${result.data?.error || result.error}`);
      }
    }
  }
  
  console.log(`   Summary: ${successCount} successful requests`);
  if (limitHit) {
    console.log(`   Usage limit enforced correctly for ${user.subscriptionTier} tier`);
  }
  
  return true;
}

async function testPaymentMethodUpdate(user) {
  console.log(`\n💳 Testing Payment Method Update for ${user.name}...`);
  const token = generateToken(user);
  
  const paymentMethodData = {
    paymentMethodId: 'pm_test_new_card_789',
    setAsDefault: true
  };
  
  const result = await apiRequest('/api/subscriptions/payment-method', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(paymentMethodData)
  });
  
  if (result.success) {
    console.log('✅ Successfully updated payment method');
    console.log(`   Card: **** ${result.data.data.paymentMethod.last4}`);
    console.log(`   Brand: ${result.data.data.paymentMethod.brand}`);
    console.log(`   Next billing: $${result.data.data.subscription.nextBillingAmount}`);
  } else {
    console.log('❌ Failed to update payment method');
    console.log(`   Error: ${result.data?.error || result.error}`);
  }
  
  return result.success;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Better Being Subscription API Demo');
  console.log('=====================================');
  
  const startTime = Date.now();
  
  try {
    // Basic API health check
    const healthOk = await testHealthCheck();
    if (!healthOk) {
      console.log('\n❌ API is not available. Please start the server first.');
      process.exit(1);
    }
    
    // Test public endpoints
    await testSubscriptionPlans();
    
    // Test free user workflows
    console.log('\n🆓 Free User Test Scenarios');
    console.log('============================');
    await testCurrentSubscription(testUsers.freeUser);
    await testUsageLimits(testUsers.freeUser);
    await testPremiumFeatureAccess(testUsers.freeUser);
    
    // Test subscription creation
    await testSubscriptionCreation(testUsers.freeUser);
    
    // Test premium user workflows
    console.log('\n💎 Premium User Test Scenarios');
    console.log('===============================');
    await testCurrentSubscription(testUsers.premiumUser);
    await testPremiumFeatureAccess(testUsers.premiumUser);
    await testUsageLimits(testUsers.premiumUser);
    await testBillingHistory(testUsers.premiumUser);
    await testPaymentMethodUpdate(testUsers.premiumUser);
    
    // Test pro user workflows  
    console.log('\n🏆 Pro User Test Scenarios');
    console.log('===========================');
    await testCurrentSubscription(testUsers.proUser);
    await testSubscriptionUpgrade(testUsers.premiumUser); // Upgrade premium to pro
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ All tests completed!');
    console.log(`   Duration: ${duration} seconds`);
    console.log(`   Server: ${BASE_URL}`);
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Better Being Subscription API Test Script

Usage: node test-subscription-api.js [options]

Options:
  --help, -h     Show this help message
  --quick        Run quick tests only
  --user <type>  Test specific user type (free, premium, pro)

Examples:
  node test-subscription-api.js
  node test-subscription-api.js --quick
  node test-subscription-api.js --user premium
  `);
  process.exit(0);
}

// Run specific user tests if requested
if (args.includes('--user')) {
  const userIndex = args.indexOf('--user') + 1;
  const userType = args[userIndex];
  
  if (testUsers[userType + 'User']) {
    console.log(`🎯 Testing ${userType} user scenarios only...`);
    testCurrentSubscription(testUsers[userType + 'User']).then(() => {
      testPremiumFeatureAccess(testUsers[userType + 'User']).then(() => {
        console.log('✅ User-specific tests completed');
      });
    });
  } else {
    console.log('❌ Invalid user type. Use: free, premium, or pro');
    process.exit(1);
  }
} else {
  // Run full test suite
  runAllTests().catch(console.error);
}

export default {
  runAllTests,
  testUsers,
  generateToken,
  apiRequest
};