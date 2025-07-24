# Test Scenarios for Leasy MVP

Following Canon TDD approach - listing all test scenarios before implementation.

## 1. Mock Authentication Tests

- [x] POST /api/auth/mock-login accepts "Il Keun Lee" and returns success
- [x] Mock login creates a session token
- [x] Invalid/empty name returns 400 error
- [x] Session persists across requests
- [x] Logout clears session

## 2. Dashboard API Tests

- [x] GET /api/dashboard returns building data for logged-in user
- [x] Dashboard shows PNL building information
- [x] Dashboard calculates total monthly revenue correctly (₩27,333,581)
- [x] Dashboard shows correct tenant count (12 occupied units)
- [x] Unauthorized request returns 401 error

## 3. Tenant Data Tests

- [x] GET /api/tenants returns all PNL building tenants
- [x] Each tenant has correct unit number, name, and business number
- [x] Tenant data matches Excel sheet values exactly
- [x] Rent amounts are accurate for each unit
- [x] VAT is calculated as 10% of rent

## 4. Invoice Generation Tests

- [x] POST /api/invoices/generate accepts period and tenant list
- [x] Generated invoice contains all required fields
- [x] Invoice calculates rent + electricity + water correctly
- [x] VAT is properly calculated for each line item
- [x] Total amount matches sum of all items plus VAT
- [x] Invoice ID is generated uniquely
- [x] Multiple invoices can be generated in one request

## 5. PDF Generation Tests

- [x] GET /api/invoices/{id}/pdf returns PDF file
- [x] PDF contains all invoice data
- [x] PDF is properly formatted (mock)
- [x] Non-existent invoice ID returns 404

## 6. E2E User Flow Tests

- [ ] User can complete full flow: login → dashboard → generate → download
- [ ] Form validation shows appropriate error messages
- [ ] Loading states display during async operations
- [ ] Success messages show after invoice generation
- [ ] Navigation between pages works correctly

## 7. Data Validation Tests

- [ ] Excel data parser handles Korean characters correctly
- [ ] Number formatting handles Korean won currency
- [ ] Date formatting is consistent
- [ ] Missing data fields are handled gracefully

## 8. UI Component Tests

- [ ] Login form submits on enter key
- [ ] Dashboard cards display correct metrics
- [ ] Tenant selection checkboxes work properly
- [ ] Generate button is disabled when no tenants selected
- [ ] Download links work for generated PDFs

## 9. Mock Service Worker Tests

- [ ] MSW intercepts all API calls correctly
- [ ] Mock responses match expected data structure
- [ ] Network errors are simulated properly
- [ ] Loading states work with delayed responses

## 10. Form Validation Tests

- [ ] Period selector validates date format
- [ ] At least one tenant must be selected
- [ ] Form shows validation errors inline
- [ ] Submit is prevented with invalid data

## 11. State Management Tests

- [ ] User session state persists
- [ ] Generated invoices are stored in session
- [ ] Navigation maintains application state
- [ ] Refresh doesn't lose generated invoices

## 12. Error Handling Tests

- [ ] API errors show user-friendly messages
- [ ] Network failures are handled gracefully
- [ ] Invalid data doesn't crash the app
- [ ] Retry mechanisms work for failed requests

## 13. Performance Tests

- [ ] Page loads within 3 seconds
- [ ] Invoice generation completes within 5 seconds
- [ ] PDF generation completes within 10 seconds
- [ ] Large tenant lists render efficiently

## 14. Accessibility Tests

- [ ] All interactive elements are keyboard accessible
- [ ] ARIA labels are present and correct
- [ ] Color contrast meets WCAG standards
- [ ] Screen reader announces important updates

## 15. Responsive Design Tests

- [ ] Layout works on mobile devices
- [ ] Tables are scrollable on small screens
- [ ] Forms are usable on touch devices
- [ ] PDF download works on mobile
