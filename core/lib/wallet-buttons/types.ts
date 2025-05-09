declare global {
  interface Window {
    checkoutKitLoader?: CheckoutKitLoader;
  }
}

interface CheckoutKitLoader {
  load(moduleName: string): Promise<CheckoutKitModule>;
}

interface CheckoutKitModule {
  createHeadlessCheckoutWalletInitializer(props?: {
    host?: string;
  }): CheckoutHeadlessButtonInitializer;
}

interface CheckoutHeadlessButtonInitializer {
  initializeHeadlessButton(option: InitializeButtonProps): void;
}

export interface InitializeButtonProps {
  [key: string]: unknown;
  containerId: string;
  methodId: string;
}

export interface WalletInitializationData {
  initializationData: null | string;
  clientToken: null | string;
}

/**
 *
 * PayPal Commerce Style options
 *
 */

export enum StyleButtonLabel {
  paypal = 'paypal',
  checkout = 'checkout',
  buynow = 'buynow',
  pay = 'pay',
  installment = 'installment',
}

export enum StyleButtonColor {
  gold = 'gold',
  blue = 'blue',
  silver = 'silver',
  black = 'black',
  white = 'white',
}

export enum StyleButtonShape {
  pill = 'pill',
  rect = 'rect',
}

export interface PayPalButtonStyleOptions {
  color?: StyleButtonColor;
  shape?: StyleButtonShape;
  height?: number;
  label?: StyleButtonLabel;
}

/**
 *
 * PayPal Commerce Funding sources
 *
 */
export type FundingType = string[];
export type EnableFundingType = FundingType | string;

/**
 *
 * PayPal Commerce Initialization Data
 *
 */
export interface PayPalCommerceInitializationData {
  attributionId?: string;
  availableAlternativePaymentMethods: FundingType;
  buttonStyle?: PayPalButtonStyleOptions;
  buyerCountry?: string;
  clientId: string;
  clientToken?: string;
  enabledAlternativePaymentMethods: FundingType;
  isDeveloperModeApplicable?: boolean;
  intent?: PayPalCommerceIntent;
  isAcceleratedCheckoutEnabled?: boolean;
  isHostedCheckoutEnabled?: boolean;
  isPayPalCreditAvailable?: boolean;
  isVenmoEnabled?: boolean;
  isGooglePayEnabled?: boolean;
  merchantId?: string;
  orderId?: string;
  shouldRenderFields?: boolean;
  shouldRunAcceleratedCheckout?: boolean;
  paymentButtonStyles?: Record<string, PayPalButtonStyleOptions>;
}

export enum PayPalCommerceIntent {
  AUTHORIZE = 'authorize',
  CAPTURE = 'capture',
}
