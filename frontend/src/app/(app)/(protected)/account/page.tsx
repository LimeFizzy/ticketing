'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { CreditCard, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { useAuth } from '@/hooks/use-auth';
import { type PaymentCard, type User } from '@/types/user';

const emptyCard: PaymentCard = {
  cardholderName: '',
  number: '',
  expiry: '',
  cvc: '',
};

type SavedSection = 'profile' | 'card' | null;

const AccountForm = ({ user }: { user: User }) => {
  const { updateProfile } = useAuth();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);

  const [card, setCard] = useState<PaymentCard>(user.card ?? emptyCard);

  const [saved, setSaved] = useState<SavedSection>(null);

  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(() => setSaved(null), 1500);
    return () => clearTimeout(id);
  }, [saved]);

  const submitProfile = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfile({ firstName, lastName, email });
    setSaved('profile');
  };

  const submitCard = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfile({ card });
    setSaved('card');
  };

  const removeCard = () => {
    setCard(emptyCard);
    updateProfile({ card: undefined });
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-foreground">Account</h1>

      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/15">
            <UserIcon className="size-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-white/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Profile details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={submitProfile}
          >
            <FormField label="First name">
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </FormField>

            <FormField label="Last name">
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </FormField>

            <FormField label="Email" className="sm:col-span-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </FormField>

            <div className="flex items-center gap-3 sm:col-span-2">
              <Button type="submit">Save changes</Button>
              {saved === 'profile' && (
                <span className="text-sm text-muted-foreground">Saved</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass border-white/40 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="size-4 text-primary" />
            Saved card
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={submitCard}
          >
            <FormField label="Cardholder name" className="sm:col-span-2">
              <Input
                value={card.cardholderName}
                onChange={(e) =>
                  setCard({ ...card, cardholderName: e.target.value })
                }
                autoComplete="cc-name"
              />
            </FormField>

            <FormField label="Card number" className="sm:col-span-2">
              <Input
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value })}
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                autoComplete="cc-number"
              />
            </FormField>

            <FormField label="Expiry (MM/YY)">
              <Input
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                placeholder="08/29"
                autoComplete="cc-exp"
              />
            </FormField>

            <FormField label="CVC">
              <Input
                value={card.cvc}
                onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                inputMode="numeric"
                placeholder="123"
                autoComplete="cc-csc"
              />
            </FormField>

            <div className="flex items-center gap-3 sm:col-span-2">
              <Button type="submit">Save card</Button>
              {user.card && (
                <Button type="button" variant="ghost" onClick={removeCard}>
                  Remove card
                </Button>
              )}
              {saved === 'card' && (
                <span className="text-sm text-muted-foreground">Saved</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const AccountPage = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <AccountForm key={user.id} user={user} />;
};

export default AccountPage;
