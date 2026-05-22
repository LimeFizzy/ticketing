'use client';

import { useState } from 'react';
import { Check, Loader2, Plus, Trash2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { createPromoCode, deletePromoCode } from '@/lib/api';
import type { DiscountType, PromoCodeDto } from '@/lib/api/types.gen';
import { formatCurrencyEur } from '@/lib/formatters';

interface Props {
  eventId: string;
  initialCodes: PromoCodeDto[];
}

interface Draft {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  maxUses: string;
  expiresAt: string;
}

const emptyDraft = (): Draft => ({
  code: '',
  discountType: 'Percentage',
  discountValue: '',
  maxUses: '',
  expiresAt: '',
});

const isValid = (d: Draft) =>
  d.code.trim().length > 0 && Number(d.discountValue) > 0;

const isExpired = (code: PromoCodeDto) =>
  !!code.expiresAt && new Date(code.expiresAt) < new Date();

const formatDiscount = (code: PromoCodeDto) =>
  code.discountType === 'Percentage'
    ? `${code.discountValue}%`
    : formatCurrencyEur(code.discountValue);

export const PromoCodesList = ({ eventId, initialCodes }: Props) => {
  const [codes, setCodes] = useState<PromoCodeDto[]>(initialCodes);
  const [adding, setAdding] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const patchDraft = (patch: Partial<Draft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const commitAdd = async () => {
    if (!isValid(draft)) return;
    setCommitting(true);
    const { data } = await createPromoCode({
      path: { eventId },
      body: {
        code: draft.code.trim().toUpperCase(),
        discountType: draft.discountType,
        discountValue: Number(draft.discountValue),
        maxUses: draft.maxUses ? Number(draft.maxUses) : null,
        expiresAt: draft.expiresAt
          ? new Date(draft.expiresAt).toISOString()
          : null,
      },
    });
    if (data) setCodes((prev) => [...prev, data]);
    setAdding(false);
    setCommitting(false);
    setDraft(emptyDraft());
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deletePromoCode({ path: { eventId, promoCodeId: id } });
    setCodes((prev) => prev.filter((c) => c.id !== id));
    setDeletingId(null);
  };

  return (
    <Card className="glass border-white/40 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Promo Codes
          </p>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5"
            disabled={adding}
            onClick={() => {
              setAdding(true);
              setDraft(emptyDraft());
            }}
          >
            <Plus className="size-3.5" />
            Add code
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Code</th>
                <th className="pb-2 pr-4 font-medium">Discount</th>
                <th className="pb-2 pr-4 font-medium">Uses</th>
                <th className="pb-2 pr-4 font-medium">Expires</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="sr-only pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {codes.length === 0 && !adding && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No promo codes yet.
                  </td>
                </tr>
              )}

              {codes.map((code) => {
                const expired = isExpired(code);
                const active = code.isActive && !expired;
                return (
                  <tr key={code.id} className="group">
                    <td className="py-3 pr-4 font-mono font-medium text-foreground">
                      {code.code}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatDiscount(code)}
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                      {code.currentUses}
                      {code.maxUses != null ? ` / ${code.maxUses}` : ' / ∞'}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {code.expiresAt
                        ? new Date(code.expiresAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={active ? 'default' : 'secondary'}>
                        {expired ? 'Expired' : active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Delete"
                          onClick={() => handleDelete(code.id)}
                          disabled={deletingId === code.id}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          {deletingId === code.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {adding && (
                <tr className="bg-muted/20">
                  <td className="py-2 pr-4">
                    <Input
                      value={draft.code}
                      onChange={(e) =>
                        patchDraft({ code: e.target.value.toUpperCase() })
                      }
                      placeholder="SUMMER20"
                      className="h-8 font-mono"
                      autoFocus
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-1.5">
                      <Select
                        value={draft.discountType}
                        onValueChange={(v) =>
                          patchDraft({
                            discountType: v as DiscountType,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Percentage">%</SelectItem>
                          <SelectItem value="Fixed">€ fixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={0}
                        step={draft.discountType === 'Percentage' ? 1 : 0.01}
                        max={
                          draft.discountType === 'Percentage' ? 100 : undefined
                        }
                        value={draft.discountValue}
                        onChange={(e) =>
                          patchDraft({ discountValue: e.target.value })
                        }
                        placeholder="20"
                        className="h-8 w-20"
                      />
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <Input
                      type="number"
                      min={1}
                      value={draft.maxUses}
                      onChange={(e) => patchDraft({ maxUses: e.target.value })}
                      placeholder="∞"
                      className="h-8 w-20"
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <DateTimePicker
                      value={draft.expiresAt}
                      onChange={(v) => patchDraft({ expiresAt: v })}
                    />
                  </td>
                  <td className="py-2 pr-4" />
                  <td className="py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Confirm"
                        disabled={!isValid(draft) || committing}
                        onClick={commitAdd}
                        className="text-primary hover:bg-primary/10 hover:text-primary"
                      >
                        {committing ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Check className="size-3.5" />
                        )}
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Cancel"
                        disabled={committing}
                        onClick={() => setAdding(false)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          {codes.length} promo code{codes.length !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  );
};
