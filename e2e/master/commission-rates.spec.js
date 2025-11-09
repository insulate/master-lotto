const { test, expect } = require('@playwright/test');

test.describe('Master - Commission Rates Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Master
    await page.goto('/login');
    await page.fill('input[name="username"]', 'master');
    await page.fill('input[name="password"]', 'master123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/master/dashboard');

    // Navigate to agents page
    await page.goto('/master/agents');
    await expect(page.getByRole('heading', { name: 'จัดการเอเย่นต์', level: 1 })).toBeVisible();
  });

  test('should navigate to commission rates page successfully', async ({ page }) => {
    // Click commission button for the first agent (Percent icon button, 2nd button in actions)
    await page.locator('tbody tr').first().locator('button').nth(1).click();

    // Wait for navigation to commission page
    await page.waitForURL('**/master/agents/*/commission');

    // Verify page title
    await expect(page.getByRole('heading', { name: 'จัดการค่าคอมมิชชัน', level: 1 })).toBeVisible();

    // Verify agent info is displayed
    await expect(page.locator('text=Username')).toBeVisible();
    await expect(page.locator('text=ชื่อ-นามสกุล')).toBeVisible();
    await expect(page.locator('text=สถานะ')).toBeVisible();
  });

  test('should display all lottery types correctly', async ({ page }) => {
    // Navigate to commission page
    await page.locator('tbody tr').first().locator('button').nth(1).click();
    await page.waitForURL('**/master/agents/*/commission');

    // Verify all 4 lottery types are displayed
    await expect(page.locator('text=หวยรัฐบาล')).toBeVisible();
    await expect(page.locator('text=หวยลาวพัฒนา')).toBeVisible();
    await expect(page.locator('text=หวยฮานอยปกติ')).toBeVisible();
    await expect(page.locator('text=หวยฮานอย VIP')).toBeVisible();
  });

  test('should expand and collapse lottery type accordion', async ({ page }) => {
    // Navigate to commission page
    await page.locator('tbody tr').first().locator('button').nth(1).click();
    await page.waitForURL('**/master/agents/*/commission');

    // Wait for page to load completely
    await page.waitForTimeout(1000);

    // Get all accordion buttons (there should be 4 lottery types)
    const accordionButtons = page.locator('button[type="button"]').filter({ hasText: 'หวย' });

    // The first accordion should be auto-expanded, verify input fields are visible
    await expect(page.locator('label:has-text("3 ตัวบน")').first()).toBeVisible();
    await expect(page.locator('label:has-text("3 ตัวโต๊ด")').first()).toBeVisible();
    await expect(page.locator('label:has-text("2 ตัวบน")').first()).toBeVisible();
    await expect(page.locator('label:has-text("2 ตัวล่าง")').first()).toBeVisible();
    await expect(page.locator('label:has-text("วิ่งบน")').first()).toBeVisible();
    await expect(page.locator('label:has-text("วิ่งล่าง")').first()).toBeVisible();

    // Click first accordion to collapse
    await accordionButtons.first().click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Input fields should be hidden
    await expect(page.locator('label:has-text("3 ตัวบน")').first()).not.toBeVisible();

    // Click again to expand
    await accordionButtons.first().click();
    await page.waitForTimeout(500);

    // Input fields should be visible again
    await expect(page.locator('label:has-text("3 ตัวบน")').first()).toBeVisible();
  });

  test('should set commission rates successfully', async ({ page }) => {
    // Navigate to commission page
    await page.locator('tbody tr').first().locator('button').nth(1).click();
    await page.waitForURL('**/master/agents/*/commission');

    // Wait for page to load completely (first accordion is auto-expanded)
    await page.waitForTimeout(1000);

    // Verify inputs are visible (first lottery type is auto-expanded)
    await expect(page.locator('label:has-text("3 ตัวบน")').first()).toBeVisible();

    // Find all number inputs - should be 6 inputs visible
    const inputs = page.locator('input[type="number"]');

    // Set commission rates (values between 0-100)
    const rates = ['10', '15', '20', '25', '5', '8'];

    for (let i = 0; i < 6; i++) {
      await inputs.nth(i).fill(rates[i]);
    }

    // Scroll down to see submit button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Click submit button
    const submitButton = page.getByRole('button', { name: 'บันทึกค่าคอมมิชชัน' });
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for success and redirect (increase timeout)
    await page.waitForURL('**/master/agents', { timeout: 15000 });

    // Verify we're back at agents page
    await expect(page.getByRole('heading', { name: 'จัดการเอเย่นต์', level: 1 })).toBeVisible();
  });

  test('should set commission rates with decimal values', async ({ page }) => {
    // Navigate to commission page
    await page.locator('tbody tr').first().locator('button').nth(1).click();
    await page.waitForURL('**/master/agents/*/commission');

    // Wait for page to load (first accordion is auto-expanded)
    await page.waitForTimeout(1000);

    // Find first input and set decimal value
    const firstInput = page.locator('input[type="number"]').first();
    await firstInput.fill('10.5');

    // Submit
    await page.getByRole('button', { name: 'บันทึกค่าคอมมิชชัน' }).click();

    // Wait for success and redirect
    await page.waitForURL('**/master/agents', { timeout: 10000 });
  });

  test('should set boundary values (0 and 100)', async ({ page }) => {
    // Navigate to commission page
    await page.locator('tbody tr').first().locator('button').nth(1).click();
    await page.waitForURL('**/master/agents/*/commission');

    // Wait for page to load (first accordion is auto-expanded)
    await page.waitForTimeout(1000);

    const inputs = page.locator('input[type="number"]');

    // Set first input to minimum (0)
    await inputs.nth(0).fill('0');

    // Set second input to maximum (100)
    await inputs.nth(1).fill('100');

    // Submit
    await page.getByRole('button', { name: 'บันทึกค่าคอมมิชชัน' }).click();

    // Wait for success and redirect
    await page.waitForURL('**/master/agents', { timeout: 10000 });
  });

  test('should set commission rates for multiple lottery types', async ({ page }) => {
    // Navigate to commission page
    await page.locator('tbody tr').first().locator('button').nth(1).click();
    await page.waitForURL('**/master/agents/*/commission');

    // Wait for page to load (first accordion is auto-expanded)
    await page.waitForTimeout(1000);

    // Set first input for first lottery type (auto-expanded)
    await page.locator('input[type="number"]').nth(0).fill('10');

    // Get all accordion buttons
    const accordionButtons = page.locator('button[type="button"]').filter({ hasText: 'หวย' });

    // Collapse first lottery type
    await accordionButtons.nth(0).click();
    await page.waitForTimeout(500);

    // Expand second lottery type
    await accordionButtons.nth(1).click();
    await page.waitForTimeout(500);

    // Set first input for second lottery type
    const visibleInputs = page.locator('input[type="number"]:visible');
    await visibleInputs.first().fill('15');

    // Submit
    await page.getByRole('button', { name: 'บันทึกค่าคอมมิชชัน' }).click();

    // Wait for success and redirect
    await page.waitForURL('**/master/agents', { timeout: 10000 });
  });

  test('should cancel commission rate changes', async ({ page }) => {
    // Navigate to commission page
    await page.locator('tbody tr').first().locator('button').nth(1).click();
    await page.waitForURL('**/master/agents/*/commission');

    // Wait for page to load (first accordion is auto-expanded)
    await page.waitForTimeout(1000);

    // Make some changes
    await page.locator('input[type="number"]').first().fill('50');

    // Click cancel button
    await page.getByRole('button', { name: 'ยกเลิก' }).click();

    // Verify redirect back to agents page
    await page.waitForURL('**/master/agents');
    await expect(page.getByRole('heading', { name: 'จัดการเอเย่นต์', level: 1 })).toBeVisible();
  });

  test('should navigate back to agents page via sidebar', async ({ page }) => {
    // Navigate to commission page
    await page.locator('tbody tr').first().locator('button').nth(1).click();
    await page.waitForURL('**/master/agents/*/commission');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Click "จัดการเอเย่นต์" in sidebar to go back
    await page.locator('a:has-text("จัดการเอเย่นต์")').click();

    // Verify redirect back to agents page
    await page.waitForURL('**/master/agents');
    await expect(page.getByRole('heading', { name: 'จัดการเอเย่นต์', level: 1 })).toBeVisible();
  });

  test('should verify commission rates are saved via API', async ({ page }) => {
    // Get token for API calls
    const token = await page.evaluate(() => localStorage.getItem('access_token'));

    // Get first agent ID
    const agentsResponse = await page.request.get('http://localhost:3000/api/v1/master/agents', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const agentsData = await agentsResponse.json();

    if (agentsData.success && agentsData.data && agentsData.data.agents && agentsData.data.agents.length > 0) {
      const firstAgent = agentsData.data.agents[0];
      const agentId = firstAgent._id;

      // Navigate to commission page
      await page.goto(`/master/agents/${agentId}/commission`);

      // Wait for page to load (first accordion is auto-expanded)
      await page.waitForTimeout(1000);

      // Set specific rates
      const testRate = '12.5';
      await page.locator('input[type="number"]').first().fill(testRate);

      // Submit
      await page.getByRole('button', { name: 'บันทึกค่าคอมมิชชัน' }).click();

      // Wait for success
      await page.waitForURL('**/master/agents', { timeout: 10000 });

      // Verify via API
      const updatedAgentResponse = await page.request.get(`http://localhost:3000/api/v1/master/agents/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedAgentData = await updatedAgentResponse.json();

      // Check commission_rates structure
      expect(updatedAgentData.success).toBe(true);
      expect(updatedAgentData.data.agent.commission_rates).toBeDefined();
      expect(Array.isArray(updatedAgentData.data.agent.commission_rates)).toBe(true);

      // Find government lottery type rates
      const governmentRates = updatedAgentData.data.agent.commission_rates.find(
        rate => rate.lottery_type === 'government'
      );

      if (governmentRates) {
        // Verify the rate we set
        expect(governmentRates.rates.three_top).toBe(parseFloat(testRate));
      }
    }
  });
});
