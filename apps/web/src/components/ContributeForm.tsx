import { CheckCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import { useState } from "react";
import { isEthAddress } from "@residuals/shared";
import { ApiError, postContribute } from "../lib/api";
import type { ContributeResult } from "../lib/types";
import { Button, Field, Input, Panel, Textarea } from "./ui";

export function ContributeForm() {
  const [address, setAddress] = useState("");
  const [handle, setHandle] = useState("");
  const [topic, setTopic] = useState("");
  const [region, setRegion] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContributeResult | null>(null);

  const bodyLen = body.trim().length;
  const bodyHint =
    bodyLen > 0 && (bodyLen < 80 || bodyLen > 2000)
      ? `Body must be 80-2000 characters (currently ${bodyLen}).`
      : `${bodyLen} / 2000 characters`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!isEthAddress(address.trim())) {
      setError("Enter a valid 0x address for royalty payouts.");
      return;
    }
    if (!handle.trim() || !topic.trim()) {
      setError("Handle and topic are required.");
      return;
    }
    if (bodyLen < 80 || bodyLen > 2000) {
      setError("Entry body must be between 80 and 2000 characters.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        address: address.trim(),
        handle: handle.trim(),
        topic: topic.trim(),
        body: body.trim(),
        ...(region.trim() ? { region: region.trim() } : {}),
      };
      const created = await postContribute(payload);
      setResult(created);
      setBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Contribute failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel>
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Contribute</h2>
      <p className="mt-2 max-w-xl text-sm text-ink-muted">
        Publish practical knowledge. When agents retrieve your entry, a share of the query
        fee accrues to your address.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-5 md:grid-cols-2">
        <Field label="Payout address">
          <Input
            id="contribute-address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
          />
        </Field>
        <Field label="Handle">
          <Input
            id="contribute-handle"
            name="handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@yourname"
            disabled={loading}
          />
        </Field>
        <Field label="Topic">
          <Input
            id="contribute-topic"
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Banking in Singapore"
            disabled={loading}
          />
        </Field>
        <Field label="Region (optional)">
          <Input
            id="contribute-region"
            name="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="SG"
            disabled={loading}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Entry body" hint={bodyHint}>
            <Textarea
              id="contribute-body"
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the concrete steps you wish someone had told you..."
              disabled={loading}
            />
          </Field>
        </div>

        {error ? (
          <p className="md:col-span-2 text-sm text-amber" role="alert">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="md:col-span-2 flex gap-3 rounded-xl border border-hairline bg-surface-muted px-4 py-4 text-sm">
            <CheckCircle size={20} className="shrink-0 text-amber" weight="fill" />
            <div>
              <p className="font-medium">Entry created</p>
              <p className="mt-1 text-ink-muted">
                id #{result.id}
                {result.status ? ` · status ${result.status}` : ""}
              </p>
            </div>
          </div>
        ) : null}

        <div className="md:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Contribute"}
            {!loading ? <PaperPlaneTilt size={16} weight="bold" /> : null}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
