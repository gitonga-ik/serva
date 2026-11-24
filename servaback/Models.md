# Tenant Management System (TMS) — Database Schema

> **Note:** Standard metadata fields (`id`, `created_at`, `updated_at`, `deleted_at`) are assumed for all tables.

---

## 1. Property & Asset Management
These models represent the physical real estate you are managing.

### `Property` (Building / Complex)
* **`name`**: `String` — e.g., `"Oakwood Apartments"`
* **`property_type`**: `Enum` — `single_family`, `multi_family`, `commercial`, `mixed_use`
* **`address_line_1`**, **`address_line_2`**, **`city`**, **`state_province`**, **`postal_code`**, **`country`**: `Strings`
* **`owner_id`**: `Foreign Key -> User` — Links to an Owner/Landlord user if managing for third parties
* **`amenities`**: `JSON / Array` — e.g., `["pool", "gym", "parking"]`

### `Unit` (Apartment / Suite / Room)
* **`property_id`**: `Foreign Key -> Property`
* **`unit_number`**: `String` — e.g., `"Apt 4B"`
* **`floor`**: `Integer`
* **`bedrooms`**: `Decimal` — Supports `0` for studio, `1.5`, etc.
* **`bathrooms`**: `Decimal`
* **`square_footage`**: `Integer`
* **`market_rent`**: `Decimal` — Baseline asking price
* **`status`**: `Enum` — `vacant`, `occupied`, `maintenance`, `reserved`

---

## 2. People & Access
Separating authentication/identity from role-specific data keeps your schema clean, especially if a single person is both a landlord for one property and a tenant in another.

### `User` (Core Identity)
* **`first_name`**, **`last_name`**: `Strings`
* **`email`**: `String` (Unique)
* **`phone_number`**: `String`
* **`password_hash`**: `String`
* **`role`**: `Enum` — `admin`, `property_manager`, `landlord`, `tenant`, `vendor`
* **`is_active`**: `Boolean`

### `TenantProfile` (Extended Tenant Details)
* **`user_id`**: `Foreign Key -> User`
* **`date_of_birth`**: `Date`
* **`government_id_number`**: `String` — Encrypted, for background/credit checks
* **`employer_name`**, **`job_title`**: `Strings`
* **`monthly_income`**: `Decimal`
* **`emergency_contact_name`**, **`emergency_contact_phone`**, **`emergency_contact_relationship`**: `Strings`
* **`vehicles`**: `JSON` — License plate, make/model
* **`pets`**: `JSON` — Type, breed, weight

---

## 3. Leasing & Occupancy
This is the glue connecting `TenantProfile` to `Unit`. Because multiple roommates can sign one lease, a junction table is required.

### `Lease`
* **`unit_id`**: `Foreign Key -> Unit`
* **`start_date`**: `Date`
* **`end_date`**: `Date` — Nullable for month-to-month leases
* **`lease_type`**: `Enum` — `fixed_term`, `month_to_month`
* **`rent_amount`**: `Decimal` — Actual agreed-upon rent
* **`rent_due_day`**: `Integer` — e.g., `1` for the 1st of the month
* **`security_deposit_amount`**: `Decimal`
* **`security_deposit_status`**: `Enum` — `unpaid`, `held`, `partially_refunded`, `refunded`
* **`late_fee_amount`**: `Decimal`
* **`late_fee_grace_period_days`**: `Integer`
* **`status`**: `Enum` — `draft`, `pending_signature`, `active`, `expired`, `terminated`
* **`signed_document_url`**: `String`

### `LeaseTenant` (Junction Table)
* **`lease_id`**: `Foreign Key -> Lease`
* **`tenant_id`**: `Foreign Key -> TenantProfile`
* **`is_primary`**: `Boolean` — Designates the main point of contact
* **`occupant_type`**: `Enum` — `lease_holder`, `co_signer`, `minor_occupant`
* **`move_in_date`**, **`move_out_date`**: `Dates`

