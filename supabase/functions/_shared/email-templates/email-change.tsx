/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1';
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22';

interface EmailChangeEmailProps {
  confirmationUrl: string;
  siteName?: string;
  recipient?: string;
  newEmail?: string;
}

export const EmailChangeEmail = ({
  confirmationUrl = 'https://example.com/change',
  siteName = '한국어 Learn',
  newEmail = 'new@example.com',
}: EmailChangeEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirm your new email for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}><Text style={logo}>🇰🇷</Text><Heading style={h1}>{siteName}</Heading></Section>
        <Hr style={hr} />
        <Section style={body}>
          <Heading as="h2" style={h2}>Confirm email change</Heading>
          <Text style={text}>You requested to change your email to <strong>{newEmail}</strong>. Follow the link in the email sent to your new address to confirm.</Text>
          <Text style={small}>If you didn't request this, you can ignore this email and your address won't change.</Text>
        </Section>
        <Hr style={hr} />
        <Section style={footer}><Text style={footerText}>Sent by {siteName}.</Text></Section>
      </Container>
    </Body>
  </Html>
);
export default EmailChangeEmail;

const main: React.CSSProperties = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Nunito', Arial, sans-serif" };
const container: React.CSSProperties = { maxWidth: '480px', margin: '0 auto', padding: '40px 24px' };
const header: React.CSSProperties = { textAlign: 'center' as const, paddingBottom: '8px' };
const logo: React.CSSProperties = { fontSize: '48px', margin: '0', lineHeight: '1.2' };
const h1: React.CSSProperties = { fontFamily: "'Nunito', Arial, sans-serif", fontSize: '24px', fontWeight: 700, color: 'hsl(168, 90%, 12%)', margin: '8px 0 0' };
const hr: React.CSSProperties = { borderTop: '1px solid hsl(72, 20%, 85%)', margin: '24px 0' };
const body: React.CSSProperties = { textAlign: 'center' as const };
const h2: React.CSSProperties = { fontFamily: "'Nunito', Arial, sans-serif", fontSize: '20px', fontWeight: 700, color: 'hsl(168, 90%, 12%)', margin: '0 0 12px' };
const text: React.CSSProperties = { fontSize: '15px', lineHeight: '1.6', color: 'hsl(168, 20%, 35%)', margin: '0 0 24px' };
const small: React.CSSProperties = { fontSize: '13px', color: 'hsl(168, 20%, 35%)', margin: '24px 0 4px' };
const footer: React.CSSProperties = { textAlign: 'center' as const };
const footerText: React.CSSProperties = { fontSize: '12px', color: 'hsl(168, 20%, 35%)', margin: '0' };
