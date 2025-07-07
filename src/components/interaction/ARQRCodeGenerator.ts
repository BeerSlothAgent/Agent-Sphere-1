export interface PaymentData {
  agentId: string;
  interactionType: string;
  amount: number;
  transactionId: string;
  timestamp: number;
  walletAddress: string;
  merchantAddress: string;
}

export interface BlockchainData {
  to: string;
  amount: number;
  currency: string;
  memo: string;
  transactionId: string;
  network: string;
  timestamp: number;
}

export class ARQRCodeGenerator {
  private scene: any;
  private qrCodeObject: any = null;
  private glowMesh: any = null;
  private textMesh: any = null;
  private animationFrameId: number | null = null;

  constructor(scene: any) {
    this.scene = scene;
  }

  async generateQRCode(paymentData: PaymentData): Promise<void> {
    try {
      // Generate QR code content (blockchain transaction data)
      const qrContent = this.createBlockchainQRContent(paymentData);
      
      // Create QR code texture using QR.js library
      const qrCodeTexture = await this.generateQRTexture(qrContent);
      
      // Create 3D QR code object in AR space
      this.createARQRObject(qrCodeTexture, paymentData);
      
      // Add visual effects
      this.addQREffects();
      
      console.log('🎯 AR QR Code generated successfully!', paymentData);
    } catch (error) {
      console.error('❌ Failed to generate AR QR Code:', error);
    }
  }

  private createBlockchainQRContent(paymentData: PaymentData): string {
    // Simulate blockchain transaction format
    const blockchainData: BlockchainData = {
      to: paymentData.merchantAddress,
      amount: paymentData.amount,
      currency: 'USDFC',
      memo: `Payment for ${paymentData.interactionType} with ${paymentData.agentId}`,
      transactionId: paymentData.transactionId,
      network: 'NEAR',
      timestamp: paymentData.timestamp
    };
    
    return JSON.stringify(blockchainData);
  }

  private async generateQRTexture(content: string): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = 512;
        canvas.height = 512;
        
        // Import QR code library dynamically
        import('qrcode').then((QR) => {
          QR.toCanvas(canvas, content, {
            width: 512,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          }, (error: Error | null | undefined) => {
            if (error) {
              reject(error);
            } else {
              resolve(canvas);
            }
          });
        }).catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private createARQRObject(qrTexture: HTMLCanvasElement, paymentData: PaymentData): void {
    // Remove existing QR code if any
    this.removeQRCode();

    // Create 3D plane for QR code using A-Frame
    const qrEntity = document.createElement('a-entity');
    qrEntity.setAttribute('geometry', {
      primitive: 'plane',
      width: 0.3,
      height: 0.3
    });

    // Create texture from canvas
    const texture = new Image();
    texture.src = qrTexture.toDataURL();
    
    qrEntity.setAttribute('material', {
      src: texture.src,
      transparent: true,
      alphaTest: 0.1
    });

    // Position QR code near the center of the scene
    qrEntity.setAttribute('position', '0.5 1.8 -2');
    qrEntity.setAttribute('rotation', '0 0 0');
    
    // Make QR code always face the camera
    qrEntity.setAttribute('look-at', '[camera]');
    
    // Add click handler for QR code scanning simulation
    qrEntity.addEventListener('click', () => {
      this.handleQRCodeScan(paymentData);
    });

    // Add to scene
    if (this.scene && this.scene.appendChild) {
      this.scene.appendChild(qrEntity);
    } else {
      // Fallback: add to a-scene directly
      const aScene = document.querySelector('a-scene');
      if (aScene) {
        aScene.appendChild(qrEntity);
      }
    }

    this.qrCodeObject = qrEntity;
    
    // Add payment info display
    this.addPaymentInfoDisplay(paymentData);
  }

  private addQREffects(): void {
    if (!this.qrCodeObject) return;

    // Create glowing effect
    const glowEntity = document.createElement('a-entity');
    glowEntity.setAttribute('geometry', {
      primitive: 'plane',
      width: 0.35,
      height: 0.35
    });
    glowEntity.setAttribute('material', {
      color: '#00ff88',
      transparent: true,
      opacity: 0.3,
      shader: 'flat'
    });
    glowEntity.setAttribute('position', '0.5 1.8 -2.01');
    glowEntity.setAttribute('look-at', '[camera]');

    const aScene = document.querySelector('a-scene');
    if (aScene) {
      aScene.appendChild(glowEntity);
    }

    this.glowMesh = glowEntity;

    // Add rotation animation
    this.qrCodeObject.setAttribute('animation', {
      property: 'rotation',
      to: '0 0 360',
      loop: true,
      dur: 10000,
      easing: 'linear'
    });

    // Add pulsing glow effect
    glowEntity.setAttribute('animation', {
      property: 'material.opacity',
      to: '0.6',
      direction: 'alternate',
      loop: true,
      dur: 2000,
      easing: 'easeInOutSine'
    });
  }

