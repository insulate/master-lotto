import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Master Login Flow
 * ทดสอบการเข้าสู่ระบบและการทำงานพื้นฐานของ Master
 */

test.describe('Master Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // ไปที่หน้า login ก่อนทุก test
    await page.goto('/');
  });

  test('should display login page correctly', async ({ page }) => {
    // ตรวจสอบว่าหน้า login แสดงถูกต้อง
    await expect(page.locator('h1')).toContainText('ระบบหวยออนไลน์');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully as Master', async ({ page }) => {
    // กรอก username และ password
    await page.fill('input[name="username"]', 'master');
    await page.fill('input[name="password"]', 'master123');

    // คลิกปุ่ม Login
    await page.click('button[type="submit"]');

    // รอให้ redirect ไปหน้า dashboard
    await page.waitForURL('**/master/dashboard');

    // ตรวจสอบว่าเข้าสู่ระบบสำเร็จ
    await expect(page).toHaveURL(/\/master\/dashboard/);

    // ตรวจสอบว่ามีเมนูของ Master
    await expect(page.getByRole('link', { name: 'จัดการเอเย่นต์' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'จัดการหวย' })).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login ก่อน
    await page.fill('input[name="username"]', 'master');
    await page.fill('input[name="password"]', 'master123');
    await page.click('button[type="submit"]');

    // รอให้ redirect ไปหน้า dashboard
    await page.waitForURL('**/master/dashboard');

    // ตรวจสอบว่าเข้าสู่ระบบสำเร็จ
    await expect(page).toHaveURL(/\/master\/dashboard/);

    // ตรวจสอบว่ามีเมนูของ Master
    await expect(page.getByRole('link', { name: 'จัดการเอเย่นต์' })).toBeVisible();

    // คลิกปุ่ม Logout
    await page.click('text=ออกจากระบบ');

    // ตรวจสอบว่า redirect กลับมาหน้า login
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=เข้าสู่ระบบเพื่อดำเนินการต่อ')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // กรอก username และ password ผิด
    await page.fill('input[name="username"]', 'invalidmaster');
    await page.fill('input[name="password"]', 'wrongpassword');

    // คลิกปุ่ม Login
    await page.click('button[type="submit"]');

    // ตรวจสอบว่าแสดง error message
    await expect(page.locator('text=ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')).toBeVisible();
  });

  test('should show error with empty fields', async ({ page }) => {
    // คลิกปุ่ม Login โดยไม่กรอกข้อมูล
    await page.click('button[type="submit"]');

    // ตรวจสอบว่าแสดง validation errors
    await expect(page.locator('text=กรุณากรอกชื่อผู้ใช้')).toBeVisible();
    await expect(page.locator('text=กรุณากรอกรหัสผ่าน')).toBeVisible();

    // ควรยังอยู่ที่หน้า login
    await expect(page).toHaveURL('/login');
  });
});
