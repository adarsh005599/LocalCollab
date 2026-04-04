import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';

// Chain ID 416002 strictly enforces Testnet routing for the dApp
const peraWallet = new PeraWalletConnect({ 
  chainId: 416002,
  shouldShowSignTxnToast: false 
});

interface SecureDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencerName: string;
  influencerWallet: string; // Target beneficiary for reference, but contract holds funds
  amount: number; // The payment amount (e.g. ₹ or raw ALGO value)
  contractAddress: string; // Algorand uses Application IDs, assume this is passed as the string ID
  contractABI: any; // Ensure you pass the ABI JSON imported from your contract build
  onSuccess?: (action: 'chat' | 'later') => void;
}

export default function SecureDealModal({
  isOpen,
  onClose,
  influencerName,
  influencerWallet,
  amount,
  contractAddress,
  contractABI,
  onSuccess
}: SecureDealModalProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
const handleSecureDeal = async () => {
    try {
      setStatus('loading');

      await peraWallet.disconnect().catch(() => {});
      const activeAccounts = await peraWallet.connect();
      const activeAddress = activeAccounts[0];
      
      if (!activeAddress) {
        throw new Error("Wallet connection failed or was cancelled.");
      }

      const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');

      const isDemoMode = contractAddress === "123456";
      // FIX 1: Parse contractAddress string to number for appId
      const appId = isDemoMode ? 0 : parseInt(contractAddress, 10);
      const actualDepositMicroAlgos = isDemoMode ? 1_000 : (amount * 1_000_000); 
      
      const suggestedParams = await algodClient.getTransactionParams().do();
      
      let payloadForPera;
      let signedTxns;

      if (isDemoMode) {
        const safePaymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: activeAddress,
          receiver: activeAddress,
          amount: actualDepositMicroAlgos,
          suggestedParams,
        });

        payloadForPera = [{
          txn: safePaymentTxn,
          signers: [activeAddress]
        }];
        
        signedTxns = await peraWallet.signTransaction([payloadForPera]);

      } else {
        const appAddress = algosdk.getApplicationAddress(appId);
        
        const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: activeAddress,
          receiver: appAddress,
          amount: actualDepositMicroAlgos,
          suggestedParams,
        });

        const contract = new algosdk.ABIContract(contractABI);
        const initializeDepositMethod = contract.getMethodByName('initializeDeposit');

        const atc = new algosdk.AtomicTransactionComposer();

        // FIX 2: Cast activeAddress to algosdk.Address type
        const senderAddress = activeAddress as unknown as algosdk.Address;

        atc.addMethodCall({
          appID: appId,
          method: initializeDepositMethod,
          methodArgs: [
            { 
              txn: paymentTxn, 
              signer: algosdk.makeBasicAccountTransactionSigner({ 
                addr: senderAddress, 
                sk: new Uint8Array() 
              }) 
            }
          ],
          sender: activeAddress,
          suggestedParams,
          signer: algosdk.makeBasicAccountTransactionSigner({ 
            addr: senderAddress, 
            sk: new Uint8Array() 
          })
        });

        const builtTxns = atc.buildGroup();
        payloadForPera = builtTxns.map(t => ({
          txn: t.txn,
          signers: [activeAddress]
        }));

        signedTxns = await peraWallet.signTransaction([payloadForPera]);
      }
      
      const signedTxnNumbers = signedTxns.map(tx => new Uint8Array(tx));
      
      // FIX 3: sendRawTransaction returns txID as a string directly, not destructured
      const sendResponse = await algodClient.sendRawTransaction(signedTxnNumbers).do();
      const sentTxnId: string = sendResponse.txid ?? sendResponse.txid ?? sendResponse;
      
      await algosdk.waitForConfirmation(algodClient, sentTxnId, 4);

      setTxId(sentTxnId);
      setStatus('success');
      // FIX 4: onSuccess requires 'chat' | 'later' argument
      if (onSuccess) onSuccess('chat');
      
    } catch (error: any) {
      console.error('Transaction Failed:', error);
      setErrorMessage(error?.message || String(error));
      setStatus('error');
    }
  };

  const resetAndClose = () => {
    setStatus('idle');
    setTxId('');
    setErrorMessage('');
    onClose();
  };

  // Safe formatting 
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Dark blurred overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-slate-900/90 p-8 shadow-[0_0_40px_rgba(30,58,138,0.3)] backdrop-blur-xl font-sans"
          >
            {/* Close Button */}
            <button 
              onClick={resetAndClose}
              className="absolute right-6 top-6 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>

            {/* Content Switcher */}
            {status === 'success' ? (
              <div className="flex flex-col items-center text-center py-6">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="mb-4 text-emerald-400 bg-emerald-400/10 p-3 rounded-full"
                >
                  <CheckCircle size={48} />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Deal Secured Successfully</h2>
                <p className="text-slate-400 mt-4 text-sm leading-relaxed max-w-sm mx-auto">
                  {amount} ALGO has been securely locked in the smart contract. The funds will only be released when the milestone is approved.
                </p>
                <div className="flex gap-3 w-full mt-8">
                  <button 
                    onClick={() => {
                      if (onSuccess) onSuccess('later');
                      else resetAndClose();
                    }}
                    className="flex-[0.35] bg-transparent border border-slate-700 hover:bg-slate-800 text-white py-3 rounded-xl font-medium transition-all"
                  >
                    Later
                  </button>
                  <button 
                    onClick={() => {
                      if (onSuccess) onSuccess('chat');
                      resetAndClose();
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Start Chatting
                  </button>
                </div>
              </div>
            ) : status === 'error' ? (
              <div className="flex flex-col items-center text-center py-6">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="mb-4 text-rose-400 bg-rose-400/10 p-3 rounded-full"
                >
                  <AlertCircle size={48} />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Transaction Failed</h2>
                <p className="text-slate-300 text-sm mb-4">
                  The deal was cancelled or something went wrong:
                </p>
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-lg text-xs font-mono w-full mb-8 overflow-hidden text-ellipsis whitespace-nowrap">
                  {errorMessage}
                </div>
                <button 
                  onClick={() => setStatus('idle')}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Try Again
                </button>
                <button 
                  onClick={resetAndClose}
                  className="mt-3 w-full bg-transparent hover:bg-slate-800 text-slate-400 py-3 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
                    <ShieldCheck size={28} />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Secure Collaboration</h2>
                </div>

                <div className="bg-slate-800/40 rounded-2xl p-5 mb-6 border border-slate-700/50">
                  <div className="text-sm text-slate-400 mb-1">Collaboration Offer With</div>
                  <div className="text-lg font-bold text-white mb-4">{influencerName}</div>

                  <div className="flex justify-between items-end border-t border-slate-700/50 pt-4">
                    <div className="text-sm font-medium text-slate-400">Escrow Payment</div>
                    <div className="text-3xl font-extrabold text-white tracking-tight">{formattedAmount}</div>
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-8 flex items-start gap-3 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 leading-relaxed">
                  <Lock size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Your funds will be locked securely on the Algorand blockchain until the influencer's work is completed and approved.</span>
                </p>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleSecureDeal}
                    disabled={status === 'loading'}
                    className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all overflow-hidden flex items-center justify-center group"
                  >
                    {status === 'loading' ? (
                      <React.Fragment>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Processing...
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                         Secure Deal
                      </React.Fragment>
                    )}
                  </button>
                  <button 
                    onClick={resetAndClose}
                    className="w-full bg-transparent hover:bg-slate-800 text-slate-400 py-3 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
