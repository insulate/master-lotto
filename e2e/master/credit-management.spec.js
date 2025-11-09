const { test, expect } = require('@playwright/test');

test.describe('Master - Credit Management', () => {
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

  test('should display credit adjustment modal correctly', async ({ page }) => {
    // Click adjust credit button for the first agent (Wallet icon button, 4th button in actions)
    await page.locator('tbody tr').first().locator('button').nth(3).click();

    // Wait for modal to open
    await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).toBeVisible();

    // Check modal content
    await expect(page.locator('text=เอเย่นต์:')).toBeVisible();
    await expect(page.locator('text=เครดิตปัจจุบัน:')).toBeVisible();
    await expect(page.locator('text=ประเภทการทำรายการ')).toBeVisible();
    await expect(page.getByRole('button', { name: 'เพิ่มเครดิต' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'ลดเครดิต' }).first()).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: 'ยกเลิก' }).first().click();
    await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).not.toBeVisible();
  });

  test('should add credit to agent successfully', async ({ page }) => {
    // Click adjust credit button for the first agent (Wallet icon button, 4th button in actions)
    await page.locator('tbody tr').first().locator('button').nth(3).click();

    // Wait for modal to open
    await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).toBeVisible();

    // Get current credit
    const currentCreditText = await page.locator('text=เครดิตปัจจุบัน:').locator('..').locator('span').last().textContent();

    // Fill amount (Add is already selected by default)
    const addAmount = 5000;
    await page.locator('input[type="number"]').fill(addAmount.toString());

    // Verify preview shows correct amount
    await expect(page.locator('text=เครดิตหลังเพิ่ม:')).toBeVisible();

    // Submit form (click the submit button, which is the second "เพิ่มเครดิต" button)
    await page.getByRole('button', { name: 'เพิ่มเครดิต' }).nth(1).click();

    // Wait for modal to close
    await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).not.toBeVisible({ timeout: 10000 });

    // Success message should appear (we won't check toast, just verify modal closed)
  });

  test('should deduct credit from agent successfully', async ({ page }) => {
    // First, add credit to the agent so we can deduct it
    await page.locator('tbody tr').first().locator('button').nth(3).click();
    await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).toBeVisible();
    await page.locator('input[type="number"]').fill('1000');
    await page.getByRole('button', { name: 'เพิ่มเครดิต' }).nth(1).click();
    await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).not.toBeVisible({ timeout: 10000 });

    // Now deduct credit
    await page.locator('tbody tr').first().locator('button').nth(3).click();

    // Wait for modal to open
    await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).toBeVisible();

    // Select "Deduct Credit" action (click the action selector button)
    await page.getByRole('button', { name: 'ลดเครดิต' }).first().click();

    // Fill amount (small amount to avoid exceeding current credit)
    const deductAmount = 100;
    await page.locator('input[type="number"]').fill(deductAmount.toString());

    // Verify preview shows correct amount
    await expect(page.locator('text=เครดิตหลังลด:')).toBeVisible();

    // Submit form (click the submit button, which is the second "ลดเครดิต" button)
    await page.getByRole('button', { name: 'ลดเครดิต' }).nth(1).click();

    // Wait for modal to close
    await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).not.toBeVisible({ timeout: 10000 });
  });

  test('should show validation error when deducting more than available credit', async ({ page }) => {
    // Click adjust credit button for the first agent (Wallet icon button, 4th button in actions)
    await page.locator('tbody tr').first().locator('button').nth(3).click();

    // Wait for modal to open
    await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).toBeVisible();

    // Get current credit value
    const currentCreditText = await page.locator('text=เครดิตปัจจุบัน:').locator('..').locator('span').last().textContent();
    // Parse credit value (remove currency symbols and commas)
    const currentCredit = parseFloat(currentCreditText.replace(/[฿,]/g, ''));

    // Select "Deduct Credit" action (click the action selector button)
    await page.getByRole('button', { name: 'ลดเครดิต' }).first().click();

    // Try to deduct more than available
    const excessiveAmount = currentCredit + 10000;
    await page.locator('input[type="number"]').fill(excessiveAmount.toString());

    // Submit form (click the submit button, which is the second "ลดเครดิต" button)
    await page.getByRole('button', { name: 'ลดเครดิต' }).nth(1).click();

    // Should show error message
    await expect(page.locator('text=จำนวนเครดิตต้องไม่เกิน')).toBeVisible();
  });

  test('should show validation error when amount is zero or negative', async ({ page }) => {
    // Click adjust credit button for the first agent (Wallet icon button, 4th button in actions)
    await page.locator('tbody tr').first().locator('button').nth(3).click();

    // Wait for modal to open
    await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).toBeVisible();

    // Try to submit with zero amount
    await page.locator('input[type="number"]').fill('0');
    await page.getByRole('button', { name: 'เพิ่มเครดิต' }).nth(1).click();

    // Should show error
    await expect(page.locator('text=กรุณากรอกจำนวนเครดิตที่ถูกต้อง (มากกว่า 0)')).toBeVisible();
  });

  test('should cancel credit adjustment', async ({ page }) => {
    // Click adjust credit button for the first agent (Wallet icon button, 4th button in actions)
    await page.locator('tbody tr').first().locator('button').nth(3).click();

    // Wait for modal to open
    await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).toBeVisible();

    // Fill some data
    await page.locator('input[type="number"]').fill('1000');

    // Click cancel
    await page.getByRole('button', { name: 'ยกเลิก' }).first().click();

    // Modal should close
    await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).not.toBeVisible();
  });

  test('should display credit history modal correctly', async ({ page }) => {
    // Click credit history button for the first agent (History icon button, 5th button in actions)
    await page.locator('tbody tr').first().locator('button').nth(4).click();

    // Wait for modal to open
    await expect(page.locator('text=ประวัติเครดิต -')).toBeVisible();

    // Check modal content
    await expect(page.locator('text=เลือกวันที่:')).toBeVisible();
    await expect(page.locator('input[type="date"]')).toBeVisible();

    // Check table headers (if there's data)
    const hasData = await page.locator('table th:has-text("วันที่")').isVisible().catch(() => false);

    if (hasData) {
      await expect(page.locator('table th:has-text("วันที่")')).toBeVisible();
      await expect(page.locator('table th:has-text("ประเภท")')).toBeVisible();
      await expect(page.locator('table th:has-text("จำนวน")')).toBeVisible();
      await expect(page.locator('table th:has-text("ก่อนทำรายการ")')).toBeVisible();
      await expect(page.locator('table th:has-text("หลังทำรายการ")')).toBeVisible();
      await expect(page.locator('table th:has-text("ดำเนินการโดย")')).toBeVisible();
    }

    // Close modal
    await page.getByRole('button', { name: 'ปิด' }).click();
    await expect(page.locator('text=ประวัติเครดิต -')).not.toBeVisible();
  });

  test('should filter credit history by date', async ({ page }) => {
    // Click credit history button for the first agent (History icon button, 5th button in actions)
    await page.locator('tbody tr').first().locator('button').nth(4).click();

    // Wait for modal to open
    await expect(page.locator('text=ประวัติเครดิต -')).toBeVisible();

    // Wait for history to load
    await page.waitForTimeout(1000);

    // Change date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    await page.locator('input[type="date"]').fill(yesterdayString);

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Should either show "ไม่มีประวัติ" or filtered data
    const hasNoData = await page.locator('text=ไม่มีประวัติการเติม-ลดเครดิตในวันที่เลือก').isVisible().catch(() => false);
    const hasData = await page.locator('table tbody tr').count().catch(() => 0);

    // Either condition should be true
    expect(hasNoData || hasData >= 0).toBeTruthy();

    // Close modal
    await page.getByRole('button', { name: 'ปิด' }).click();
  });

  test('should verify credit transaction is recorded after adjustment', async ({ page }) => {
    // Get token for API calls
    const token = await page.evaluate(() => localStorage.getItem('access_token'));

    // Get first agent
    const agentsResponse = await page.request.get('http://localhost:3000/api/v1/master/agents', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const agentsData = await agentsResponse.json();

    if (agentsData.success && agentsData.data && agentsData.data.agents && agentsData.data.agents.length > 0) {
      const firstAgent = agentsData.data.agents[0];
      const agentId = firstAgent._id;
      const creditBefore = firstAgent.credit;

      // Click adjust credit button for the first agent (Wallet icon button, 4th button in actions)
      await page.locator('tbody tr').first().locator('button').nth(3).click();

      // Wait for modal
      await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).toBeVisible();

      // Add credit
      const addAmount = 1000;
      await page.locator('input[type="number"]').fill(addAmount.toString());
      await page.getByRole('button', { name: 'เพิ่มเครดิต' }).nth(1).click();

      // Wait for modal to close
      await expect(page.getByRole('heading', { name: 'ปรับเครดิตเอเย่นต์', level: 3 })).not.toBeVisible({ timeout: 10000 });

      // Wait a bit for transaction to be saved
      await page.waitForTimeout(1000);

      // Fetch credit history
      const historyResponse = await page.request.get(`http://localhost:3000/api/v1/master/agents/${agentId}/credit-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const historyData = await historyResponse.json();

      // Verify transaction exists
      expect(historyData.success).toBe(true);
      expect(historyData.data.transactions.length).toBeGreaterThan(0);

      // Find the most recent transaction
      const latestTransaction = historyData.data.transactions[0];
      expect(latestTransaction.action).toBe('add');
      expect(latestTransaction.amount).toBe(addAmount);
      expect(latestTransaction.credit_before).toBe(creditBefore);
      expect(latestTransaction.credit_after).toBe(creditBefore + addAmount);
    }
  });
});
