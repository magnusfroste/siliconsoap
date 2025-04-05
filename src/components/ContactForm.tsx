
import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sendContactMessage } from '@/lib/airtable';
import { useNavigate } from 'react-router-dom';

const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Check if we have Airtable configuration
  const hasAirtableConfig = Boolean(
    localStorage.getItem('VITE_AIRTABLE_API_KEY') && 
    localStorage.getItem('VITE_AIRTABLE_BASE_ID')
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!hasAirtableConfig) {
        // If no Airtable config, simulate form submission
        setTimeout(() => {
          toast.success("Demo mode: Message would be sent to Airtable", {
            description: "Configure Airtable to store real messages",
          });
          
          setName('');
          setEmail('');
          setMessage('');
          setIsSubmitting(false);
        }, 1500);
        return;
      }
      
      // Send message to Airtable
      await sendContactMessage({
        name,
        email,
        message
      });
      
      toast.success("Message sent successfully!", {
        description: "Thanks for reaching out. I'll get back to you soon.",
      });
      
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message", {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="section-title">Let's Connect</h2>
        
        <p className="text-center text-gray-600 text-lg mb-10">
          Ready to explore how we can drive innovation and growth together? Let's start a conversation.
        </p>
        
        {!hasAirtableConfig && (
          <div className="glass-card p-4 mb-8 text-center">
            <p className="text-amber-500">Running in demo mode. Messages will not be stored.</p>
            <Button
              onClick={() => navigate('/airtable-config')}
              className="mt-4 apple-button"
            >
              Set Up Airtable Connection
            </Button>
          </div>
        )}
        
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Your Name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Your Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Your Email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Your Message
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field min-h-[150px]"
                placeholder="Your Message"
                required
              />
            </div>
            
            <div className="text-center">
              <Button 
                type="submit" 
                className="apple-button w-full sm:w-auto flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
