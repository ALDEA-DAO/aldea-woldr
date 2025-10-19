import React, { useEffect, useState } from 'react';
import '../styles/transaction-status.css';

export type TransactionStage = 
  | 'cardano-confirming'
  | 'bridge-processing'
  | 'pyrope-minting'
  | 'completed'
  | 'error';

interface TransactionStatusModalProps {
  isOpen: boolean;
  stage: TransactionStage;
  cardanoTxHash?: string;
  error?: string;
  onClose: () => void;
}

export const TransactionStatusModal: React.FC<TransactionStatusModalProps> = ({
  isOpen,
  stage,
  cardanoTxHash,
  error,
  onClose
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (stage === 'completed' || stage === 'error') return;

    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, [stage]);

  if (!isOpen) return null;

  const getStageContent = () => {
    switch (stage) {
      case 'cardano-confirming':
        return {
          icon: '⏳',
          title: 'Clearing funds in Cardano',
          description: 'Waiting for transaction confirmation on Cardano blockchain',
          status: 'loading',
          showTxHash: true
        };
      case 'bridge-processing':
        return {
          icon: '🌉',
          title: 'Waiting for the bridge to process',
          description: 'Bridge is verifying and processing your transaction',
          status: 'loading',
          showTxHash: true
        };
      case 'pyrope-minting':
        return {
          icon: '⚡',
          title: 'Minting tokens on Pyrope',
          description: 'Creating wrapped ALDEA tokens on Pyrope chain',
          status: 'loading',
          showTxHash: false
        };
      case 'completed':
        return {
          icon: '✅',
          title: 'ALDEA successfully bridged to Pyrope',
          description: 'Your tokens are now available on Pyrope chain!',
          status: 'success',
          showTxHash: false
        };
      case 'error':
        return {
          icon: '❌',
          title: 'Bridge transaction failed',
          description: error || 'An error occurred during the bridge process',
          status: 'error',
          showTxHash: true
        };
      default:
        return {
          icon: '🔄',
          title: 'Processing',
          description: 'Please wait...',
          status: 'loading',
          showTxHash: false
        };
    }
  };

  const content = getStageContent();
  const canClose = stage === 'completed' || stage === 'error';

  return (
    <div className="tx-status-overlay">
      <div className="tx-status-modal">
        <div className={`tx-status-icon ${content.status}`}>
          {content.icon}
        </div>

        <h2 className="tx-status-title">{content.title}{content.status === 'loading' && dots}</h2>
        
        <p className="tx-status-description">{content.description}</p>

        {content.showTxHash && cardanoTxHash && (
          <div className="tx-hash-display">
            <label>Cardano Transaction:</label>
            <a 
              href={`https://preprod.cardanoscan.io/transaction/${cardanoTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-hash-link"
            >
              {cardanoTxHash.slice(0, 16)}...{cardanoTxHash.slice(-16)}
            </a>
          </div>
        )}

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`progress-step ${stage === 'cardano-confirming' || stage === 'bridge-processing' || stage === 'pyrope-minting' || stage === 'completed' ? 'active' : ''} ${stage !== 'cardano-confirming' ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <div className="step-label">Cardano</div>
          </div>

          <div className="progress-line"></div>

          <div className={`progress-step ${stage === 'bridge-processing' || stage === 'pyrope-minting' || stage === 'completed' ? 'active' : ''} ${stage === 'pyrope-minting' || stage === 'completed' ? 'completed' : ''}`}>
            <div className="step-circle">2</div>
            <div className="step-label">Bridge</div>
          </div>

          <div className="progress-line"></div>

          <div className={`progress-step ${stage === 'pyrope-minting' || stage === 'completed' ? 'active' : ''} ${stage === 'completed' ? 'completed' : ''}`}>
            <div className="step-circle">3</div>
            <div className="step-label">Pyrope</div>
          </div>
        </div>

        {canClose && (
          <button className="tx-status-close-btn" onClick={onClose}>
            {stage === 'completed' ? 'Done' : 'Close'}
          </button>
        )}

        {!canClose && (
          <div className="tx-status-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};
