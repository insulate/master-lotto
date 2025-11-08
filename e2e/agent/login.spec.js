import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Agent Login Flow
 * ทดสอบการเข้าสู่ระบบและการทำงานพื้นฐานของ Agent
 */

test.describe('Agent Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // ไปที่หน้า login ก่อนทุก test
    await page.goto('/');
  });

  test('should login successfully as Agent', async ({ page }) => {
    // กรอก username และ password
    await page.fill('input[name="username"]', 'agent1');
    await page.fill('input[name="password"]', 'agent123');

    // คลิกปุ่ม Login
    await page.click('button[type="submit"]');

    // รอให้ redirect ไปหน้า dashboard
    await page.waitForURL('**/agent/**');

    // ตรวจสอบว่าเข้าสู่ระบบสำเร็จ
    await expect(page).toHaveURL(/\/agent/);

    // ตรวจสอบว่ามีเมนูของ Agent
    await expect(page.getByRole('link', { name: 'จัดการผู้เล่น' })).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login ก่อน
    await page.fill('input[name="username"]', 'agent1');
    await page.fill('input[name="password"]', 'agent123');
    await page.click('button[type="submit"]');

    // รอให้ redirect ไปหน้า dashboard
    await page.waitForURL('**/agent/**');

    // คลิกปุ่ม Logout
    await page.click('text=ออกจากระบบ');

    // ตรวจสอบว่า redirect กลับมาหน้า login
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=เข้าสู่ระบบเพื่อดำเนินการต่อ')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // กรอก username และ password ผิด
    await page.fill('input[name="username"]', 'invalidagent');
    await page.fill('input[name="password"]', 'wrongpassword');

    // คลิกปุ่ม Login
    await page.click('button[type="submit"]');

    // ตรวจสอบว่าแสดง error message
    await expect(page.locator('text=ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')).toBeVisible();
  });
});
