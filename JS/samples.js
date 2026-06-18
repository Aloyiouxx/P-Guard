/* ============================================================
   js/samples.js
   Pre-written sample emails for the demo chips.
   ============================================================ */

const SAMPLES = {
  phishing: `From: security-alert@paypa1-support.com
Subject: URGENT: Your PayPal account has been suspended!

Dear Customer,

Your account has been flagged for suspicious activity and will be permanently suspended within 24 hours unless you verify your identity immediately.

Click here to verify your account: http://paypal-secure-login.xyz/verify

Please confirm your password and billing details to restore access. Failure to act within 24 hours will result in permanent account termination.

PayPal Security Team`,

  credential: `From: support@amazon-account-verify.net
Subject: Action Required: Update your payment information

Hello valued member,

We've noticed an issue with your payment method. Please update your credit card details to avoid service interruption.

Enter your card number, billing address and CVV at the link below within 48 hours to keep your subscription active:
http://bit.ly/amzn-update-payment

You were selected for account verification due to unusual login activity. Please provide your account credentials and social security number for identity verification.

Amazon Customer Service`,

  lottery: `Dear Lucky Winner,

Congratulations! You have been selected as the winner of our $50,000 prize in the International Lottery Program!

You won a free iPhone 15 and $10,000 cash! Claim your winnings and prize reward immediately!

To claim your jackpot winnings, simply download the attached invoice.exe and provide your bank account details so we can transfer your funds.

Congratulations once again on being our chosen winner!

International Prize Committee`,

  legit: `From: notifications@github.com
Subject: [GitHub] Your pull request has been reviewed

Hi Sarah,

Peter Johnson reviewed your pull request "Fix authentication middleware" in the repository acme-corp/backend.

Peter left a comment:
"Good work on the token refresh logic. A few minor suggestions on the error handling in line 42. Otherwise this looks good to merge."

View the pull request:
https://github.com/acme-corp/backend/pull/1247

You can unsubscribe from these notifications in your GitHub settings.

GitHub, Inc.`
};

/**
 * Loads a sample email into the textarea and triggers live analysis.
 * Called by onclick on the sample chips in index.html.
 */
function loadSample(key) {
  document.getElementById('emailInput').value = SAMPLES[key];
  handleInput();
  document.getElementById('emailInput').focus();
}
