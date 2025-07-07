import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Check, Wallet } from 'lucide-react';

interface AuthSectionProps {
  waitlistCount: number;
  setWaitlistCount: (count: number) => void;
  supabase: any;
}

const AuthSection = ({ waitlistCount, setWaitlistCount, supabase }: AuthSectionProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // If Supabase is configured, use it to store the email
      if (supabase) {
        const { error } = await supabase
          .from('waitlist')
          .insert([{ email }]);
          
        if (error) throw error;
      }
      
      // Simulate successful submission
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setWaitlistCount(waitlistCount + 1);
      }, 1500);
    } catch (err) {
      console.error('Error submitting to waitlist:', err);
      setIsSubmitting(false);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <section id="auth" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Join the Waitlist</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-lg">
              Be among the first to deploy NEAR agents at your school. Early access members get bonus USDFC and exclusive NEAR agent templates.
            </p>
            
            <div className="mt-8">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Email Signup</h3>
                  <p className="mt-1 text-sm text-gray-500">Get notified when NEAR AgentSphere launches</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600">
                  <Lock className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">NEAR Protocol Security</h3>
                  <p className="mt-1 text-sm text-gray-500">Early access to NEAR-powered features</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
                <span className="text-sm font-medium">
                  {waitlistCount.toLocaleString()} students already signed up
                </span>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="aura-coin inline-block">
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                  N
                </div>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">Earn 500 USDFC</h3>
              <p className="mt-2 text-gray-600">
                Join now and receive 500 USDFC when we launch - enough to deploy your first 5 NEAR agents!
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-12 lg:mt-0 lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
              <div className="px-6 py-8 sm:p-10 sm:pb-6">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-2xl leading-8 font-extrabold text-white sm:text-3xl">
                    NEAR Early Access
                  </h3>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white bg-opacity-20 text-white">
                    Limited Spots
                  </span>
                </div>
                <div className="mt-4 flex items-baseline text-white">
                  <span className="text-5xl font-extrabold tracking-tight">Free</span>
                  <span className="ml-1 text-xl font-semibold">for beta testers</span>
                </div>
                <p className="mt-5 text-lg text-white text-opacity-90">
                  Get exclusive early access to NEAR AgentSphere and help shape the future of NeAR agents.
                </p>
              </div>
              
              <div className="px-6 pt-6 pb-8 bg-white bg-opacity-10 sm:p-10">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="waitlist-email" className="block text-sm font-medium text-white">
                        Email address
                      </label>
                      <input
                        type="email"
                        id="waitlist-email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@school.edu"
                        className="mt-1 block w-full border-0 rounded-lg py-3 px-4 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                        aria-describedby={error ? "email-error" : undefined}
                      />
                      {error && (
                        <p id="email-error" className="mt-2 text-sm text-pink-300" role="alert">
                          {error}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="notify-checkbox"
                        name="notify"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        defaultChecked
                        aria-describedby="notify-description"
                      />
                      <label htmlFor="notify-checkbox" className="ml-2 block text-sm text-white">
                        Notify me when available
                      </label>
                      <span id="notify-description" className="sr-only">
                        Check this box to receive notifications when AgentSphere becomes available
                      </span>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-describedby="submit-status"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Join Waitlist <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                      )}
                    </button>
                    <span id="submit-status" className="sr-only">
                      {isSubmitting ? "Processing your request" : "Ready to submit"}
                    </span>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="mt-4 text-xl font-medium text-white">You're on the list!</h3>
                    <p className="mt-2 text-white text-opacity-80">
                      We'll notify you when NEAR AgentSphere is ready for your school.
                    </p>
                    <p className="mt-4 text-white text-opacity-90 font-medium">
                      500 USDFC have been reserved for your NEAR account!
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900">Connect Your Wallet</h3>
              <p className="mt-2 text-gray-600">
                Store your USDFC securely and trade with other NEAR users.
              </p>
              <div className="mt-4">
                <button 
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                  aria-describedby="wallet-status"
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Connect NEAR Wallet (Coming Soon)
                </button>
                <p id="wallet-status" className="mt-2 text-sm text-gray-500 text-center">
                  NEAR wallet integration will be available at launch
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuthSection;