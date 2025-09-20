'use client';

import React, { useState, useMemo } from 'react';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  features: string[];
  isActive: boolean;
  stripePriceId: string;
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  canceledAt?: string;
}

interface SubscriptionManagementProps {
  // Plans available for subscription
  availablePlans: SubscriptionPlan[];
  // Current user's subscriptions
  currentSubscriptions: Subscription[];
  // Actions
  onSubscribe: (planId: string) => Promise<void>;
  onCancelSubscription: (subscriptionId: string) => Promise<void>;
  onReactivateSubscription: (subscriptionId: string) => Promise<void>;
  onUpdatePaymentMethod: () => Promise<void>;
  // Loading states
  isLoading?: boolean;
  loadingPlanId?: string;
  // User type
  viewType?: 'customer' | 'creator';
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  availablePlans,
  currentSubscriptions,
  onSubscribe,
  onCancelSubscription,
  onReactivateSubscription,
  onUpdatePaymentMethod,
  isLoading = false,
  loadingPlanId,
  viewType = 'customer'
}) => {
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);

  // Get subscription status for a plan
  const getSubscriptionForPlan = (planId: string) => {
    return currentSubscriptions.find(sub => sub.planId === planId);
  };

  // Format price
  const formatPrice = (priceInCents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(priceInCents / 100);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status: Subscription['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      canceled: 'bg-red-100 text-red-800',
      incomplete: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      active: 'Active',
      past_due: 'Past Due',
      canceled: 'Canceled',
      incomplete: 'Incomplete'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Active subscriptions
  const activeSubscriptions = useMemo(() => {
    return currentSubscriptions.filter(sub => sub.status === 'active' || sub.status === 'past_due');
  }, [currentSubscriptions]);

  // Canceled subscriptions
  const canceledSubscriptions = useMemo(() => {
    return currentSubscriptions.filter(sub => sub.status === 'canceled');
  }, [currentSubscriptions]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {viewType === 'creator' ? 'Manage Your Subscription Plans' : 'Manage Your Subscriptions'}
        </h1>
        <p className="text-gray-600">
          {viewType === 'creator'
            ? 'Create and manage subscription plans for your content'
            : 'Subscribe to premium content and manage your subscriptions'}
        </p>
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {viewType === 'creator' ? 'Your Subscription Plans' : 'Available Plans'}
        </h2>

        {availablePlans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {viewType === 'creator' ? 'No subscription plans created yet' : 'No subscription plans available'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePlans.map((plan) => {
              const subscription = getSubscriptionForPlan(plan.id);
              const isSubscribed = !!subscription && subscription.status !== 'canceled';
              const isPlanLoading = loadingPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-6 ${
                    isSubscribed ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
                    <div className="text-3xl font-bold text-gray-800 mt-2">
                      {formatPrice(plan.price, plan.currency)}
                      <span className="text-sm font-normal text-gray-600">/month</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {subscription && (
                    <div className="mb-4 p-3 bg-white rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Status:</span>
                        {getStatusBadge(subscription.status)}
                      </div>
                      {subscription.status === 'active' && (
                        <div className="text-xs text-gray-600">
                          Next billing: {formatDate(subscription.currentPeriodEnd)}
                        </div>
                      )}
                      {subscription.status === 'past_due' && (
                        <div className="text-xs text-red-600">
                          Payment failed. Please update your payment method.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    {!isSubscribed ? (
                      <button
                        onClick={() => onSubscribe(plan.id)}
                        disabled={isPlanLoading || isLoading || !plan.isActive}
                        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                          isPlanLoading || isLoading || !plan.isActive
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isPlanLoading ? 'Processing...' : plan.isActive ? 'Subscribe' : 'Not Available'}
                      </button>
                    ) : (
                      <>
                        {subscription?.status === 'active' && (
                          <button
                            onClick={() => setShowCancelModal(subscription.id)}
                            className="w-full py-2 px-4 rounded-md font-medium text-red-600 border border-red-600 hover:bg-red-50 transition-colors"
                          >
                            Cancel Subscription
                          </button>
                        )}
                        {subscription?.status === 'past_due' && (
                          <button
                            onClick={onUpdatePaymentMethod}
                            className="w-full py-2 px-4 rounded-md font-medium bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
                          >
                            Update Payment Method
                          </button>
                        )}
                        {subscription?.status === 'canceled' && (
                          <button
                            onClick={() => onReactivateSubscription(subscription.id)}
                            disabled={isPlanLoading}
                            className="w-full py-2 px-4 rounded-md font-medium bg-green-600 hover:bg-green-700 text-white transition-colors disabled:bg-gray-400"
                          >
                            {isPlanLoading ? 'Processing...' : 'Reactivate'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Current Subscriptions */}
      {(activeSubscriptions.length > 0 || canceledSubscriptions.length > 0) && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Subscriptions</h2>

          {activeSubscriptions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Active Subscriptions</h3>
              <div className="space-y-4">
                {activeSubscriptions.map((subscription) => {
                  const plan = availablePlans.find(p => p.id === subscription.planId);
                  if (!plan) return null;

                  return (
                    <div key={subscription.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{plan.name}</h4>
                          <p className="text-sm text-gray-600">
                            {formatPrice(plan.price, plan.currency)}/month
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(subscription.status)}
                          <div className="text-sm text-gray-600 mt-1">
                            {subscription.status === 'active'
                              ? `Next billing: ${formatDate(subscription.currentPeriodEnd)}`
                              : 'Payment required'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {canceledSubscriptions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Canceled Subscriptions</h3>
              <div className="space-y-4">
                {canceledSubscriptions.map((subscription) => {
                  const plan = availablePlans.find(p => p.id === subscription.planId);
                  if (!plan) return null;

                  return (
                    <div key={subscription.id} className="border border-gray-200 rounded-lg p-4 opacity-75">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{plan.name}</h4>
                          <p className="text-sm text-gray-600">
                            Canceled on {formatDate(subscription.canceledAt!)}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(subscription.status)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cancel Subscription</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this subscription? You&apos;ll lose access to premium features at the end of your current billing period.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={async () => {
                  await onCancelSubscription(showCancelModal);
                  setShowCancelModal(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;