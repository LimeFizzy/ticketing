import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { PromoCodeDto } from '@/lib/api/types.gen';
import { formatCurrencyEur } from '@/lib/formatters';

interface Props {
  codes: PromoCodeDto[];
}

const isExpired = (code: PromoCodeDto) =>
  !!code.expiresAt && new Date(code.expiresAt) < new Date();

const formatDiscount = (code: PromoCodeDto) =>
  code.discountType === 'percentage'
    ? `${code.discountValue}%`
    : formatCurrencyEur(code.discountValue);

export const PromoCodesCard = ({ codes }: Props) => (
  <Card className="glass border-white/40 shadow-sm">
    <CardContent className="flex flex-col gap-4 p-5">
      <h2 className="text-base font-semibold text-foreground">Promo Codes</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">Code</th>
              <th className="pb-2 pr-4 font-medium">Discount</th>
              <th className="pb-2 pr-4 text-right font-medium">Uses / Max</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {codes.map((code) => {
              const expired = isExpired(code);
              const active = code.isActive && !expired;
              return (
                <tr key={code.id}>
                  <td className="py-3 pr-4 font-mono font-medium text-foreground">
                    {code.code}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {formatDiscount(code)}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                    {code.currentUses}
                    {code.maxUses != null ? ` / ${code.maxUses}` : ' / ∞'}
                  </td>
                  <td className="py-3">
                    <Badge variant={active ? 'default' : 'secondary'}>
                      {expired ? 'Expired' : active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);
