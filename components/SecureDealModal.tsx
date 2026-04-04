"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, CheckCircle, AlertCircle } from 'lucide-react';
import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';

const peraWallet = new PeraWalletConnect({ 
  chainId: 416002,
  shouldShowSignTxnToast: false 
});

export default function SecureDealModal({
  isOpen,
  onClose,
  influencerName,
  amount,
  contractAddress,
  contractABI,
  onSuccess
}: any) {

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSecureDeal = async () => {
    try {
      setStatus("loading");

      await peraWallet.disconnect().catch(() => {});
      const accounts = await peraWallet.connect();
      const activeAddress = accounts[0];

      if (!activeAddress) throw new Error("Wallet connection failed");

      const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');

      const isDemoMode = contractAddress === "123456";
      const amountMicro = isDemoMode ? 1000 : amount * 1_000_000;

      const suggestedParams = await algodClient.getTransactionParams().do();

      let signedTxns;

      if (isDemoMode) {
        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: activeAddress,
          receiver: activeAddress,
          amount: amountMicro,
          suggestedParams,
        });

        signedTxns = await peraWallet.signTransaction([[
          { txn, signers: [activeAddress] }
        ]]);

      } else {
        const appId = Number(contractAddress);
        const appAddress = algosdk.getApplicationAddress(appId);

        const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: activeAddress,
          receiver: appAddress,
          amount: amountMicro,
          suggestedParams,
        });

        const contract = new algosdk.ABIContract(contractABI);
        const method = contract.getMethodByName('initializeDeposit');

        const atc = new algosdk.AtomicTransactionComposer();

        // ✅ FINAL CORRECT SIGNER TYPE
        const dummySigner: algosdk.TransactionSigner = async () => {
          throw new Error("Handled by Pera Wallet");
        };

        atc.addMethodCall({
          appID: appId,
          method,
          methodArgs: [
            {
              txn: paymentTxn,
              signer: dummySigner
            }
          ],
          sender: activeAddress,
          suggestedParams,
          signer: dummySigner
        });

        const built = atc.buildGroup();

        const payload = built.map(t => ({
          txn: t.txn,
          signers: [activeAddress]
        }));

        signedTxns = await peraWallet.signTransaction([payload]);
      }

      const signedTxnNumbers = signedTxns.map(tx => new Uint8Array(tx));

const response: any = await algodClient.sendRawTransaction(signedTxnNumbers).do();
const txId = response.txId || response.txid;

await algosdk.waitForConfirmation(algodClient, txId as string, 4);

      setStatus("success");
      onSuccess?.("chat");

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Transaction failed");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setErrorMessage("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            onClick={reset}
            className="fixed inset-0 bg-black/60"
          />

          <motion.div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 p-6 rounded-xl w-96">

            <button onClick={reset} className="absolute right-3 top-3">
              <X />
            </button>

            {status === "success" ? (
              <div className="text-center">
                <CheckCircle className="mx-auto text-green-400" />
                <p className="text-white mt-3">Deal secured</p>
              </div>
            ) : status === "error" ? (
              <div className="text-center">
                <AlertCircle className="mx-auto text-red-400" />
                <p className="text-red-400 mt-3">{errorMessage}</p>
              </div>
            ) : (
              <>
                <h2 className="text-white mb-4">Secure Deal</h2>

                <p className="text-slate-300 mb-4">
                  Your funds will be locked until the influencer&apos;s work is completed.
                </p>

                <button
                  onClick={handleSecureDeal}
                  className="w-full bg-blue-600 text-white py-2 rounded"
                >
                  {status === "loading" ? "Processing..." : "Secure Deal"}
                </button>
              </>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}