  private addPaymentInfoDisplay(paymentData: PaymentData): void {
    // Create floating text display above QR code
    const textEntity = document.createElement('a-entity');
    
    const paymentText = `${paymentData.amount} USDFC\n${paymentData.interactionType.toUpperCase()} CHAT\nScan to Pay\nExpires in 5:00`;
    
    textEntity.setAttribute('text', {
      value: paymentText,
      align: 'center',
      color: '#00ff88',
      font: 'kelsonsans',
      width: 8,
      position: '0 0 0.1'
    });
    
    textEntity.setAttribute('position', '0.5 2.1 -2');
    textEntity.setAttribute('look-at', '[camera]');

    const aScene = document.querySelector('a-scene');
    if (aScene) {
      aScene.appendChild(textEntity);
    }

    this.textMesh = textEntity;

    // Add timer countdown
    this.startPaymentTimer();
  }

  private startPaymentTimer(): void {
    let timeLeft = 300; // 5 minutes in seconds
    
    const updateTimer = () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      if (this.textMesh) {
        const currentText = this.textMesh.getAttribute('text').value;
        const updatedText = currentText.replace(/Expires in \d+:\d+/, `Expires in ${timeString}`);
        this.textMesh.setAttribute('text', 'value', updatedText);
      }
      
      timeLeft--;
      
      if (timeLeft >= 0) {
        setTimeout(updateTimer, 1000);
      } else {
        // Timer expired, remove QR code
        this.removeQRCode();
        this.onPaymentExpired();
      }
    };
    
    updateTimer();
  }

  private handleQRCodeScan(paymentData: PaymentData): void {
    console.log('🔍 QR Code scanned!', paymentData);
    
    // Trigger blockchain payment simulation
    if (window.blockchainPaymentSimulator) {
      window.blockchainPaymentSimulator.simulatePayment(paymentData);
    } else {
      // Fallback: show alert
      alert(`QR Code Scanned!\nAmount: ${paymentData.amount} USDFC\nAgent: ${paymentData.agentId}\nType: ${paymentData.interactionType}`);
    }
  }

  private onPaymentExpired(): void {
    console.log('⏰ Payment QR code expired');
    // Notify the interaction modal that payment expired
    if (window.onPaymentExpired) {
      window.onPaymentExpired();
    }
  }

  removeQRCode(): void {
    const aScene = document.querySelector('a-scene');
    
    if (this.qrCodeObject && aScene) {
      aScene.removeChild(this.qrCodeObject);
      this.qrCodeObject = null;
    }
    
    if (this.glowMesh && aScene) {
      aScene.removeChild(this.glowMesh);
      this.glowMesh = null;
    }
    
    if (this.textMesh && aScene) {
      aScene.removeChild(this.textMesh);
      this.textMesh = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  getAgentPosition(agentId: string): { x: number; y: number; z: number } {
    // Try to find the agent in the scene
    const agentElement = document.querySelector(`[data-agent-id="${agentId}"]`);
    if (agentElement) {
      const positionAttr = agentElement.getAttribute('position');
      if (positionAttr && typeof positionAttr === 'string') {
        // Parse position string like "1 2 3" into object
        const coords = positionAttr.split(' ').map(Number);
        return {
          x: coords[0] || 0,
          y: coords[1] || 1.6,
          z: coords[2] || -2
        };
      }
      // If position attribute exists but is an object
      const position = agentElement.getAttribute('position') as any;
      return {
        x: position.x || 0,
        y: position.y || 1.6,
        z: position.z || -2
      };
    }
    
    // Default position
    return { x: 0, y: 1.6, z: -2 };
  }
}

// Global utility functions
export const generateTransactionId = (): string => {
  return 'tx_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
};

export const formatCurrency = (amount: number, currency: string = 'USDFC'): string => {
  return `${amount} ${currency}`;
};

// Global type declarations for window object
declare global {
  interface Window {
    generateARQRCode?: (paymentData: PaymentData) => void;
    removeARQRCode?: () => void;
    triggerPaymentSuccess?: (qrData: PaymentData) => void;
    enableChatInterface?: (agentId: string, interactionType: string) => void;
    onPaymentExpired?: () => void;
    blockchainPaymentSimulator?: any;
  }
}