'use client';

import React, { useState } from 'react';

export interface NewsletterSubscriber {
  email: string;
  name?: string;
  source: 'website' | 'social' | 'referral' | 'import';
  tags?: string[];
}

interface NewsletterSignupProps {
  onSubscribe: (subscriber: NewsletterSubscriber) => Promise<void>;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  showNameField?: boolean;
  variant?: 'inline' | 'modal' | 'sidebar' | 'popup';
  source?: NewsletterSubscriber['source'];
  tags?: string[];
  isLoading?: boolean;
  className?: string;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  onSubscribe,
  title = "Stay in the loop",
  description = "Get the latest articles and insights delivered to your inbox.",
  placeholder = "Enter your email address",
  buttonText = "Subscribe",
  showNameField = false,
  variant = 'inline',
  source = 'website',
  tags = [],
  isLoading = false,
  className = ""
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      setErrorMessage('Email is required');
      setStatus('error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    try {
      setStatus('idle');
      setErrorMessage('');

      const subscriberData: NewsletterSubscriber = {
        email: formData.email,
        source,
        tags
      };

      if (showNameField && formData.name) {
        subscriberData.name = formData.name;
      }

      await onSubscribe(subscriberData);
      setStatus('success');
      setFormData({ email: '', name: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Clear error when user starts typing
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'modal':
        return {
          container: 'bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl',
          title: 'text-2xl font-bold text-center mb-4',
          description: 'text-gray-600 text-center mb-6',
          form: 'space-y-4'
        };
      case 'sidebar':
        return {
          container: 'bg-gray-50 rounded-lg p-4 border border-gray-200',
          title: 'text-lg font-semibold mb-2',
          description: 'text-sm text-gray-600 mb-4',
          form: 'space-y-3'
        };
      case 'popup':
        return {
          container: 'bg-blue-600 text-white rounded-lg p-4 shadow-lg',
          title: 'text-lg font-semibold mb-2',
          description: 'text-blue-100 mb-4 text-sm',
          form: 'space-y-3'
        };
      default: // inline
        return {
          container: 'bg-white rounded-lg border border-gray-200 p-6',
          title: 'text-xl font-semibold mb-2',
          description: 'text-gray-600 mb-4',
          form: 'space-y-4'
        };
    }
  };

  const styles = getVariantStyles();

  if (status === 'success') {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className={`${variant === 'popup' ? 'text-white' : 'text-gray-800'} font-semibold mb-2`}>
            Success! You&apos;re subscribed
          </h3>
          <p className={`text-sm ${variant === 'popup' ? 'text-blue-100' : 'text-gray-600'}`}>
            Check your email for a confirmation link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <h3 className={`${styles.title} ${variant === 'popup' ? 'text-white' : 'text-gray-800'}`}>
        {title}
      </h3>
      <p className={styles.description}>
        {description}
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {showNameField && (
          <div>
            <input
              type="text"
              name="name"
              placeholder="Your name (optional)"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                variant === 'popup' ? 'bg-white text-gray-800' : ''
              }`}
            />
          </div>
        )}

        <div className={variant === 'inline' ? 'flex gap-2' : ''}>
          <input
            type="email"
            name="email"
            placeholder={placeholder}
            value={formData.email}
            onChange={handleChange}
            required
            className={`${
              variant === 'inline' ? 'flex-1' : 'w-full'
            } px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              status === 'error' ? 'border-red-500' : ''
            } ${variant === 'popup' ? 'bg-white text-gray-800' : ''}`}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`${
              variant === 'inline' ? 'px-6' : 'w-full px-4'
            } py-2 rounded-md font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : variant === 'popup'
                ? 'bg-white text-blue-600 hover:bg-gray-100'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {isLoading ? 'Subscribing...' : buttonText}
          </button>
        </div>

        {status === 'error' && errorMessage && (
          <div className="text-sm text-red-600 mt-2">
            {errorMessage}
          </div>
        )}
      </form>

      {variant !== 'popup' && (
        <div className="mt-4 text-xs text-gray-500">
          By subscribing, you agree to receive emails from us. You can unsubscribe at any time.
        </div>
      )}
    </div>
  );
};

// Predefined newsletter signup variants for common use cases
export const InlineNewsletterSignup: React.FC<Omit<NewsletterSignupProps, 'variant'>> = (props) => (
  <NewsletterSignup {...props} variant="inline" />
);

export const SidebarNewsletterSignup: React.FC<Omit<NewsletterSignupProps, 'variant'>> = (props) => (
  <NewsletterSignup {...props} variant="sidebar" />
);

export const ModalNewsletterSignup: React.FC<Omit<NewsletterSignupProps, 'variant'>> = (props) => (
  <NewsletterSignup {...props} variant="modal" />
);

export const PopupNewsletterSignup: React.FC<Omit<NewsletterSignupProps, 'variant'>> = (props) => (
  <NewsletterSignup {...props} variant="popup" />
);

export default NewsletterSignup;