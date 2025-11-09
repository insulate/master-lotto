const { test, expect } = require('@playwright/test');

test.describe('Master - Lottery Types Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Master
    await page.goto('/login');
    await page.fill('input[name="username"]', 'master');
    await page.fill('input[name="password"]', 'master123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/master/dashboard');

    // Navigate to lottery types page
    await page.goto('/master/lottery-types');
    await expect(page.getByRole('heading', { name: 'จัดการหวย', level: 1 })).toBeVisible();
  });

  test('should navigate to lottery types page successfully', async ({ page }) => {
    // Verify page title
    await expect(page.getByRole('heading', { name: 'จัดการหวย', level: 1 })).toBeVisible();

    // Verify subtitle showing master info
    await expect(page.locator('text=Master:')).toBeVisible();
  });

  test('should display summary cards correctly', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Verify all 4 summary cards are displayed (using .first() to get the card, not table header)
    await expect(page.locator('text=ประเภทหวยทั้งหมด').first()).toBeVisible();
    await expect(page.locator('text=งวดที่เปิดรับแทง').first()).toBeVisible();
    await expect(page.locator('text=งวดที่ปิดรับแทง').first()).toBeVisible();
    await expect(page.locator('text=งวดทั้งหมด').first()).toBeVisible();

    // Verify lottery types count is 4
    const typesCountText = await page.locator('text=ประเภทหวยทั้งหมด').locator('..').locator('.text-2xl').textContent();
    expect(typesCountText.trim()).toBe('4');
  });

  test('should display all lottery types in table', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Verify all 4 lottery types are displayed (use more specific selectors)
    await expect(page.locator('.font-semibold.text-lg:has-text("หวยรัฐบาล")')).toBeVisible();
    await expect(page.locator('.font-semibold.text-lg:has-text("หวยลาวพัฒนา")')).toBeVisible();
    await expect(page.locator('.font-semibold.text-lg:has-text("หวยฮานอยปกติ")')).toBeVisible();
    await expect(page.locator('.font-semibold.text-lg:has-text("หวยฮานอย VIP")')).toBeVisible();

    // Verify table headers
    await expect(page.locator('th:has-text("ประเภทหวย")').first()).toBeVisible();
    await expect(page.locator('th:has-text("งวดทั้งหมด")').first()).toBeVisible();
    await expect(page.locator('th:has-text("เปิดรับแทง")').first()).toBeVisible();
    await expect(page.locator('th:has-text("ปิดรับแทง")').first()).toBeVisible();
    await expect(page.locator('th:has-text("ประกาศผลแล้ว")').first()).toBeVisible();
    await expect(page.locator('th:has-text("สถานะ")').first()).toBeVisible();
    await expect(page.locator('th:has-text("จัดการ")').first()).toBeVisible();
  });

  test('should display lottery type icons and descriptions', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for emoji icons (government lottery)
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();

    // Verify description is displayed (smaller text under lottery name)
    const descriptions = page.locator('.text-xs.text-gray-500');
    const count = await descriptions.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should disable a lottery type successfully', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Find first enabled lottery type
    const firstRow = page.locator('tbody tr').first();
    const statusBadge = firstRow.locator('text=เปิดใช้งาน');

    // Check if it's enabled, if not, skip this test scenario
    const isEnabled = await statusBadge.isVisible().catch(() => false);

    if (isEnabled) {
      // Click disable button (ปิดใช้งาน - red button)
      await firstRow.locator('button:has-text("ปิดใช้งาน")').click();

      // Verify confirmation dialog appears
      await expect(page.locator('text=ยืนยันการปิดใช้งาน')).toBeVisible();
      await expect(page.locator('text=คุณต้องการปิดใช้งาน')).toBeVisible();

      // Confirm action
      await page.getByRole('button', { name: 'ยืนยัน' }).click();

      // Wait for success (dialog should close)
      await expect(page.locator('text=ยืนยันการปิดใช้งาน')).not.toBeVisible({ timeout: 10000 });

      // Wait for table to refresh
      await page.waitForTimeout(1000);
    }
  });

  test('should enable a lottery type successfully', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // First, disable a lottery type to have something to enable
    const firstRow = page.locator('tbody tr').first();
    const enabledBadge = firstRow.locator('text=เปิดใช้งาน');
    const isEnabled = await enabledBadge.isVisible().catch(() => false);

    if (isEnabled) {
      // Disable it first
      await firstRow.locator('button:has-text("ปิดใช้งาน")').click();
      await expect(page.locator('text=ยืนยันการปิดใช้งาน')).toBeVisible();
      await page.getByRole('button', { name: 'ยืนยัน' }).click();
      await expect(page.locator('text=ยืนยันการปิดใช้งาน')).not.toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(1000);
    }

    // Now enable it
    await firstRow.locator('button:has-text("เปิดใช้งาน")').click();

    // Verify confirmation dialog appears
    await expect(page.locator('text=ยืนยันการเปิดใช้งาน')).toBeVisible();
    await expect(page.locator('text=คุณต้องการเปิดใช้งาน')).toBeVisible();

    // Confirm action
    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    // Wait for success (dialog should close)
    await expect(page.locator('text=ยืนยันการเปิดใช้งาน')).not.toBeVisible({ timeout: 10000 });
  });

  test('should cancel status change', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Click toggle status button (either enable or disable)
    const firstRow = page.locator('tbody tr').first();
    const toggleButton = firstRow.locator('button').last();
    await toggleButton.click();

    // Verify confirmation dialog appears
    const hasDisableDialog = await page.locator('text=ยืนยันการปิดใช้งาน').isVisible().catch(() => false);
    const hasEnableDialog = await page.locator('text=ยืนยันการเปิดใช้งาน').isVisible().catch(() => false);
    expect(hasDisableDialog || hasEnableDialog).toBeTruthy();

    // Cancel action
    await page.getByRole('button', { name: 'ยกเลิก' }).click();

    // Verify dialog closes
    await expect(page.locator('text=ยืนยันการปิดใช้งาน')).not.toBeVisible();
    await expect(page.locator('text=ยืนยันการเปิดใช้งาน')).not.toBeVisible();
  });

  test('should navigate to lottery draws page from lottery type', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Click "จัดการงวดหวย" button for first lottery type
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('button:has-text("จัดการงวดหวย")').click();

    // Verify navigation to lottery draws page with query param
    await page.waitForURL('**/master/lottery-draws?type=*');

    // Verify we're on lottery draws page
    await expect(page.getByRole('heading', { name: 'จัดการงวดหวย', level: 1 })).toBeVisible();
  });

  test('should verify lottery type status change via API', async ({ page }) => {
    // Get token for API calls
    const token = await page.evaluate(() => localStorage.getItem('access_token'));

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Get all lottery types
    const typesResponse = await page.request.get('http://localhost:3000/api/v1/master/lottery-types', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const typesData = await typesResponse.json();

    if (typesData.success && typesData.data && typesData.data.lotteryTypes && typesData.data.lotteryTypes.length > 0) {
      const firstType = typesData.data.lotteryTypes[0];
      const originalStatus = firstType.enabled;

      // Find the row for this lottery type
      const firstRow = page.locator('tbody tr').first();

      // Toggle status
      if (originalStatus) {
        // Disable it
        await firstRow.locator('button:has-text("ปิดใช้งาน")').click();
        await expect(page.locator('text=ยืนยันการปิดใช้งาน')).toBeVisible();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        await expect(page.locator('text=ยืนยันการปิดใช้งาน')).not.toBeVisible({ timeout: 10000 });
      } else {
        // Enable it
        await firstRow.locator('button:has-text("เปิดใช้งาน")').click();
        await expect(page.locator('text=ยืนยันการเปิดใช้งาน')).toBeVisible();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        await expect(page.locator('text=ยืนยันการเปิดใช้งาน')).not.toBeVisible({ timeout: 10000 });
      }

      // Wait for update
      await page.waitForTimeout(1000);

      // Verify via API
      const updatedTypesResponse = await page.request.get('http://localhost:3000/api/v1/master/lottery-types', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedTypesData = await updatedTypesResponse.json();

      // Find the same lottery type
      const updatedType = updatedTypesData.data.lotteryTypes.find(t => t._id === firstType._id);

      // Verify status was toggled
      expect(updatedType.enabled).toBe(!originalStatus);
    }
  });

  test('should navigate to lottery types page via sidebar', async ({ page }) => {
    // Navigate away from lottery types page
    await page.goto('/master/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();

    // Click "จัดการหวย" in sidebar
    await page.locator('a:has-text("จัดการหวย")').click();

    // Verify navigation to lottery types page
    await page.waitForURL('**/master/lottery-types');
    await expect(page.getByRole('heading', { name: 'จัดการหวย', level: 1 })).toBeVisible();
  });
});
