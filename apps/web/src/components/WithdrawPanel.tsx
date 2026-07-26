import { ArrowSquareOut, Wallet } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ApiError, getContributor } from "../lib/api";
import { formatMicros } from "../lib/money";
import type { ContributorStats } from "../lib/types";
import { getVaultAddress, residualsVaultAbi } from "../lib/vault";
import { explorerTxUrl, shortAddress } from "../lib/wallet";
import { Button, Panel, Skeleton, StateBlock } from "./ui";

export function WithdrawPanel() {
  const vault = getVaultAddress();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: connecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, data: txHash, isPending: writing, error: writeError, reset } =
    useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [offchain, setOffchain] = useState<ContributorStats | null>(null);
  const [offchainError, setOffchainError] = useState<string | null>(null);
  const [offchainLoading, setOffchainLoading] = useState(false);

  const {
    data: claimable,
    isLoading: claimableLoading,
    error: claimableError,
    refetch: refetchClaimable,
  } = useReadContract({
    address: vault,
    abi: residualsVaultAbi,
    functionName: "claimable",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(vault && address) },
  });

  useEffect(() => {
    if (!address) {
      setOffchain(null);
      return;
    }
    let cancelled = false;
    setOffchainLoading(true);
    setOffchainError(null);
    void getContributor(address)
      .then((stats) => {
        if (!cancelled) setOffchain(stats);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setOffchain(null);
          setOffchainError(err instanceof ApiError ? err.message : "Contributor lookup failed");
        }
      })
      .finally(() => {
        if (!cancelled) setOffchainLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address, isSuccess]);

  useEffect(() => {
    if (isSuccess) void refetchClaimable();
  }, [isSuccess, refetchClaimable]);

  function onWithdraw() {
    if (!vault) return;
    reset();
    writeContract({
      address: vault,
      abi: residualsVaultAbi,
      functionName: "withdraw",
    });
  }

  const injected = connectors.find((c) => c.id === "injected") ?? connectors[0];

  return (
    <Panel>
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Withdraw</h2>
      <p className="mt-2 max-w-xl text-sm text-ink-muted">
        Connect a wallet on X Layer to read vault claimable balance and call withdraw().
        Accruals settle on-chain in batches before becoming claimable.
      </p>

      <div className="mt-8 space-y-4">
        {!vault ? (
          <StateBlock
            title="Vault address not configured"
            body="Set VITE_VAULT_ADDRESS after ResidualsVault deploy to enable on-chain withdraw."
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {!isConnected ? (
            <Button
              onClick={() => injected && connect({ connector: injected })}
              disabled={!injected || connecting}
            >
              <Wallet size={16} weight="bold" />
              {connecting ? "Connecting…" : "Connect wallet"}
            </Button>
          ) : (
            <>
              <p className="rounded-full bg-surface-muted px-4 py-2 text-sm">
                {address ? shortAddress(address) : ""}
              </p>
              <Button variant="secondary" onClick={() => disconnect()}>
                Disconnect
              </Button>
              <Button
                onClick={onWithdraw}
                disabled={!vault || writing || confirming}
              >
                {writing || confirming ? "Confirming…" : "Withdraw"}
              </Button>
            </>
          )}
        </div>

        {connectError ? (
          <p className="text-sm text-amber">{connectError.message}</p>
        ) : null}
        {writeError ? (
          <p className="text-sm text-amber">{writeError.message}</p>
        ) : null}
        {txHash ? (
          <p className="text-sm text-ink-muted">
            Tx{" "}
            <a
              href={explorerTxUrl(txHash)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-ink underline-offset-2 hover:underline"
            >
              {shortAddress(txHash)}
              <ArrowSquareOut size={14} />
            </a>
            {isSuccess ? " · confirmed" : confirming ? " · pending" : ""}
          </p>
        ) : null}

        {isConnected ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-hairline p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                On-chain claimable
              </p>
              {claimableLoading ? (
                <Skeleton className="mt-3 h-8 w-32" />
              ) : claimableError ? (
                <p className="mt-3 text-sm text-amber">Could not read claimable</p>
              ) : (
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {formatMicros(claimable ?? 0n)}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-hairline p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                Off-chain accrual
              </p>
              {offchainLoading ? (
                <Skeleton className="mt-3 h-8 w-32" />
              ) : offchainError ? (
                <p className="mt-3 text-sm text-amber">{offchainError}</p>
              ) : offchain ? (
                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    Accrued{" "}
                    <span className="font-medium">{formatMicros(offchain.accruedMicros)}</span>
                  </p>
                  <p>
                    Settled{" "}
                    <span className="font-medium">{formatMicros(offchain.settledMicros)}</span>
                  </p>
                  <p>
                    Withdrawable (API){" "}
                    <span className="font-medium">
                      {formatMicros(offchain.withdrawableMicros)}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-muted">No contributor record yet.</p>
              )}
            </div>
          </div>
        ) : (
          <StateBlock
            title="Wallet not connected"
            body="Connect an injected wallet (e.g. MetaMask) on X Layer to withdraw settled royalties."
          />
        )}
      </div>
    </Panel>
  );
}
