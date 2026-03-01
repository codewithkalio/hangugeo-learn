/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';

interface SignupEmailProps {
  confirmationUrl: string;
  siteName?: string;
  recipient?: string;
}

export const SignupEmail = ({
  confirmationUrl = 'https://example.com/confirm',
  siteName = '한국어 Learn',
  recipient = '',
}: SignupEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {siteName} — confirm your email to get started 🇰🇷</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={logoEmoji}>🇰🇷</Text>
            <Heading style={heading}>{siteName}</Heading>
            <Text style={subheading}>Korean Learning</Text>
          </Section>

          <Hr style={divider} />

          {/* Body */}
          <Section style={bodySection}>
            <Heading as="h2" style={bodyHeading}>
              Welcome aboard! ✨
            </Heading>
            <Text style={bodyText}>
              Thanks for signing up. Tap the button below to confirm your email and start learning Korean.
            </Text>

            {/* CTA */}
            <Section style={ctaSection}>
              <Link href={confirmationUrl} style={ctaButton}>
                Create Account
              </Link>
            </Section>

            <Text style={bodyTextSmall}>
              If the button doesn't work, copy and paste this link into your browser:
            </Text>
            <Text style={linkText}>{confirmationUrl}</Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              You received this email because someone signed up at {siteName}.
              If this wasn't you, you can safely ignore it.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SignupEmail;

// ---------- Styles ----------

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', 'Nunito', Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '40px 24px',
};

const headerSection: React.CSSProperties = {
  textAlign: 'center' as const,
  paddingBottom: '8px',
};

const logoEmoji: React.CSSProperties = {
  fontSize: '48px',
  margin: '0',
  lineHeight: '1.2',
};

const heading: React.CSSProperties = {
  fontFamily: "'Nunito', Arial, sans-serif",
  fontSize: '24px',
  fontWeight: 700,
  color: 'hsl(168, 90%, 12%)',
  margin: '8px 0 0',
};

const subheading: React.CSSProperties = {
  fontSize: '13px',
  color: 'hsl(168, 20%, 35%)',
  margin: '2px 0 0',
};

const divider: React.CSSProperties = {
  borderTop: '1px solid hsl(72, 20%, 85%)',
  margin: '24px 0',
};

const bodySection: React.CSSProperties = {
  textAlign: 'center' as const,
};

const bodyHeading: React.CSSProperties = {
  fontFamily: "'Nunito', Arial, sans-serif",
  fontSize: '20px',
  fontWeight: 700,
  color: 'hsl(168, 90%, 12%)',
  margin: '0 0 12px',
};

const bodyText: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: 'hsl(168, 20%, 35%)',
  margin: '0 0 24px',
};

const bodyTextSmall: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '1.5',
  color: 'hsl(168, 20%, 35%)',
  margin: '24px 0 4px',
};

const linkText: React.CSSProperties = {
  fontSize: '12px',
  color: 'hsl(163, 55%, 45%)',
  wordBreak: 'break-all' as const,
  margin: '0',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
};

const ctaButton: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: 'hsl(168, 90%, 20%)',
  color: '#ffffff',
  fontFamily: "'Nunito', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '15px',
  padding: '14px 32px',
  borderRadius: '16px',
  textDecoration: 'none',
};

const footerSection: React.CSSProperties = {
  textAlign: 'center' as const,
};

const footerText: React.CSSProperties = {
  fontSize: '12px',
  lineHeight: '1.5',
  color: 'hsl(168, 20%, 35%)',
  margin: '0',
};