---

## 4. Financials & Billing
Avoid storing `"current balance"` as a static column on a tenant; instead, derive it from **Invoices (Charges)** and **Payments (Credits)** to maintain an auditable ledger.

### `Invoice` / `Charge`
* **`lease_id`**: `Foreign Key -> Lease`
* **`charge_type`**: `Enum` — `rent`, `security_deposit`, `late_fee`, `utility`, `maintenance_reimbursement`
* **`description`**: `String` — e.g., `"October 2026 Rent"`
* **`amount`**: `Decimal`
* **`due_date`**: `Date`
* **`status`**: `Enum` — `draft`, `open`, `partially_paid`, `paid`, `void`

### `Payment`
* **`lease_id`**: `Foreign Key -> Lease`
* **`invoice_id`**: `Foreign Key -> Invoice` — Nullable if applying to a general balance
* **`amount`**: `Decimal`
* **`payment_date`**: `Timestamp`
* **`payment_method`**: `Enum` — `ach`, `credit_card`, `mobile_money`, `bank_transfer`, `cash`, `check`
* **`transaction_reference`**: `String` — ID from Stripe, M-Pesa, bank, etc.
* **`status`**: `Enum` — `pending`, `completed`, `failed`, `refunded`

---

## 5. Maintenance & Operations
Tracks ongoing upkeep and vendor assignments.

### `MaintenanceRequest`
* **`property_id`**: `Foreign Key -> Property`
* **`unit_id`**: `Foreign Key -> Unit` — Nullable if issue is in a common area like the lobby
* **`reported_by_user_id`**: `Foreign Key -> User`
* **`assigned_to_user_id`**: `Foreign Key -> User` — Staff or external vendor
* **`title`**: `String`
* **`description`**: `Text`
* **`category`**: `Enum` — `plumbing`, `electrical`, `hvac`, `appliance`, `structural`, `other`
* **`priority`**: `Enum` — `low`, `medium`, `high`, `emergency`
* **`status`**: `Enum` — `open`, `in_progress`, `awaiting_parts`, `resolved`, `closed`
* **`permission_to_enter`**: `Boolean` — Can staff enter if tenant isn't home?
* **`estimated_cost`**, **`actual_cost`**: `Decimals`
* **`resolved_at`**: `Timestamp`

---

## 6. Supporting Utility Models (Recommended)
As your system grows, these two polymorphic/reusable models save a lot of refactoring:

### `Document` / `Attachment`
Attach photos of broken pipes to a `MaintenanceRequest`, ID scans to a `TenantProfile`, or PDFs to a `Lease`.
* **`entity_type`**: `String` — e.g., `"Lease"`, `"MaintenanceRequest"`
* **`entity_id`**: `UUID` / `Integer`
* **`file_url`**: `String`
* **`file_name`**: `String`
* **`document_type`**: `Enum` — `lease_agreement`, `id_proof`, `inspection_photo`, `receipt`

### `Communication` / `ActivityLog`
Keeps an audit trail of automated rent reminders, lease renewal notices, and maintenance comments.
* **`entity_type`**: `String`
* **`entity_id`**: `UUID` / `Integer`
* **`sender_id`**: `Foreign Key -> User`
* **`channel`**: `Enum` — `in_app`, `email`, `sms`
* **`body`**: `Text`

---

## Architectural Tips
* **Use `Decimal` for all currency fields:** Never use `Float` for money (`rent_amount`, `amount`, etc.) to avoid floating-point rounding errors.
* **Soft Deletes:** Use a `deleted_at` timestamp rather than hard-deleting records. If a tenant moves out or a unit is retired, you still need their historical invoices and leases for tax and legal audits.
* **Multi-tenancy (SaaS):** If you plan to sell this software to multiple property management companies, add an `organization_id` (or `workspace_id`) to `Property`, `User`, and `Lease` to isolate each company's data.