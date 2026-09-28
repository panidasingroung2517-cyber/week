# Security Specification for Chot Thean Bookstore

## Data Invariants
1. A book cannot be created or modified by unauthenticated users or customers; only Admins or Staff can manage books.
2. Order creation requires authentication, valid items, and matching userId. A customer can only update their own order to cancel if it is still pending.
3. Reviews can only be written by authenticated users with their own userId and valid rating between 1 and 5.
4. Coupons can only be read by authenticated users, but modified only by Admins.
5. User profile PII can only be read/updated by the user itself or an Admin.
6. Admins collection is readable only by admins, and bootstrap includes `panidasingroung2517@gmail.com`.

## The "Dirty Dozen" Payloads
1. **Unauthenticated Book Creation**: Anonymous user attempts to write a book record to `/books/malicious-book`.
2. **Customer Admin Escalation**: A customer attempts to write `{ role: 'admin' }` to `/users/{userId}` or `/admins/{userId}`.
3. **Ghost Field Injection in Book**: Admin or attacker sends extra payload `{ isSpecialHacker: true }` in `/books/book-1`.
4. **Order User Spoofing**: User A creates an order with `userId: 'user-b'`.
5. **Order Price Tampering on Update**: Customer modifies an existing order's `total` from 1500 to 10 baht.
6. **Review Impersonation**: Attacker submits review under someone else's `userId`.
7. **Negative or 10-Star Rating Poisoning**: Submitting a review with `rating: 99` or `rating: -1`.
8. **Malicious Giant ID Poisoning**: Trying to write document with 2000-character junk ID string.
9. **Coupon Manipulation**: Regular customer updates coupon discount percentage to 100%.
10. **Other User PII Snooping**: User A queries `/users/{userB}` private profile.
11. **Order Status Skip by Customer**: Regular customer attempts to update their own order status to `delivered`.
12. **System Notification Forgery**: Customer writes arbitrary notification into another customer's notifications collection.
