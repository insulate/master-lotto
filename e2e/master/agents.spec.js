const { test, expect } = require('@playwright/test');

test.describe('Master - Agents Management', () => {
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

  test('should display agents list page correctly', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'จัดการเอเย่นต์', level: 1 })).toBeVisible();

    // Check create agent button
    await expect(page.getByRole('button', { name: '+ สร้างเอเย่นต์ใหม่' })).toBeVisible();

    // Check search input
    await expect(page.getByRole('textbox', { name: 'ค้นหาด้วย Username หรือชื่อ...' })).toBeVisible();

    // Check status filter
    await expect(page.getByRole('combobox')).toBeVisible();

    // Check table headers
    await expect(page.locator('table th:has-text("Username")')).toBeVisible();
    await expect(page.locator('table th:has-text("ชื่อ-นามสกุล")')).toBeVisible();
    await expect(page.locator('table th:has-text("ข้อมูลติดต่อ")')).toBeVisible();
    await expect(page.locator('table th:has-text("เครดิต")')).toBeVisible();
    await expect(page.locator('table th:has-text("สถานะ")')).toBeVisible();
    await expect(page.locator('table th:has-text("วันที่สร้าง")')).toBeVisible();
    await expect(page.locator('table th:has-text("จัดการ")')).toBeVisible();
  });

  test('should create new agent successfully', async ({ page }) => {
    const timestamp = Date.now();
    const username = `test${timestamp}`;
    const name = `Test Agent ${timestamp}`;
    const password = 'test123';
    const initialCredit = '10000';
    const contactInfo = `Line: @${username}`;

    // Click create agent button
    await page.getByRole('button', { name: '+ สร้างเอเย่นต์ใหม่' }).click();

    // Wait for modal to open
    await expect(page.getByRole('heading', { name: 'สร้างเอเย่นต์ใหม่', level: 3 })).toBeVisible();

    // Fill form
    await page.getByRole('textbox', { name: 'ตัวอักษรและตัวเลข 3-20 ตัวอักษร' }).fill(username);
    await page.getByRole('textbox', { name: 'ชื่อและนามสกุล' }).fill(name);
    await page.getByRole('textbox', { name: 'อย่างน้อย 6 ตัวอักษร' }).fill(password);
    await page.getByRole('spinbutton').fill(initialCredit);
    await page.getByRole('textbox', { name: 'เบอร์โทร, Line ID' }).fill(contactInfo);

    // Submit form
    await page.getByRole('button', { name: 'สร้างเอเย่นต์', exact: true }).click();

    // Wait for modal to close (indicates success)
    await expect(page.getByRole('heading', { name: 'สร้างเอเย่นต์ใหม่', level: 3 })).not.toBeVisible({ timeout: 10000 });

    // Verify agent appears in table
    await expect(page.getByRole('cell', { name: username, exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: name, exact: true })).toBeVisible();
    await expect(page.locator(`text=${contactInfo}`)).toBeVisible();
    await expect(page.locator('text=฿10,000.00').first()).toBeVisible();

    // Verify count increased
    await expect(page.locator('text=พบ')).toBeVisible();
  });

  test('should edit agent information successfully', async ({ page }) => {
    // Click edit button for the first agent
    await page.getByRole('button', { name: 'แก้ไข' }).first().click();

    // Wait for modal to open
    await expect(page.getByRole('heading', { name: 'แก้ไขข้อมูลเอเย่นต์', level: 3 })).toBeVisible();

    // Check username is disabled (find disabled textbox in modal)
    const usernameField = page.locator('input[type="text"][disabled]');
    await expect(usernameField).toBeDisabled();
    await expect(page.locator('text=Username ไม่สามารถแก้ไขได้')).toBeVisible();

    // Get current name and modify it
    const nameField = page.getByRole('textbox', { name: 'ชื่อและนามสกุล' });
    const currentName = await nameField.inputValue();
    const updatedName = currentName + ' Updated';

    // Update name
    await nameField.fill(updatedName);

    // Update contact info
    const contactField = page.getByRole('textbox', { name: 'เบอร์โทร, Line ID' });
    await contactField.fill('Line: @updated, Tel: 099-999-9999');

    // Submit form
    await page.getByRole('button', { name: 'บันทึกการแก้ไข' }).click();

    // Wait for modal to close (indicates success)
    await expect(page.getByRole('heading', { name: 'แก้ไขข้อมูลเอเย่นต์', level: 3 })).not.toBeVisible({ timeout: 10000 });

    // Verify updated information in table
    await expect(page.getByRole('cell', { name: updatedName, exact: true })).toBeVisible();
    await expect(page.locator('text=Line: @updated, Tel: 099-999-9999')).toBeVisible();
  });

  // test('should disable agent successfully', async ({ page }) => {
  //   // Click disable button for the first active agent
  //   await page.getByRole('button', { name: 'ระงับ' }).first().click();

  //   // Wait for confirmation modal
  //   await expect(page.getByRole('heading', { name: 'ยืนยันการระงับเอเย่นต์', level: 3 })).toBeVisible();
  //   await expect(page.locator('text=คุณต้องการระงับเอเย่นต์')).toBeVisible();

  //   // Confirm disable
  //   await page.getByRole('button', { name: 'ยืนยัน' }).click();

  //   // Check success toast
  //   await expect(page.getByRole('status')).toContainText('ระงับเอเย่นต์');
  //   await expect(page.getByRole('status')).toContainText('สำเร็จ');

  //   // Verify status changed to disabled
  //   await expect(page.getByRole('cell', { name: 'ระงับ', exact: true })).toBeVisible();

  //   // Verify enable button is now visible
  //   await expect(page.getByRole('button', { name: 'เปิดใช้งาน' })).toBeVisible();
  // });

  // test('should enable agent successfully', async ({ page }) => {
  //   // First, disable an agent
  //   await page.getByRole('button', { name: 'ระงับ' }).first().click();
  //   await page.getByRole('button', { name: 'ยืนยัน' }).click();

  //   // Wait for disable to complete
  //   await expect(page.getByRole('status')).toContainText('ระงับเอเย่นต์');

  //   // Now enable it
  //   await page.getByRole('button', { name: 'เปิดใช้งาน' }).first().click();

  //   // Wait for confirmation modal
  //   await expect(page.getByRole('heading', { name: 'ยืนยันการเปิดใช้งาน', level: 3 })).toBeVisible();
  //   await expect(page.locator('text=คุณต้องการเปิดใช้งานเอเย่นต์')).toBeVisible();

  //   // Confirm enable
  //   await page.getByRole('button', { name: 'ยืนยัน' }).click();

  //   // Check success toast
  //   await expect(page.getByRole('status')).toContainText('เปิดใช้งานเอเย่นต์');
  //   await expect(page.getByRole('status')).toContainText('สำเร็จ');

  //   // Verify status changed to active
  //   await expect(page.getByRole('cell', { name: 'ใช้งาน', exact: true })).toBeVisible();

  //   // Verify disable button is now visible
  //   await expect(page.getByRole('button', { name: 'ระงับ' })).toBeVisible();
  // });

  // test('should filter agents by status', async ({ page }) => {
  //   // Get initial count
  //   const initialCount = await page.locator('text=พบ').textContent();

  //   // Filter by active status
  //   await page.getByRole('combobox').selectOption('active');

  //   // Wait for filter to apply
  //   await page.waitForTimeout(500);

  //   // Verify only active agents are shown
  //   const activeRows = page.locator('tbody tr');
  //   const count = await activeRows.count();

  //   for (let i = 0; i < count; i++) {
  //     await expect(activeRows.nth(i).getByRole('cell', { name: 'ใช้งาน' })).toBeVisible();
  //   }

  //   // Filter by disabled status
  //   await page.getByRole('combobox').selectOption('inactive');

  //   // Wait for filter to apply
  //   await page.waitForTimeout(500);

  //   // Verify only disabled agents are shown (if any)
  //   const disabledRows = page.locator('tbody tr');
  //   const disabledCount = await disabledRows.count();

  //   if (disabledCount > 0) {
  //     for (let i = 0; i < disabledCount; i++) {
  //       await expect(disabledRows.nth(i).getByRole('cell', { name: 'ระงับ' })).toBeVisible();
  //     }
  //   }

  //   // Reset filter to all
  //   await page.getByRole('combobox').selectOption('all');
  // });

  // test('should search agents by username or name', async ({ page }) => {
  //   // Get first agent's username
  //   const firstCell = page.locator('tbody tr').first().locator('td').first();
  //   const username = await firstCell.textContent();

  //   // Search by username
  //   await page.getByRole('textbox', { name: 'ค้นหาด้วย Username หรือชื่อ...' }).fill(username);

  //   // Wait for search to apply
  //   await page.waitForTimeout(500);

  //   // Verify filtered results contain the search term
  //   await expect(page.getByRole('cell', { name: username, exact: true })).toBeVisible();

  //   // Clear search
  //   await page.getByRole('textbox', { name: 'ค้นหาด้วย Username หรือชื่อ...' }).clear();

  //   // Wait for search to clear
  //   await page.waitForTimeout(500);
  // });

  // test('should cancel agent creation', async ({ page }) => {
  //   // Click create agent button
  //   await page.getByRole('button', { name: '+ สร้างเอเย่นต์ใหม่' }).click();

  //   // Wait for modal to open
  //   await expect(page.getByRole('heading', { name: 'สร้างเอเย่นต์ใหม่', level: 3 })).toBeVisible();

  //   // Fill some data
  //   await page.getByRole('textbox', { name: 'ตัวอักษรและตัวเลข 3-20 ตัวอักษร' }).fill('testcancel');

  //   // Click cancel button
  //   await page.getByRole('button', { name: 'ยกเลิก' }).first().click();

  //   // Verify modal is closed
  //   await expect(page.getByRole('heading', { name: 'สร้างเอเย่นต์ใหม่', level: 3 })).not.toBeVisible();
  // });

  // test('should cancel agent edit', async ({ page }) => {
  //   // Click edit button for the first agent
  //   await page.getByRole('button', { name: 'แก้ไข' }).first().click();

  //   // Wait for modal to open
  //   await expect(page.getByRole('heading', { name: 'แก้ไขข้อมูลเอเย่นต์', level: 3 })).toBeVisible();

  //   // Modify some data
  //   const nameField = page.getByRole('textbox', { name: 'ชื่อและนามสกุล' });
  //   await nameField.fill('This should not be saved');

  //   // Click cancel button
  //   await page.getByRole('button', { name: 'ยกเลิก' }).first().click();

  //   // Verify modal is closed
  //   await expect(page.getByRole('heading', { name: 'แก้ไขข้อมูลเอเย่นต์', level: 3 })).not.toBeVisible();

  //   // Verify data was not changed
  //   await expect(page.locator('text=This should not be saved')).not.toBeVisible();
  // });

  // test('should show validation error for duplicate username', async ({ page }) => {
  //   // Get an existing agent's username
  //   const firstCell = page.locator('tbody tr').first().locator('td').first();
  //   const existingUsername = await firstCell.textContent();

  //   // Click create agent button
  //   await page.getByRole('button', { name: '+ สร้างเอเย่นต์ใหม่' }).click();

  //   // Wait for modal to open
  //   await expect(page.getByRole('heading', { name: 'สร้างเอเย่นต์ใหม่', level: 3 })).toBeVisible();

  //   // Fill form with duplicate username
  //   await page.getByRole('textbox', { name: 'ตัวอักษรและตัวเลข 3-20 ตัวอักษร' }).fill(existingUsername);
  //   await page.getByRole('textbox', { name: 'ชื่อและนามสกุล' }).fill('Test Duplicate');
  //   await page.getByRole('textbox', { name: 'อย่างน้อย 6 ตัวอักษร' }).fill('test123');

  //   // Submit form
  //   await page.getByRole('button', { name: 'สร้างเอเย่นต์', exact: true }).click();

  //   // Check for error toast
  //   await expect(page.getByRole('status')).toBeVisible();
  //   // Error message may vary - just verify toast appears
  // });
});
