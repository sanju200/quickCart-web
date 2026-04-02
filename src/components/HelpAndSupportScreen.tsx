import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';

const FAQS = [
  {
    id: '1',
    question: 'How can I track my order?',
    answer: 'You can track your order in the "Order History" section. Simply tap on any order to see its current status and estimated delivery time.',
  },
  {
    id: '2',
    question: 'What are the payment options?',
    answer: 'We accept various payment methods including Credit/Debit Cards, UPI, Net Banking, and popular Digital Wallets. Cash on Delivery (COD) is also available for most locations.',
  },
  {
    id: '3',
    question: 'How do I return or replace an item?',
    answer: 'You can initiate a return or replacement within 48 hours of delivery from the "Order History" screen. Ensure the product is in its original condition with tags intact.',
  },
  {
    id: '4',
    question: 'When will I receive my refund?',
    answer: 'Refunds are typically processed within 5-7 business days after the returned product reaches our warehouse and passes quality checks.',
  },
  {
    id: '5',
    question: 'How to change my delivery address?',
    answer: 'You can add, edit, or delete your addresses in the "Saved Addresses" section under your Account Profile.',
  },
  {
    id: '6',
    question: 'Is there a minimum order value for free delivery?',
    answer: 'Free delivery is applicable on all orders above ₹500. For orders below this amount, a nominal delivery fee of ₹40 will be charged.',
  },
];

const HelpAndSupportScreen = () => {
  const { navigate } = useAppNavigation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="container">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
          <button onClick={() => navigate('PROFILE')} className="back-button" aria-label="Go back">
            <span className="back-icon">←</span>
          </button>
          <h1 className="header-title">Help & Support</h1>
        </div>
      </div>

      <div className="scroll-content" style={{ overflowY: 'visible', height: 'auto', flex: 1, backgroundColor: '#F9FBF9' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', padding: '24px' }}>
          <div className="hero-section" style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#fff',
            borderRadius: '24px',
            marginBottom: '32px',
            border: '1px solid #eee',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <span style={{ fontSize: 64, display: 'block', marginBottom: 20 }}>🎧</span>
            <h2 style={{ fontSize: 28, color: '#1B5E20', fontWeight: 800, margin: 0 }}>How can we help?</h2>
            <p style={{ fontSize: 16, color: '#666', marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>
              Browse frequently asked questions or connect with our support team available 24/7.
            </p>
          </div>

          <h2 className="section-title" style={{ fontSize: 22, fontWeight: 800, color: '#333', marginBottom: 20 }}>
            Frequently Asked Questions
          </h2>
          
          <div className="faq-container" style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((faq) => {
              const isActive = expandedId === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className={`faq-item ${isActive ? 'active' : ''}`}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    border: isActive ? '2px solid #2E7D32' : '1px solid #eee',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleExpand(faq.id)}
                >
                  <div className="faq-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#333', flex: 1 }}>{faq.question}</span>
                    <span style={{ fontSize: 24, color: '#2E7D32', fontWeight: 800, marginLeft: 16 }}>
                      {isActive ? '−' : '+'}
                    </span>
                  </div>
                  {isActive && (
                    <div style={{ padding: '0 24px 20px', color: '#555', lineHeight: 1.6, fontSize: 15 }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <h2 className="section-title" style={{ fontSize: 22, fontWeight: 800, color: '#333', marginBottom: 20 }}>
            Still need help?
          </h2>
          
          <div className="contact-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginBottom: 40
          }}>
            <div className="user-card" style={{ padding: 20, cursor: 'pointer' }}>
              <div className="avatar" style={{ backgroundColor: '#E8F5E9', fontSize: 24 }}>✉️</div>
              <div style={{ flex: 1, marginLeft: 16 }}>
                <span style={{ display: 'block', fontWeight: 700 }}>Email Support</span>
                <span style={{ color: '#2E7D32', fontSize: 14 }}>support@quickcart.com</span>
              </div>
            </div>

            <div className="user-card" style={{ padding: 20, cursor: 'pointer' }}>
              <div className="avatar" style={{ backgroundColor: '#E8F5E9', fontSize: 24 }}>📞</div>
              <div style={{ flex: 1, marginLeft: 16 }}>
                <span style={{ display: 'block', fontWeight: 700 }}>Call Us</span>
                <span style={{ color: '#2E7D32', fontSize: 14 }}>+1 (800) 123-4567</span>
              </div>
            </div>

            <div className="user-card" style={{ padding: 20, cursor: 'pointer' }}>
              <div className="avatar" style={{ backgroundColor: '#E8F5E9', fontSize: 24 }}>💬</div>
              <div style={{ flex: 1, marginLeft: 16 }}>
                <span style={{ display: 'block', fontWeight: 700 }}>Live Chat</span>
                <span style={{ color: '#2E7D32', fontSize: 14 }}>Available 24/7</span>
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: '#999', fontSize: 13, paddingBottom: 40 }}>
            Typical response time: <span style={{ color: '#666', fontWeight: 600 }}>within 2 hours</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 600,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#eee',
  },
  heroEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  faqContainer: {
    marginBottom: 25,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  faqItemExpanded: {
    borderColor: '#2E7D32',
    borderWidth: 1.5,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    paddingRight: 10,
  },
  expandIcon: {
    fontSize: 20,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  faqAnswerContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 0,
    borderTopColor: '#f5f5f5',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  contactContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  contactIconBox: {
    width: 45,
    height: 45,
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  contactIcon: {
    fontSize: 22,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  contactValue: {
    fontSize: 13,
    color: '#2E7D32',
    marginTop: 2,
  },
  footerText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 10,
  },
});

export default HelpAndSupportScreen;
