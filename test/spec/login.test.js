const { Builder } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page'); // Sesuaikan jalur foldernya jika berbeda

describe('SauceDemo Login Automation Tests', function () {
    let driver;
    let loginPage;

    // Setup browser sebelum setiap test case dijalankan
    beforeEach(async function () {
        this.timeout(20000);


        // Menggunakan browser Chrome
        driver = await new Builder()
        .forBrowser('chrome')
        .build();
        loginPage = new LoginPage(driver);
        //panggil login page open browser
        await loginPage.openBrowser(); 
    });

    // Menutup browser setelah setiap test case selesai
    afterEach(async function () {
        await driver.quit();
    });

    it('Positive Test: Should login successfully with standard_user', async function () {
        // 1. Masukkan username dan password yang valid
        await loginPage.inputUsername('standard_user');
        await loginPage.inputPassword('secret_sauce');

        // 2. Klik tombol login
        await loginPage.clickLoginButton();

        // 3. Lakukan assertion untuk memastikan login sukses (muncul judul Products)
        await loginPage.assertProductTitle();
    });

    it('Negative Test: Should fail to login with invalid username', async function () {
        // 1. Masukkan username invalid
        await loginPage.inputUsername('locked_out');
        await loginPage.inputPassword('secret_sauce');

        // 2. Klik tombol login
        await loginPage.clickLoginButton();

        // 3. Lakukan assertion untuk memastikan pesan error muncul dengan benar
        await loginPage.isErrorMessageVisible();
    });
});