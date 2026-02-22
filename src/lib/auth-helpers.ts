import type { ActiveCustomer } from '@/contexts/auth-context';

const ALEXIS_USERNAME = 'alexis';
const ALEXIS_EMAIL = 'alexis@local.com';

export function isAlexisCustomer(customer: ActiveCustomer | null): boolean {
  if (!customer) {
    return false;
  }

  const username = customer.username.trim().toLowerCase();
  const email = customer.emailAddress.trim().toLowerCase();

  return username === ALEXIS_USERNAME || email === ALEXIS_EMAIL;
}
